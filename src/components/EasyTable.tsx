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
  NumberPicker,
  DatePicker,
  Switch,
  Checkbox,
  Radio,
  Message,
  Icon,
  Balloon,
} from "@alifd/next";

// ============ 类型定义 ============

/** 选项类型 */
export interface TableOptionItem {
  label: string;
  value: string | number;
  disabled?: boolean;
}

/** 列类型 */
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

/** 编辑控制 */
export type EditableControl =
  | boolean
  | ((record: Record<string, unknown>, rowIndex: number) => boolean);

/** 显示控制 */
export type VisibleControl =
  | boolean
  | ((record: Record<string, unknown>, rowIndex: number) => boolean);

/** 禁用控制 */
export type DisabledControl =
  | boolean
  | ((record: Record<string, unknown>, rowIndex: number, column: ColumnSchema) => boolean);

/** 列配置 */
export interface ColumnSchema {
  /** 列标识 */
  key: string;
  /** 列标题 */
  title: string;
  /** 数据字段 */
  dataIndex: string;
  /** 列宽度 */
  width?: number | string;
  /** 对齐方式 */
  align?: "left" | "center" | "right";
  /** 固定列 */
  fixed?: "left" | "right";
  /** 是否可排序 */
  sortable?: boolean;
  /** 是否可筛选 */
  filterable?: boolean;
  /** 列类型 */
  type?: ColumnType;
  /** 是否可编辑 */
  editable?: EditableControl;
  /** 是否显示 */
  visible?: VisibleControl;
  /** 是否禁用 */
  disabled?: DisabledControl;
  /** 选项（用于 select/radio/checkbox） */
  options?:
    | TableOptionItem[]
    | ((record: Record<string, unknown>, rowIndex: number) => TableOptionItem[]);
  /** 占位符 */
  placeholder?: string;
  /** 格式化显示 */
  format?: (value: unknown, record: Record<string, unknown>, rowIndex: number) => React.ReactNode;
  /** 自定义渲染 */
  render?: (value: unknown, record: Record<string, unknown>, rowIndex: number) => React.ReactNode;
  /** 编辑时自定义渲染 */
  editRender?: (props: EditRenderProps) => React.ReactNode;
  /** 值变化回调 */
  onChange?: (
    value: unknown,
    record: Record<string, unknown>,
    rowIndex: number,
    column: ColumnSchema,
  ) => void;
  /** 验证函数 */
  validator?: (
    value: unknown,
    record: Record<string, unknown>,
    rowIndex: number,
  ) => string | boolean | Promise<string | boolean>;
  /** 最小值（number） */
  min?: number;
  /** 最大值（number） */
  max?: number;
  /** 精度（number） */
  precision?: number;
  /** 日期格式 */
  dateFormat?: string;
  /** 组件属性 */
  componentProps?: Record<string, unknown>;
}

/** 编辑渲染属性 */
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

/** 操作列配置 */
export interface ActionSchema {
  /** 操作标识 */
  key: string;
  /** 操作文本 */
  text?: string;
  /** 图标 */
  icon?: string;
  /** 操作类型 */
  type?: "primary" | "secondary" | "normal";
  /** 是否显示 */
  visible?: boolean | ((record: Record<string, unknown>, rowIndex: number) => boolean);
  /** 是否禁用 */
  disabled?: boolean | ((record: Record<string, unknown>, rowIndex: number) => boolean);
  /** 点击回调 */
  onClick?: (record: Record<string, unknown>, rowIndex: number) => void;
  /** 确认提示 */
  confirm?: string;
  /** 危险操作 */
  danger?: boolean;
}

/** 表单字段配置（用于新增/编辑弹窗） */
export interface FormFieldSchema {
  /** 字段名 */
  name: string;
  /** 标签 */
  label: string;
  /** 组件类型 */
  type?: ColumnType;
  /** 是否必填 */
  required?: boolean;
  /** 选项 */
  options?: TableOptionItem[];
  /** 占位符 */
  placeholder?: string;
  /** 默认值 */
  defaultValue?: unknown;
  /** 验证函数 */
  validator?: (value: unknown) => string | boolean;
  /** 组件属性 */
  componentProps?: Record<string, unknown>;
}

/** 表格实例 */
export interface TableInstance {
  /** 获取数据 */
  getData: () => Record<string, unknown>[];
  /** 设置数据 */
  setData: (data: Record<string, unknown>[]) => void;
  /** 获取选中行 */
  getSelectedRows: () => Record<string, unknown>[];
  /** 设置选中行 */
  setSelectedRows: (keys: (string | number)[]) => void;
  /** 新增行 */
  addRow: (row?: Record<string, unknown>, index?: number) => void;
  /** 删除行 */
  deleteRows: (keys: (string | number)[]) => void;
  /** 更新行 */
  updateRow: (key: string | number, data: Record<string, unknown>) => void;
  /** 获取修改记录 */
  getChanges: () => {
    added: Record<string, unknown>[];
    modified: Record<string, unknown>[];
    removed: Record<string, unknown>[];
  };
  /** 清除修改记录 */
  clearChanges: () => void;
  /** 开始编辑 */
  startEdit: (key: string | number) => void;
  /** 取消编辑 */
  cancelEdit: () => void;
  /** 保存编辑 */
  saveEdit: () => boolean;
  /** 验证数据 */
  validate: () => Promise<{ valid: boolean; errors: Record<string, string[]> }>;
  /** 刷新数据 */
  refresh: () => void;
}

/** 表格属性 */
export interface EasyTableProps {
  /** 列配置 */
  columns: ColumnSchema[];
  /** 数据源 */
  dataSource?: Record<string, unknown>[];
  /** 行主键 */
  rowKey?: string;
  /** 是否可编辑 */
  editable?: boolean;
  /** 编辑模式：行编辑或单元格编辑 */
  editMode?: "row" | "cell";
  /** 是否显示序号列 */
  showIndex?: boolean;
  /** 序号列标题 */
  indexTitle?: string;
  /** 序号列宽度 */
  indexWidth?: number;
  /** 是否显示操作列 */
  showActions?: boolean;
  /** 操作列配置 */
  actions?: ActionSchema[];
  /** 操作列标题 */
  actionsTitle?: string;
  /** 操作列宽度 */
  actionsWidth?: number;
  /** 是否显示选择列 */
  showSelection?: boolean;
  /** 选择列宽度 */
  selectionWidth?: number;
  /** 选择变化回调 */
  onSelectionChange?: (
    selectedKeys: (string | number)[],
    selectedRows: Record<string, unknown>[],
  ) => void;
  /** 数据变化回调 */
  onChange?: (
    data: Record<string, unknown>[],
    changes: {
      added: Record<string, unknown>[];
      modified: Record<string, unknown>[];
      removed: Record<string, unknown>[];
    },
  ) => void;
  /** 分页配置 */
  pagination?:
    | false
    | {
        current?: number;
        pageSize?: number;
        total?: number;
        onChange?: (current: number, pageSize: number) => void;
      };
  /** 加载状态 */
  loading?: boolean;
  /** 空数据提示 */
  emptyContent?: React.ReactNode;
  /** 是否显示边框 */
  hasBorder?: boolean;
  /** 是否显示斑马纹 */
  isZebra?: boolean;
  /** 表格样式 */
  style?: React.CSSProperties;
  /** 表格类名 */
  className?: string;
  /** 行样式 */
  getRowProps?: (
    record: Record<string, unknown>,
    index: number,
  ) => React.HTMLAttributes<HTMLElement>;
  /** 最大高度（超出滚动） */
  maxBodyHeight?: number | string;
  /** 是否固定表头 */
  fixedHeader?: boolean;
  /** 新增行默认值 */
  defaultRowData?: Record<string, unknown>;
  /** 是否显示新增按钮 */
  showAddButton?: boolean;
  /** 新增按钮文本 */
  addButtonText?: string;
  /** 新增按钮点击回调 */
  onAddClick?: () => void;
  /** 是否显示删除按钮 */
  showDeleteButton?: boolean;
  /** 删除按钮文本 */
  deleteButtonText?: string;
  /** 删除确认文本 */
  deleteConfirmText?: string;
  /** 删除回调 */
  onDelete?: (keys: (string | number)[], rows: Record<string, unknown>[]) => void;
  /** 工具栏渲染 */
  renderToolbar?: (table: TableInstance) => React.ReactNode;
  /** 底部渲染 */
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

  // 获取选项
  const getOptions = (): TableOptionItem[] => {
    if (typeof options === "function") {
      return options(record, rowIndex);
    }
    return options || [];
  };

  // 自定义编辑渲染
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

  // 根据类型渲染编辑组件
  switch (type) {
    case "input":
      return (
        <Input
          value={value as string}
          onChange={onValueChange}
          disabled={disabled}
          placeholder={placeholder}
          style={{ width: "100%" }}
          {...componentProps}
        />
      );

    case "number":
      return (
        <NumberPicker
          value={value as number}
          onChange={onValueChange}
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
          onChange={onValueChange}
          disabled={disabled}
          placeholder={placeholder}
          dataSource={getOptions() as never[]}
          style={{ width: "100%" }}
          {...componentProps}
        />
      );

    case "date":
      return (
        <DatePicker
          value={value as string}
          onChange={onValueChange}
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
          onChange={onValueChange}
          disabled={disabled}
          {...componentProps}
        />
      );

    case "checkbox":
      return (
        <Checkbox.Group
          value={value as (string | number)[]}
          onChange={onValueChange}
          disabled={disabled}
          {...componentProps}
        >
          {getOptions().map((opt) => (
            <Checkbox key={String(opt.value)} value={opt.value}>
              {opt.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      );

    case "radio":
      return (
        <Radio.Group
          value={value as string | number}
          onChange={onValueChange}
          disabled={disabled}
          {...componentProps}
        >
          {getOptions().map((opt) => (
            <Radio key={String(opt.value)} value={opt.value}>
              {opt.label}
            </Radio>
          ))}
        </Radio.Group>
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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageSizes = [10, 20, 50, 100];

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (current < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  if (total <= pageSize && !pagination?.total) return null;

  return (
    <div
      style={{
        marginTop: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#666", fontSize: 13 }}>共 {total} 条</span>
        <Select
          size="small"
          value={pageSize}
          onChange={(val: number) => pagination?.onChange?.(1, val)}
          dataSource={pageSizes.map((s) => ({ label: `${s} 条/页`, value: s }))}
          style={{ width: 110 }}
        />
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <Button
          size="small"
          disabled={current <= 1}
          onClick={() => pagination?.onChange?.(current - 1, pageSize)}
        >
          上一页
        </Button>
        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "#999" }}>
              ...
            </span>
          ) : (
            <Button
              key={page}
              size="small"
              type={page === current ? "primary" : "normal"}
              onClick={() => pagination?.onChange?.(page, pageSize)}
            >
              {page}
            </Button>
          ),
        )}
        <Button
          size="small"
          disabled={current >= totalPages}
          onClick={() => pagination?.onChange?.(current + 1, pageSize)}
        >
          下一页
        </Button>
      </div>
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

  // 内部数据
  const [data, setData] = useState<Record<string, unknown>[]>(externalData || []);
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
  const [editingKey, setEditingKey] = useState<string | number | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // 变更记录
  const changesRef = useRef<{
    added: Record<string, unknown>[];
    modified: Record<string, unknown>[];
    removed: Record<string, unknown>[];
  }>({
    added: [],
    modified: [],
    removed: [],
  });

  // 原始数据（用于取消编辑）
  const originalDataRef = useRef<Record<string, unknown>>({});
  const keyCounterRef = useRef(0);

  // Refs for latest state, to keep tableInstance useMemo stable
  const dataRef = useRef(data);
  const selectedKeysRef = useRef(selectedKeys);
  const editingKeyRef = useRef(editingKey);
  const editDataRef = useRef(editData);
  const errorsRef = useRef(errors);
  const onChangeRef = useRef(onChange);
  const onSelectionChangeRef = useRef(onSelectionChange);

  // Sync refs with latest state/props after render
  useEffect(() => {
    dataRef.current = data;
    selectedKeysRef.current = selectedKeys;
    editingKeyRef.current = editingKey;
    editDataRef.current = editData;
    errorsRef.current = errors;
    onChangeRef.current = onChange;
    onSelectionChangeRef.current = onSelectionChange;
  });

  // 同步外部数据
  useEffect(() => {
    if (externalData) {
      setData(externalData);
    }
  }, [externalData]);

  // 生成唯一 key
  const generateKey = useCallback(() => {
    keyCounterRef.current += 1;
    return `row_${Date.now()}_${keyCounterRef.current}`;
  }, []);

  // 获取行的 key
  const getRowKeyValue = useCallback(
    (record: Record<string, unknown>) => {
      return record[rowKey] as string | number;
    },
    [rowKey],
  );

  // 表格实例方法 — 通过 refs 读取最新状态，useMemo 只在 columns/rowKey 等变化时重建
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

  // 暴露实例
  useImperativeHandle(ref, () => tableInstance, [tableInstance]);

  // 处理选择变化
  const handleSelectionChange = useCallback(
    (keys: (string | number)[]) => {
      setSelectedKeys(keys);
      const rows = data.filter((item) => keys.includes(getRowKeyValue(item)));
      onSelectionChange?.(keys, rows);
    },
    [data, getRowKeyValue, onSelectionChange],
  );

  // 处理单元格值变化
  const handleCellChange = useCallback(
    (column: ColumnSchema, value: unknown) => {
      const newEditData = { ...editData, [column.dataIndex]: value };
      setEditData(newEditData);

      // 触发列级 onChange
      if (column.onChange) {
        const rowIndex = data.findIndex((item) => getRowKeyValue(item) === editingKey);
        if (rowIndex !== -1) {
          column.onChange(value, newEditData, rowIndex, column);
        }
      }
    },
    [editData, data, editingKey, getRowKeyValue],
  );

  // 处理新增
  const handleAdd = useCallback(() => {
    if (onAddClick) {
      onAddClick();
    } else {
      tableInstance.addRow();
    }
  }, [onAddClick, tableInstance]);

  // 处理删除
  const handleDelete = useCallback(() => {
    if (selectedKeys.length === 0) {
      Message.warning("请先选择要删除的数据");
      return;
    }
    if (onDelete) {
      const rows = data.filter((item) => selectedKeys.includes(getRowKeyValue(item)));
      onDelete(selectedKeys, rows);
    } else {
      tableInstance.deleteRows(selectedKeys);
      Message.success("删除成功");
    }
  }, [selectedKeys, data, getRowKeyValue, onDelete, tableInstance]);

  // 处理编辑
  const handleEdit = useCallback(
    (record: Record<string, unknown>) => {
      tableInstance.startEdit(getRowKeyValue(record));
    },
    [tableInstance, getRowKeyValue],
  );

  // 处理保存
  const handleSave = useCallback(() => {
    if (tableInstance.saveEdit()) {
      Message.success("保存成功");
    }
  }, [tableInstance]);

  // 处理取消
  const handleCancel = useCallback(() => {
    tableInstance.cancelEdit();
  }, [tableInstance]);

  // 构建列配置
  const tableColumns = useMemo(() => {
    const cols: Record<string, unknown>[] = [];

    // 序号列
    if (showIndex) {
      cols.push({
        key: "__index__",
        title: indexTitle,
        width: indexWidth,
        align: "center",
        cell: (_value: unknown, _index: number, record: Record<string, unknown>) => {
          const rowIndex = data.findIndex(
            (item) => getRowKeyValue(item) === getRowKeyValue(record),
          );
          return rowIndex + 1;
        },
      });
    }

    // 数据列
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

      // 检查列是否可见
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
        sortable,
        cell: (value: unknown, rowIndex: number, record: Record<string, unknown>) => {
          const recordKey = getRowKeyValue(record);
          const isEditing = editingKey === recordKey;

          // 检查单元格是否可编辑
          const isEditable =
            editable &&
            (typeof colEditable === "function"
              ? colEditable(record, rowIndex)
              : colEditable !== false);

          // 编辑模式
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

          // 显示模式
          if (render) {
            return render(value, record, rowIndex);
          }

          if (format) {
            return format(value, record, rowIndex);
          }

          // 默认显示
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

    // 操作列
    if (showActions && actions.length > 0) {
      cols.push({
        key: "__actions__",
        title: actionsTitle,
        width: actionsWidth,
        align: "center",
        fixed: "right" as const,
        cell: (_value: unknown, rowIndex: number, record: Record<string, unknown>) => {
          const recordKey = getRowKeyValue(record);
          const isEditing = editingKey === recordKey;

          // 编辑模式下的操作按钮
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

          // 渲染操作按钮
          return (
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {actions.map((action) => {
                const {
                  key: actionKey,
                  text,
                  icon,
                  type: btnType = "normal",
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

                const button = (
                  <Button
                    key={actionKey}
                    type={btnType}
                    size="small"
                    disabled={isDisabled}
                    onClick={() => actionOnClick?.(record, rowIndex)}
                    warning={danger}
                  >
                    {icon && <Icon type={icon} />}
                    {text}
                  </Button>
                );

                if (confirm) {
                  return (
                    <Balloon key={actionKey} trigger={button} closable={false}>
                      <div style={{ padding: 8 }}>
                        <p>{confirm}</p>
                        <div style={{ marginTop: 8, textAlign: "right" }}>
                          <Button
                            size="small"
                            type="primary"
                            warning={danger}
                            onClick={() => actionOnClick?.(record, rowIndex)}
                          >
                            确定
                          </Button>
                        </div>
                      </div>
                    </Balloon>
                  );
                }

                return button;
              })}

              {/* 编辑按钮 */}
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

  // 渲染工具栏
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
          <Button warning onClick={handleDelete} disabled={selectedKeys.length === 0}>
            {deleteButtonText}
          </Button>
        )}
        {renderToolbar?.(tableInstance)}
      </div>
    );
  };

  return (
    <div className={className} style={style}>
      {/* eslint-disable-next-line react-hooks/refs -- renderToolbarContent reads tableInstance (stable memo with ref-based methods) */}
      {renderToolbarContent()}
      <Table
        dataSource={data}
        columns={tableColumns}
        loading={loading}
        hasBorder={hasBorder}
        isZebra={isZebra}
        emptyContent={emptyContent}
        maxBodyHeight={maxBodyHeight}
        fixedHeader={fixedHeader}
        rowSelection={
          showSelection
            ? {
                selectedRowKeys: selectedKeys,
                onChange: handleSelectionChange,
              }
            : undefined
        }
        getRowProps={getRowProps}
      />
      {pagination !== false && <PaginationBar pagination={pagination} dataLength={data.length} />}
      {/* eslint-disable-next-line react-hooks/refs -- renderFooter receives tableInstance (stable memo with ref-based methods) */}
      {renderFooter?.(tableInstance)}
    </div>
  );
});

EasyTable.displayName = "EasyTable";

export default EasyTable;
