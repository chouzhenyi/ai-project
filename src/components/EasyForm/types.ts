import React from "react";

// ============ 公共类型定义 ============

export type ComponentType =
  | "Input"
  | "Input.Password"
  | "Input.TextArea"
  | "Select"
  | "SelectInfinite"
  | "TreeSelect"
  | "Cascader"
  | "DatePicker"
  | "DateRangePicker"
  | "TimePicker"
  | "NumberPicker"
  | "Switch"
  | "Checkbox"
  | "Radio"
  | "Rating"
  | "Upload"
  | "Custom";

export interface OptionItem {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: OptionItem[];
  /** 选项携带的额外数据，选中后可通过 FormActions.setFieldValue 自动回填到其他字段 */
  extra?: Record<string, unknown>;
}

export type OptionsLoader = (
  formValues: Record<string, unknown>,
  formActions: FormInstance,
) => Promise<OptionItem[]>;

export interface PaginationParams {
  page: number;
  pageSize: number;
  keyword?: string;
}

export interface PaginationResult {
  options: OptionItem[];
  hasMore: boolean;
  total?: number;
}

export type PaginationOptionsLoader = (
  params: PaginationParams,
  formValues: Record<string, unknown>,
  formActions: FormInstance,
) => Promise<PaginationResult>;

export interface ValidationRule {
  required?: boolean | string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  validator?: (
    value: unknown,
    formValues: Record<string, unknown>,
  ) => Promise<boolean | string> | boolean | string;
}

export type ComponentProps =
  | Record<string, unknown>
  | ((
      formValues: Record<string, unknown>,
      formActions: FormInstance,
    ) => Record<string, unknown> | Promise<Record<string, unknown>>);

export type VisibleControl =
  | boolean
  | ((formValues: Record<string, unknown>, formActions: FormInstance) => boolean);

export type DisabledControl =
  | boolean
  | ((formValues: Record<string, unknown>, formActions: FormInstance) => boolean);

export interface FormSchema {
  name: string;
  label: string;
  component?: ComponentType;
  componentProps?: ComponentProps;
  options?: OptionItem[] | OptionsLoader;
  paginationOptions?: PaginationOptionsLoader;
  rules?: ValidationRule[];
  defaultValue?: unknown;
  placeholder?: string;
  required?: boolean;
  disabled?: DisabledControl;
  visible?: VisibleControl;
  span?: number;
  width?: string | number;
  labelAlign?: "left" | "top" | "inset";
  dateFormat?: string;
  optionRender?: (option: OptionItem) => React.ReactNode;
  tooltip?: string;
  help?: string;
  render?: (props: CustomRenderProps) => React.ReactNode;
  /** 字段值变化时的同步回调，用于响应值变化（如联动计算） */
  onChange?: (
    value: unknown,
    formValues: Record<string, unknown>,
    formActions: FormInstance,
  ) => void;
  /** 字段值变化后的级联副作用，在 onChange 之后执行（如重置依赖字段、异步加载选项） */
  effect?: (value: unknown, formValues: Record<string, unknown>, formActions: FormInstance) => void;
}

export interface CustomRenderProps {
  value: unknown;
  onChange: (value: unknown) => void;
  disabled: boolean;
  readonly: boolean;
  formValues: Record<string, unknown>;
  formActions: FormInstance;
}

export interface FormInstance {
  setValues: (values: Record<string, unknown>) => void;
  setFieldValue: (name: string, value: unknown) => void;
  getValues: () => Record<string, unknown>;
  getFieldValue: (name: string) => unknown;
  reset: () => void;
  validate: () => Promise<{
    valid: boolean;
    values: Record<string, unknown>;
    errors: Record<string, string>;
  }>;
  setFieldError: (name: string, error: string) => void;
  clearErrors: () => void;
  setFieldOptions: (name: string, options: OptionItem[]) => void;
  submit: () => void;
}

export interface EasyFormProps {
  schema: FormSchema[];
  initialValues?: Record<string, unknown>;
  onSubmit?: (values: Record<string, unknown>, form: FormInstance) => void | Promise<void>;
  onChange?: (values: Record<string, unknown>, form: FormInstance) => void;
  onReset?: (values: Record<string, unknown>, form: FormInstance) => void;
  style?: React.CSSProperties;
  labelCol?: { span?: number };
  wrapperCol?: { span?: number };
  labelAlign?: "left" | "top" | "inset";
  submitText?: string;
  resetText?: string;
  showActions?: boolean;
  renderActions?: (form: FormInstance) => React.ReactNode;
  disabled?: boolean;
  readonly?: boolean;
  inline?: boolean;
  columns?: number;
}

// ============ 内部组件 Props ============

export interface SelectInfiniteProps {
  value?: string | number;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  placeholder?: string;
  paginationOptions?: PaginationOptionsLoader;
}

export interface FieldProps {
  schema: FormSchema;
  value: unknown;
  error: string | null;
  disabled: boolean;
  readonly: boolean;
  options: OptionItem[];
  onChange: (name: string, value: unknown) => void;
}
