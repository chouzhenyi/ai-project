import type { FormSchema } from "../../../components/EasyForm";
import type { ColumnSchema } from "../../../components/EasyTable";
import { RELATED_TYPE_OPTIONS_CONST, RELATED_TYPE_MAP } from "../store";

export const RELATED_DOC_SCHEMA: FormSchema[] = [
  {
    name: "relatedCode",
    label: "关联单据编号",
    component: "Input",
    required: true,
    span: 12,
  },
  {
    name: "relatedType",
    label: "关联单据类型",
    component: "Select",
    required: true,
    span: 12,
    options: RELATED_TYPE_OPTIONS_CONST,
  },
  {
    name: "relatedName",
    label: "关联单据名称",
    component: "Input",
    span: 12,
  },
  {
    name: "relatedDate",
    label: "关联日期",
    component: "DatePicker",
    span: 12,
  },
  {
    name: "relatedPerson",
    label: "关联人",
    component: "Input",
    span: 12,
  },
];

export const RELATED_DOC_COLUMNS: ColumnSchema[] = [
  { key: "relatedCode", title: "关联单据编号", dataIndex: "relatedCode", width: 160 },
  {
    key: "relatedType",
    title: "关联单据类型",
    dataIndex: "relatedType",
    width: 120,
    format: (value) => RELATED_TYPE_MAP[String(value)] ?? String(value),
  },
  { key: "relatedName", title: "关联单据名称", dataIndex: "relatedName", width: 160 },
  { key: "relatedDate", title: "关联日期", dataIndex: "relatedDate", width: 120 },
  { key: "relatedPerson", title: "关联人", dataIndex: "relatedPerson", width: 100 },
];
