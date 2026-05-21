import type { FormSchema } from "../../../components/EasyForm";
import type { ColumnSchema } from "../../../components/EasyTable";

export const ATTACHMENT_SCHEMA: FormSchema[] = [
  {
    name: "fileName",
    label: "附件名称",
    component: "Input",
    required: true,
    span: 24,
  },
  {
    name: "fileSize",
    label: "附件大小",
    component: "Input",
    span: 12,
    placeholder: "如: 2.5MB",
  },
  {
    name: "uploadDate",
    label: "上传日期",
    component: "DatePicker",
    span: 12,
  },
  {
    name: "fileRemark",
    label: "附件备注",
    component: "Input.TextArea",
    span: 24,
  },
  {
    name: "fileUpload",
    label: "上传文件",
    component: "Upload",
    span: 24,
  },
];

export const ATTACHMENT_COLUMNS: ColumnSchema[] = [
  { key: "fileName", title: "附件名称", dataIndex: "fileName", width: 200 },
  { key: "fileSize", title: "附件大小", dataIndex: "fileSize", width: 100 },
  { key: "uploadDate", title: "上传日期", dataIndex: "uploadDate", width: 120 },
  { key: "fileRemark", title: "备注", dataIndex: "fileRemark" },
];
