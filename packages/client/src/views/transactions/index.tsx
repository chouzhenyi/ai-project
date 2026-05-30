import { useState, useEffect } from "react";
import { Card, Tabs, message, Table, Tag } from "antd";
import EasyForm, { type FormSchema } from "@components/EasyForm";
import { transactionsApi, type Transaction } from "../../api/transactions";

const CheckinForm = () => {
  const schema: FormSchema[] = [
    {
      name: "containerCode", label: "容器 QR 码", component: "Input", required: true, span: 12,
      placeholder: "扫描或输入容器二维码",
    },
    {
      name: "itemName", label: "物品名称", component: "Input", required: true, span: 12,
    },
    { name: "quantity", label: "数量", component: "NumberPicker", required: true, span: 8, componentProps: { min: 0.01 } },
    { name: "unit", label: "单位", component: "Input", span: 8, defaultValue: "个" },
    { name: "expiryDate", label: "到期日期", component: "DatePicker", span: 8 },
    { name: "notes", label: "备注", component: "Input.TextArea", span: 24 },
  ];

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const containerId = values.containerCode as string;
      const result = await transactionsApi.checkin(containerId, [{
        name: values.itemName as string,
        quantity: values.quantity as number,
        unit: values.unit as string,
        expiryDate: values.expiryDate as string,
        notes: values.notes as string,
      }]);
      message.success("入库成功");
      console.log("入库结果:", result);
    } catch {
      message.error("入库失败，请检查容器码是否正确");
    }
  };

  return (
    <Card title="入库">
      <EasyForm schema={schema} onSubmit={handleSubmit} columns={2} submitText="确认入库" />
    </Card>
  );
};

const DESTINATION_OPTIONS = [
  { label: "🛋 客厅/在用", value: "in-use" },
  { label: "🚗 车上", value: "car" },
  { label: "🏢 公司/带出门", value: "office" },
  { label: "🎁 送人了", value: "gift" },
  { label: "🗑 扔了/卖了", value: "disposed" },
  { label: "📦 挪到其他容器", value: "transfer" },
];

const CheckoutForm = () => {
  const schema: FormSchema[] = [
    { name: "itemId", label: "物品 ID", component: "Input", required: true, span: 12, placeholder: "扫描或输入物品 ID" },
    { name: "quantity", label: "数量", component: "NumberPicker", required: true, span: 12, componentProps: { min: 0.01 } },
    {
      name: "destination", label: "去向", component: "Select", required: true, span: 24,
      options: DESTINATION_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
    },
    { name: "notes", label: "备注", component: "Input.TextArea", span: 24, placeholder: "或点击 🎤 语音输入" },
  ];

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      await transactionsApi.checkout(
        values.itemId as string,
        values.quantity as number,
        values.destination as string,
        undefined,
        values.notes as string,
      );
      message.success("出库成功");
    } catch {
      message.error("出库失败");
    }
  };

  return (
    <Card title="出库">
      <EasyForm schema={schema} onSubmit={handleSubmit} columns={2} submitText="确认出库" />
    </Card>
  );
};

const TransactionHistory = () => {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    transactionsApi.list().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: "类型", dataIndex: "type", key: "type", width: 100, render: (v: string) => {
      const map: Record<string, { color: string; text: string }> = {
        inbound: { color: "green", text: "入库" },
        outbound: { color: "red", text: "出库" },
        transfer: { color: "blue", text: "调拨" },
        adjustment: { color: "orange", text: "调整" },
      };
      const m = map[v] || { color: "default", text: v };
      return <Tag color={m.color}>{m.text}</Tag>;
    }},
    { title: "数量变化", dataIndex: "quantityChange", key: "quantityChange", width: 100, render: (v: number) => (
      <span style={{ color: v > 0 ? "#52c41a" : "#ff4d4f" }}>{v > 0 ? `+${v}` : v}</span>
    )},
    { title: "变化前", dataIndex: "quantityBefore", key: "quantityBefore", width: 80 },
    { title: "变化后", dataIndex: "quantityAfter", key: "quantityAfter", width: 80 },
    { title: "去向", dataIndex: "destination", key: "destination", width: 150, render: (v: string | null) => v || "-" },
    { title: "备注", dataIndex: "notes", key: "notes", width: 150, render: (v: string | null) => v || "-" },
    { title: "时间", dataIndex: "createdAt", key: "createdAt", width: 180 },
  ];

  return (
    <Card title="操作记录">
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} size="small" />
    </Card>
  );
};

const TransactionsPage = () => {
  const items = [
    { key: "checkin", label: "入库", children: <CheckinForm /> },
    { key: "checkout", label: "出库", children: <CheckoutForm /> },
    { key: "history", label: "操作记录", children: <TransactionHistory /> },
  ];
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>出入库管理</h2>
      <Tabs items={items} />
    </div>
  );
};

export default TransactionsPage;
