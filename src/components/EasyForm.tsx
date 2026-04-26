import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  NumberPicker,
  Switch,
  Checkbox,
  Radio,
  Upload,
  Rating,
  TimePicker,
  TreeSelect,
  Cascader,
  Message,
} from "@alifd/next";

// ============ 类型定义 ============

/** 组件类型 */
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

/** 选项类型 */
export interface OptionItem {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: OptionItem[];
  /** 选中时额外填充到表单的字段 */
  extra?: Record<string, unknown>;
}

/** 异步选项加载函数 */
export type OptionsLoader = (
  formValues: Record<string, unknown>,
  formActions: FormInstance,
) => Promise<OptionItem[]>;

/** 分页选项加载参数 */
export interface PaginationParams {
  /** 当前页码，从1开始 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 搜索关键词 */
  keyword?: string;
}

/** 分页选项加载结果 */
export interface PaginationResult {
  /** 选项列表 */
  options: OptionItem[];
  /** 是否还有更多数据 */
  hasMore: boolean;
  /** 总数 */
  total?: number;
}

/** 分页选项加载函数（用于无限滚动下拉） */
export type PaginationOptionsLoader = (
  params: PaginationParams,
  formValues: Record<string, unknown>,
  formActions: FormInstance,
) => Promise<PaginationResult>;

/** 验证规则 */
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

/** 组件属性（静态或动态） */
export type ComponentProps =
  | Record<string, unknown>
  | ((
      formValues: Record<string, unknown>,
      formActions: FormInstance,
    ) => Record<string, unknown> | Promise<Record<string, unknown>>);

/** 字段显示控制 */
export type VisibleControl =
  | boolean
  | ((formValues: Record<string, unknown>, formActions: FormInstance) => boolean);

/** 字段禁用控制 */
export type DisabledControl =
  | boolean
  | ((formValues: Record<string, unknown>, formActions: FormInstance) => boolean);

/** 表单字段 Schema */
export interface FormSchema {
  /** 字段名 */
  name: string;
  /** 标签 */
  label: string;
  /** 组件类型 */
  component?: ComponentType;
  /** 组件属性（静态对象或动态函数） */
  componentProps?: ComponentProps;
  /** 选项（静态或异步） */
  options?: OptionItem[] | OptionsLoader;
  /** 分页选项加载（用于 SelectInfinite 无限滚动） */
  paginationOptions?: PaginationOptionsLoader;
  /** 验证规则 */
  rules?: ValidationRule[];
  /** 默认值 */
  defaultValue?: unknown;
  /** 占位符 */
  placeholder?: string;
  /** 是否必填（快捷方式） */
  required?: boolean;
  /** 是否禁用 */
  disabled?: DisabledControl;
  /** 是否显示 */
  visible?: VisibleControl;
  /** 栅格占位（1-24） */
  span?: number;
  /** 自定义宽度 */
  width?: string | number;
  /** 标签对齐方式，不传则使用表单级 labelAlign */
  labelAlign?: "left" | "top" | "inset";
  /** 日期格式 */
  dateFormat?: string;
  /** 自定义下拉选项渲染 */
  optionRender?: (option: OptionItem) => React.ReactNode;
  /** 提示信息 */
  tooltip?: string;
  /** 帮助文本 */
  help?: string;
  /** 自定义渲染（component 为 Custom 时使用） */
  render?: (props: CustomRenderProps) => React.ReactNode;
  /** 值变化回调 */
  onChange?: (
    value: unknown,
    formValues: Record<string, unknown>,
    formActions: FormInstance,
  ) => void;
  /** 联动更新其他字段 */
  effect?: (value: unknown, formValues: Record<string, unknown>, formActions: FormInstance) => void;
}

/** 自定义渲染属性 */
export interface CustomRenderProps {
  value: unknown;
  onChange: (value: unknown) => void;
  disabled: boolean;
  readonly: boolean;
  formValues: Record<string, unknown>;
  formActions: FormInstance;
}

/** 表单实例方法 */
export interface FormInstance {
  /** 设置表单值 */
  setValues: (values: Record<string, unknown>) => void;
  /** 设置单个字段值 */
  setFieldValue: (name: string, value: unknown) => void;
  /** 获取表单值 */
  getValues: () => Record<string, unknown>;
  /** 获取单个字段值 */
  getFieldValue: (name: string) => unknown;
  /** 重置表单 */
  reset: () => void;
  /** 验证表单 */
  validate: () => Promise<{
    valid: boolean;
    values: Record<string, unknown>;
    errors: Record<string, string>;
  }>;
  /** 设置字段错误 */
  setFieldError: (name: string, error: string) => void;
  /** 清除错误 */
  clearErrors: () => void;
  /** 设置字段选项 */
  setFieldOptions: (name: string, options: OptionItem[]) => void;
  /** 提交表单 */
  submit: () => void;
}

/** 表单属性 */
export interface EasyFormProps {
  /** 表单 Schema */
  schema: FormSchema[];
  /** 初始值 */
  initialValues?: Record<string, unknown>;
  /** 提交回调 */
  onSubmit?: (values: Record<string, unknown>, form: FormInstance) => void | Promise<void>;
  /** 值变化回调 */
  onChange?: (values: Record<string, unknown>, form: FormInstance) => void;
  /** 重置回调 */
  onReset?: (values: Record<string, unknown>, form: FormInstance) => void;
  /** 表单样式 */
  style?: React.CSSProperties;
  /** 标签栅格 */
  labelCol?: { fixedSpan?: number; span?: number };
  /** 内容栅格 */
  wrapperCol?: { span?: number };
  /** 标签对齐 */
  labelAlign?: "left" | "top" | "inset";
  /** 提交按钮文本 */
  submitText?: string;
  /** 重置按钮文本 */
  resetText?: string;
  /** 是否显示操作按钮 */
  showActions?: boolean;
  /** 自定义操作按钮 */
  renderActions?: (form: FormInstance) => React.ReactNode;
  /** 是否禁用整个表单 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否内联模式 */
  inline?: boolean;
  /** 列数（响应式） */
  columns?: number;
}

// ============ 工具函数 ============

/** 获取嵌套对象值 */
const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, key) => {
    return acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined;
  }, obj);
};

/** 设置嵌套对象值 */
const setNestedValue = (
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> => {
  const keys = path.split(".");
  const result = { ...obj };
  let current: Record<string, unknown> = result;

  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = { ...((current[keys[i]] as Record<string, unknown>) || {}) };
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;

  return result;
};

/** 执行验证规则 */
const executeValidation = async (
  value: unknown,
  rules: ValidationRule[],
  formValues: Record<string, unknown>,
): Promise<string | null> => {
  if (!rules || rules.length === 0) return null;

  for (const rule of rules) {
    // 必填验证
    if (rule.required) {
      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);
      if (isEmpty) {
        return typeof rule.required === "string" ? rule.required : "此字段为必填项";
      }
    }

    // 正则验证
    if (rule.pattern && value !== undefined && value !== null && value !== "") {
      if (!rule.pattern.test(String(value))) {
        return "格式不正确";
      }
    }

    // 最小值验证
    if (rule.min !== undefined && value !== undefined && value !== null && value !== "") {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue < rule.min) {
        return `最小值为 ${rule.min}`;
      }
      if (typeof value === "string" && value.length < rule.min) {
        return `最少输入 ${rule.min} 个字符`;
      }
    }

    // 最大值验证
    if (rule.max !== undefined && value !== undefined && value !== null && value !== "") {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > rule.max) {
        return `最大值为 ${rule.max}`;
      }
      if (typeof value === "string" && value.length > rule.max) {
        return `最多输入 ${rule.max} 个字符`;
      }
    }

    // 自定义验证
    if (rule.validator) {
      try {
        const result = await rule.validator(value, formValues);
        if (result === false) {
          return "验证失败";
        }
        if (typeof result === "string") {
          return result;
        }
      } catch (error) {
        return error instanceof Error ? error.message : "验证失败";
      }
    }
  }

  return null;
};

// ============ 无限滚动选择器组件 ============

interface SelectInfiniteProps {
  value?: string | number;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: string | null;
  paginationOptions?: PaginationOptionsLoader;
  formValues: Record<string, unknown>;
  formActions: FormInstance;
}

const SelectInfinite: React.FC<SelectInfiniteProps> = ({
  value,
  onChange,
  disabled,
  placeholder,
  error,
  paginationOptions,
  formValues,
  formActions,
}) => {
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const pageSize = 20;
  const loadingRef = useRef(false);

  // 加载数据
  const loadOptions = useCallback(
    async (pageNum: number, searchKeyword: string, append = true) => {
      if (!paginationOptions || loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const result = await paginationOptions(
          { page: pageNum, pageSize, keyword: searchKeyword },
          formValues,
          formActions,
        );

        if (append) {
          setOptions((prev) => [...prev, ...result.options]);
        } else {
          setOptions(result.options);
        }
        setHasMore(result.hasMore);
      } catch (e) {
        console.error("Failed to load options:", e);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [paginationOptions, formValues, formActions],
  );

  // 初始加载
  useEffect(() => {
    if (paginationOptions) {
      setPage(1);
      setOptions([]);
      loadOptions(1, "", false);
    }
  }, [paginationOptions, loadOptions]);

  // 搜索
  const handleSearch = useCallback(
    (searchKeyword: string) => {
      setKeyword(searchKeyword);
      setPage(1);
      setOptions([]);
      loadOptions(1, searchKeyword, false);
    },
    [loadOptions],
  );

  // 滚动到底部时加载更多
  const handleScrollToBottom = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadOptions(nextPage, keyword);
    }
  }, [hasMore, loading, page, keyword, loadOptions]);

  // 渲染底部
  const renderFooter = () => {
    if (loading) {
      return <div style={{ textAlign: "center", padding: 8 }}>加载中...</div>;
    }
    if (!hasMore && options.length > 0) {
      return <div style={{ textAlign: "center", padding: 8, color: "#999" }}>没有更多数据了</div>;
    }
    return null;
  };

  return (
    <div style={{ position: "relative" }}>
      <Select
        style={{ width: "100%" }}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        dataSource={options as never[]}
        showSearch
        onSearch={handleSearch}
        filterLocal={false}
        menuProps={{
          footer: (
            <>
              {renderFooter()}
              {hasMore && !loading && (
                <div
                  style={{ textAlign: "center", padding: 8, cursor: "pointer", color: "#1890ff" }}
                  onClick={handleScrollToBottom}
                >
                  点击加载更多
                </div>
              )}
            </>
          ),
        }}
      />
    </div>
  );
};

// ============ 字段组件 ============

interface FieldProps {
  schema: FormSchema;
  value: unknown;
  error: string | null;
  disabled: boolean;
  readonly: boolean;
  options: OptionItem[];
  formValues: Record<string, unknown>;
  formActions: FormInstance;
  onChange: (name: string, value: unknown) => void;
}

const Field: React.FC<FieldProps> = ({
  schema,
  value,
  error,
  disabled,
  readonly,
  options,
  formValues,
  formActions,
  onChange,
}) => {
  const { component = "Input", name, render, placeholder, paginationOptions } = schema;

  const handleChange = useCallback(
    (newValue: unknown) => {
      onChange(name, newValue);
    },
    [name, onChange],
  );

  // 自定义组件
  if (component === "Custom" && render) {
    return (
      <>
        {render({
          value,
          onChange: handleChange,
          disabled,
          readonly,
          formValues,
          formActions,
        })}
        {error && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{error}</div>}
      </>
    );
  }

  // 通用样式：宽度占满
  const fullWidthStyle = { width: "100%" };

  // 根据组件类型渲染
  switch (component) {
    case "Input":
      return (
        <Input
          style={fullWidthStyle}
          value={value as string}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
        />
      );

    case "Input.Password":
      return (
        <Input.Password
          style={fullWidthStyle}
          value={value as string}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
        />
      );

    case "Input.TextArea":
      return (
        <Input.TextArea
          style={fullWidthStyle}
          value={value as string}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
        />
      );

    case "Select":
      return (
        <Select
          style={fullWidthStyle}
          value={value as string | number}
          onChange={(val: string | number | undefined) => {
            handleChange(val);
            if (val !== undefined) {
              const opt = options.find((o) => o.value === val);
              if (opt?.extra) {
                Object.entries(opt.extra).forEach(([k, v]) => {
                  formActions.setFieldValue(k, v);
                });
              }
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          dataSource={options as never[]}
          itemRender={
            schema.optionRender
              ? (item) => {
                  const opt = options.find((o) => o.value === item.value);
                  return opt ? schema.optionRender!(opt) : item.label;
                }
              : undefined
          }
          showSearch
          filterLocal
        />
      );

    case "SelectInfinite":
      return (
        <SelectInfinite
          value={value as string | number}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          error={error}
          paginationOptions={paginationOptions}
          formValues={formValues}
          formActions={formActions}
        />
      );

    case "TreeSelect":
      return (
        <TreeSelect
          style={fullWidthStyle}
          value={value as string | number}
          onChange={handleChange}
          placeholder={placeholder}
          dataSource={options as never[]}
        />
      );

    case "Cascader":
      return (
        <Cascader
          style={fullWidthStyle}
          value={value as string}
          onChange={handleChange}
          placeholder={placeholder}
          dataSource={options as never[]}
        />
      );

    case "DatePicker":
      return (
        <DatePicker
          style={fullWidthStyle}
          value={value as string}
          onChange={(val: unknown) => {
            if (val && typeof (val as Record<string, unknown>).format === "function") {
              handleChange(
                (val as Record<string, unknown>).format(
                  schema.dateFormat || "YYYY-MM-DD",
                ) as string,
              );
            } else {
              handleChange(val);
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          format={schema.dateFormat || "YYYY-MM-DD"}
        />
      );

    case "DateRangePicker":
      return (
        <DatePicker.RangePicker
          style={fullWidthStyle}
          value={value as [string, string]}
          onChange={(val: unknown) => {
            if (Array.isArray(val)) {
              handleChange(
                val.map((d: unknown) =>
                  d && typeof (d as Record<string, unknown>).format === "function"
                    ? (d as Record<string, unknown>).format(schema.dateFormat || "YYYY-MM-DD")
                    : d,
                ),
              );
            } else {
              handleChange(val);
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          format={schema.dateFormat || "YYYY-MM-DD"}
        />
      );

    case "TimePicker":
      return (
        <TimePicker
          style={fullWidthStyle}
          value={value as string}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
        />
      );

    case "NumberPicker":
      return (
        <NumberPicker
          style={fullWidthStyle}
          value={value as number}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
        />
      );

    case "Switch":
      return <Switch checked={Boolean(value)} onChange={handleChange} disabled={disabled} />;

    case "Checkbox":
      return (
        <Checkbox.Group
          style={fullWidthStyle}
          value={value as (string | number)[]}
          onChange={handleChange}
          disabled={disabled}
        >
          {options.map((opt) => (
            <Checkbox key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      );

    case "Radio":
      return (
        <Radio.Group
          style={fullWidthStyle}
          value={value as string | number}
          onChange={handleChange}
          disabled={disabled}
        >
          {options.map((opt) => (
            <Radio key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </Radio>
          ))}
        </Radio.Group>
      );

    case "Rating":
      return <Rating value={value as number} onChange={handleChange} disabled={disabled} />;

    case "Upload":
      return (
        <Upload
          style={fullWidthStyle}
          value={value as never}
          onChange={handleChange}
          disabled={disabled}
          listType="text"
        />
      );

    default:
      return (
        <Input
          style={fullWidthStyle}
          value={value as string}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
        />
      );
  }
};

// ============ 主表单组件 ============

const EasyForm = forwardRef<FormInstance, EasyFormProps>((props, ref) => {
  const {
    schema,
    initialValues = {},
    onSubmit,
    onChange,
    onReset,
    style,
    labelCol = { span: 6 },
    wrapperCol = { span: 18 },
    labelAlign = "left",
    submitText = "提交",
    resetText = "重置",
    showActions = true,
    renderActions,
    disabled: formDisabled = false,
    readonly: formReadonly = false,
    inline = false,
    columns = 1,
  } = props;

  // 表单值
  const [values, setValuesState] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    schema.forEach((item) => {
      if (item.defaultValue !== undefined) {
        init[item.name] = item.defaultValue;
      }
    });
    return { ...init, ...initialValues };
  });

  // 字段错误
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 字段选项（异步加载）
  const [fieldOptions, setFieldOptions] = useState<Record<string, OptionItem[]>>({});

  // 值引用
  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  // 创建表单实例
  const formActionsRef = useRef<FormInstance | null>(null);

  const formActions: FormInstance = useMemo(
    () => ({
      setValues: (newValues) => {
        setValuesState((prev) => ({ ...prev, ...newValues }));
      },
      setFieldValue: (name, value) => {
        setValuesState((prev) => setNestedValue(prev, name, value));
      },
      getValues: () => valuesRef.current,
      getFieldValue: (name) => getNestedValue(valuesRef.current, name),
      reset: () => {
        const init: Record<string, unknown> = {};
        schema.forEach((item) => {
          init[item.name] = item.defaultValue ?? undefined;
        });
        setValuesState({ ...init, ...initialValues });
        setErrors({});
      },
      validate: async () => {
        const newErrors: Record<string, string> = {};
        let valid = true;

        for (const item of schema) {
          const fieldValue = getNestedValue(valuesRef.current, item.name);

          if (item.required) {
            const isEmpty =
              fieldValue === undefined ||
              fieldValue === null ||
              fieldValue === "" ||
              (Array.isArray(fieldValue) && fieldValue.length === 0);
            if (isEmpty) {
              newErrors[item.name] =
                typeof item.required === "string" ? item.required : "此字段为必填项";
              valid = false;
              continue;
            }
          }

          if (item.rules && item.rules.length > 0) {
            const error = await executeValidation(fieldValue, item.rules, valuesRef.current);
            if (error) {
              newErrors[item.name] = error;
              valid = false;
            }
          }
        }

        setErrors(newErrors);
        return { valid, values: valuesRef.current, errors: newErrors };
      },
      setFieldError: (name, error) => {
        setErrors((prev) => ({ ...prev, [name]: error }));
      },
      clearErrors: () => {
        setErrors({});
      },
      setFieldOptions: (name, options) => {
        setFieldOptions((prev) => ({ ...prev, [name]: options }));
      },
      submit: () => {
        formActionsRef.current?.validate().then(({ valid, values }) => {
          if (valid) {
            onSubmit?.(values, formActionsRef.current!);
          }
        });
      },
    }),
    [schema, initialValues, onSubmit],
  );

  useEffect(() => {
    formActionsRef.current = formActions;
  }, [formActions]);

  // 暴露表单实例
  useImperativeHandle(ref, () => formActions, [formActions]);

  // 初始化：加载异步选项和动态属性
  useEffect(() => {
    const init = async () => {
      const newOptions: Record<string, OptionItem[]> = {};

      for (const item of schema) {
        if (typeof item.options === "function") {
          try {
            newOptions[item.name] = await item.options(valuesRef.current, formActionsRef.current!);
          } catch (e) {
            console.error(`Failed to load options for ${item.name}:`, e);
            newOptions[item.name] = [];
          }
        }
      }

      setFieldOptions(newOptions);
    };

    init();
  }, [schema]);

  // 字段值变化处理
  const handleFieldChange = useCallback(
    (name: string, value: unknown) => {
      const next = setNestedValue(valuesRef.current, name, value);
      valuesRef.current = next;

      setValuesState(next);
      setErrors((prev) => {
        const err = { ...prev };
        delete err[name];
        return err;
      });

      onChange?.(next, formActions);

      const fieldSchema = schema.find((s) => s.name === name);
      if (fieldSchema?.onChange) {
        fieldSchema.onChange(value, next, formActions);
      }
      if (fieldSchema?.effect) {
        fieldSchema.effect(value, next, formActions);
      }
    },
    [schema, onChange, formActions],
  );

  // 提交处理
  const handleSubmit = useCallback(async () => {
    const { valid, values: formValues } = await formActions.validate();
    if (valid) {
      try {
        await onSubmit?.(formValues, formActions);
      } catch (e) {
        Message.error(e instanceof Error ? e.message : "提交失败");
      }
    }
  }, [onSubmit, formActions]);

  // 重置处理
  const handleReset = useCallback(() => {
    formActions.reset();
    onReset?.({}, formActions);
  }, [formActions, onReset]);

  // 获取字段选项
  const getFieldOptions = useCallback(
    (item: FormSchema): OptionItem[] => {
      if (typeof item.options === "function") {
        return fieldOptions[item.name] || [];
      }
      return item.options || [];
    },
    [fieldOptions],
  );

  // 预计算字段可见性和禁用状态
  // eslint-disable-next-line react-hooks/refs
  const fieldStates = schema.map((item) => ({
    item,
    isVisible:
      typeof item.visible === "function"
        ? item.visible(values, formActions)
        : item.visible !== false,
    isDisabled:
      typeof item.disabled === "function"
        ? item.disabled(values, formActions)
        : item.disabled === true,
  }));

  // 渲染字段
  const renderFields = useMemo(() => {
    function renderField(item: FormSchema, isDisabled: boolean) {
      const options = getFieldOptions(item);
      const fieldValue = getNestedValue(values, item.name);
      const fieldLabelAlign = item.labelAlign || labelAlign;

      return (
        <Form.Item
          key={item.name}
          label={item.label}
          labelAlign={fieldLabelAlign}
          labelCol={labelCol}
          wrapperCol={wrapperCol}
          required={item.required || item.rules?.some((r) => r.required)}
          help={item.help}
          extra={item.tooltip}
          validateState={errors[item.name] ? "error" : undefined}
          style={{
            marginBottom: 0,
            background: formDisabled || isDisabled ? "#eee" : undefined,
          }}
        >
          <Field
            schema={item}
            value={fieldValue}
            error={errors[item.name] || null}
            disabled={formDisabled || isDisabled}
            readonly={formReadonly}
            options={options}
            formValues={values}
            formActions={formActions}
            onChange={handleFieldChange}
          />
        </Form.Item>
      );
    }

    const visibleFields = fieldStates.filter((fs) => fs.isVisible);

    if (inline) {
      return visibleFields.map((fs) => renderField(fs.item, fs.isDisabled));
    }

    // 栅格布局
    const colSpan = Math.floor(24 / columns);
    return (
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {visibleFields.map((fs) => {
          const itemSpan = fs.item.span || colSpan;
          const itemWidth = fs.item.width || `${(itemSpan / 24) * 100}%`;

          return (
            <div
              key={fs.item.name}
              style={{
                width: itemWidth,
                padding: 10,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  position: "relative",
                  border: errors[fs.item.name] ? "1px solid #dc2626" : "1px solid #e5e7eb",
                  borderRadius: 4,
                  padding: 12,
                  background: errors[fs.item.name]
                    ? "rgba(220, 38, 38, 0.2)"
                    : formDisabled || fs.isDisabled
                      ? "#eee"
                      : undefined,
                }}
              >
                {renderField(fs.item, fs.isDisabled)}
                {errors[fs.item.name] && fs.item.labelAlign !== "top" && (
                  <div
                    style={{
                      position: "absolute",
                      left: `calc(12px + ${((labelCol?.span ?? 6) / 24) * 100}%)`,
                      bottom: -18,
                      color: "#dc2626",
                      fontSize: 12,
                      lineHeight: "16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {errors[fs.item.name]}
                  </div>
                )}
                {errors[fs.item.name] && fs.item.labelAlign === "top" && (
                  <div
                    style={{
                      position: "absolute",
                      left: 12,
                      bottom: -18,
                      color: "#dc2626",
                      fontSize: 12,
                      lineHeight: "16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {errors[fs.item.name]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [
    fieldStates,
    errors,
    formDisabled,
    formReadonly,
    inline,
    columns,
    values,
    formActions,
    handleFieldChange,
    getFieldOptions,
    labelAlign,
    labelCol,
    wrapperCol,
  ]);

  // 渲染操作按钮
  const renderActionButtons = () => {
    if (!showActions) return null;

    if (renderActions) {
      return renderActions(formActions);
    }

    return (
      <Form.Item label=" " colon={false}>
        <Form.Submit
          type="primary"
          style={{ marginRight: 8 }}
          onClick={handleSubmit}
          disabled={formDisabled}
        >
          {submitText}
        </Form.Submit>
        <Form.Reset onClick={handleReset} disabled={formDisabled}>
          {resetText}
        </Form.Reset>
      </Form.Item>
    );
  };

  return (
    <Form
      style={style}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      labelAlign={labelAlign}
      inline={inline}
    >
      {renderFields}
      {
        // eslint-disable-next-line react-hooks/refs
        renderActionButtons()
      }
    </Form>
  );
});

EasyForm.displayName = "EasyForm";

export default EasyForm;
