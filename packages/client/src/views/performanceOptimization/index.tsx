import { Tabs, Alert } from "antd";
import { MemoDemo } from "./demos/MemoDemo";
import { UseMemoDemo } from "./demos/UseMemoDemo";
import { UseCallbackDemo } from "./demos/UseCallbackDemo";
import { UseMemoizedFnDemo } from "./demos/UseMemoizedFnDemo";
import "./styles.css";

const tabItems = [
  {
    key: "memo",
    label: "React.memo",
    children: <MemoDemo />,
  },
  {
    key: "useMemo",
    label: "useMemo",
    children: <UseMemoDemo />,
  },
  {
    key: "useCallback",
    label: "useCallback",
    children: <UseCallbackDemo />,
  },
  {
    key: "useMemoizedFn",
    label: "useMemoizedFn",
    children: <UseMemoizedFnDemo />,
  },
];

const PerformancePage = () => {
  return (
    <div className="perf-page">
      <h2 style={{ marginBottom: 24 }}>React Hooks 性能优化对比</h2>

      <Alert
        message="开发模式下 React Strict Mode 可能导致渲染计数 ×2，这是正常行为。生产构建中不会出现。"
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
      />

      <Tabs defaultActiveKey="memo" items={tabItems} size="large" />
    </div>
  );
};

export default PerformancePage;
