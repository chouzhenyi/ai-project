import { Card } from "antd";
import type { ReactNode } from "react";

export interface PrincipleBlockProps {
  title: string;
  content: ReactNode;
}

export function PrincipleBlock({ title, content }: PrincipleBlockProps) {
  return (
    <Card
      size="small"
      style={{
        marginBottom: 16,
        background: "rgba(24, 144, 255, 0.04)",
        borderColor: "rgba(24, 144, 255, 0.15)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ lineHeight: 1.7 }}>{content}</div>
    </Card>
  );
}
