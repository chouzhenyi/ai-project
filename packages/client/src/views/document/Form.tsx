import { useParams } from "react-router-dom";
import { Tag } from "antd";
import { getDocumentById, getStatusColor, STATUS_MAP } from "./store";
import ActionBar from "./components/ActionBar";
import BasicInfoSection from "./components/BasicInfoSection";
import ModuleSection from "./components/ModuleSection";
import ModuleDrawer from "./components/ModuleDrawer";
import RelatedDocSection from "./components/RelatedDocSection";
import useDocumentForm from "./hooks/useDocumentForm";
import { MODULE_CONFIG } from "./config";

const DocumentForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const editDoc = isEdit && id ? getDocumentById(id) : undefined;

  const {
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
  } = useDocumentForm(editDoc);

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

      <ActionBar
        onSave={handleSave}
        onSubmitApproval={handleSubmitApproval}
        onDiscard={handleDiscard}
        isEdit={isEdit}
      />

      <BasicInfoSection
        formRef={basicFormRef}
        initialValues={basicInfoInitialValues}
        onChange={onBasicInfoChange}
      />

      {Object.keys(MODULE_CONFIG)
        .filter((k) => k !== "relatedDoc")
        .map((moduleKey) => (
          <ModuleSection
            key={moduleKey}
            config={MODULE_CONFIG[moduleKey]}
            dataSource={moduleData[moduleKey] || []}
            onAdd={() => openDrawer(moduleKey, "create")}
            onEdit={(record) => openDrawer(moduleKey, "edit", record)}
            onDelete={(rowId) => handleModuleDelete(moduleKey, rowId)}
          />
        ))}

      <RelatedDocSection dataSource={moduleData.relatedDoc || []} />

      <ModuleDrawer
        open={drawerOpen}
        config={drawerModule ? MODULE_CONFIG[drawerModule] : null}
        mode={drawerMode}
        editRow={drawerEditRow}
        onSubmit={handleDrawerSubmit}
        onClose={closeDrawer}
      />
    </div>
  );
};

export default DocumentForm;
