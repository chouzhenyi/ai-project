import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Input, Select, Button, message, Space, Spin } from "antd";
import { containersApi } from "../api/containers";

const NewContainerPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [type, setType] = useState<"room" | "furniture" | "container">("container");
  const [parentId, setParentId] = useState<string | undefined>(searchParams.get("parent") || undefined);
  const [parents, setParents] = useState<{ id: string; name: string; type: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    containersApi.list({}).then((list) => setParents(list)).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) { message.warning("请输入名称"); return; }
    setSubmitting(true);
    try {
      const container = await containersApi.create({
        name: name.trim(),
        type,
        parentId,
      });
      message.success(`创建成功！QR 码：${container.qrCode}`);
      navigate(`/m/box/${container.id}`);
    } catch {
      message.error("创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 24 }}>新建位置</h2>
      <Card>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <p><b>名称</b></p>
            <Input placeholder="如：客厅、衣柜、收纳箱A" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <p><b>类型</b></p>
            <Select value={type} onChange={setType} style={{ width: "100%" }}>
              <Select.Option value="room">房间</Select.Option>
              <Select.Option value="furniture">家具</Select.Option>
              <Select.Option value="container">容器</Select.Option>
            </Select>
          </div>
          <div>
            <p><b>上级位置</b><span style={{ color: "#999", fontWeight: 400 }}>（可选）</span></p>
            {loading ? <Spin size="small" /> : (
              <Select
                value={parentId}
                onChange={setParentId}
                style={{ width: "100%" }}
                placeholder="不选则为顶层"
                allowClear
              >
                {parents.map((p) => (
                  <Select.Option key={p.id} value={p.id}>{p.name} ({p.type})</Select.Option>
                ))}
              </Select>
            )}
          </div>
          <Space style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>
            <Button onClick={() => navigate(-1)}>取消</Button>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>创建</Button>
          </Space>
          <p style={{ color: "#999", fontSize: 12, textAlign: "center", marginTop: 8 }}>
            创建后自动生成 QR 码，可在容器详情页查看和打印
          </p>
        </Space>
      </Card>
    </div>
  );
};

export default NewContainerPage;
