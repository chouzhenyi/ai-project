import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { ColumnSchema, TableInstance } from "./types";

interface ChangeTracker {
  added: Record<string, unknown>[];
  modified: Record<string, unknown>[];
  removed: Record<string, unknown>[];
}

export function useTableInstance(
  columns: ColumnSchema[],
  externalData: Record<string, unknown>[] | undefined,
  rowKey: string,
  defaultRowData: Record<string, unknown>,
  onChange:
    | ((
        data: Record<string, unknown>[],
        changes: {
          added: Record<string, unknown>[];
          modified: Record<string, unknown>[];
          removed: Record<string, unknown>[];
        },
      ) => void)
    | undefined,
  onSelectionChange:
    | ((selectedKeys: (string | number)[], selectedRows: Record<string, unknown>[]) => void)
    | undefined,
) {
  const [data, setData] = useState<Record<string, unknown>[]>(externalData || []);
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
  const [editingKey, setEditingKey] = useState<string | number | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const changesRef = useRef<ChangeTracker>({
    added: [],
    modified: [],
    removed: [],
  });

  const originalDataRef = useRef<Record<string, unknown>>({});
  const keyCounterRef = useRef(0);

  const dataRef = useRef(data);
  const selectedKeysRef = useRef(selectedKeys);
  const editingKeyRef = useRef(editingKey);
  const editDataRef = useRef(editData);
  const errorsRef = useRef(errors);
  const onChangeRef = useRef(onChange);
  const onSelectionChangeRef = useRef(onSelectionChange);

  useEffect(() => {
    dataRef.current = data;
    selectedKeysRef.current = selectedKeys;
    editingKeyRef.current = editingKey;
    editDataRef.current = editData;
    errorsRef.current = errors;
    onChangeRef.current = onChange;
    onSelectionChangeRef.current = onSelectionChange;
  });

  useEffect(() => {
    if (externalData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync external dataSource prop into internal state
      setData(externalData);
    }
  }, [externalData]);

  const generateKey = useCallback(() => {
    keyCounterRef.current += 1;
    return `row_${Date.now()}_${keyCounterRef.current}`;
  }, []);

  const getRowKeyValue = useCallback(
    (record: Record<string, unknown>): string | number => {
      const val = record[rowKey];
      if (val === undefined || val === null) {
        if (import.meta.env.DEV) {
          console.warn(`[EasyTable] rowKey "${rowKey}" is missing in record:`, record);
        }
        return "";
      }
      return val as string | number;
    },
    [rowKey],
  );

  /** 不可变更新 changesRef */
  const updateChanges = useCallback((updater: (prev: ChangeTracker) => ChangeTracker) => {
    changesRef.current = updater(changesRef.current);
  }, []);

  const tableInstance = useMemo<TableInstance>(
    () => ({
      getData: () => dataRef.current,
      setData: (newData) => {
        setData(newData);
      },
      getSelectedRows: () =>
        dataRef.current.filter((item) => selectedKeysRef.current.includes(getRowKeyValue(item))),
      setSelectedRows: (keys) => {
        setSelectedKeys(keys);
        const rows = dataRef.current.filter((item) => keys.includes(getRowKeyValue(item)));
        onSelectionChangeRef.current?.(keys, rows);
      },
      addRow: (row = {}, index) => {
        const newRow = { ...defaultRowData, ...row, [rowKey]: row[rowKey] || generateKey() };
        const current = dataRef.current;
        const newData =
          index !== undefined
            ? [...current.slice(0, index), newRow, ...current.slice(index)]
            : [...current, newRow];
        setData(newData);
        updateChanges((prev) => ({
          ...prev,
          added: [...prev.added, newRow],
        }));
        onChangeRef.current?.(newData, changesRef.current);
      },
      deleteRows: (keys) => {
        const keySet = new Set(keys);
        const current = dataRef.current;
        const removedRows = current.filter((item) => keySet.has(getRowKeyValue(item)));
        const newData = current.filter((item) => !keySet.has(getRowKeyValue(item)));
        setData(newData);
        setSelectedKeys([]);
        const trulyRemoved: Record<string, unknown>[] = [];
        updateChanges((prev) => {
          let newAdded = prev.added;
          for (const row of removedRows) {
            const key = getRowKeyValue(row);
            const addedIndex = newAdded.findIndex((r) => getRowKeyValue(r) === key);
            if (addedIndex !== -1) {
              newAdded = newAdded.filter((_, i) => i !== addedIndex);
            } else {
              trulyRemoved.push(row);
            }
          }
          return {
            added: newAdded,
            modified: prev.modified,
            removed: [...prev.removed, ...trulyRemoved],
          };
        });
        onChangeRef.current?.(newData, changesRef.current);
      },
      updateRow: (key, rowData) => {
        const current = dataRef.current;
        const newData = current.map((item) =>
          getRowKeyValue(item) === key ? { ...item, ...rowData } : item,
        );
        setData(newData);
        const updatedRow = newData.find((item) => getRowKeyValue(item) === key);
        if (updatedRow && !changesRef.current.added.find((r) => getRowKeyValue(r) === key)) {
          updateChanges((prev) => {
            const hasExisting = prev.modified.some((r) => getRowKeyValue(r) === key);
            return {
              ...prev,
              modified: hasExisting
                ? prev.modified.map((r) =>
                    getRowKeyValue(r) === key ? { ...r, ...updatedRow } : r,
                  )
                : [...prev.modified, updatedRow],
            };
          });
        }
        onChangeRef.current?.(newData, changesRef.current);
      },
      getChanges: () => ({
        added: [...changesRef.current.added],
        modified: [...changesRef.current.modified],
        removed: [...changesRef.current.removed],
      }),
      clearChanges: () => {
        changesRef.current = { added: [], modified: [], removed: [] };
      },
      startEdit: (key) => {
        const record = dataRef.current.find((item) => getRowKeyValue(item) === key);
        if (record) {
          originalDataRef.current = { ...record };
          setEditingKey(key);
          setEditData({ ...record });
        }
      },
      cancelEdit: () => {
        setEditingKey(null);
        setEditData({});
        setErrors({});
      },
      saveEdit: () => {
        if (Object.keys(errorsRef.current).length > 0) {
          return false;
        }
        const key = editingKeyRef.current;
        if (key !== null) {
          const current = dataRef.current;
          const newData = current.map((item) =>
            getRowKeyValue(item) === key ? { ...item, ...editDataRef.current } : item,
          );
          setData(newData);
          const updatedRow = newData.find((item) => getRowKeyValue(item) === key);
          if (updatedRow && !changesRef.current.added.find((r) => getRowKeyValue(r) === key)) {
            updateChanges((prev) => {
              const hasExisting = prev.modified.some((r) => getRowKeyValue(r) === key);
              return {
                ...prev,
                modified: hasExisting
                  ? prev.modified.map((r) =>
                      getRowKeyValue(r) === key ? { ...r, ...updatedRow } : r,
                    )
                  : [...prev.modified, updatedRow],
              };
            });
          }
          onChangeRef.current?.(newData, changesRef.current);
          setEditingKey(null);
          setEditData({});
          return true;
        }
        return false;
      },
      validate: async () => {
        let hasError = false;

        const results = await Promise.all(
          dataRef.current.map(async (record, i) => {
            const key = getRowKeyValue(record);

            const rowErrors = (
              await Promise.all(
                columns
                  .filter((col) => col.validator)
                  .map(async (col) => {
                    const value = record[col.dataIndex];
                    try {
                      const result = await col.validator!(value, record, i);
                      if (typeof result === "string") return result;
                      if (result === false) return `${col.title}验证失败`;
                      return null;
                    } catch (e) {
                      return e instanceof Error ? e.message : "验证失败";
                    }
                  }),
              )
            ).filter(Boolean) as string[];

            return { key: String(key), rowErrors };
          }),
        );

        const newErrors: Record<string, string[]> = {};
        for (const { key, rowErrors } of results) {
          if (rowErrors.length > 0) {
            newErrors[key] = rowErrors;
            hasError = true;
          }
        }

        setErrors(newErrors);
        return { valid: !hasError, errors: newErrors };
      },
      refresh: () => {
        setData([...dataRef.current]);
      },
    }),
    [columns, rowKey, defaultRowData, generateKey, getRowKeyValue, updateChanges],
  );

  return {
    data,
    selectedKeys,
    editingKey,
    editData,
    errors,
    tableInstance,
    getRowKeyValue,
    editingKeyRef,
    editDataRef,
  };
}
