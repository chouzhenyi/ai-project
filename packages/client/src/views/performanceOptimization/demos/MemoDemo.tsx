import { useState, useCallback, memo } from "react";
import { Button, Row, Col, Card, Switch, Alert, Space, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { RenderBadge } from "../components/RenderBadge";
import { RenderMonitor, type MonitorMetric } from "../components/RenderMonitor";
import { PrincipleBlock } from "../components/PrincipleBlock";
import { useRenderCount } from "../hooks/useRenderCount";

const { Text } = Typography;

interface ChildProps {
  name: string;
  value: number;
  onClick: () => void;
}

function NormalChild({ name, value, onClick }: ChildProps) {
  useRenderCount(`Normal-${name}`);
  return (
    <div className="perf-child-wrapper perf-child-wrapper-rendered">
      <Space>
        <Text strong>{name}</Text>
        <RenderBadge label={`Normal-${name}`} />
        <Text type="secondary">value: {value}</Text>
        <Button size="small" onClick={onClick}>
          +1
        </Button>
      </Space>
    </div>
  );
}

const MemoChild = memo(function MemoChildInner({ name, value, onClick }: ChildProps) {
  useRenderCount(`Memo-${name}`);
  return (
    <div className="perf-child-wrapper perf-child-wrapper-memo">
      <Space>
        <Text strong>{name} (memo)</Text>
        <RenderBadge label={`Memo-${name}`} />
        <Text type="secondary">value: {value}</Text>
        <Button size="small" onClick={onClick}>
          +1
        </Button>
      </Space>
    </div>
  );
});

export function MemoDemo() {
  const [count, setCount] = useState(0);
  const [unrelated, setUnrelated] = useState(0);
  const [memoEnabled, setMemoEnabled] = useState(true);

  const handleClick = useCallback(() => setCount((c) => c + 1), []);

  const normalA = useRenderCount("Normal-A");
  const normalB = useRenderCount("Normal-B");
  const memoA = useRenderCount("Memo-A");
  const memoB = useRenderCount("Memo-B");

  const totalRenders = normalA.count + normalB.count + memoA.count + memoB.count;
  const memoSavedRenders = memoA.count - 1 + (memoB.count - 1);
  const normalSavedRenders = 0;
  const saved = memoEnabled ? memoSavedRenders : normalSavedRenders;
  const savedPercent = totalRenders > 0 ? (saved / totalRenders) * 100 : 0;

  const metrics: MonitorMetric[] = [
    { label: "Normal A", value: normalA.count, suffix: "次" },
    { label: "Normal B", value: normalB.count, suffix: "次" },
    { label: "Memo A", value: memoA.count, suffix: "次" },
    { label: "Memo B", value: memoB.count, suffix: "次" },
  ];

  const MemoSideComponent = memoEnabled ? MemoChild : NormalChild;

  return (
    <div>
      <PrincipleBlock
        title="原理: React.memo — 组件级浅比较防护网"
        content={
          <div>
            <pre style={{ fontSize: 13, lineHeight: 1.5 }}>
              {`Parent.render()
  ├─ NormalChild ──► 始终执行 render → 计数+1
  └─ MemoChild   ──► shallowEqual(props)
                      ├─ 相同 → ❌ 跳过 (bailout)
                      └─ 不同 → ✓ render`}
            </pre>
            <Text type="secondary">
              点击「更新无关状态」按钮，观察普通子组件渲染次数飙升而 memo 子组件保持不变。
            </Text>
          </div>
        }
      />

      <Alert
        message="开发模式下 React Strict Mode 可能导致渲染计数 ×2，这是正常行为。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<ReloadOutlined />} onClick={() => setUnrelated((u) => u + 1)}>
          更新无关状态 ({unrelated})
        </Button>
        <Button
          onClick={() => {
            setCount(0);
            setUnrelated(0);
          }}
        >
          重置
        </Button>
        <Text>memo 开关:</Text>
        <Switch
          checked={memoEnabled}
          onChange={setMemoEnabled}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
      </Space>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title="普通子组件 (无 memo)" size="small">
            <NormalChild name="A" value={count} onClick={handleClick} />
            <NormalChild name="B" value={count} onClick={handleClick} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={memoEnabled ? "React.memo 子组件" : "普通子组件 (memo 已禁用)"} size="small">
            <MemoSideComponent
              key={`memo-a-${memoEnabled}`}
              name="A"
              value={count}
              onClick={handleClick}
            />
            <MemoSideComponent
              key={`memo-b-${memoEnabled}`}
              name="B"
              value={count}
              onClick={handleClick}
            />
          </Card>
        </Col>
      </Row>

      <RenderMonitor metrics={metrics} savedPercent={savedPercent} totalLabel="节省渲染" />
    </div>
  );
}
