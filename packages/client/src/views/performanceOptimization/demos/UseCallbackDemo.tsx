import { useState, memo, useCallback } from "react";
import { Button, Row, Col, Card, Space, Typography, Tag, Alert } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useRenderCount } from "../hooks/useRenderCount";
import { useRefTrack } from "../hooks/useRefTrack";
import { RenderBadge } from "../components/RenderBadge";
import { PrincipleBlock } from "../components/PrincipleBlock";

const { Text } = Typography;

interface StableCallbackChildProps {
  label: string;
  onStableClick: () => void;
}

interface NormalCallbackChildProps {
  label: string;
  onNormalClick: () => void;
}

function NoMemoChild({ label, onStableClick }: StableCallbackChildProps) {
  useRenderCount(`NoMemo-${label}`);
  return (
    <div className="perf-child-wrapper" style={{ marginBottom: 8 }}>
      <Space>
        <Text strong>{label}</Text>
        <RenderBadge label={`NoMemo-${label}`} />
        <Button size="small" onClick={onStableClick}>
          点击
        </Button>
      </Space>
    </div>
  );
}

const MemoWithNormalFn = memo(function MemoWithNormalFnInner({
  label,
  onNormalClick,
}: NormalCallbackChildProps) {
  useRenderCount(`MemoNormal-${label}`);
  return (
    <div className="perf-child-wrapper" style={{ marginBottom: 8 }}>
      <Space>
        <Text strong>{label}</Text>
        <RenderBadge label={`MemoNormal-${label}`} />
        <Button size="small" onClick={onNormalClick}>
          点击
        </Button>
      </Space>
    </div>
  );
});

const MemoWithCallbackFn = memo(function MemoWithCallbackFnInner({
  label,
  onStableClick,
}: StableCallbackChildProps) {
  useRenderCount(`MemoCb-${label}`);
  return (
    <div className="perf-child-wrapper" style={{ marginBottom: 8 }}>
      <Space>
        <Text strong>{label}</Text>
        <RenderBadge label={`MemoCb-${label}`} />
        <Button size="small" onClick={onStableClick}>
          点击
        </Button>
      </Space>
    </div>
  );
});

export function UseCallbackDemo() {
  const [count, setCount] = useState(0);
  const [unrelated, setUnrelated] = useState(0);

  const stableCallback = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const normalFn = () => {
    setCount((c) => c + 1);
  };

  const cbTrack = useRefTrack(stableCallback);
  const fnTrack = useRefTrack(normalFn);

  return (
    <div>
      <PrincipleBlock
        title="⚠️ 核心认知: useCallback 必须配合 React.memo 才有意义!"
        content={
          <div>
            <pre style={{ fontSize: 13, lineHeight: 1.5 }}>
              {`场景 A: 子组件无 memo
  → 回调引用变化无所谓, 子组件本来就要渲染

场景 B: 子组件有 memo + 普通函数
  → 新函数引用每次都变 → memo 失效 → 子组件还是渲染了!

场景 C: 子组件有 memo + useCallback
  → 稳定引用 → memo 浅比较通过 → 子组件跳过渲染 ✓`}
            </pre>
            <Alert
              message="单独使用 useCallback 几乎无意义! 它的价值在于配合 React.memo 防止子组件被拖垮。"
              type="warning"
              showIcon
              style={{ marginTop: 8 }}
            />
          </div>
        }
      />

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<ReloadOutlined />} onClick={() => setUnrelated((u) => u + 1)}>
          更新无关状态 ({unrelated})
        </Button>
        <Button onClick={stableCallback}>useCallback (+1)</Button>
        <Button onClick={normalFn}>普通函数 (+1)</Button>
        <Text strong>count: {count}</Text>
      </Space>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card title="引用变化追踪" size="small">
            <Tag color="green">useCallback 引用变化: {cbTrack.changedCount}</Tag>
            <br />
            <br />
            <Tag color="red">普通函数引用变化: {fnTrack.changedCount}</Tag>
          </Card>
        </Col>
        <Col span={18}>
          <Alert
            message={`useCallback 引用变化 ${cbTrack.changedCount} 次 vs 普通函数引用变化 ${fnTrack.changedCount} 次。点击更多次「更新无关状态」观察差距拉大。`}
            type="info"
            showIcon
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card title="场景 A: 无 memo 子组件" size="small" style={{ borderColor: "#d9d9d9" }}>
            <NoMemoChild label="无memo" onStableClick={stableCallback} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              无论回调是否稳定, 子组件都渲染 — useCallback 单独无用
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="场景 B: memo + 普通函数" size="small" style={{ borderColor: "#ff7875" }}>
            <MemoWithNormalFn label="memo+普通fn" onNormalClick={normalFn} />
            <Tag color="red" style={{ marginTop: 8 }}>
              普通fn引用每次都变 → memo失效!
            </Tag>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="场景 C: memo + useCallback" size="small" style={{ borderColor: "#52c41a" }}>
            <MemoWithCallbackFn label="memo+useCallback" onStableClick={stableCallback} />
            <Tag color="green" style={{ marginTop: 8 }}>
              useCallback引用稳定 → memo生效!
            </Tag>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
