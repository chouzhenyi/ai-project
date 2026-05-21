import type { FormSchema } from "../../../components/EasyForm";
import {
  TYPE_OPTIONS_CONST,
  STATUS_OPTIONS_CONST,
  CURRENCY_OPTIONS_CONST,
  DEPARTMENT_OPTIONS_CONST,
} from "../store";

export const BASIC_INFO_SCHEMA: FormSchema[] = [
  {
    name: "code",
    label: "单据编号",
    component: "Input",
    required: true,
    span: 8,
  },
  {
    name: "name",
    label: "单据名称",
    component: "Input",
    required: true,
    span: 8,
  },
  {
    name: "type",
    label: "单据类型",
    component: "Select",
    required: true,
    span: 8,
    options: TYPE_OPTIONS_CONST,
  },
  {
    name: "date",
    label: "单据日期",
    component: "DatePicker",
    required: true,
    span: 8,
  },
  {
    name: "amount",
    label: "金额",
    component: "NumberPicker",
    required: true,
    span: 8,
    componentProps: { min: 0 },
  },
  {
    name: "currency",
    label: "币种",
    component: "Select",
    span: 8,
    options: CURRENCY_OPTIONS_CONST,
  },
  {
    name: "handler",
    label: "经办人",
    component: "Input",
    span: 8,
  },
  {
    name: "department",
    label: "部门",
    component: "Select",
    span: 8,
    options: DEPARTMENT_OPTIONS_CONST,
  },
  {
    name: "remark",
    label: "备注",
    component: "Input.TextArea",
    span: 16,
  },
  {
    name: "status",
    label: "状态",
    component: "Select",
    span: 8,
    options: STATUS_OPTIONS_CONST,
    disabled: true,
  },
];
