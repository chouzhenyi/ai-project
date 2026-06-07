import { useState, useMemo, useRef } from "react";
import { Button, Row, Col, Card, Switch, Space, Typography, InputNumber, Statistic } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { RenderBadge } from "../components/RenderBadge";
import { PrincipleBlock } from "../components/PrincipleBlock";
import { expensiveCompute } from "../shared/utils";

const { Text } = Typography;

/* eslint-disable react-hooks/refs, react-hooks/purity -- performance measurement is intentionally impure for demo purposes;
   refs track compute counts and performance.now() measures timing to demonstrate useMemo caching behavior */
export function UseMemoDemo() {
  const [num, setNum] = useState(5);
  const [trigger, setTrigger] = useState(0);
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const normalComputeCount = useRef(0);
  const memoComputeCount = useRef(0);
  const noCacheComputeCount = useRef(0);

  const normalStart = performance.now();
  const normalResult = expensiveCompute(num);
  const normalDuration = performance.now() - normalStart;
  normalComputeCount.current += 1;

  const memoizedResult = useMemo(() => {
    memoComputeCount.current += 1;
    const start = performance.now();
    const result = expensiveCompute(num);
    return { result, duration: performance.now() - start };
  }, [num]);

  const noCacheStart = performance.now();
  const noCacheResult = expensiveCompute(num);
  const noCacheDuration = performance.now() - noCacheStart;
  if (!cacheEnabled) {
    noCacheComputeCount.current += 1;
  }

  const rightResult = cacheEnabled ? memoizedResult.result : noCacheResult;
  const rightDuration = cacheEnabled
    ? memoComputeCount.current === normalComputeCount.current
      ? memoizedResult.duration
      : 0
    : noCacheDuration;
  const rightComputeCount = cacheEnabled ? memoComputeCount.current : noCacheComputeCount.current;

  const savedCount = normalComputeCount.current - rightComputeCount;
  const savedPercent =
    normalComputeCount.current > 0 ? (savedCount / normalComputeCount.current) * 100 : 0;

  return (
    <div>
      <PrincipleBlock
        title="原理: useMemo — 缓存 + 依赖追踪"
        content={
          <div>
            <pre style={{ fontSize: 13, lineHeight: 1.5 }}>
              {`useMemo(fn, deps)
  ├─ deps 没变 → 返回缓存值 (0ms)
  └─ deps 变了 → 重新执行 fn (约30ms)`}
            </pre>
            <Text type="secondary">
              调整输入值后点击「触发重渲染」。useMemo
              版本仅在输入值变化时重新计算，普通版本每次渲染都重新执行耗时计算。
            </Text>
          </div>
        }
      />

      <Space style={{ marginBottom: 16 }}>
        <Text>输入值:</Text>
        <InputNumber min={1} max={20} value={num} onChange={(v) => setNum(v ?? 1)} />
        <Button icon={<ReloadOutlined />} onClick={() => setTrigger((t) => t + 1)}>
          触发重渲染 ({trigger})
        </Button>
        <Text>useMemo 开关:</Text>
        <Switch
          checked={cacheEnabled}
          onChange={setCacheEnabled}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
      </Space>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title="每次渲染都计算 (无 useMemo)" size="small">
            <Statistic title="计算结果" value={normalResult} />
            <Statistic
              title="耗时"
              value={normalDuration.toFixed(2)}
              suffix="ms"
              valueStyle={{ color: "#ff4d4f" }}
            />
            <Statistic title="计算次数" value={normalComputeCount.current} suffix="次" />
            <RenderBadge label="NormalCompute" />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={cacheEnabled ? "useMemo 缓存" : "每次渲染都计算 (缓存已禁用)"} size="small">
            <Statistic title="计算结果" value={rightResult} />
            <Statistic
              title="耗时"
              value={rightDuration.toFixed(2)}
              suffix="ms"
              valueStyle={{ color: cacheEnabled && rightDuration < 1 ? "#52c41a" : "#ff4d4f" }}
            />
            <Statistic title="计算次数" value={rightComputeCount} suffix="次" />
            <RenderBadge label="MemoizedCompute" />
          </Card>
        </Col>
      </Row>

      <Card title="对比摘要" size="small" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="左侧计算次数"
              value={normalComputeCount.current}
              suffix="次"
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="右侧计算次数"
              value={rightComputeCount}
              suffix="次"
              valueStyle={{ color: "#52c41a" }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="节省计算"
              value={savedCount}
              suffix="次"
              valueStyle={{ color: savedCount > 0 ? "#52c41a" : "#999" }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="节省百分比"
              value={savedPercent.toFixed(1)}
              suffix="%"
              valueStyle={{ color: "#52c41a" }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
}
