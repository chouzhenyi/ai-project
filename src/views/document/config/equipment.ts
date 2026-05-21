import type { FormSchema } from "../../../components/EasyForm";
import type { ColumnSchema } from "../../../components/EasyTable";
import { EQUIP_STATUS_OPTIONS_CONST, EQUIP_STATUS_MAP } from "../store";

export const EQUIPMENT_SCHEMA: FormSchema[] = [
  {
    name: "equipName",
    label: "设备名称",
    component: "Input",
    required: true,
    span: 12,
  },
  {
    name: "equipType",
    label: "设备类型",
    component: "Input",
    span: 12,
  },
  {
    name: "specModel",
    label: "规格型号",
    component: "Input",
    span: 12,
  },
  {
    name: "serialNo",
    label: "序列号",
    component: "Input",
    span: 12,
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
    span: 8,
    componentProps: { min: 0 },
  },
  {
    name: "equipStatus",
    label: "设备状态",
    component: "Select",
    span: 8,
    options: EQUIP_STATUS_OPTIONS_CONST,
  },
];

export const EQUIPMENT_COLUMNS: ColumnSchema[] = [
  { key: "equipName", title: "设备名称", dataIndex: "equipName", width: 140 },
  { key: "equipType", title: "设备类型", dataIndex: "equipType", width: 100 },
  { key: "specModel", title: "规格型号", dataIndex: "specModel", width: 140 },
  { key: "serialNo", title: "序列号", dataIndex: "serialNo", width: 140 },
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
  {
    key: "equipStatus",
    title: "状态",
    dataIndex: "equipStatus",
    width: 100,
    format: (value) => EQUIP_STATUS_MAP[String(value)] ?? String(value),
  },
];
