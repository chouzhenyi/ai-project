import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { addDocument, updateDocument, getNextItemId } from "../store";
import type { DocumentData } from "../store";
import type { FormInstance } from "../../../components/EasyForm";

type DrawerMode = "create" | "edit";

interface UseDocumentFormReturn {
  basicFormRef: React.RefObject<FormInstance>;
  currentStatus: string;
  moduleData: Record<string, Record<string, unknown>[]>;
  drawerOpen: boolean;
  drawerModule: string;
  drawerMode: DrawerMode;
  drawerEditRow: Record<string, unknown> | null;
  basicInfoInitialValues: Record<string, unknown>;
  openDrawer: (moduleKey: string, mode: DrawerMode, row?: Record<string, unknown>) => void;
  closeDrawer: () => void;
  handleDrawerSubmit: (values: Record<string, unknown>) => void;
  handleModuleDelete: (moduleKey: string, rowId: unknown) => void;
  onBasicInfoChange: (values: Record<string, unknown>) => void;
  handleSave: () => Promise<void>;
  handleSubmitApproval: () => Promise<void>;
  handleDiscard: () => void;
}

const useDocumentForm = (editDoc: DocumentData | undefined): UseDocumentFormReturn => {
  const isEdit = !!editDoc;
  const navigate = useNavigate();

  const basicFormRef = useRef<FormInstance>(null);

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

  const basicInfoInitialValues =
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
      : { status: "draft", currency: "CNY" };

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

  const onBasicInfoChange = useCallback((values: Record<string, unknown>) => {
    setCurrentStatus(String(values.status || "draft"));
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
    if (isEdit && editDoc) {
      updateDocument(String(editDoc.id), data);
      message.success("保存成功");
    } else {
      addDocument(data);
      message.success("保存成功");
    }
    navigate("/document");
  }, [collectAllData, isEdit, editDoc, navigate]);

  const handleSubmitApproval = useCallback(async () => {
    const data = await collectAllData();
    if (!data) return;
    data.status = "submitted";
    if (isEdit && editDoc) {
      updateDocument(String(editDoc.id), data);
    } else {
      addDocument(data);
    }
    message.success("提交审批成功");
    navigate("/document");
  }, [collectAllData, isEdit, editDoc, navigate]);

  const handleDiscard = useCallback(() => {
    if (isEdit && editDoc) {
      updateDocument(String(editDoc.id), { status: "abandoned" });
      message.success("单据已废弃");
      navigate("/document");
    } else {
      message.warning("新建单据无法废弃，请先保存");
    }
  }, [isEdit, editDoc, navigate]);

  return {
    basicFormRef,
    currentStatus,
    moduleData,
    drawerOpen,
    drawerModule,
    drawerMode,
    drawerEditRow,
    basicInfoInitialValues,
    openDrawer,
    closeDrawer,
    handleDrawerSubmit,
    handleModuleDelete,
    onBasicInfoChange,
    handleSave,
    handleSubmitApproval,
    handleDiscard,
  };
};

export default useDocumentForm;
