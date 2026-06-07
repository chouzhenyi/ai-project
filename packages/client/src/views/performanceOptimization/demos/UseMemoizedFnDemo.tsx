import { useState, useCallback, memo } from "react";
import { Button, Row, Col, Card, Switch, Space, Typography, Tag, Divider, Alert } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useMemoizedFn } from "ahooks";
import { useRenderCount } from "../hooks/useRenderCount";
import { useRefTrack } from "../hooks/useRefTrack";
import { RenderBadge } from "../components/RenderBadge";
import { PrincipleBlock } from "../components/PrincipleBlock";

const { Text } = Typography;

interface FnChildProps {
  label: string;
  onClick: () => void;
}

function FnChild({ label, onClick }: FnChildProps) {
  useRenderCount(`FnChild-${label}`);
  return (
    <div className="perf-child-wrapper" style={{ marginBottom: 8 }}>
      <Space>
        <Text strong>{label}</Text>
        <RenderBadge label={`FnChildBadge-${label}`} />
        <Button size="small" onClick={onClick}>
          点击
        </Button>
      </Space>
    </div>
  );
}

const MemoFnChild = memo(FnChild);

interface LogEntry {
  type: "useCallback" | "useMemoizedFn";
  expectedValue: number;
  actualValue: number;
  isStale: boolean;
  timestamp: string;
}

export function UseMemoizedFnDemo() {
  const [count, setCount] = useState(0);
  const [unrelated, setUnrelated] = useState(0);
  const [optimEnabled, setOptimEnabled] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const handleMemoized = useMemoizedFn(() => {
    setCount((c) => c + 1);
  });

  const handleNormal = () => {
    setCount((c) => c + 1);
  };

  const cbTrack = useRefTrack(handleMemoized);
  const fnTrack = useRefTrack(handleNormal);

  /* eslint-disable react-hooks/exhaustive-deps -- intentionally empty/missing deps to demonstrate stale closure problem */
  const staleCallback = useCallback(() => {
    return count;
  }, []);

  const freshMemoizedFn = useMemoizedFn(() => {
    return count;
  });

  const delayedLogCb = useCallback(() => {
    const actual = staleCallback();
    setLogs((prev) => [
      ...prev,
      {
        type: "useCallback",
        expectedValue: -1,
        actualValue: actual,
        isStale: true,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  const delayedLogMemo = useMemoizedFn(() => {
    const actual = freshMemoizedFn();
    setLogs((prev) => [
      ...prev,
      {
        type: "useMemoizedFn",
        expectedValue: -1,
        actualValue: actual,
        isStale: false,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  });

  const handleDelayedCb = () => {
    const expected = count;
    setTimeout(() => {
      delayedLogCb();
      setLogs((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.type === "useCallback") {
          return [
            ...prev.slice(0, -1),
            { ...last, expectedValue: expected, isStale: last.actualValue !== expected },
          ];
        }
        return prev;
      });
    }, 2000);
  };

  const handleDelayedMemo = () => {
    const expected = count;
    setTimeout(() => {
      delayedLogMemo();
      setLogs((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.type === "useMemoizedFn") {
          return [
            ...prev.slice(0, -1),
            { ...last, expectedValue: expected, isStale: last.actualValue !== expected },
          ];
        }
        return prev;
      });
    }, 2000);
  };

  const ActiveFnChild = optimEnabled ? MemoFnChild : FnChild;

  return (
    <div>
      <PrincipleBlock
        title="Part A: 引用稳定性对比"
        content={
          <div>
            <pre style={{ fontSize: 13, lineHeight: 1.5 }}>
              {`useMemoizedFn(fn)
  → 永远返回同一个函数引用
  → 无需 deps 数组
  → memo 子组件不会因引用变化而重复渲染

普通函数 () => {}
  → 每次渲染都创建新引用
  → memo 子组件每次都检测到 props 变化`}
            </pre>
            <Text type="secondary">
              点击「更新无关状态」按钮，观察右侧 memo 子组件的渲染计数差异。
            </Text>
          </div>
        }
      />

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<ReloadOutlined />} onClick={() => setUnrelated((u) => u + 1)}>
          更新无关状态 ({unrelated})
        </Button>
        <Button onClick={handleMemoized}>useMemoizedFn (+1)</Button>
        <Button onClick={handleNormal}>普通函数 (+1)</Button>
        <Text strong>count: {count}</Text>
        <Text>useMemoizedFn 开关:</Text>
        <Switch
          checked={optimEnabled}
          onChange={setOptimEnabled}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
      </Space>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} md={4}>
          <Card title="引用变化追踪" size="small">
            <Space direction="vertical">
              <Tag color="purple">useMemoizedFn 变化: {cbTrack.changedCount}</Tag>
              <Tag color="red">普通函数变化: {fnTrack.changedCount}</Tag>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card title="普通函数 → memo 子组件" size="small" style={{ borderColor: "#ff7875" }}>
            <MemoFnChild key={`fn-normal-${optimEnabled}`} label="普通fn" onClick={handleNormal} />
            <Tag color="red">普通fn每次新引用 → memo 子组件被迫渲染</Tag>
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card
            title={
              optimEnabled ? "useMemoizedFn → memo 子组件" : "普通函数 → memo 子组件 (开关已禁用)"
            }
            size="small"
            style={{ borderColor: optimEnabled ? "#52c41a" : "#ff7875" }}
          >
            <ActiveFnChild
              key={`fn-memoized-${optimEnabled}`}
              label={optimEnabled ? "memoizedFn" : "普通fn(禁用)"}
              onClick={optimEnabled ? handleMemoized : handleNormal}
            />
            <Tag color={optimEnabled ? "green" : "red"}>
              {optimEnabled
                ? "useMemoizedFn引用稳定 → memo 子组件跳过渲染 ✓"
                : "开关禁用 → 和普通fn一样每次渲染"}
            </Tag>
          </Card>
        </Col>
      </Row>

      <Divider />

      <PrincipleBlock
        title="⚠️ Part B: 闭包陷阱 (Stale Closure) — 延迟读 state"
        content={
          <div>
            <pre style={{ fontSize: 13, lineHeight: 1.5 }}>
              {`useCallback(fn, []) — 空依赖数组
  → fn 在 mount 时创建一次
  → 闭包捕获当时的 count = 0
  → setTimeout 2秒后执行, fn 里读到的永远是 0!

useMemoizedFn(fn)
  → 内部用 ref 存储最新 fn
  → 每次调用时从 ref 取最新的
  → 读到的永远是当前值 ✓`}
            </pre>
            <Text type="secondary">
              操作: 先点击 [+1] 多次增加 count，再点击「延迟打印」，2 秒后观察两个版本输出的值差异。
            </Text>
          </div>
        }
      />

      <Alert
        message={`当前 count = ${count}。先点 [+1] 多次，再点「延迟打印」观察差异`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => setCount((c) => c + 1)} size="large">
          +1
        </Button>
        <Button type="primary" danger onClick={handleDelayedCb} size="large">
          延迟打印 count (useCallback [])
        </Button>
        <Button
          type="primary"
          style={{ background: "#722ed1", borderColor: "#722ed1" }}
          onClick={handleDelayedMemo}
          size="large"
        >
          延迟打印 count (useMemoizedFn)
        </Button>
        <Button onClick={() => setLogs([])}>清空记录</Button>
      </Space>

      {logs.length > 0 && (
        <Card title="延迟打印结果记录" size="small">
          <div className="perf-timeline">
            {logs.map((entry, idx) => (
              <div
                key={idx}
                className={`perf-timeline-item ${entry.isStale ? "perf-timeline-item-stale" : "perf-timeline-item-fresh"}`}
              >
                <Space>
                  <Tag color={entry.type === "useMemoizedFn" ? "purple" : "blue"}>{entry.type}</Tag>
                  <Text>预期值: {entry.expectedValue}</Text>
                  <Text>实际值: {entry.actualValue}</Text>
                  {entry.isStale ? (
                    <Tag color="red">⚠️ 陈旧值! 读到的是闭包捕获时的旧值</Tag>
                  ) : (
                    <Tag color="green">✅ 最新值! 读到的是当前 state</Tag>
                  )}
                  <Text type="secondary">{entry.timestamp}</Text>
                </Space>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
