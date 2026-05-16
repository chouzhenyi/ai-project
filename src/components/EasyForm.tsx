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
  InputNumber,
  Switch,
  Checkbox,
  Radio,
  Upload,
  Rate,
  TimePicker,
  TreeSelect,
  Cascader,
  message,
  Row,
  Col,
  Button,
} from "antd";
import dayjs from "dayjs";

// ============ 类型定义 ============

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
  onChange?: (
    value: unknown,
    formValues: Record<string, unknown>,
    formActions: FormInstance,
  ) => void;
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

// ============ 工具函数 ============

const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, key) => {
    return acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined;
  }, obj);
};

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

const executeValidation = async (
  value: unknown,
  rules: ValidationRule[],
  formValues: Record<string, unknown>,
): Promise<string | null> => {
  if (!rules || rules.length === 0) return null;

  for (const rule of rules) {
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

    if (rule.pattern && value !== undefined && value !== null && value !== "") {
      if (!rule.pattern.test(String(value))) {
        return "格式不正确";
      }
    }

    if (rule.min !== undefined && value !== undefined && value !== null && value !== "") {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue < rule.min) {
        return `最小值为 ${rule.min}`;
      }
      if (typeof value === "string" && value.length < rule.min) {
        return `最少输入 ${rule.min} 个字符`;
      }
    }

    if (rule.max !== undefined && value !== undefined && value !== null && value !== "") {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > rule.max) {
        return `最大值为 ${rule.max}`;
      }
      if (typeof value === "string" && value.length > rule.max) {
        return `最多输入 ${rule.max} 个字符`;
      }
    }

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

// ============ 无限滚动选择器 ============

interface SelectInfiniteProps {
  value?: string | number;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  placeholder?: string;
  paginationOptions?: PaginationOptionsLoader;
  formValues: Record<string, unknown>;
  formActions: FormInstance;
}

const SelectInfinite: React.FC<SelectInfiniteProps> = ({
  value,
  onChange,
  disabled,
  placeholder,
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

  useEffect(() => {
    if (paginationOptions) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(1);
      setOptions([]);
      loadOptions(1, "", false);
    }
  }, [paginationOptions, loadOptions]);

  const handleSearch = useCallback(
    (searchKeyword: string) => {
      setKeyword(searchKeyword);
      setPage(1);
      setOptions([]);
      loadOptions(1, searchKeyword, false);
    },
    [loadOptions],
  );

  const handleScrollToBottom = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadOptions(nextPage, keyword);
    }
  }, [hasMore, loading, page, keyword, loadOptions]);

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
    <Select
      style={{ width: "100%" }}
      value={value}
      onChange={(val) => onChange?.(val)}
      disabled={disabled}
      placeholder={placeholder}
      options={options}
      showSearch
      onSearch={handleSearch}
      filterOption={false}
      onPopupScroll={(e) => {
        const target = e.target as HTMLElement;
        if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10) {
          handleScrollToBottom();
        }
      }}
      dropdownRender={(menu) => (
        <>
          {menu}
          {renderFooter()}
          {hasMore && !loading && (
            <div
              style={{ textAlign: "center", padding: 8, cursor: "pointer", color: "#1677ff" }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleScrollToBottom}
            >
              点击加载更多
            </div>
          )}
        </>
      )}
    />
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
  const {
    component = "Input",
    name,
    render,
    placeholder,
    paginationOptions,
    componentProps: rawComponentProps,
  } = schema;

  const componentProps = useMemo(() => {
    if (typeof rawComponentProps === "function") {
      return rawComponentProps(formValues, formActions) as Record<string, unknown>;
    }
    return rawComponentProps || {};
  }, [rawComponentProps, formValues, formActions]);

  const handleChange = useCallback(
    (newValue: unknown) => {
      onChange(name, newValue);
    },
    [name, onChange],
  );

  const fullWidthStyle = { width: "100%" };

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
        {error && <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 4 }}>{error}</div>}
      </>
    );
  }

  switch (component) {
    case "Input":
      return (
        <Input
          style={fullWidthStyle}
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          {...componentProps}
        />
      );

    case "Input.Password":
      return (
        <Input.Password
          style={fullWidthStyle}
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          {...componentProps}
        />
      );

    case "Input.TextArea":
      return (
        <Input.TextArea
          style={fullWidthStyle}
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          {...componentProps}
        />
      );

    case "Select":
      return (
        <Select
          style={fullWidthStyle}
          value={value as string | number | undefined}
          onChange={(val, option) => {
            handleChange(val);
            if (option && (option as OptionItem).extra) {
              const opt = option as OptionItem;
              Object.entries(opt.extra!).forEach(([k, v]) => {
                formActions.setFieldValue(k, v);
              });
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          options={options}
          optionRender={
            schema.optionRender ? (opt) => schema.optionRender!(opt.data as OptionItem) : undefined
          }
          showSearch
          optionFilterProp="label"
          {...componentProps}
        />
      );

    case "SelectInfinite":
      return (
        <SelectInfinite
          value={value as string | number}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
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
          onChange={(val) => handleChange(val)}
          placeholder={placeholder}
          treeData={options as never}
          disabled={disabled}
          {...componentProps}
        />
      );

    case "Cascader":
      return (
        <Cascader
          style={fullWidthStyle}
          value={value as (string | number)[]}
          onChange={(val) => handleChange(val)}
          placeholder={placeholder}
          options={options as never}
          disabled={disabled}
          {...componentProps}
        />
      );

    case "DatePicker": {
      const dateFormat = schema.dateFormat || "YYYY-MM-DD";
      return (
        <DatePicker
          style={fullWidthStyle}
          value={value ? dayjs(value as string, dateFormat) : undefined}
          onChange={(dayjsValue) => {
            handleChange(dayjsValue ? dayjsValue.format(dateFormat) : undefined);
          }}
          disabled={disabled}
          placeholder={placeholder}
          format={dateFormat}
          {...componentProps}
        />
      );
    }

    case "DateRangePicker": {
      const dateFormat = schema.dateFormat || "YYYY-MM-DD";
      return (
        <DatePicker.RangePicker
          style={fullWidthStyle}
          value={
            Array.isArray(value) && value.length === 2
              ? [dayjs(value[0] as string, dateFormat), dayjs(value[1] as string, dateFormat)]
              : undefined
          }
          onChange={(values) => {
            if (values && values[0] && values[1]) {
              handleChange([values[0].format(dateFormat), values[1].format(dateFormat)]);
            } else {
              handleChange(undefined);
            }
          }}
          disabled={disabled}
          placeholder={placeholder ? ([placeholder, placeholder] as [string, string]) : undefined}
          format={dateFormat}
          {...componentProps}
        />
      );
    }

    case "TimePicker": {
      const timeFormat = schema.dateFormat || "HH:mm:ss";
      return (
        <TimePicker
          style={fullWidthStyle}
          value={value ? dayjs(value as string, timeFormat) : undefined}
          onChange={(dayjsValue) => {
            handleChange(dayjsValue ? dayjsValue.format(timeFormat) : undefined);
          }}
          disabled={disabled}
          placeholder={placeholder}
          format={timeFormat}
          {...componentProps}
        />
      );
    }

    case "NumberPicker":
      return (
        <InputNumber
          style={fullWidthStyle}
          value={value as number}
          onChange={(val) => handleChange(val)}
          disabled={disabled}
          placeholder={placeholder}
          {...componentProps}
        />
      );

    case "Switch":
      return (
        <Switch
          checked={Boolean(value)}
          onChange={(checked) => handleChange(checked)}
          disabled={disabled}
          {...componentProps}
        />
      );

    case "Checkbox":
      return (
        <Checkbox.Group
          value={value as (string | number)[]}
          onChange={(vals) => handleChange(vals)}
          disabled={disabled}
          options={options}
          {...componentProps}
        />
      );

    case "Radio":
      return (
        <Radio.Group
          value={value as string | number}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          options={options}
          {...componentProps}
        />
      );

    case "Rating":
      return (
        <Rate
          value={value as number}
          onChange={(val) => handleChange(val)}
          disabled={disabled}
          {...componentProps}
        />
      );

    case "Upload":
      return (
        <Upload
          fileList={(value as never) ?? []}
          onChange={(info) => handleChange(info.fileList)}
          disabled={disabled}
          {...componentProps}
        />
      );

    default:
      return (
        <Input
          style={fullWidthStyle}
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          {...componentProps}
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

  const [values, setValuesState] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    schema.forEach((item) => {
      if (item.defaultValue !== undefined) {
        init[item.name] = item.defaultValue;
      }
    });
    return { ...init, ...initialValues };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldOptions, setFieldOptions] = useState<Record<string, OptionItem[]>>({});

  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

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

  useImperativeHandle(ref, () => formActions, [formActions]);

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
  }, [schema, initialValues]);

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

  const handleSubmit = useCallback(async () => {
    const { valid, values: formValues } = await formActions.validate();
    if (valid) {
      try {
        await onSubmit?.(formValues, formActions);
      } catch (e) {
        message.error(e instanceof Error ? e.message : "提交失败");
      }
    }
  }, [onSubmit, formActions]);

  const handleReset = useCallback(() => {
    formActions.reset();
    onReset?.({}, formActions);
  }, [formActions, onReset]);

  const getFieldOptions = useCallback(
    (item: FormSchema): OptionItem[] => {
      if (typeof item.options === "function") {
        return fieldOptions[item.name] || [];
      }
      return item.options || [];
    },
    [fieldOptions],
  );

  /* eslint-disable react-hooks/refs -- formActions is a stable memo, callbacks may read refs but only in event handlers */
  const fieldStates = useMemo(
    () =>
      schema.map((item) => ({
        item,
        isVisible:
          typeof item.visible === "function"
            ? item.visible(values, formActions)
            : item.visible !== false,
        isDisabled:
          typeof item.disabled === "function"
            ? item.disabled(values, formActions)
            : item.disabled === true,
      })),
    [schema, values, formActions],
  );
  /* eslint-enable react-hooks/refs */

  const renderFields = useMemo(() => {
    const visibleFields = fieldStates.filter((fs) => fs.isVisible);

    if (inline) {
      return visibleFields.map((fs) => {
        const item = fs.item;
        const fieldLabelAlign = item.labelAlign || labelAlign;
        const options = getFieldOptions(item);
        const fieldValue = getNestedValue(values, item.name);

        const isTopLabel = fieldLabelAlign === "top";
        const itemLabelCol = isTopLabel ? { span: 24 } : labelCol;
        const itemWrapperCol = isTopLabel ? { span: 24 } : wrapperCol;

        return (
          <Form.Item
            key={item.name}
            label={item.label}
            required={item.required || item.rules?.some((r) => r.required)}
            validateStatus={errors[item.name] ? "error" : undefined}
            help={errors[item.name]}
            extra={item.tooltip}
            labelCol={itemLabelCol}
            wrapperCol={itemWrapperCol}
          >
            <Field
              schema={item}
              value={fieldValue}
              error={errors[item.name] || null}
              disabled={formDisabled || fs.isDisabled}
              readonly={formReadonly}
              options={options}
              formValues={values}
              formActions={formActions}
              onChange={handleFieldChange}
            />
          </Form.Item>
        );
      });
    }

    const colSpan = Math.floor(24 / columns);
    return (
      <Row gutter={[16, 16]}>
        {visibleFields.map((fs) => {
          const item = fs.item;
          const fieldLabelAlign = item.labelAlign || labelAlign;
          const options = getFieldOptions(item);
          const fieldValue = getNestedValue(values, item.name);
          const itemSpan = item.span || colSpan;

          const isTopLabel = fieldLabelAlign === "top";
          const itemLabelCol = isTopLabel ? { span: 24 } : labelCol;
          const itemWrapperCol = isTopLabel ? { span: 24 } : wrapperCol;

          return (
            <Col key={item.name} span={itemSpan}>
              <Form.Item
                label={item.label}
                required={item.required || item.rules?.some((r) => r.required)}
                validateStatus={errors[item.name] ? "error" : undefined}
                help={errors[item.name]}
                extra={item.tooltip}
                labelCol={itemLabelCol}
                wrapperCol={itemWrapperCol}
              >
                <Field
                  schema={item}
                  value={fieldValue}
                  error={errors[item.name] || null}
                  disabled={formDisabled || fs.isDisabled}
                  readonly={formReadonly}
                  options={options}
                  formValues={values}
                  formActions={formActions}
                  onChange={handleFieldChange}
                />
              </Form.Item>
            </Col>
          );
        })}
      </Row>
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

  const renderActionButtons = () => {
    if (!showActions) return null;

    if (renderActions) {
      return renderActions(formActions);
    }

    return (
      <Form.Item wrapperCol={{ offset: labelCol.span, span: wrapperCol.span }}>
        <Button type="primary" onClick={handleSubmit} disabled={formDisabled}>
          {submitText}
        </Button>
        <Button onClick={handleReset} disabled={formDisabled} style={{ marginLeft: 8 }}>
          {resetText}
        </Button>
      </Form.Item>
    );
  };

  return (
    <Form
      style={style}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      labelAlign={labelAlign === "top" ? "left" : labelAlign === "inset" ? "left" : labelAlign}
      layout={inline ? "inline" : "horizontal"}
    >
      {renderFields}
      {/* eslint-disable-next-line react-hooks/refs -- renderActionButtons reads formActions (stable memo with ref-based methods) */}
      {renderActionButtons()}
    </Form>
  );
});

EasyForm.displayName = "EasyForm";

export default EasyForm;
