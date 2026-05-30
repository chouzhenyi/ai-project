import { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Tag, Spin, Button } from "antd";
import { WarningOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import EasyTable, { type ColumnSchema, type ActionSchema } from "@components/EasyTable";
import { alertsApi, type Alert, type AlertSummary } from "../../api/alerts";

const severityConfig: Record<string, { color: string; label: string }> = {
  critical: { color: "red", label: "紧急" },
  warning: { color: "orange", label: "警告" },
  info: { color: "blue", label: "提示" },
};

const Dashboard = () => {
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      alertsApi.summary(),
      alertsApi.list(false),
    ]).then(([s, a]) => {
      setSummary(s);
      setAlerts(a);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleResolve = async (id: string) => {
    await alertsApi.resolve(id);
    load();
  };

  const columns: ColumnSchema[] = [
    {
      key: "severity", title: "等级", dataIndex: "severity", width: 80,
      format: (v: unknown) => {
        const cfg = severityConfig[String(v)] || { color: "default", label: String(v) };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    { key: "message", title: "消息", dataIndex: "message", width: 300 },
    { key: "type", title: "类型", dataIndex: "type", width: 100 },
    { key: "createdAt", title: "创建时间", dataIndex: "createdAt", width: 180 },
  ];

  const actions: ActionSchema[] = [
    {
      key: "resolve", text: "标记已处理", type: "primary",
      onClick: (r: Record<string, unknown>) => handleResolve(r.id as string),
    },
  ];

  if (loading) return <Spin style={{ display: "block", margin: "100px auto" }} />;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>仪表盘</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="未处理预警"
              value={summary?.unresolved || 0}
              valueStyle={{ color: (summary?.unresolved || 0) > 0 ? "#cf1322" : "#3f8600" }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="紧急"
              value={summary?.bySeverity.critical || 0}
              valueStyle={{ color: "#cf1322" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="警告"
              value={summary?.bySeverity.warning || 0}
              valueStyle={{ color: "#faad14" }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="提示"
              value={summary?.bySeverity.info || 0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="待处理预警" extra={<Button onClick={load}>刷新</Button>}>
        <EasyTable
          columns={columns}
          dataSource={alerts as unknown as Record<string, unknown>[]}
          showActions
          actions={actions}
          actionsWidth={120}
          hasBorder
        />
      </Card>
    </div>
  );
};

export default Dashboard;
