import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Steps, Button, Input, InputNumber, message, Space, DatePicker, Spin } from "antd";
import CameraScanner from "../components/CameraScanner";
import { containersApi, type Container } from "../api/containers";
import { transactionsApi } from "../api/transactions";

interface ItemEntry {
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  notes?: string;
}

const CheckInPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [containerId, setContainerId] = useState(searchParams.get("container") || "");
  const [containerName, setContainerName] = useState("");
  const [containers, setContainers] = useState<Container[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ItemEntry[]>([{ name: "", quantity: 1, unit: "个" }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    containersApi.list({ keyword: search || undefined }).then(setContainers);
  }, [search]);

  const filtered = containers.slice(0, 50);

  const handleScan = (code: string) => {
    const id = code.replace(/^C:/, "");
    setContainerId(id);
    setStep(1);
    message.success("容器识别成功");
  };

  const selectContainer = (c: Container) => {
    setContainerId(c.id);
    setContainerName(c.name);
    setStep(1);
  };

  const updateItem = (index: number, field: keyof ItemEntry, value: string | number | undefined) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  const addItem = () => setItems([...items, { name: "", quantity: 1, unit: "个" }]);
  const removeItem = (index: number) => items.length > 1 && setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!containerId) { message.warning("请选择容器"); return; }
    if (!items.some((i) => i.name)) { message.warning("请至少输入一个物品"); return; }
    setSubmitting(true);
    try {
      await transactionsApi.checkin(containerId, items);
      message.success("入库成功");
      navigate("/m/scan");
    } catch {
      message.error("入库失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>入库</h2>
      <Steps current={step} size="small" items={[
        { title: "选容器" }, { title: "填物品" }, { title: "确认" },
      ]} style={{ marginBottom: 24 }} />

      {step === 0 && (
        <Card>
          <p style={{ marginBottom: 12, color: "#999" }}>搜索或扫码选择要放入的容器</p>
          <Space style={{ marginBottom: 12, width: "100%" }}>
            <Input.Search
              placeholder="搜索容器名称" value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <CameraScanner onResult={handleScan} buttonText="📷" />
          </Space>
          {loading ? <Spin /> : (
            <div style={{ maxHeight: 360, overflow: "auto" }}>
              {filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectContainer(c)}
                  style={{
                    padding: "10px 12px", marginBottom: 6, borderRadius: 8, cursor: "pointer",
                    border: "1px solid #f0f0f0", background: containerId === c.id ? "#e6f7ff" : "#fff",
                  }}
                >
                  <b>{c.name}</b>
                  <span style={{ color: "#999", marginLeft: 8 }}>{c.type}</span>
                  <span style={{ color: "#999", marginLeft: 8, fontSize: 12 }}>{c.qrCode || ""}</span>
                </div>
              ))}
              {filtered.length === 0 && <p style={{ color: "#999", textAlign: "center", marginTop: 24 }}>无匹配容器，请先新建</p>}
            </div>
          )}
          <Space style={{ marginTop: 12, justifyContent: "center", width: "100%" }}>
            <Button onClick={() => navigate("/m/new-container")}>+ 新建容器</Button>
          </Space>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <p style={{ color: "#1890ff", marginBottom: 12 }}>容器：{containerName || containerId}</p>
          {items.map((item, i) => (
            <div key={i} style={{ marginBottom: 12, padding: 8, border: "1px solid #f0f0f0", borderRadius: 8 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Input placeholder="物品名称" value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} />
                <Space>
                  <InputNumber placeholder="数量" value={item.quantity} min={0.01} onChange={(v) => updateItem(i, "quantity", v ?? 0)} />
                  <Input placeholder="单位" value={item.unit} onChange={(e) => updateItem(i, "unit", e.target.value)} style={{ width: 80 }} />
                  <Button danger size="small" onClick={() => removeItem(i)}>✕</Button>
                </Space>
                <DatePicker placeholder="到期日期" onChange={(_v, d) => updateItem(i, "expiryDate", d as string)} style={{ width: "100%" }} />
              </Space>
            </div>
          ))}
          <Space style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}>
            <Button type="dashed" onClick={addItem}>+ 添加物品</Button>
          </Space>
          <Space>
            <Button onClick={() => setStep(0)}>上一步</Button>
            <Button type="primary" onClick={() => setStep(2)} disabled={!items.some((i) => i.name)}>下一步</Button>
          </Space>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h4>入库确认</h4>
          <p><b>容器：</b>{containerName || containerId}</p>
          <ul>
            {items.filter((i) => i.name).map((item, i) => (
              <li key={i}>{item.name} × {item.quantity}{item.unit}{item.expiryDate ? ` (到期: ${item.expiryDate})` : ""}</li>
            ))}
          </ul>
          <Space>
            <Button onClick={() => setStep(1)}>返回修改</Button>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>确认入库</Button>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default CheckInPage;
