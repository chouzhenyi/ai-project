import type { FormSchema } from "../../../components/EasyForm";
import type { ColumnSchema } from "../../../components/EasyTable";

export const SUPPLIER_SCHEMA: FormSchema[] = [
  {
    name: "supplierName",
    label: "供应商名称",
    component: "Input",
    required: true,
    span: 12,
  },
  {
    name: "contactPerson",
    label: "联系人",
    component: "Input",
    span: 12,
  },
  {
    name: "contactPhone",
    label: "联系电话",
    component: "Input",
    span: 12,
  },
  {
    name: "contactAddress",
    label: "联系地址",
    component: "Input",
    span: 12,
  },
  {
    name: "bankName",
    label: "开户银行",
    component: "Input",
    span: 12,
  },
  {
    name: "bankAccount",
    label: "银行账号",
    component: "Input",
    span: 12,
  },
  {
    name: "taxNo",
    label: "税号",
    component: "Input",
    span: 12,
  },
];

export const SUPPLIER_COLUMNS: ColumnSchema[] = [
  { key: "supplierName", title: "供应商名称", dataIndex: "supplierName", width: 160 },
  { key: "contactPerson", title: "联系人", dataIndex: "contactPerson", width: 100 },
  { key: "contactPhone", title: "联系电话", dataIndex: "contactPhone", width: 130 },
  { key: "contactAddress", title: "联系地址", dataIndex: "contactAddress" },
  { key: "bankName", title: "开户银行", dataIndex: "bankName", width: 140 },
  { key: "bankAccount", title: "银行账号", dataIndex: "bankAccount", width: 160 },
  { key: "taxNo", title: "税号", dataIndex: "taxNo", width: 180 },
];
