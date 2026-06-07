import { useRef } from "react";

export function useRenderCount(label: string) {
  /* eslint-disable react-hooks/refs -- render counting is intentionally impure for demo purposes;
     this hook tracks how many times a component renders, which requires mutating a ref during render */
  const countRef = useRef(0);
  countRef.current += 1;
  return { count: countRef.current, label };
}
