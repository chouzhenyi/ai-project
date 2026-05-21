import { Drawer, Space, Button } from "antd";
import EasyForm from "../../../components/EasyForm";
import type { ModuleConfig } from "../config";

interface ModuleDrawerProps {
  open: boolean;
  config: ModuleConfig | null;
  mode: "create" | "edit";
  editRow: Record<string, unknown> | null;
  onSubmit: (values: Record<string, unknown>) => void;
  onClose: () => void;
}

const ModuleDrawer = ({ open, config, mode, editRow, onSubmit, onClose }: ModuleDrawerProps) => {
  const drawerTitle = config ? `${mode === "create" ? "新建" : "编辑"}${config.label}` : "";

  return (
    <Drawer title={drawerTitle} open={open} onClose={onClose} width={600} destroyOnClose>
      {config && (
        <EasyForm
          schema={config.schema}
          initialValues={mode === "edit" && editRow ? editRow : undefined}
          onSubmit={onSubmit}
          columns={2}
          renderActions={(form) => (
            <Space>
              <Button type="primary" onClick={() => form.submit()}>
                确定
              </Button>
              <Button onClick={onClose}>取消</Button>
            </Space>
          )}
        />
      )}
    </Drawer>
  );
};

export default ModuleDrawer;
