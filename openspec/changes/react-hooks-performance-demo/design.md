## Context

当前项目是一个 React 18 + Ant Design 5 的后台管理系统，包含仪表盘、物品管理、容器管理等业务页面。路由采用 `createBrowserRouter` + lazy loading 模式，CSS 使用 Plain CSS + 组件作用域样式表（无 CSS-in-JS / Tailwind）。

项目已安装 `ahooks ^3.9.9`（含 `useMemoizedFn`）。全局 CSS 变量体系在 `src/index.css` 中定义，支持亮/暗色模式。

本设计的目标是在此架构内新增一个**交互式性能优化教学页面**，通过可操作的对比实验让开发者直观理解 React 四大优化手段的实际效果。

## Goals / Non-Goals

**Goals:**

- 提供四个独立的交互式 Demo，每个聚焦一个优化手段 (memo / useMemo / useCallback / useMemoizedFn)
- 每个 Demo 包含：原理说明 → 交互实验区 → 实时数据面板 → 优化开关
- 通过渲染计数、耗时测量、引用追踪等**量化指标**让优化效果可视化
- 重点演示 `useMemoizedFn` 解决闭包陷阱的能力（延迟读 state 场景）
- 支持动态切换优化开关，观察「有优化 vs 无优化」的性能退化
- 接入侧边栏路由，作为独立页面访问

**Non-Goals:**

- 不做生产级性能监控工具（这是教学/演示用途）
- 不覆盖 React 19 / Compiler 相关优化（仅限 React 18 Hooks API）
- 不做单元测试 / E2E 测试（纯展示页面，无业务逻辑）
- 不实现「预测模式」和「时间线视图」（探索阶段讨论过但未入选）

## Decisions

### D1: 多文件拆分架构

**选择**: 按职责拆分为 hooks/、components/、demos/、shared/ 子目录

**理由**:

- 单文件 400-500 行可维护性差，拆分后每个文件 <150 行
- 共享工具（useRenderCount、RenderBadge 等）可被所有 Demo 复用
- 符合项目现有模式（EasyTable / EasyForm 也是多文件结构）

**替代方案**: 单文件 — 更简单但难以维护，排除。

### D2: 渲染计数方案 — useRef 计数器

**选择**: 用 `useRef` + 每次 render 递增的方式追踪渲染次数

```ts
function useRenderCount(label: string): { count: number; label: string } {
  const countRef = useRef(0);
  countRef.current += 1;
  return { count: countRef.current, label };
}
```

**理由**:

- 直接利用 React render 本身作为计数触发点，零额外开销
- 无需 useEffect / useState（避免触发额外渲染）
- ref 值变化不导致重渲染，但我们在 render 路径上直接读取所以总是最新

**替代方案**:

- `useEffect` + `useState` — 会产生额外 render 循环，干扰实验结果
- DevTools Profiler API — 过于复杂且非标准接口

### D3: 引用变化检测 — useRefTrack

**选择**: 用 `useRef` 存储上一次引用值，每次 render 做 `===` 比较

```ts
function useRefTrack<T>(value: T): { changedCount: number } {
  const ref = useRef(value);
  const countRef = useRef(0);
  if (ref.current !== value) {
    countRef.current += 1;
    ref.current = value;
  }
  return { changedCount: countRef.current };
}
```

**理由**: 这正是 `React.memo` 的浅比较行为，能准确模拟 memo 对函数引用变化的感知。

### D4: 耗时计算模拟 — 同步阻塞

**选择**: `while (performance.now() - start < 30)` 同步阻塞 + 实际数学计算

**理由**:

- 30ms 足够用户感知到「卡顿」但不影响体验
- 必须是同步的才能被 useMemo 正确缓存（异步无法用 useMemo 管控）
- 数学运算确保同一输入 → 同一输出（纯函数）

### D5: 切换开关实现 — key 强制 remount

**选择**: 切换优化开关时改变子组件的 `key` prop，强制卸载重建

```tsx
const ChildType = memoEnabled ? MemoChild : NormalChild;
<ChildType key={`child-${memoEnabled}`} {...props} />;
```

**理由**:

- 切换后渲染计数从零开始，对比更清晰
- 避免组件内部状态残留导致的数据混乱
- 简单可靠，无需额外的 reset 逻辑

### D6: 闭包陷阱场景 — setTimeout 延迟读 state

**选择**: 用户先多次点击 [+1] 增加 count，再点击 [延迟打印 count] 触发 `setTimeout(() => log(count), 2000)`

**理由**:

- 最经典的教学案例，一个操作就能暴露问题
- `useCallback(fn, [])` 在 mount 时创建闭包，捕获当时的 count=0
- 2 秒后执行时读到的是陈旧值 0 而非当前值
- `useMemoizedFn` 通过内部 ref 始终持有最新引用，输出正确值

### D7: 动画策略 — 纯 CSS @keyframes

**选择**: 所有动画使用 CSS `@keyframes` + `transform` / `opacity`（GPU 加速）

| 动画名        | 触发条件             | 效果                | 时长        |
| ------------- | -------------------- | ------------------- | ----------- |
| `countPop`    | RenderBadge 数字变化 | scale(1)→1.2→1 弹跳 | 200ms       |
| `renderFlash` | 普通 Child 发生渲染  | 红色内边框闪焰      | 400ms       |
| `cacheHit`    | MemoChild 被跳过渲染 | 绿色边框缓慢呼吸    | 2s infinite |
| `dangerPulse` | 渲染计数 >8          | 整体 opacity 闪烁   | 1s infinite |
| `fadeInUp`    | Tab 切换内容入场     | 上滑 + 淡入         | 300ms       |

**理由**:

- 性能优化页面本身必须快，不能用 JS 动画库
- transform+opacity 不触发布局重算
- 项目现有模式无动画依赖，保持一致性

### D8: 样式方案 — 扩展 CSS 变量 + Ant Design 组件为主

**选择**:

- 布局和交互态：Ant Design 组件（Card / Tabs / Tag / Statistic / Switch / Row / Col / Alert / Button / Space / Typography / InputNumber / Progress）
- 自定义样式：页面级 `styles.css` 定义动画和语义色变量
- 内联 style：用于动态计算的样式值（如动态颜色、条件间距）

**理由**: 与项目现有风格完全一致（dashboard 页面就是 Ant Design + inline style 模式）。

### D9: Strict Mode 处理 — 页面提示

**选择**: 在页面顶部放置 `Alert type="info"` 提示用户开发模式下可能双渲染

**理由**:

- 技术规避（key remount 去重）会掩盖重要知识点
- Strict Mode 双渲染本身就是值得了解的 React 行为
- 不影响教学有效性，反而增加一个知识点

## Risks / Trade-offs

| Risk                                                | Impact                         | Mitigation                                  |
| --------------------------------------------------- | ------------------------------ | ------------------------------------------- |
| React Strict Mode 导致渲染计数 ×2                   | 用户可能困惑为什么数字比预期高 | 页面顶部 Alert 说明；这本身是有价值的教学点 |
| `expensiveCompute` 的 30ms 阻塞在低端设备上可能更长 | 用户感觉页面卡顿               | 加 Loading spinner 反馈；提供降低难度的选项 |
| ahooks 版本升级可能导致 API 变化                    | `useMemoizedFn` 接口变化       | 锁定 ^3.9.x；ahooks 这个 API 已稳定多年     |
| 切换开关导致 key 变化引发闪烁                       | 视觉上的不连贯                 | key 变化时加 fadeInUp 入场动画缓解          |
| 闭包陷阱 demo 中 setTimeout 时序不确定              | 快速连续点击可能导致结果交错   | 使用独立的 timerId 管理；结果列表按顺序记录 |
