## Why

React 性能优化（`React.memo`、`useMemo`、`useCallback`、`useMemoizedFn`）是前端面试和日常开发中的高频话题，但开发者普遍存在理解表面化的问题：**不知道 `useCallback` 单独使用几乎无意义**、**容易写出闭包陷阱**、**不清楚四者之间的层级关系**。当前项目缺少一个可交互的实验环境来直观感受这些优化手段的实际效果。

## What Changes

- 新建 `views/performanceOptimization/` 目录，实现一个 **4 Tab 交互式性能对比页面**
- 每个Tab 聚焦一个优化手段，提供：原理图解 + 交互式 Playground + 实时数据面板 + **优化开关（可动态禁用/启用观察退化效果）**
- 在侧边栏路由中新增「性能优化」入口 (`/performance`)
- 多文件拆分架构：hooks/、components/、demos/、shared/ 各司其职

### 四个对比维度

| Tab           | 对比内容                                  | 核心教学点                                                            |
| ------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| React.memo    | 普通 Child vs `memo()` Child              | memo 是组件级浅比较防线，props 不变时跳过渲染                         |
| useMemo       | 每次渲染重算 vs 缓存计算结果              | 耗时计算的依赖缓存，无关状态变化时直接返回缓存                        |
| useCallback   | 普通函数 vs `useCallback` + `memo` 子组件 | **必须配合 memo 使用**，稳定引用防止拖垮下层                          |
| useMemoizedFn | 普通函数 vs ahooks `useMemoizedFn`        | **永远稳定引用 + 永远最新闭包**，重点演示**闭包陷阱 (Stale Closure)** |

### 特色功能

- **破坏/切换模式**: 每个 Tab 有 Switch 开关，可动态禁用优化，实时观察渲染计数飙升/耗时增加
- **闭包陷阱重点演示** (Tab 4): 延迟读 state 场景 — `useCallback(fn, [])` 读到陈旧值 vs `useMemoizedFn` 读到最新值，配时间线可视化
- **数据面板**: 渲染次数统计、节省百分比进度条、引用变化计数等量化指标
- **Strict Mode 提示**: 页面顶部 Alert 说明开发模式下可能双渲染

## Capabilities

### New Capabilities

- `perf-memo-demo`: React.memo 对比 Demo — 包含 NormalChild / MemoChild 组件、触发器、渲染计数追踪、切换开关、数据面板
- `perf-usememo-demo`: useMemo 对比 Demo — 包含模拟耗时计算函数、缓存命中/未命中对比、耗时与次数统计
- `perf-usecallback-demo`: useCallback 对比 Demo — 包含三场景对比（无memo / 有memo无callback / 有memo有callback）、引用变化追踪器
- `perf-usememoizedfn-demo`: useMemoizedFn 对比 Demo — Part A 引用稳定性对比 + Part B 闭包陷阱演示（延迟读 state + 时间线）
- `perf-shared-tools`: 共享工具层 — useRenderCount hook、useRefTrack hook、RenderBadge 组件、RenderMonitor 数据面板组件、PrincipleBlock 原理说明组件、expensiveCompute 工具函数
- `perf-page-container`: 页面容器 — Tabs 导航、路由接入、Strict Mode 提示

### Modified Capabilities

- `client-routing`: 在 `src/router/index.tsx` 的 menuItems 和 router children 中新增 `/performance` 路由

## Impact

- **新增文件**: `views/performanceOptimization/` 下约 12-14 个文件（4 demos + 3 shared hooks/components + styles + index + utils）
- **修改文件**: `src/router/index.tsx`（新增 lazy import + 路由配置 + menu item）
- **新增依赖**: 无（ahooks ^3.9.7 已安装）
- **构建影响**: 新增一个懒加载路由页面，不影响现有页面 bundle 体积（code splitting）
- **回滚方案**: 删除 `views/performanceOptimization/` 目录 + 还原 `router/index.tsx`
