import type { FormSchema } from "../../../components/EasyForm";
import type { ColumnSchema } from "../../../components/EasyTable";
import { BASIC_INFO_SCHEMA } from "./basicInfo";
import { INVOICE_SCHEMA, INVOICE_COLUMNS } from "./invoice";
import { PARTS_SCHEMA, PARTS_COLUMNS } from "./parts";
import { EQUIPMENT_SCHEMA, EQUIPMENT_COLUMNS } from "./equipment";
import { SUPPLIER_SCHEMA, SUPPLIER_COLUMNS } from "./supplier";
import { ATTACHMENT_SCHEMA, ATTACHMENT_COLUMNS } from "./attachment";
import { RELATED_DOC_SCHEMA, RELATED_DOC_COLUMNS } from "./relatedDoc";

export interface ModuleConfig {
  label: string;
  schema: FormSchema[];
  columns: ColumnSchema[];
}

export const MODULE_CONFIG: Record<string, ModuleConfig> = {
  invoice: { label: "发票信息", schema: INVOICE_SCHEMA, columns: INVOICE_COLUMNS },
  parts: { label: "配件信息", schema: PARTS_SCHEMA, columns: PARTS_COLUMNS },
  equipment: { label: "设备信息", schema: EQUIPMENT_SCHEMA, columns: EQUIPMENT_COLUMNS },
  supplier: { label: "供应商信息", schema: SUPPLIER_SCHEMA, columns: SUPPLIER_COLUMNS },
  attachment: { label: "附件信息", schema: ATTACHMENT_SCHEMA, columns: ATTACHMENT_COLUMNS },
  relatedDoc: { label: "关联单据信息", schema: RELATED_DOC_SCHEMA, columns: RELATED_DOC_COLUMNS },
};

export { BASIC_INFO_SCHEMA };
