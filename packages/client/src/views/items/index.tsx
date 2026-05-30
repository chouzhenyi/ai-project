import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Space, Input, Tag, message } from "antd";
import EasyTable, { type ColumnSchema, type ActionSchema } from "@components/EasyTable";
import { itemsApi, type Item } from "../../api/items";

const statusColor = (item: Item) => {
  if (!item.expiryDate) return undefined;
  const days = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return "red";
  if (days < 7) return "orange";
  if (days < 30) return "gold";
  return undefined;
};

const statusText = (item: Item) => {
  if (!item.expiryDate) return undefined;
  const days = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return "已过期";
  if (days === 0) return "今天到期";
  if (days <= 7) return `${days}天后到期`;
  return undefined;
};

const ItemsList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");

  const pageSize = 20;

  const load = useCallback(async (p: number, kw?: string) => {
    setLoading(true);
    try {
      const res = await itemsApi.list({ keyword: kw, page: p, pageSize });
      setData(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, keyword); }, [page, keyword, load]);

  const handleSearch = () => { setPage(1); load(1, keyword); };

  const handleDelete = async (record: Item) => {
    try {
      await itemsApi.delete(record.id);
      message.success("已删除");
      load(page, keyword);
    } catch { message.error("删除失败"); }
  };

  const columns: ColumnSchema[] = [
    { key: "name", title: "物品名称", dataIndex: "name", width: 160 },
    {
      key: "quantity", title: "数量", dataIndex: "quantity", width: 100, align: "center",
      render: (_v: unknown, r: Record<string, unknown>) => `${r.quantity} ${r.unit}`,
    },
    {
      key: "expiryDate", title: "保质期", dataIndex: "expiryDate", width: 120,
      render: (_v: unknown, r: Record<string, unknown>) => {
        const item = r as unknown as Item;
        if (!item.expiryDate) return <span style={{ color: "#999" }}>未设置</span>;
        const color = statusColor(item);
        const text = statusText(item);
        return (
          <span style={color ? { color } : undefined}>
            {item.expiryDate} {text && <Tag color={color} style={{ marginLeft: 4 }}>{text}</Tag>}
          </span>
        );
      },
    },
    {
      key: "notes", title: "注意事项", dataIndex: "notes", width: 200,
      render: (v: unknown) => v ? String(v) : <span style={{ color: "#999" }}>-</span>,
    },
    { key: "createdAt", title: "创建时间", dataIndex: "createdAt", width: 180 },
  ];

  const actions: ActionSchema[] = [
    {
      key: "edit", text: "编辑", type: "primary",
      onClick: (r: Record<string, unknown>) => navigate(`/items/${r.id}`),
    },
    {
      key: "delete", text: "删除", danger: true, confirm: "确定删除此物品？",
      onClick: (r: Record<string, unknown>) => handleDelete(r as unknown as Item),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>物品管理</h2>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索物品名称"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 240 }}
          enterButton
        />
        <Button type="primary" onClick={() => navigate("/items/new")}>新增物品</Button>
      </Space>
      <EasyTable
        columns={columns}
        dataSource={data as unknown as Record<string, unknown>[]}
        loading={loading}
        showActions
        actions={actions}
        hasBorder
        isZebra
        pagination={{ current: page, pageSize, total, onChange: (p: number) => setPage(p) }}
      />
    </div>
  );
};

export default ItemsList;
