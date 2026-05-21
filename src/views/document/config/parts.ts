import type { FormSchema } from "../../../components/EasyForm";
import type { ColumnSchema } from "../../../components/EasyTable";

export const PARTS_SCHEMA: FormSchema[] = [
  {
    name: "partName",
    label: "配件名称",
    component: "Input",
    required: true,
    span: 12,
  },
  {
    name: "specModel",
    label: "规格型号",
    component: "Input",
    span: 12,
  },
  {
    name: "unit",
    label: "单位",
    component: "Input",
    span: 8,
  },
  {
    name: "quantity",
    label: "数量",
    component: "NumberPicker",
    required: true,
    span: 8,
    componentProps: { min: 0 },
  },
  {
    name: "unitPrice",
    label: "单价",
    component: "NumberPicker",
    required: true,
    span: 8,
    componentProps: { min: 0 },
  },
  {
    name: "amount",
    label: "金额",
    component: "NumberPicker",
    span: 12,
    componentProps: { min: 0 },
  },
];

export const PARTS_COLUMNS: ColumnSchema[] = [
  { key: "partName", title: "配件名称", dataIndex: "partName", width: 140 },
  { key: "specModel", title: "规格型号", dataIndex: "specModel", width: 140 },
  { key: "unit", title: "单位", dataIndex: "unit", width: 80 },
  { key: "quantity", title: "数量", dataIndex: "quantity", width: 80 },
  {
    key: "unitPrice",
    title: "单价",
    dataIndex: "unitPrice",
    width: 100,
    align: "right",
    format: (value) => `¥ ${Number(value).toLocaleString()}`,
  },
  {
    key: "amount",
    title: "金额",
    dataIndex: "amount",
    width: 120,
    align: "right",
    format: (value) => `¥ ${Number(value).toLocaleString()}`,
  },
];
