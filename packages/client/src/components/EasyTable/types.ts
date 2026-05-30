import React from "react";

// ============ 公共类型定义 ============

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

// ============ 内部组件 Props ============

export interface EditCellProps {
  column: ColumnSchema;
  record: Record<string, unknown>;
  rowIndex: number;
  value: unknown;
  onSave: () => void;
  onCancel: () => void;
  onValueChange: (value: unknown) => void;
}

export interface PaginationBarProps {
  pagination?: {
    current?: number;
    pageSize?: number;
    total?: number;
    onChange?: (current: number, pageSize: number) => void;
  };
  dataLength: number;
}
