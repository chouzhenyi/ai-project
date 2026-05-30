import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Tag, Spin, Button, Space } from "antd";
import { containersApi } from "../api/containers";
import type { Container } from "../api/containers";

const ContainerItemsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [container, setContainer] = useState<Container | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    containersApi.getById(id).then((c) => {
      setContainer(c as unknown as Container);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin style={{ display: "block", margin: "100px auto" }} />;
  if (!container) return <p style={{ padding: 16 }}>容器不存在</p>;

  return (
    <div style={{ padding: 16 }}>
      <h2>{container.name}</h2>
      <p style={{ color: "#999" }}>类型：{container.type} | QR: {container.qrCode || "无"}</p>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => navigate(`/m/checkin?container=${id}`)}>+ 入库</Button>
        <Button onClick={() => navigate(`/m/new-container?parent=${id}`)}>+ 子容器</Button>
        <Button onClick={() => navigate("/m/scan")}>← 返回</Button>
      </Space>

      <h3>物品清单</h3>
      {(container as unknown as { items?: { id: string; name: string; quantity: number; unit: string; expiryDate?: string }[] }).items?.map((item) => (
        <Card
          key={item.id}
          size="small"
          style={{ marginBottom: 8 }}
          onClick={() => navigate(`/m/item/${item.id}`)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <b>{item.name}</b>
              <br />
              <span style={{ color: "#999" }}>{item.quantity} {item.unit}</span>
            </div>
            {item.expiryDate && (
              <Tag color={new Date(item.expiryDate) < new Date() ? "red" : "default"}>
                {item.expiryDate}
              </Tag>
            )}
          </div>
        </Card>
      ))}
      {(!(container as unknown as { items?: unknown[] }).items || (container as unknown as { items: unknown[] }).items.length === 0) && (
        <p style={{ color: "#999", textAlign: "center", marginTop: 48 }}>这个容器还是空的</p>
      )}
    </div>
  );
};

export default ContainerItemsPage;
