import React, {
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useEffect,
} from "react";
import {
  Table,
  Button,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  Checkbox,
  Radio,
  message,
  Popconfirm,
  Pagination,
} from "antd";
import dayjs from "dayjs";

// ============ 类型定义 ============

export interface TableOptionItem {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export type ColumnType =
  | "text"
  | "input"
  | "number"
  | "select"
  | "date"
  | "switch"
  | "checkbox"
  | "radio"
  | "custom";

export type EditableControl =
  | boolean
  | ((record: Record<string, unknown>, rowIndex: number) => boolean);

export type VisibleControl =
  | boolean
  | ((record: Record<string, unknown>, rowIndex: number) => boolean);

export type DisabledControl =
  | boolean
  | ((record: Record<string, unknown>, rowIndex: number, column: ColumnSchema) => boolean);

export interface ColumnSchema {
  key: string;
  title: string;
  dataIndex: string;
  width?: number | string;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
  sortable?: boolean;
  filterable?: boolean;
  type?: ColumnType;
  editable?: EditableControl;
  visible?: VisibleControl;
  disabled?: DisabledControl;
  options?:
    | TableOptionItem[]
    | ((record: Record<string, unknown>, rowIndex: number) => TableOptionItem[]);
  placeholder?: string;
  format?: (value: unknown, record: Record<string, unknown>, rowIndex: number) => React.ReactNode;
  render?: (value: unknown, record: Record<string, unknown>, rowIndex: number) => React.ReactNode;
  editRender?: (props: EditRenderProps) => React.ReactNode;
  onChange?: (
    value: unknown,
    record: Record<string, unknown>,
    rowIndex: number,
    column: ColumnSchema,
  ) => void;
  validator?: (
    value: unknown,
    record: Record<string, unknown>,
    rowIndex: number,
  ) => string | boolean | Promise<string | boolean>;
  min?: number;
  max?: number;
  precision?: number;
  required?: boolean;
  dateFormat?: string;
  componentProps?: Record<string, unknown>;
}

export interface EditRenderProps {
  value: unknown;
  onChange: (value: unknown) => void;
  disabled: boolean;
  record: Record<string, unknown>;
  rowIndex: number;
  column: ColumnSchema;
  onSave: () => void;
  onCancel: () => void;
}

export interface ActionSchema {
  key: string;
  text?: string;
  type?: "primary" | "secondary" | "normal";
  visible?: boolean | ((record: Record<string, unknown>, rowIndex: number) => boolean);
  disabled?: boolean | ((record: Record<string, unknown>, rowIndex: number) => boolean);
  onClick?: (record: Record<string, unknown>, rowIndex: number) => void;
  confirm?: string;
  danger?: boolean;
}

export interface TableInstance {
  getData: () => Record<string, unknown>[];
  setData: (data: Record<string, unknown>[]) => void;
  getSelectedRows: () => Record<string, unknown>[];
  setSelectedRows: (keys: (string | number)[]) => void;
  addRow: (row?: Record<string, unknown>, index?: number) => void;
  deleteRows: (keys: (string | number)[]) => void;
  updateRow: (key: string | number, data: Record<string, unknown>) => void;
  getChanges: () => {
    added: Record<string, unknown>[];
    modified: Record<string, unknown>[];
    removed: Record<string, unknown>[];
  };
  clearChanges: () => void;
  startEdit: (key: string | number) => void;
  cancelEdit: () => void;
  saveEdit: () => boolean;
  validate: () => Promise<{ valid: boolean; errors: Record<string, string[]> }>;
  refresh: () => void;
}

export interface EasyTableProps {
  columns: ColumnSchema[];
  dataSource?: Record<string, unknown>[];
  rowKey?: string;
  editable?: boolean;
  editMode?: "row" | "cell";
  showIndex?: boolean;
  indexTitle?: string;
  indexWidth?: number;
  showActions?: boolean;
  actions?: ActionSchema[];
  actionsTitle?: string;
  actionsWidth?: number;
  showSelection?: boolean;
  selectionWidth?: number;
  onSelectionChange?: (
    selectedKeys: (string | number)[],
    selectedRows: Record<string, unknown>[],
  ) => void;
  onChange?: (
    data: Record<string, unknown>[],
    changes: {
      added: Record<string, unknown>[];
      modified: Record<string, unknown>[];
      removed: Record<string, unknown>[];
    },
  ) => void;
  pagination?:
    | false
    | {
        current?: number;
        pageSize?: number;
        total?: number;
        onChange?: (current: number, pageSize: number) => void;
      };
  loading?: boolean;
  emptyContent?: React.ReactNode;
  hasBorder?: boolean;
  isZebra?: boolean;
  style?: React.CSSProperties;
  className?: string;
  getRowProps?: (
    record: Record<string, unknown>,
    index: number,
  ) => React.HTMLAttributes<HTMLElement>;
  maxBodyHeight?: number | string;
  fixedHeader?: boolean;
  defaultRowData?: Record<string, unknown>;
  showAddButton?: boolean;
  addButtonText?: string;
  onAddClick?: () => void;
  showDeleteButton?: boolean;
  deleteButtonText?: string;
  deleteConfirmText?: string;
  onDelete?: (keys: (string | number)[], rows: Record<string, unknown>[]) => void;
  renderToolbar?: (table: TableInstance) => React.ReactNode;
  renderFooter?: (table: TableInstance) => React.ReactNode;
}

// ============ 编辑单元格组件 ============

interface EditCellProps {
  column: ColumnSchema;
  record: Record<string, unknown>;
  rowIndex: number;
  value: unknown;
  onSave: () => void;
  onCancel: () => void;
  onValueChange: (value: unknown) => void;
}

const EditCell: React.FC<EditCellProps> = ({
  column,
  record,
  rowIndex,
  value,
  onSave,
  onCancel,
  onValueChange,
}) => {
  const {
    type = "text",
    options,
    placeholder,
    disabled: disabledControl,
    min,
    max,
    precision,
    dateFormat = "YYYY-MM-DD",
    componentProps = {},
    editRender,
  } = column;

  const disabled =
    typeof disabledControl === "function"
      ? disabledControl(record, rowIndex, column)
      : disabledControl === true;

  const getOptions = (): TableOptionItem[] => {
    if (typeof options === "function") {
      return options(record, rowIndex);
    }
    return options || [];
  };

  if (editRender) {
    return (
      <>
        {editRender({
          value,
          onChange: onValueChange,
          disabled,
          record,
          rowIndex,
          column,
          onSave,
          onCancel,
        })}
      </>
    );
  }

  switch (type) {
    case "input":
      return (
        <Input
          value={value as string}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          style={{ width: "100%" }}
          {...componentProps}
        />
      );

    case "number":
      return (
        <InputNumber
          value={value as number}
          onChange={(val) => onValueChange(val)}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          max={max}
          precision={precision}
          style={{ width: "100%" }}
          {...componentProps}
        />
      );

    case "select":
      return (
        <Select
          value={value as string | number}
          onChange={(val) => onValueChange(val)}
          disabled={disabled}
          placeholder={placeholder}
          options={getOptions()}
          style={{ width: "100%" }}
          {...componentProps}
        />
      );

    case "date":
      return (
        <DatePicker
          value={value ? dayjs(value as string, dateFormat) : undefined}
          onChange={(dayjsValue) => {
            onValueChange(dayjsValue ? dayjsValue.format(dateFormat) : undefined);
          }}
          disabled={disabled}
          placeholder={placeholder}
          format={dateFormat}
          style={{ width: "100%" }}
          {...componentProps}
        />
      );

    case "switch":
      return (
        <Switch
          checked={Boolean(value)}
          onChange={(checked) => onValueChange(checked)}
          disabled={disabled}
          {...componentProps}
        />
      );

    case "checkbox":
      return (
        <Checkbox.Group
          value={value as (string | number)[]}
          onChange={(vals) => onValueChange(vals)}
          disabled={disabled}
          options={getOptions()}
          {...componentProps}
        />
      );

    case "radio":
      return (
        <Radio.Group
          value={value as string | number}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={disabled}
          options={getOptions()}
          {...componentProps}
        />
      );

    case "custom":
      return (
        <span style={{ color: "#999", fontStyle: "italic" }}>
          custom 类型需要通过 editRender 提供编辑组件
        </span>
      );

    default:
      return <span>{String(value ?? "")}</span>;
  }
};

// ============ 分页组件 ============

interface PaginationBarProps {
  pagination?: {
    current?: number;
    pageSize?: number;
    total?: number;
    onChange?: (current: number, pageSize: number) => void;
  };
  dataLength: number;
}

const PaginationBar: React.FC<PaginationBarProps> = ({ pagination, dataLength }) => {
  const total = pagination?.total ?? dataLength;
  const pageSize = pagination?.pageSize ?? 10;
  const current = pagination?.current ?? 1;

  if (total <= pageSize && !pagination?.total) return null;

  return (
    <div
      style={{
        marginTop: 16,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        showSizeChanger
        showQuickJumper
        pageSizeOptions={[10, 20, 50, 100]}
        showTotal={(t) => `共 ${t} 条`}
        onChange={(page, size) => pagination?.onChange?.(page, size)}
      />
    </div>
  );
};

// ============ 主表格组件 ============

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        changesRef.current.added.push(newRow);
        onChangeRef.current?.(newData, changesRef.current);
      },
      deleteRows: (keys) => {
        const current = dataRef.current;
        const removedRows = current.filter((item) => keys.includes(getRowKeyValue(item)));
        const newData = current.filter((item) => !keys.includes(getRowKeyValue(item)));
        setData(newData);
        setSelectedKeys([]);
        const trulyRemoved: Record<string, unknown>[] = [];
        for (const row of removedRows) {
          const key = getRowKeyValue(row);
          const addedIndex = changesRef.current.added.findIndex((r) => getRowKeyValue(r) === key);
          if (addedIndex !== -1) {
            changesRef.current.added.splice(addedIndex, 1);
          } else {
            trulyRemoved.push(row);
          }
        }
        changesRef.current.removed.push(...trulyRemoved);
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
          const existingModified = changesRef.current.modified.find(
            (r) => getRowKeyValue(r) === key,
          );
          if (existingModified) {
            Object.assign(existingModified, updatedRow);
          } else {
            changesRef.current.modified.push(updatedRow);
          }
        }
        onChangeRef.current?.(newData, changesRef.current);
      },
      getChanges: () => ({ ...changesRef.current }),
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
            const existingModified = changesRef.current.modified.find(
              (r) => getRowKeyValue(r) === key,
            );
            if (existingModified) {
              Object.assign(existingModified, updatedRow);
            } else {
              changesRef.current.modified.push(updatedRow);
            }
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
    [columns, rowKey, defaultRowData, generateKey, getRowKeyValue],
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
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
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
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
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
      <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
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
      {/* eslint-disable-next-line react-hooks/refs -- renderToolbarContent reads tableInstance (stable memo with ref-based methods) */}
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
      {/* eslint-disable-next-line react-hooks/refs -- renderFooter receives tableInstance (stable memo with ref-based methods) */}
      {renderFooter?.(tableInstance)}
    </div>
  );
});

EasyTable.displayName = "EasyTable";

export default EasyTable;
