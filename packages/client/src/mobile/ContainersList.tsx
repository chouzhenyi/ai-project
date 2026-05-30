import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Spin, Button, Space } from "antd";
import { containersApi, type Container } from "../api/containers";

const ContainersListPage = () => {
  const navigate = useNavigate();
  const [containers, setContainers] = useState<Container[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    containersApi.list({ keyword: search || undefined }).then(setContainers).finally(() => setLoading(false));
  }, [search]);

  return (
    <div style={{ padding: 16 }}>
      <Input.Search placeholder="搜索容器" value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 12 }} />
      <Space style={{ marginBottom: 12 }}>
        <Button size="small" onClick={() => navigate("/m/new-container")}>+ 新建</Button>
      </Space>
      {loading ? <Spin style={{ display: "block", margin: "40px auto" }} /> : (
        containers.map((c) => (
          <Card
            key={c.id}
            size="small"
            style={{ marginBottom: 8, cursor: "pointer" }}
            onClick={() => navigate(`/m/box/${c.id}`)}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span><b>{c.name}</b> <span style={{ color: "#999" }}>({c.type})</span></span>
              <span style={{ color: "#999", fontSize: 12 }}>{c.qrCode || ""}</span>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default ContainersListPage;
