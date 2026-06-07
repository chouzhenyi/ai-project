export function expensiveCompute(n: number): number {
  const start = performance.now();
  while (performance.now() - start < 30);
  let result = 0;
  for (let i = 0; i < n * 10000; i++) result += Math.sqrt(i);
  return Math.round(result * 100) / 100;
}
