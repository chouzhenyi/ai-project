export interface DocumentData {
  id: number;
  code: string;
  name: string;
  type: string;
  date: string;
  amount: number;
  currency: string;
  handler: string;
  department: string;
  remark: string;
  status: string;
  supplierName: string;
  createTime: string;
  invoices: Record<string, unknown>[];
  parts: Record<string, unknown>[];
  equipment: Record<string, unknown>[];
  suppliers: Record<string, unknown>[];
  attachments: Record<string, unknown>[];
  relatedDocs: Record<string, unknown>[];
}

const TYPE_OPTIONS = [
  { label: "采购", value: "purchase" },
  { label: "销售", value: "sales" },
  { label: "调拨", value: "transfer" },
  { label: "退货", value: "return" },
];

const STATUS_OPTIONS = [
  { label: "草稿", value: "draft" },
  { label: "已提交审批", value: "submitted" },
  { label: "已废弃", value: "abandoned" },
];

const CURRENCY_OPTIONS = [
  { label: "人民币", value: "CNY" },
  { label: "美元", value: "USD" },
  { label: "欧元", value: "EUR" },
];

const DEPARTMENT_OPTIONS = [
  { label: "采购部", value: "purchase" },
  { label: "技术部", value: "tech" },
  { label: "销售部", value: "sales" },
  { label: "运营部", value: "operation" },
];

export const TYPE_MAP = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.label]));
export const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]));
export const TYPE_OPTIONS_CONST = TYPE_OPTIONS;
export const STATUS_OPTIONS_CONST = STATUS_OPTIONS;
export const CURRENCY_OPTIONS_CONST = CURRENCY_OPTIONS;
export const DEPARTMENT_OPTIONS_CONST = DEPARTMENT_OPTIONS;

const STATUS_COLOR_MAP: Record<string, string> = {
  draft: "default",
  submitted: "processing",
  abandoned: "error",
};

export const getStatusColor = (status: string) => STATUS_COLOR_MAP[status] || "default";

const INVOICE_TYPE_OPTIONS = [
  { label: "增值税专用发票", value: "special" },
  { label: "增值税普通发票", value: "ordinary" },
  { label: "电子发票", value: "electronic" },
];

export const INVOICE_TYPE_OPTIONS_CONST = INVOICE_TYPE_OPTIONS;
export const INVOICE_TYPE_MAP = Object.fromEntries(
  INVOICE_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

const EQUIP_STATUS_OPTIONS = [
  { label: "正常", value: "normal" },
  { label: "维修中", value: "repair" },
  { label: "已报废", value: "scrapped" },
];

export const EQUIP_STATUS_OPTIONS_CONST = EQUIP_STATUS_OPTIONS;
export const EQUIP_STATUS_MAP = Object.fromEntries(
  EQUIP_STATUS_OPTIONS.map((o) => [o.value, o.label]),
);

const RELATED_TYPE_OPTIONS = [
  { label: "付款单", value: "payment" },
  { label: "报账单", value: "reimbursement" },
  { label: "退货单", value: "return" },
];

export const RELATED_TYPE_OPTIONS_CONST = RELATED_TYPE_OPTIONS;
export const RELATED_TYPE_MAP = Object.fromEntries(
  RELATED_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

const documents: DocumentData[] = [
  {
    id: 1,
    code: "DOC2024001",
    name: "服务器采购单",
    type: "purchase",
    date: "2024-01-15",
    amount: 150000,
    currency: "CNY",
    handler: "张三",
    department: "tech",
    remark: "年度服务器采购计划",
    status: "draft",
    supplierName: "华为技术有限公司",
    createTime: "2024-01-15 10:30:00",
    invoices: [
      {
        id: 1,
        invoiceType: "special",
        invoiceNo: "FP20240001",
        invoiceDate: "2024-01-16",
        invoiceAmount: 150000,
        taxRate: 13,
        taxAmount: 19500,
        noTaxAmount: 130500,
        invoiceParty: "华为技术",
        invoiceRemark: "",
      },
    ],
    parts: [
      {
        id: 1,
        partName: "CPU",
        specModel: "Intel Xeon E5-2680",
        unit: "个",
        quantity: 10,
        unitPrice: 5000,
        amount: 50000,
      },
      {
        id: 2,
        partName: "内存条",
        specModel: "DDR4 32GB",
        unit: "条",
        quantity: 20,
        unitPrice: 800,
        amount: 16000,
      },
    ],
    equipment: [
      {
        id: 1,
        equipName: "机架服务器",
        equipType: "server",
        specModel: "Dell R740",
        serialNo: "SN20240001",
        quantity: 5,
        unitPrice: 20000,
        amount: 100000,
        equipStatus: "normal",
      },
    ],
    suppliers: [
      {
        id: 1,
        supplierName: "华为技术有限公司",
        contactPerson: "李经理",
        contactPhone: "13800138001",
        contactAddress: "深圳市龙岗区坂田街道",
        bankName: "中国银行深圳分行",
        bankAccount: "6225880123456789",
        taxNo: "91440300715218356X",
      },
    ],
    attachments: [
      {
        id: 1,
        fileName: "采购合同.pdf",
        fileSize: "2.5MB",
        uploadDate: "2024-01-15",
        fileRemark: "正式采购合同",
      },
    ],
    relatedDocs: [
      {
        id: 1,
        relatedCode: "PAY2024001",
        relatedType: "payment",
        relatedName: "服务器付款单",
        relatedDate: "2024-01-20",
        relatedPerson: "张三",
      },
    ],
  },
  {
    id: 2,
    code: "DOC2024002",
    name: "办公设备采购单",
    type: "purchase",
    date: "2024-02-10",
    amount: 35000,
    currency: "CNY",
    handler: "李四",
    department: "purchase",
    remark: "",
    status: "submitted",
    supplierName: "联想集团",
    createTime: "2024-02-10 14:20:00",
    invoices: [
      {
        id: 3,
        invoiceType: "ordinary",
        invoiceNo: "FP20240020",
        invoiceDate: "2024-02-11",
        invoiceAmount: 35000,
        taxRate: 13,
        taxAmount: 4550,
        noTaxAmount: 30450,
        invoiceParty: "联想集团",
        invoiceRemark: "",
      },
    ],
    parts: [],
    equipment: [
      {
        id: 2,
        equipName: "笔记本电脑",
        equipType: "laptop",
        specModel: "ThinkPad X1 Carbon",
        serialNo: "SN20240002",
        quantity: 10,
        unitPrice: 3500,
        amount: 35000,
        equipStatus: "normal",
      },
    ],
    suppliers: [
      {
        id: 2,
        supplierName: "联想集团",
        contactPerson: "王经理",
        contactPhone: "13900139002",
        contactAddress: "北京市海淀区",
        bankName: "工商银行北京分行",
        bankAccount: "6222081234567890",
        taxNo: "911101087123456789",
      },
    ],
    attachments: [],
    relatedDocs: [],
  },
  {
    id: 3,
    code: "DOC2024003",
    name: "原材料退货单",
    type: "return",
    date: "2024-03-05",
    amount: 8000,
    currency: "CNY",
    handler: "王五",
    department: "purchase",
    remark: "质量问题退货",
    status: "abandoned",
    supplierName: "材料供应商A",
    createTime: "2024-03-05 09:00:00",
    invoices: [],
    parts: [],
    equipment: [],
    suppliers: [],
    attachments: [],
    relatedDocs: [],
  },
  {
    id: 4,
    code: "DOC2024004",
    name: "仓库调拨单",
    type: "transfer",
    date: "2024-03-20",
    amount: 0,
    currency: "CNY",
    handler: "赵六",
    department: "operation",
    remark: "北京仓调拨至上海仓",
    status: "draft",
    supplierName: "",
    createTime: "2024-03-20 16:00:00",
    invoices: [],
    parts: [
      {
        id: 3,
        partName: "包装箱",
        specModel: "50x50x40",
        unit: "个",
        quantity: 200,
        unitPrice: 15,
        amount: 3000,
      },
    ],
    equipment: [],
    suppliers: [],
    attachments: [],
    relatedDocs: [],
  },
  {
    id: 5,
    code: "DOC2024005",
    name: "客户销售单",
    type: "sales",
    date: "2024-04-01",
    amount: 28000,
    currency: "CNY",
    handler: "钱七",
    department: "sales",
    remark: "",
    status: "submitted",
    supplierName: "",
    createTime: "2024-04-01 11:00:00",
    invoices: [
      {
        id: 4,
        invoiceType: "electronic",
        invoiceNo: "FP20240050",
        invoiceDate: "2024-04-02",
        invoiceAmount: 28000,
        taxRate: 13,
        taxAmount: 3640,
        noTaxAmount: 24360,
        invoiceParty: "本公司",
        invoiceRemark: "电子发票",
      },
    ],
    parts: [],
    equipment: [],
    suppliers: [],
    attachments: [
      {
        id: 2,
        fileName: "销售协议.docx",
        fileSize: "1.2MB",
        uploadDate: "2024-04-01",
        fileRemark: "",
      },
    ],
    relatedDocs: [],
  },
];

let nextDocId = 6;
let nextItemId = 200;

export const getDocuments = (): DocumentData[] => documents;

export const getDocumentById = (id: string | number): DocumentData | undefined =>
  documents.find((d) => d.id === Number(id));

export const addDocument = (doc: Partial<DocumentData>): DocumentData => {
  const newDoc: DocumentData = {
    id: nextDocId++,
    code: doc.code || "",
    name: doc.name || "",
    type: doc.type || "purchase",
    date: doc.date || new Date().toISOString().slice(0, 10),
    amount: doc.amount || 0,
    currency: doc.currency || "CNY",
    handler: doc.handler || "",
    department: doc.department || "",
    remark: doc.remark || "",
    status: doc.status || "draft",
    supplierName: doc.supplierName || "",
    createTime: new Date().toISOString().replace("T", " ").slice(0, 19),
    invoices: doc.invoices || [],
    parts: doc.parts || [],
    equipment: doc.equipment || [],
    suppliers: doc.suppliers || [],
    attachments: doc.attachments || [],
    relatedDocs: doc.relatedDocs || [],
  };
  documents.push(newDoc);
  return newDoc;
};

export const updateDocument = (
  id: string | number,
  updates: Partial<DocumentData>,
): DocumentData | undefined => {
  const idx = documents.findIndex((d) => d.id === Number(id));
  if (idx === -1) return undefined;
  documents[idx] = { ...documents[idx], ...updates };
  return documents[idx];
};

export const deleteDocument = (id: string | number): boolean => {
  const idx = documents.findIndex((d) => d.id === Number(id));
  if (idx === -1) return false;
  documents.splice(idx, 1);
  return true;
};

export const getNextItemId = (): number => nextItemId++;
