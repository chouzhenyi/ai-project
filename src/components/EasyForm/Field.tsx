import React, { useCallback, useMemo } from "react";
import {
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
} from "antd";
import dayjs from "dayjs";
import type { FieldProps, OptionItem } from "./types";
import SelectInfinite from "./SelectInfinite";
import "./styles.css";

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
        {error && <div className="easy-form-field-error">{error}</div>}
      </>
    );
  }

  switch (component) {
    case "Input":
      return (
        <Input
          className="easy-form-full-width"
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
          className="easy-form-full-width"
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
          className="easy-form-full-width"
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
          className="easy-form-full-width"
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
          className="easy-form-full-width"
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
          className="easy-form-full-width"
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
          className="easy-form-full-width"
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
          className="easy-form-full-width"
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
          className="easy-form-full-width"
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
          className="easy-form-full-width"
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
          className="easy-form-full-width"
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          {...componentProps}
        />
      );
  }
};

export default Field;
