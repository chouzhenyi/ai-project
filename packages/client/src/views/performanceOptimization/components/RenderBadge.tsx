import { Tag } from "antd";
import { useRenderCount } from "../hooks/useRenderCount";

function getBadgeColor(count: number): string {
  if (count <= 3) return "green";
  if (count <= 8) return "orange";
  return "red";
}

export function RenderBadge({ label }: { label: string }) {
  const { count } = useRenderCount(label);
  return (
    <Tag
      color={getBadgeColor(count)}
      className={count > 8 ? "perf-badge-danger" : "perf-badge"}
      style={{ marginRight: 0, fontFamily: "var(--mono, monospace)" }}
    >
      渲染 {count} 次
    </Tag>
  );
}
