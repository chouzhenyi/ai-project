import { useRef } from "react";

export function useRefTrack<T>(value: T): { changedCount: number } {
  /* eslint-disable react-hooks/refs -- reference tracking is intentionally impure for demo purposes;
     this hook tracks how many times a value's reference changes, which requires reading/writing refs during render */
  const ref = useRef(value);
  const countRef = useRef(0);
  if (ref.current !== value) {
    countRef.current += 1;
    ref.current = value;
  }
  return { changedCount: countRef.current };
}
