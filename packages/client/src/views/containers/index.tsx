import { useState, useEffect } from "react";
import { Tree, Card, Table, Button, Modal, Input, Select, Space, message, Spin } from "antd";
import type { TreeProps } from "antd";

interface DataNode {
  key: string;
  title: string;
  children?: DataNode[];
}
import { containersApi, type Container, type TreeNode } from "../../api/containers";

const ContainersPage = () => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [containerItems, setContainerItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createType, setCreateType] = useState("container");
  const [createParentId, setCreateParentId] = useState<string | undefined>();

  const loadTree = async () => {
    setLoading(true);
    try {
      const tree = await containersApi.tree();
      const convert = (nodes: TreeNode[]): DataNode[] =>
        nodes.map((n) => ({
          key: n.id,
          title: `${n.name} [${n.type}]`,
          children: n.children ? convert(n.children) : undefined,
        }));
      setTreeData(convert(tree));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTree(); }, []);

  const handleSelect: TreeProps["onSelect"] = async (keys) => {
    if (!keys.length) return;
    const container = await containersApi.getById(keys[0] as string);
    setSelectedContainer(container as unknown as Container);
    setContainerItems((container.items || []) as Record<string, unknown>[]);
  };

  const handleCreate = async () => {
    if (!createName) { message.warning("请输入名称"); return; }
    await containersApi.create({ name: createName, type: createType, parentId: createParentId });
    message.success("创建成功");
    setCreateOpen(false);
    setCreateName("");
    loadTree();
  };

  const handleDelete = async (id: string) => {
    try {
      await containersApi.delete(id);
      message.success("已删除");
      setSelectedContainer(null);
      loadTree();
    } catch {
      message.error("删除失败，请确认容器为空且无子节点");
    }
  };

  const itemColumns = [
    { title: "物品名称", dataIndex: "name", key: "name" },
    { title: "数量", dataIndex: "quantity", key: "quantity", render: (v: unknown, r: Record<string, unknown>) => `${v} ${r.unit}` },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>容器管理</h2>
      <div style={{ display: "flex", gap: 16 }}>
        <Card title="位置树" style={{ width: 360, minHeight: 400 }}>
          <Space style={{ marginBottom: 12 }}>
            <Button size="small" onClick={() => { setCreateParentId(undefined); setCreateOpen(true); }}>新增位置</Button>
            <Button size="small" onClick={loadTree}>刷新</Button>
          </Space>
          {loading ? <Spin /> : <Tree treeData={treeData} onSelect={handleSelect} defaultExpandAll />}
        </Card>
        <Card title="容器详情" style={{ flex: 1, minHeight: 400 }}>
          {selectedContainer ? (
            <>
              <p><b>名称：</b>{selectedContainer.name}</p>
              <p><b>类型：</b>{selectedContainer.type}</p>
              <p><b>QR 码：</b>
                {selectedContainer.qrCode ? (
                  <>
                    {selectedContainer.qrCode}
                    <Button type="link" size="small" href={`/api/v1/qrcodes/container/${selectedContainer.id}`} target="_blank">
                      打印
                    </Button>
                  </>
                ) : "无"}
              </p>
              <p><b>存放条件：</b>{selectedContainer.conditions || "未设置"}</p>
              <Space style={{ marginBottom: 12 }}>
                <Button size="small" onClick={() => { setCreateParentId(selectedContainer.id); setCreateOpen(true); }}>添加子位置</Button>
                <Button size="small" danger onClick={() => handleDelete(selectedContainer.id)}>删除</Button>
              </Space>
              <h4>物品清单</h4>
              <Table dataSource={containerItems} columns={itemColumns} rowKey="id" size="small" pagination={false} />
            </>
          ) : (
            <span style={{ color: "#999" }}>请从左侧选择容器</span>
          )}
        </Card>
      </div>

      <Modal title="新增位置" open={createOpen} onOk={handleCreate} onCancel={() => setCreateOpen(false)}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input placeholder="名称" value={createName} onChange={(e) => setCreateName(e.target.value)} />
          <Select value={createType} onChange={setCreateType} style={{ width: "100%" }}>
            <Select.Option value="room">房间</Select.Option>
            <Select.Option value="furniture">家具</Select.Option>
            <Select.Option value="container">容器</Select.Option>
          </Select>
        </Space>
      </Modal>
    </div>
  );
};

export default ContainersPage;
