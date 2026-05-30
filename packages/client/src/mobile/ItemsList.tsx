import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Tag, Spin } from "antd";
import { itemsApi, type Item } from "../api/items";

const ItemsListPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    itemsApi.list({ keyword: search || undefined, pageSize: 200 }).then((res) => setData(res.data)).finally(() => setLoading(false));
  }, [search]);

  return (
    <div style={{ padding: 16 }}>
      <Input.Search placeholder="搜索物品" value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 12 }} />
      {loading ? <Spin style={{ display: "block", margin: "40px auto" }} /> : (
        data.map((item) => (
          <Card
            key={item.id}
            size="small"
            style={{ marginBottom: 8, cursor: "pointer" }}
            onClick={() => navigate(`/m/item/${item.id}`)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <b>{item.name}</b>
                <span style={{ color: "#999", marginLeft: 8 }}>{item.quantity} {item.unit}</span>
              </div>
              {item.expiryDate && (
                <Tag color={new Date(item.expiryDate) < new Date() ? "red" : "default"}>
                  {item.expiryDate}
                </Tag>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
              {item.notes ? item.notes.slice(0, 40) + (item.notes.length > 40 ? "..." : "") : "无注意事项"}
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default ItemsListPage;
