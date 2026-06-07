## 1. 共享工具层 (Shared Tools)

- [x] 1.1 创建 `views/performanceOptimization/shared/utils.ts` — 实现 `expensiveCompute(n)` 纯函数（30ms 同步阻塞 + 数学计算）
- [x] 1.2 创建 `views/performanceOptimization/hooks/useRenderCount.ts` — 实现 useRenderCount hook（useRef 计数器，返回 { count, label }）
- [x] 1.3 创建 `views/performanceOptimization/hooks/useRefTrack.ts` — 实现 useRefTrack<T> hook（引用 === 比较，返回 changedCount）
- [x] 1.4 创建 `views/performanceOptimization/components/RenderBadge.tsx` — 实现 RenderBadge 组件（颜色阈值 ≤3绿 / 4-8橙 / >8红 + countPop 动画）
- [x] 1.5 创建 `views/performanceOptimization/components/RenderMonitor.tsx` — 实现 RenderMonitor 数据面板组件（Statistic 卡片 + Progress 进度条 + 动态颜色）
- [x] 1.6 创建 `views/performanceOptimization/components/PrincipleBlock.tsx` — 实现 PrincipleBlock 原理说明组件（Card 容器 + title/content）

## 2. 页面样式

- [x] 2.1 创建 `views/performanceOptimization/styles.css` — 定义 CSS 变量扩展（语义色 --perf-good/warn/danger/info/special）、5 个 @keyframes 动画（countPop/renderFlash/cacheHit/dangerPulse/fadeInUp）、ChildWrapper 样式、Timeline 样式

## 3. Demo 组件实现

- [x] 3.1 创建 `views/performanceOptimization/demos/MemoDemo.tsx` — React.memo 对比 Demo（NormalChild vs MemoChild ×2、无关状态触发器、memo Switch 开关、key remount 切换、RenderMonitor 数据面板）
- [x] 3.2 创建 `views/performanceOptimization/demos/UseMemoDemo.tsx` — useMemo 对比 Demo（InputNumber 输入、无关状态触发器、双列耗时/次数对比、useMemo Switch 开关、Statistic 展示）
- [x] 3.3 创建 `views/performanceOptimization/demos/UseCallbackDemo.tsx` — useCallback 三场景对比 Demo（无memo / 有memo无callback / 有memo有callback、useRefTrack 引用变化追踪、⚠️ 核心认知说明区）
- [x] 3.4 创建 `views/performanceOptimization/demos/UseMemoizedFnDemo.tsx` — useMemoizedFn Demo（Part A: 引用稳定性对比 + Part B: ⚠️闭包陷阱演示、延迟读 state + setTimeout、结果列表记录陈旧/最新值对比、原理差异说明、Switch 开关）

## 4. 页面容器与路由接入

- [x] 4.1 创建 `views/performanceOptimization/index.tsx` — 主页面组件（h2 标题 + Strict Mode Alert 提示 + Tabs 容器包裹 4 个 Demo、default export）
- [x] 4.2 修改 `src/router/index.tsx` — 添加 PerformancePage 的 lazy import、在 menuItems 数组添加 `{ key: "/performance", label: "性能优化" }`、在 router children 添加 path: "performance" 路由配置

## 5. 验证

- [x] 5.1 运行 `pnpm --filter client exec tsc --noEmit` 确认类型检查通过
- [x] 5.2 运行 `pnpm dev` 启动开发服务器，手动验证 4 个 Tab 的交互功能
