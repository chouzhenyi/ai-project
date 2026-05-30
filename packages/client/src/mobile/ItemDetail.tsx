import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Tag, Table, Spin, Button, Space, Input, Image, message } from "antd";
import { itemsApi, type Item } from "../api/items";
import { transactionsApi, type Transaction } from "../api/transactions";
import { aiApi } from "../api/ai";

const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      itemsApi.getById(id),
      transactionsApi.list({ itemId: id, pageSize: 50 }),
    ]).then(([itemData, txData]) => {
      setItem(itemData);
      setTxs(txData.data);
      setEditNotes(itemData.notes || "");
      setPhotos(itemData.photoPaths ? JSON.parse(itemData.photoPaths) : []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/v1/photos/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.data?.url) {
        const updated = [...photos, json.data.url];
        setPhotos(updated);

        // Auto-trigger AI identify from photo
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(",")[1];
          setAiLoading(true);
          try {
            const result = await aiApi.identify(base64);
            if (result.notes) {
              setEditNotes(result.notes.slice(0, 200));
              message.success("AI 已生成注意事项");
            }
          } catch {
            // vision failed, silently continue
          } finally {
            setAiLoading(false);
          }
        };
        reader.readAsDataURL(file);

        // Save item with new photo
        await itemsApi.update(id!, { photoPaths: JSON.stringify(updated) } as Partial<Item>);
        setEditing(true);
      }
    } catch {
      message.error("上传失败");
    }
  };

  const handleSaveNotes = async () => {
    if (!item) return;
    try {
      await itemsApi.update(item.id, { notes: editNotes, photoPaths: JSON.stringify(photos) } as Partial<Item>);
      setItem({ ...item, notes: editNotes, photoPaths: JSON.stringify(photos) });
      setEditing(false);
      message.success("已更新");
    } catch {
      message.error("保存失败");
    }
  };

  if (loading) return <Spin style={{ display: "block", margin: "100px auto" }} />;
  if (!item) return <p style={{ padding: 16 }}>物品不存在</p>;

  const txColumns = [
    { title: "操作", dataIndex: "type", key: "type", render: (v: string) => {
      const m: Record<string, string> = { inbound: "入库", outbound: "出库", transfer: "调拨", adjustment: "调整" };
      return <Tag color={v === "inbound" ? "green" : "red"}>{m[v] || v}</Tag>;
    }},
    { title: "数量", dataIndex: "quantityChange", key: "quantityChange", render: (v: number) => (
      <span style={{ color: v > 0 ? "#52c41a" : "#ff4d4f" }}>{v > 0 ? `+${v}` : v}</span>
    )},
    { title: "去向", dataIndex: "destination", key: "destination", render: (v: string | null) => v || "-" },
    { title: "时间", dataIndex: "createdAt", key: "createdAt" },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Button onClick={() => navigate(-1)} type="link" style={{ marginBottom: 8 }}>← 返回</Button>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>{item.name}</h2>
          <Button size="small" onClick={() => setEditing(!editing)}>{editing ? "取消" : "编辑"}</Button>
        </div>
        <p style={{ marginTop: 8 }}><b>数量：</b>{item.quantity} {item.unit}</p>
        {item.brand && <p><b>品牌：</b>{item.brand}</p>}
        {item.expiryDate && <p><b>保质期：</b><Tag color={new Date(item.expiryDate) < new Date() ? "red" : "green"}>{item.expiryDate}</Tag></p>}

        {/* Photo section */}
        <div style={{ marginBottom: 12 }}>
          <p><b>照片：</b></p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {photos.map((url) => (
              <Image key={url} src={url} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
            ))}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handlePhotoUpload} />
          <Button size="small" style={{ marginTop: 8 }} onClick={() => fileRef.current?.click()} loading={aiLoading}>
            {photos.length > 0 ? "更换照片" : "拍照/选择照片"}
          </Button>
        </div>

        {/* Notes section */}
        <div style={{ marginBottom: 12 }}>
          <p><b>注意事项：</b>{aiLoading && <Tag color="processing">AI 识别中...</Tag>}</p>
          {editing ? (
            <Input.TextArea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value.slice(0, 200))}
              rows={3}
              maxLength={200}
              showCount
              placeholder={photos.length > 0 ? "拍照后 AI 已生成，可手动修改" : "手动输入注意事项，建议先拍照让 AI 自动生成"}
            />
          ) : (
            <p style={{ color: "#666", background: "#f9f9f9", padding: 8, borderRadius: 4, minHeight: 40 }}>
              {item.notes || (photos.length > 0 ? "点击编辑修改" : "暂无")}
            </p>
          )}
          {editing && (
            <Button type="primary" size="small" style={{ marginTop: 8 }} onClick={handleSaveNotes}>保存</Button>
          )}
        </div>

        {item.storageRequirements && <p><b>存放要求：</b>{item.storageRequirements}</p>}
      </Card>

      <Card title="操作记录" style={{ marginTop: 12 }}>
        <Table dataSource={txs} columns={txColumns} rowKey="id" size="small" pagination={false} />
      </Card>
      <Space style={{ marginTop: 12, width: "100%", justifyContent: "center" }}>
        <Button type="primary" danger onClick={() => navigate(`/m/checkout?item=${id}`)}>出库</Button>
        <Button onClick={() => navigate("/m/items")}>物品列表</Button>
        <Button onClick={() => navigate("/m/scan")}>扫码</Button>
      </Space>
    </div>
  );
};

export default ItemDetailPage;
