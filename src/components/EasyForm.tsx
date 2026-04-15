import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  NumberPicker,
  Switch,
  Checkbox,
  Radio,
} from "@alifd/next";

// 组件类型
type ComponentType =
  | "Input"
  | "Input.Password"
  | "Input.TextArea"
  | "Select"
  | "DatePicker"
  | "NumberPicker"
  | "Switch"
  | "Checkbox"
  | "Radio"
  | "Custom";

// 动态组件属性类型
type DynamicComponentProps =
  | Record<string, unknown>
  | ((
      formModel: Record<string, unknown>,
      formActions: FormActions,
    ) => Promise<Record<string, unknown>>);

// 表单字段 Schema
export interface FormSchema {
  name: string; // 字段名
  label: string; // 标签
  component?: ComponentType; // 组件类型
  componentProps?: DynamicComponentProps; // 动态组件属性
  customRender?: (props: CustomRenderProps) => React.ReactNode; // 自定义渲染
}

// 自定义组件属性
export interface CustomRenderProps {
  value: unknown;
  onChange: (value: unknown) => void;
  disabled: boolean;
}

// 表单操作方法
export interface FormActions {
  setValues: (values: Record<string, unknown>) => void;
  getValues: () => Record<string, unknown>;
}

// EasyForm 属性
export interface EasyFormProps {
  schema: FormSchema[];
  onSubmit?: (values: Record<string, unknown>) => void;
  onChange?: (values: Record<string, unknown>) => void;
  style?: React.CSSProperties;
  labelCol?: { fixedSpan?: number; span?: number };
  wrapperCol?: { span?: number };
  submitText?: string;
  resetText?: string;
}

// 组件映射
const componentMap: Record<string, React.ComponentType<Record<string, unknown>>> = {
  Input,
  "Input.Password": Input.Password,
  "Input.TextArea": Input.TextArea,
  Select,
  DatePicker,
  NumberPicker,
  Switch,
  Checkbox,
  Radio,
};

// 字段组件：渲染单个表单字段
interface FieldProps {
  schema: FormSchema;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
  extraProps: Record<string, unknown>;
}

// 渲染单个字段
const Field: React.FC<FieldProps> = ({ schema, value, onChange, extraProps }) => {
  const { component, name, options, customRender } = schema;

  const handleChange = useCallback(
    (newValue: unknown) => {
      onChange(name, newValue);
    },
    [name, onChange],
  );

  // 自定义组件
  if (component === "Custom" && customRender) {
    return <>{customRender({ value, onChange: handleChange, disabled: !!extraProps.disabled })}</>;
  }

  const Component = componentMap[component || "Input"];

  // Select 组件
  if (component === "Select" && options) {
    return (
      <Select
        value={value as string | number}
        disabled={Boolean(extraProps.disabled)}
        dataSource={options}
        onChange={handleChange}
        {...extraProps}
      />
    );
  }

  // Checkbox 组
  if (component === "Checkbox") {
    return (
      <Checkbox.Group
        value={value as (string | number)[]}
        disabled={Boolean(extraProps.disabled)}
        onChange={handleChange}
        {...extraProps}
      >
        {options?.map((opt) => (
          <Checkbox key={String(opt.value)} value={opt.value}>
            {opt.label}
          </Checkbox>
        ))}
      </Checkbox.Group>
    );
  }

  // Radio 组
  if (component === "Radio") {
    return (
      <Radio.Group
        value={value as string | number}
        disabled={Boolean(extraProps.disabled)}
        onChange={handleChange}
        {...extraProps}
      >
        {options?.map((opt) => (
          <Radio key={String(opt.value)} value={opt.value}>
            {opt.label}
          </Radio>
        ))}
      </Radio.Group>
    );
  }

  // Switch 组件
  if (component === "Switch") {
    return (
      <Switch
        checked={Boolean(value)}
        disabled={Boolean(extraProps.disabled)}
        onChange={handleChange}
        {...extraProps}
      />
    );
  }

  // 通用组件
  if (Component) {
    return (
      <Component
        value={value}
        disabled={Boolean(extraProps.disabled)}
        onChange={handleChange}
        {...extraProps}
      />
    );
  }

  return <Input {...extraProps} />;
};

// 主表单组件
const EasyForm: React.FC<EasyFormProps> = (props) => {
  const {
    schema,
    onSubmit,
    onChange,
    style,
    labelCol = { fixedSpan: 8 },
    wrapperCol = { span: 14 },
    submitText = "提交",
    resetText = "重置",
  } = props;

  // 表单值状态
  const [values, setValues] = useState<Record<string, unknown>>({});

  // 动态组件属性缓存
  const [componentPropsMap, setComponentPropsMap] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const valuesRef = useRef(values);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const formActions: FormActions = useRef({
    setValues: (newValues: Record<string, unknown>) =>
      setValues((prev) => ({ ...prev, ...newValues })),
    getValues: () => valuesRef.current,
  }).current;

  // 初始化
  useEffect(() => {
    const init = async () => {
      const newPropsMap: Record<string, Record<string, unknown>> = {};
      const defaults: Record<string, unknown> = {};

      for (const item of schema) {
        if (item.componentProps) {
          if (typeof item.componentProps === "function") {
            newPropsMap[item.name] = await item.componentProps({}, formActions);
          } else {
            newPropsMap[item.name] = item.componentProps as Record<string, unknown>;
            if ("defaultValue" in newPropsMap[item.name]) {
              defaults[item.name] = newPropsMap[item.name].defaultValue;
            }
          }
        }
      }
      setComponentPropsMap(newPropsMap);
      if (Object.keys(defaults).length > 0) {
        setValues(defaults);
      }
    };
    init();
  }, [schema]);

  // 字段值变化处理
  const handleFieldChange = useCallback(
    (name: string, value: unknown) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  // 提交处理
  const handleSubmit = useCallback(() => {
    onSubmit?.(values);
  }, [onSubmit, values]);

  // 重置处理
  const handleReset = useCallback(() => {
    const initial: Record<string, unknown> = {};
    schema.forEach((item) => {
      const extraProps = componentPropsMap[item.name] || {};
      const defaultValue = extraProps.defaultValue;
      initial[item.name] = defaultValue ?? (item.component === "Switch" ? false : "");
    });
    setValues(initial);
    onChange?.(initial);
  }, [schema, componentPropsMap, onChange]);

  // 字段渲染
  const renderFields = () => {
    const rows: React.ReactNode[][] = [];
    let currentRow: React.ReactNode[] = [];
    let currentSpan = 0;

    schema.forEach((schemaItem) => {
      const span = schemaItem.span || 24;
      if (currentSpan + span > 24) {
        rows.push(currentRow);
        currentRow = [];
        currentSpan = 0;
      }
      currentRow.push(schemaItem);
      currentSpan += span;
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows.map((row, rowIndex) => (
      <div key={rowIndex} style={{ display: "flex", flexWrap: "wrap", marginBottom: -16 }}>
        {row.map((item) => {
          const schemaItem = item as FormSchema;
          const { name, label } = schemaItem;
          const extraProps = componentPropsMap[name] || {};
          const { required, defaultValue, width, span } = extraProps as Record<string, unknown>;
          const value =
            values[name] ?? defaultValue ?? (schemaItem.component === "Switch" ? false : "");
          const itemSpan = (span as number) || 24;
          const itemWidth = width || (itemSpan >= 24 ? "100%" : undefined);

          return (
            <div
              key={name}
              style={{
                width: itemWidth || `${(itemSpan / 24) * 100}%`,
                paddingRight: 16,
                boxSizing: "border-box",
                paddingBottom: 16,
              }}
            >
              <Form.Item name={name} label={label} required={required as boolean}>
                <Field
                  schema={schemaItem}
                  value={value}
                  onChange={handleFieldChange}
                  extraProps={extraProps}
                />
              </Form.Item>
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <Form style={style} labelCol={labelCol} wrapperCol={wrapperCol} onSubmit={handleSubmit}>
      {renderFields()}
      <Form.Item label=" " colon={false}>
        <Form.Submit type="primary" style={{ marginRight: 8 }} onClick={handleSubmit}>
          {submitText}
        </Form.Submit>
        <Form.Reset onClick={handleReset}>{resetText}</Form.Reset>
      </Form.Item>
    </Form>
  );
};

export default EasyForm;
