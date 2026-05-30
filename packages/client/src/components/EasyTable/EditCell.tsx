import React from "react";
import { Input, Select, InputNumber, DatePicker, Switch, Checkbox, Radio } from "antd";
import dayjs from "dayjs";
import type { EditCellProps, TableOptionItem } from "./types";
import "../shared.css";

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
          className="easy-shared-full-width"
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
          className="easy-shared-full-width"
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
          className="easy-shared-full-width"
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
          className="easy-shared-full-width"
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

export default EditCell;
