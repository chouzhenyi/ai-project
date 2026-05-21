import { Card } from "antd";
import EasyTable from "../../../components/EasyTable";
import type { ModuleConfig } from "../config";

interface ModuleSectionProps {
  config: ModuleConfig;
  dataSource: Record<string, unknown>[];
  onAdd: () => void;
  onEdit: (record: Record<string, unknown>) => void;
  onDelete: (id: unknown) => void;
}

const ModuleSection = ({ config, dataSource, onAdd, onEdit, onDelete }: ModuleSectionProps) => {
  return (
    <Card title={config.label} style={{ marginBottom: 16 }}>
      <EasyTable
        columns={config.columns}
        dataSource={dataSource}
        showActions
        actions={[
          {
            key: "edit",
            text: "编辑",
            type: "primary",
            onClick: (record) => onEdit(record),
          },
          {
            key: "delete",
            text: "删除",
            danger: true,
            confirm: "确定删除吗？",
            onClick: (record) => onDelete(record.id),
          },
        ]}
        actionsWidth={150}
        showAddButton
        addButtonText="新建"
        onAddClick={onAdd}
        hasBorder
        maxBodyHeight={300}
      />
    </Card>
  );
};

export default ModuleSection;
