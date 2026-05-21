import { Button, Space, Popconfirm, message } from "antd";

interface ActionBarProps {
  onSave: () => void;
  onSubmitApproval: () => void;
  onDiscard: () => void;
  isEdit: boolean;
}

const ActionBar = ({ onSave, onSubmitApproval, onDiscard, isEdit }: ActionBarProps) => {
  return (
    <Space style={{ marginBottom: 24 }}>
      <Button type="primary" onClick={onSave}>
        保存
      </Button>
      <Button onClick={onSubmitApproval}>提交审批</Button>
      <Button onClick={() => message.info("Demo: 创建报账单功能待实现")}>创建报账单</Button>
      <Button onClick={() => message.info("Demo: 创建付款单功能待实现")}>创建付款单</Button>
      <Popconfirm title="确定废弃此单据吗？废弃后不可恢复。" onConfirm={onDiscard}>
        <Button danger disabled={!isEdit}>
          废弃
        </Button>
      </Popconfirm>
    </Space>
  );
};

export default ActionBar;
