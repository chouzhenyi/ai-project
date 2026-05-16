import React, {
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useEffect,
} from "react";
import { Table, Button, Switch, message, Popconfirm } from "antd";
import type { ColumnSchema, EasyTableProps, TableInstance } from "./types";
import EditCell from "./EditCell";
import PaginationBar from "./PaginationBar";
import "./styles.css";

const EasyTable = forwardRef<TableInstance, EasyTableProps>((props, ref) => {
  const {
    columns,
    dataSource: externalData,
    rowKey = "id",
    editable = false,
    editMode = "row",
    showIndex = false,
    indexTitle = "#",
    indexWidth = 60,
    showActions = false,
    actions = [],
    actionsTitle = "操作",
    actionsWidth = 150,
    showSelection = false,
    onSelectionChange,
    onChange,
    pagination,
    loading = false,
    emptyContent = "暂无数据",
    hasBorder = true,
    isZebra = false,
    style,
    className,
    getRowProps,
    maxBodyHeight,
    fixedHeader = true,
    defaultRowData = {},
    showAddButton = false,
    addButtonText = "新增",
    onAddClick,
    showDeleteButton = false,
    deleteButtonText = "删除",
    onDelete,
    renderToolbar,
    renderFooter,
  } = props;

  const [data, setData] = useState<Record<string, unknown>[]>(externalData || []);
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
  const [editingKey, setEditingKey] = useState<string | number | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const changesRef = useRef<{
    added: Record<string, unknown>[];
    modified: Record<string, unknown>[];
    removed: Record<string, unknown>[];
  }>({
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
      setData(externalData);
    }
  }, [externalData]);

  const generateKey = useCallback(() => {
    keyCounterRef.current += 1;
    return `row_${Date.now()}_${keyCounterRef.current}`;
  }, []);

  const getRowKeyValue = useCallback(
    (record: Record<string, unknown>) => {
      return record[rowKey] as string | number;
    },
    [rowKey],
  );

  /** 不可变更新 changesRef：避免内部 mutation 导致外部持有旧引用时数据不一致 */
  const updateChanges = useCallback(
    (
      updater: (prev: {
        added: Record<string, unknown>[];
        modified: Record<string, unknown>[];
        removed: Record<string, unknown>[];
      }) => {
        added: Record<string, unknown>[];
        modified: Record<string, unknown>[];
        removed: Record<string, unknown>[];
      },
    ) => {
      changesRef.current = updater(changesRef.current);
    },
    [],
  );

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
        const current = dataRef.current;
        const removedRows = current.filter((item) => keys.includes(getRowKeyValue(item)));
        const newData = current.filter((item) => !keys.includes(getRowKeyValue(item)));
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

  useImperativeHandle(ref, () => tableInstance, [tableInstance]);

  const handleSelectionChange = useCallback(
    (keys: React.Key[]) => {
      const typedKeys = keys as (string | number)[];
      setSelectedKeys(typedKeys);
      const rows = data.filter((item) => typedKeys.includes(getRowKeyValue(item)));
      onSelectionChange?.(typedKeys, rows);
    },
    [data, getRowKeyValue, onSelectionChange],
  );

  const handleCellChange = useCallback(
    (column: ColumnSchema, value: unknown) => {
      const newEditData = { ...editData, [column.dataIndex]: value };
      setEditData(newEditData);

      if (column.onChange) {
        const rowIndex = data.findIndex((item) => getRowKeyValue(item) === editingKey);
        if (rowIndex !== -1) {
          column.onChange(value, newEditData, rowIndex, column);
        }
      }
    },
    [editData, data, editingKey, getRowKeyValue],
  );

  const handleAdd = useCallback(() => {
    if (onAddClick) {
      onAddClick();
    } else {
      tableInstance.addRow();
    }
  }, [onAddClick, tableInstance]);

  const handleDelete = useCallback(() => {
    if (selectedKeys.length === 0) {
      message.warning("请先选择要删除的数据");
      return;
    }
    if (onDelete) {
      const rows = data.filter((item) => selectedKeys.includes(getRowKeyValue(item)));
      onDelete(selectedKeys, rows);
    } else {
      tableInstance.deleteRows(selectedKeys);
      message.success("删除成功");
    }
  }, [selectedKeys, data, getRowKeyValue, onDelete, tableInstance]);

  const handleEdit = useCallback(
    (record: Record<string, unknown>) => {
      tableInstance.startEdit(getRowKeyValue(record));
    },
    [tableInstance, getRowKeyValue],
  );

  const handleSave = useCallback(() => {
    if (tableInstance.saveEdit()) {
      message.success("保存成功");
    }
  }, [tableInstance]);

  const handleCancel = useCallback(() => {
    tableInstance.cancelEdit();
  }, [tableInstance]);

  const tableColumns = useMemo(() => {
    const cols: Record<string, unknown>[] = [];

    if (showIndex) {
      cols.push({
        key: "__index__",
        title: indexTitle,
        width: indexWidth,
        align: "center" as const,
        render: (_value: unknown, record: Record<string, unknown>) => {
          const rowIndex = data.findIndex(
            (item) => getRowKeyValue(item) === getRowKeyValue(record),
          );
          return rowIndex + 1;
        },
      });
    }

    columns.forEach((col) => {
      const {
        key,
        title,
        dataIndex,
        width,
        align,
        fixed,
        sortable,
        type = "text",
        editable: colEditable,
        visible: colVisible,
        format,
        render,
      } = col;

      const isColumnVisible =
        typeof colVisible === "function" ? colVisible({}, 0) : colVisible !== false;

      if (!isColumnVisible) return;

      cols.push({
        key: key || dataIndex,
        title,
        dataIndex,
        width,
        align,
        fixed,
        sorter: sortable ? true : undefined,
        render: (value: unknown, record: Record<string, unknown>, rowIndex: number) => {
          const recordKey = getRowKeyValue(record);
          const isEditing = editingKey === recordKey;

          const isEditable =
            editable &&
            (typeof colEditable === "function"
              ? colEditable(record, rowIndex)
              : colEditable !== false);

          if (isEditing && isEditable) {
            return (
              <EditCell
                column={col}
                record={editData}
                rowIndex={rowIndex}
                value={editData[dataIndex]}
                onSave={handleSave}
                onCancel={handleCancel}
                onValueChange={(val) => handleCellChange(col, val)}
              />
            );
          }

          if (render) {
            return render(value, record, rowIndex);
          }

          if (format) {
            return format(value, record, rowIndex);
          }

          if (type === "switch") {
            return <Switch checked={Boolean(value)} disabled />;
          }

          if (type === "select" && col.options) {
            const opts =
              typeof col.options === "function" ? col.options(record, rowIndex) : col.options;
            const opt = opts.find((o) => o.value === value);
            return opt?.label || value;
          }

          return value ?? "-";
        },
      });
    });

    if (showActions && actions.length > 0) {
      cols.push({
        key: "__actions__",
        title: actionsTitle,
        width: actionsWidth,
        align: "center" as const,
        fixed: "right" as const,
        render: (_value: unknown, record: Record<string, unknown>, rowIndex: number) => {
          const recordKey = getRowKeyValue(record);
          const isEditing = editingKey === recordKey;

          if (isEditing && editMode === "row") {
            return (
              <div className="easy-table-actions">
                <Button type="primary" size="small" onClick={handleSave}>
                  保存
                </Button>
                <Button size="small" onClick={handleCancel}>
                  取消
                </Button>
              </div>
            );
          }

          return (
            <div className="easy-table-actions">
              {actions.map((action) => {
                const {
                  key: actionKey,
                  text,
                  type: btnType = "default",
                  visible: actionVisible = true,
                  disabled: actionDisabled = false,
                  onClick: actionOnClick,
                  confirm,
                  danger,
                } = action;

                const isVisible =
                  typeof actionVisible === "function"
                    ? actionVisible(record, rowIndex)
                    : actionVisible;

                const isDisabled =
                  typeof actionDisabled === "function"
                    ? actionDisabled(record, rowIndex)
                    : actionDisabled;

                if (!isVisible) return null;

                const antdBtnType =
                  btnType === "secondary" || btnType === "normal" ? "default" : btnType;

                const button = (
                  <Button
                    key={actionKey}
                    type={antdBtnType}
                    size="small"
                    disabled={isDisabled}
                    danger={danger}
                    onClick={() => actionOnClick?.(record, rowIndex)}
                  >
                    {text}
                  </Button>
                );

                if (confirm) {
                  return (
                    <Popconfirm
                      key={actionKey}
                      title={confirm}
                      onConfirm={() => actionOnClick?.(record, rowIndex)}
                      okText="确定"
                      cancelText="取消"
                    >
                      {button}
                    </Popconfirm>
                  );
                }

                return button;
              })}

              {editable && editMode === "row" && editingKey !== recordKey && (
                <Button type="primary" size="small" onClick={() => handleEdit(record)}>
                  编辑
                </Button>
              )}
            </div>
          );
        },
      });
    }

    return cols;
  }, [
    columns,
    showIndex,
    indexTitle,
    indexWidth,
    showActions,
    actions,
    actionsTitle,
    actionsWidth,
    editable,
    editMode,
    editingKey,
    editData,
    data,
    getRowKeyValue,
    handleSave,
    handleCancel,
    handleEdit,
    handleCellChange,
  ]);

  const renderToolbarContent = () => {
    if (!showAddButton && !showDeleteButton && !renderToolbar) return null;

    return (
      <div className="easy-table-toolbar">
        {showAddButton && (
          <Button type="primary" onClick={handleAdd}>
            {addButtonText}
          </Button>
        )}
        {showDeleteButton && (
          <Button danger onClick={handleDelete} disabled={selectedKeys.length === 0}>
            {deleteButtonText}
          </Button>
        )}
        {renderToolbar?.(tableInstance)}
      </div>
    );
  };

  const scrollConfig = useMemo(() => {
    if (maxBodyHeight) {
      return { y: maxBodyHeight as number };
    }
    if (fixedHeader) {
      return { y: 400 };
    }
    return undefined;
  }, [maxBodyHeight, fixedHeader]);

  return (
    <div className={className} style={style}>
      {renderToolbarContent()}
      <Table
        rowKey={rowKey}
        dataSource={data}
        columns={tableColumns}
        loading={loading}
        bordered={hasBorder}
        locale={{ emptyText: emptyContent }}
        scroll={scrollConfig}
        rowClassName={
          isZebra ? (_record, index) => (index % 2 === 1 ? "easy-table-zebra-row" : "") : undefined
        }
        rowSelection={
          showSelection
            ? {
                selectedRowKeys: selectedKeys,
                onChange: handleSelectionChange,
                columnWidth: 50,
              }
            : undefined
        }
        onRow={(record, index) => (getRowProps ? getRowProps(record, index ?? 0) : {})}
        pagination={false}
      />
      {pagination !== false && <PaginationBar pagination={pagination} dataLength={data.length} />}
      {renderFooter?.(tableInstance)}
    </div>
  );
});

EasyTable.displayName = "EasyTable";

export { EasyTable };
export default EasyTable;
export type {
  ColumnSchema,
  ActionSchema,
  TableInstance,
  EasyTableProps,
  EditRenderProps,
  TableOptionItem,
  ColumnType,
  EditableControl,
  VisibleControl,
  DisabledControl,
} from "./types";
