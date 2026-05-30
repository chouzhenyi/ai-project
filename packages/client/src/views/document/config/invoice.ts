import type { FormSchema } from "../../../components/EasyForm";
import type { ColumnSchema } from "../../../components/EasyTable";
import { INVOICE_TYPE_OPTIONS_CONST, INVOICE_TYPE_MAP } from "../store";

export const INVOICE_SCHEMA: FormSchema[] = [
  {
    name: "invoiceType",
    label: "发票类型",
    component: "Select",
    required: true,
    span: 12,
    options: INVOICE_TYPE_OPTIONS_CONST,
  },
  {
    name: "invoiceNo",
    label: "发票号码",
    component: "Input",
    required: true,
    span: 12,
  },
  {
    name: "invoiceDate",
    label: "开票日期",
    component: "DatePicker",
    span: 12,
  },
  {
    name: "invoiceAmount",
    label: "发票金额",
    component: "NumberPicker",
    required: true,
    span: 12,
    componentProps: { min: 0 },
  },
  {
    name: "taxRate",
    label: "税率",
    component: "NumberPicker",
    span: 12,
    componentProps: { min: 0, max: 100 },
  },
  {
    name: "taxAmount",
    label: "税额",
    component: "NumberPicker",
    span: 12,
    componentProps: { min: 0 },
  },
  {
    name: "noTaxAmount",
    label: "不含税金额",
    component: "NumberPicker",
    span: 12,
    componentProps: { min: 0 },
  },
  {
    name: "invoiceParty",
    label: "开票方",
    component: "Input",
    span: 12,
  },
  {
    name: "invoiceRemark",
    label: "发票备注",
    component: "Input.TextArea",
    span: 24,
  },
];

export const INVOICE_COLUMNS: ColumnSchema[] = [
  {
    key: "invoiceType",
    title: "发票类型",
    dataIndex: "invoiceType",
    width: 140,
    format: (value) => INVOICE_TYPE_MAP[String(value)] ?? String(value),
  },
  { key: "invoiceNo", title: "发票号码", dataIndex: "invoiceNo", width: 140 },
  { key: "invoiceDate", title: "开票日期", dataIndex: "invoiceDate", width: 120 },
  {
    key: "invoiceAmount",
    title: "发票金额",
    dataIndex: "invoiceAmount",
    width: 120,
    align: "right",
    format: (value) => `¥ ${Number(value).toLocaleString()}`,
  },
  { key: "taxRate", title: "税率", dataIndex: "taxRate", width: 80, format: (v) => `${v}%` },
  {
    key: "taxAmount",
    title: "税额",
    dataIndex: "taxAmount",
    width: 120,
    align: "right",
    format: (value) => `¥ ${Number(value).toLocaleString()}`,
  },
  {
    key: "noTaxAmount",
    title: "不含税金额",
    dataIndex: "noTaxAmount",
    width: 120,
    align: "right",
    format: (value) => `¥ ${Number(value).toLocaleString()}`,
  },
  { key: "invoiceParty", title: "开票方", dataIndex: "invoiceParty", width: 120 },
  { key: "invoiceRemark", title: "备注", dataIndex: "invoiceRemark" },
];
