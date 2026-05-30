import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Steps, Input, InputNumber, Button, Select, Space, message } from "antd";
import VoiceInput from "../components/VoiceInput";
import { itemsApi, type Item } from "../api/items";
import { transactionsApi } from "../api/transactions";
import { DESTINATION_OPTIONS } from "@advanced/shared";

const CheckOutPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [destination, setDestination] = useState("");
  const [destinationType, setDestinationType] = useState("");
  const [notes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    itemsApi.list({ pageSize: 200 }).then((res) => setItems(res.data));
  }, []);

  const filtered = items.filter((i) => i.name.includes(search) && i.quantity > 0);

  const handleSubmit = async () => {
    if (!selectedItem) return;
    if (!destination) { message.warning("请填写去向"); return; }
    if (quantity > selectedItem.quantity) { message.warning(`当前只有 ${selectedItem.quantity} ${selectedItem.unit}`); return; }
    setSubmitting(true);
    try {
      await transactionsApi.checkout(selectedItem.id, quantity, destination, destinationType, notes);
      message.success("出库成功");
      navigate("/m/scan");
    } catch {
      message.error("出库失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>出库</h2>
      <Steps current={step} size="small" items={[{ title: "选物品" }, { title: "填去向" }, { title: "确认" }]} style={{ marginBottom: 24 }} />

      {step === 0 && (
        <Card>
          <Input.Search placeholder="搜索物品" value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 12 }} />
          {filtered.map((item) => (
            <Card
              key={item.id}
              size="small"
              style={{ marginBottom: 8, cursor: "pointer", border: selectedItem?.id === item.id ? "2px solid #1890ff" : undefined }}
              onClick={() => { setSelectedItem(item); setQuantity(Math.min(1, item.quantity)); }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><b>{item.name}</b></span>
                <span>剩余 {item.quantity} {item.unit}</span>
              </div>
            </Card>
          ))}
          <Button type="primary" style={{ marginTop: 12 }} disabled={!selectedItem} onClick={() => setStep(1)}>
            下一步 ({selectedItem?.name})
          </Button>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <p><b>物品：</b>{selectedItem?.name}</p>
          <p><b>当前数量：</b>{selectedItem?.quantity} {selectedItem?.unit}</p>
          <Space style={{ marginBottom: 16 }}>
            <span>取出数量：</span>
            <InputNumber value={quantity} min={0.01} max={selectedItem?.quantity} onChange={(v) => setQuantity(v ?? 0)} />
            <span>{selectedItem?.unit}</span>
          </Space>
          <div style={{ marginBottom: 12 }}>
            <p><b>去向：</b></p>
            <Select
              value={destination}
              onChange={(v) => {
                setDestination(v);
                const opt = DESTINATION_OPTIONS.find((o) => o.value === v);
                setDestinationType(opt?.value || "");
              }}
              style={{ width: "100%" }}
              placeholder="选择去向"
            >
              {DESTINATION_OPTIONS.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
              ))}
            </Select>
          </div>
          <Space style={{ width: "100%", marginBottom: 12 }}>
            <Input placeholder="自定义去向" value={destination} onChange={(e) => setDestination(e.target.value)} style={{ flex: 1 }} />
            <VoiceInput onResult={setDestination} />
          </Space>
          <Space>
            <Button onClick={() => setStep(0)}>上一步</Button>
            <Button type="primary" onClick={() => setStep(2)} disabled={!destination}>下一步</Button>
          </Space>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h4>出库确认</h4>
          <p><b>物品：</b>{selectedItem?.name}</p>
          <p><b>数量：</b>{quantity} {selectedItem?.unit}</p>
          <p><b>去向：</b>{destination}</p>
          <p><b>备注：</b>{notes || "无"}</p>
          <Space>
            <Button onClick={() => setStep(1)}>返回修改</Button>
            <Button type="primary" onClick={handleSubmit} loading={submitting} danger>确认出库</Button>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default CheckOutPage;
