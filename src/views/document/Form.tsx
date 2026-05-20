import { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Space, Drawer, message, Popconfirm, Tag } from "antd";
import EasyForm, { type FormSchema, type FormInstance } from "../../components/EasyForm";
import EasyTable, { type ColumnSchema, type ActionSchema } from "../../components/EasyTable";
import {
  getDocumentById,
  addDocument,
  updateDocument,
  getNextItemId,
  type DocumentData,
  TYPE_OPTIONS_CONST,
  STATUS_OPTIONS_CONST,
  CURRENCY_OPTIONS_CONST,
  DEPARTMENT_OPTIONS_CONST,
  INVOICE_TYPE_OPTIONS_CONST,
  INVOICE_TYPE_MAP,
  EQUIP_STATUS_OPTIONS_CONST,
  EQUIP_STATUS_MAP,
  RELATED_TYPE_OPTIONS_CONST,
  RELATED_TYPE_MAP,
  getStatusColor,
  STATUS_MAP,
} from "./store";

const BASIC_INFO_SCHEMA: FormSchema[] = [
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

const INVOICE_SCHEMA: FormSchema[] = [
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

const PARTS_SCHEMA: FormSchema[] = [
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

const EQUIPMENT_SCHEMA: FormSchema[] = [
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

const SUPPLIER_SCHEMA: FormSchema[] = [
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

const ATTACHMENT_SCHEMA: FormSchema[] = [
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

const RELATED_DOC_SCHEMA: FormSchema[] = [
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

const INVOICE_COLUMNS: ColumnSchema[] = [
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

const PARTS_COLUMNS: ColumnSchema[] = [
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

const EQUIPMENT_COLUMNS: ColumnSchema[] = [
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

const SUPPLIER_COLUMNS: ColumnSchema[] = [
  { key: "supplierName", title: "供应商名称", dataIndex: "supplierName", width: 160 },
  { key: "contactPerson", title: "联系人", dataIndex: "contactPerson", width: 100 },
  { key: "contactPhone", title: "联系电话", dataIndex: "contactPhone", width: 130 },
  { key: "contactAddress", title: "联系地址", dataIndex: "contactAddress" },
  { key: "bankName", title: "开户银行", dataIndex: "bankName", width: 140 },
  { key: "bankAccount", title: "银行账号", dataIndex: "bankAccount", width: 160 },
  { key: "taxNo", title: "税号", dataIndex: "taxNo", width: 180 },
];

const ATTACHMENT_COLUMNS: ColumnSchema[] = [
  { key: "fileName", title: "附件名称", dataIndex: "fileName", width: 200 },
  { key: "fileSize", title: "附件大小", dataIndex: "fileSize", width: 100 },
  { key: "uploadDate", title: "上传日期", dataIndex: "uploadDate", width: 120 },
  { key: "fileRemark", title: "备注", dataIndex: "fileRemark" },
];

const RELATED_DOC_COLUMNS: ColumnSchema[] = [
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

interface ModuleConfig {
  label: string;
  schema: FormSchema[];
  columns: ColumnSchema[];
}

const MODULE_CONFIG: Record<string, ModuleConfig> = {
  invoice: { label: "发票信息", schema: INVOICE_SCHEMA, columns: INVOICE_COLUMNS },
  parts: { label: "配件信息", schema: PARTS_SCHEMA, columns: PARTS_COLUMNS },
  equipment: { label: "设备信息", schema: EQUIPMENT_SCHEMA, columns: EQUIPMENT_COLUMNS },
  supplier: { label: "供应商信息", schema: SUPPLIER_SCHEMA, columns: SUPPLIER_COLUMNS },
  attachment: { label: "附件信息", schema: ATTACHMENT_SCHEMA, columns: ATTACHMENT_COLUMNS },
  relatedDoc: { label: "关联单据信息", schema: RELATED_DOC_SCHEMA, columns: RELATED_DOC_COLUMNS },
};

type DrawerMode = "create" | "edit";

const DocumentForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const editDoc = isEdit && id ? getDocumentById(id) : undefined;

  const basicFormRef = useRef<FormInstance>(null);
  const drawerFormRef = useRef<FormInstance>(null);

  const [currentStatus, setCurrentStatus] = useState(editDoc?.status || "draft");

  const [moduleData, setModuleData] = useState<Record<string, Record<string, unknown>[]>>(() => ({
    invoice: editDoc?.invoices || [],
    parts: editDoc?.parts || [],
    equipment: editDoc?.equipment || [],
    supplier: editDoc?.suppliers || [],
    attachment: editDoc?.attachments || [],
    relatedDoc: editDoc?.relatedDocs || [],
  }));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerModule, setDrawerModule] = useState("");
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [drawerEditRow, setDrawerEditRow] = useState<Record<string, unknown> | null>(null);

  const openDrawer = useCallback(
    (moduleKey: string, mode: DrawerMode, row?: Record<string, unknown>) => {
      setDrawerModule(moduleKey);
      setDrawerMode(mode);
      setDrawerEditRow(mode === "edit" ? row || null : null);
      setDrawerOpen(true);
    },
    [],
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDrawerModule("");
    setDrawerEditRow(null);
  }, []);

  const handleDrawerSubmit = useCallback(
    (values: Record<string, unknown>) => {
      setModuleData((prev) => {
        const current = prev[drawerModule] || [];
        if (drawerMode === "create") {
          return {
            ...prev,
            [drawerModule]: [...current, { id: getNextItemId(), ...values }],
          };
        }
        return {
          ...prev,
          [drawerModule]: current.map((item) =>
            item.id === drawerEditRow?.id ? { ...item, ...values } : item,
          ),
        };
      });
      closeDrawer();
      message.success(drawerMode === "create" ? "新建成功" : "编辑成功");
    },
    [drawerModule, drawerMode, drawerEditRow, closeDrawer],
  );

  const handleModuleDelete = useCallback((moduleKey: string, rowId: unknown) => {
    setModuleData((prev) => ({
      ...prev,
      [moduleKey]: (prev[moduleKey] || []).filter((item) => item.id !== rowId),
    }));
    message.success("删除成功");
  }, []);

  const collectAllData = useCallback(async () => {
    const basicResult = await basicFormRef.current?.validate();
    if (!basicResult?.valid) {
      message.error("请检查基本信息");
      return null;
    }
    return {
      ...basicResult.values,
      supplierName: String(
        (moduleData.supplier as Record<string, unknown>[])[0]?.supplierName || "",
      ),
      invoices: moduleData.invoice,
      parts: moduleData.parts,
      equipment: moduleData.equipment,
      suppliers: moduleData.supplier,
      attachments: moduleData.attachment,
      relatedDocs: moduleData.relatedDoc,
    } as Partial<DocumentData>;
  }, [moduleData]);

  const handleSave = useCallback(async () => {
    const data = await collectAllData();
    if (!data) return;
    if (isEdit && id) {
      updateDocument(id, data);
      message.success("保存成功");
    } else {
      addDocument(data);
      message.success("保存成功");
    }
    navigate("/document");
  }, [collectAllData, isEdit, id, navigate]);

  const handleSubmitApproval = useCallback(async () => {
    const data = await collectAllData();
    if (!data) return;
    data.status = "submitted";
    if (isEdit && id) {
      updateDocument(id, data);
    } else {
      addDocument(data);
    }
    message.success("提交审批成功");
    navigate("/document");
  }, [collectAllData, isEdit, id, navigate]);

  const handleDiscard = useCallback(() => {
    if (isEdit && id) {
      updateDocument(id, { status: "abandoned" });
      message.success("单据已废弃");
      navigate("/document");
    } else {
      message.warning("新建单据无法废弃，请先保存");
    }
  }, [isEdit, id, navigate]);

  const getModuleActions = useCallback(
    (moduleKey: string): ActionSchema[] => [
      {
        key: "edit",
        text: "编辑",
        type: "primary",
        onClick: (record) => openDrawer(moduleKey, "edit", record),
      },
      {
        key: "delete",
        text: "删除",
        danger: true,
        confirm: "确定删除吗？",
        onClick: (record) => handleModuleDelete(moduleKey, record.id),
      },
    ],
    [openDrawer, handleModuleDelete],
  );

  const renderModuleSection = (moduleKey: string) => {
    const config = MODULE_CONFIG[moduleKey];
    const data = moduleData[moduleKey] || [];
    return (
      <Card title={config.label} style={{ marginBottom: 16 }} key={moduleKey}>
        <EasyTable
          columns={config.columns}
          dataSource={data}
          showActions
          actions={getModuleActions(moduleKey)}
          actionsWidth={150}
          showAddButton
          addButtonText="新建"
          onAddClick={() => openDrawer(moduleKey, "create")}
          hasBorder
          maxBodyHeight={300}
        />
      </Card>
    );
  };

  const drawerConfig = MODULE_CONFIG[drawerModule];

  const drawerTitle = drawerConfig
    ? `${drawerMode === "create" ? "新建" : "编辑"}${drawerConfig.label}`
    : "";

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>
        {isEdit ? "编辑单据" : "新建单据"}
        {isEdit && (
          <Tag color={getStatusColor(currentStatus)} style={{ marginLeft: 12 }}>
            {STATUS_MAP[currentStatus] || "草稿"}
          </Tag>
        )}
      </h2>

      <Space style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={handleSave}>
          保存
        </Button>
        <Button onClick={handleSubmitApproval}>提交审批</Button>
        <Button onClick={() => message.info("Demo: 创建报账单功能待实现")}>创建报账单</Button>
        <Button onClick={() => message.info("Demo: 创建付款单功能待实现")}>创建付款单</Button>
        <Popconfirm title="确定废弃此单据吗？废弃后不可恢复。" onConfirm={handleDiscard}>
          <Button danger>废弃</Button>
        </Popconfirm>
      </Space>

      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <EasyForm
          ref={basicFormRef}
          schema={BASIC_INFO_SCHEMA}
          showActions={false}
          columns={3}
          initialValues={
            isEdit && editDoc
              ? {
                  code: editDoc.code,
                  name: editDoc.name,
                  type: editDoc.type,
                  date: editDoc.date,
                  amount: editDoc.amount,
                  currency: editDoc.currency,
                  handler: editDoc.handler,
                  department: editDoc.department,
                  remark: editDoc.remark,
                  status: editDoc.status,
                }
              : { status: "draft", currency: "CNY" }
          }
          onChange={(values) => {
            setCurrentStatus(String(values.status || "draft"));
          }}
        />
      </Card>

      {Object.keys(MODULE_CONFIG).map(renderModuleSection)}

      <Drawer
        title={drawerTitle}
        open={drawerOpen}
        onClose={closeDrawer}
        width={600}
        destroyOnClose
      >
        {drawerConfig && (
          <EasyForm
            ref={drawerFormRef}
            schema={drawerConfig.schema}
            initialValues={drawerMode === "edit" && drawerEditRow ? drawerEditRow : undefined}
            onSubmit={handleDrawerSubmit}
            columns={2}
            renderActions={(form) => (
              <Space>
                <Button type="primary" onClick={() => form.submit()}>
                  确定
                </Button>
                <Button onClick={closeDrawer}>取消</Button>
              </Space>
            )}
          />
        )}
      </Drawer>
    </div>
  );
};

export default DocumentForm;
