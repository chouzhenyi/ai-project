import { Row, Col, Statistic, Progress, Card } from "antd";

export interface MonitorMetric {
  label: string;
  value: number | string;
  suffix?: string;
}

export interface RenderMonitorProps {
  metrics: MonitorMetric[];
  savedPercent?: number;
  totalLabel?: string;
}

function getProgressColor(percent: number): string {
  if (percent >= 80) return "#52c41a";
  if (percent >= 50) return "#faad14";
  return "#ff4d4f";
}

export function RenderMonitor({ metrics, savedPercent, totalLabel }: RenderMonitorProps) {
  return (
    <Card title="数据面板" size="small" style={{ marginTop: 16 }}>
      <Row gutter={16}>
        {metrics.map((m) => (
          <Col key={m.label} xs={12} sm={8} md={6}>
            <Statistic
              title={m.label}
              value={m.value}
              suffix={m.suffix}
              valueStyle={{ fontFamily: "var(--mono, monospace)" }}
            />
          </Col>
        ))}
      </Row>
      {savedPercent !== undefined && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>
            {totalLabel || "节省渲染"}: {savedPercent.toFixed(1)}%
          </div>
          <Progress
            percent={savedPercent}
            strokeColor={getProgressColor(savedPercent)}
            size="small"
          />
        </div>
      )}
    </Card>
  );
}
