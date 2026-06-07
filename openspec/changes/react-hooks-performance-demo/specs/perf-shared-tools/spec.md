## ADDED Requirements

### Requirement: useRenderCount Hook

系统 SHALL 提供 `useRenderCount` 自定义 Hook，用于追踪组件实例的渲染次数。

#### Scenario: 每次组件渲染时计数递增

- **WHEN** 使用 `useRenderCount` 的组件发生渲染
- **THEN** 返回值中的 count 属性 +1
- **AND** count 从 1 开始（首次 render 时为 1）

#### Scenario: 不同组件实例独立计数

- **WHEN** 多个组件实例各自调用 `useRenderCount('不同label')`
- **THEN** 每个实例维护独立的渲染计数
- **AND** label 用于标识来源（显示在 RenderBadge 中）

### Requirement: useRefTrack Hook

系统 SHALL 提供 `useRefTrack` 自定义 Hook，用于追踪值引用 (`===`) 的变化次数。

#### Scenario: 引用值变化时计数递增

- **WHEN** 传入 useRefTrack 的值与上一次渲染时的值引用不同（!==）
- **THEN** changedCount +1

#### Scenario: 引用值不变时计数保持

- **WHEN** 传入 useRefTrack 的值与上一次渲染时的值引用相同（===）
- **THEN** changedCount 保持不变

### Requirement: RenderBadge 组件

系统 SHALL 提供 RenderBadge 组件，以可视化 Tag 形式展示渲染次数。

#### Scenario: 根据渲染次数阈值显示不同颜色

- **WHEN** 渲染次数 ≤3 次
- **THEN** Tag 显示绿色背景 (var(--perf-good) / #52c41a)
- **WHEN** 渲染次数在 4-8 次之间
- **THEN** Tag 显示橙色背景 (var(--perf-warn) / #faad14)
- **WHEN** 渲染次数 >8 次
- **THEN** Tag 显示红色背景 (var(--perf-danger) / #ff4d4f)

#### Scenario: 数字变化时触发弹跳动画

- **WHEN** RenderBadge 的 count 值发生变化
- **THEN** 触发 countPop 动画（scale 1→1.2→1, 200ms）

### Requirement: RenderMonitor 数据面板组件

系统 SHALL 提供 RenderMonitor 组件，以 Statistic + Progress 形式展示多组量化指标。

#### Scenario: 接收指标数组并渲染统计卡片

- **WHEN** RenderMonitor 接收一组 { label, value, color } 指标
- **THEN** 以卡片网格形式展示每个指标的 label 和 value
- **AND** 当包含「节省百分比」类型指标时额外展示 Progress 进度条

#### Scenario: 进度条颜色根据百分比动态变化

- **WHEN** 节省百分比 ≥80%
- **THEN** Progress 条显示为绿色
- **WHEN** 节省百分比在 50-79% 之间
- **THEN** Progress 条显示为橙色
- **WHEN** 节省百分比 <50%
- **THEN** Progress 条显示为红色

### Requirement: PrincipleBlock 原理说明组件

系统 SHALL 提供 PrincipleBlock 组件，用于包裹每个 Demo 的原理说明内容（文字 + ASCII 图解）。

#### Scenario: 以 Card 形式展示原理说明

- **WHEN** PrincipleBlock 接收 title 和 content (ReactNode)
- **THEN** 以带浅色背景的 Card 容器渲染
- **AND** title 作为 Card 标题显示
- **AND** content 作为 Card body 显示（支持 JSX/纯文本）

### Requirement: expensiveCompute 工具函数

系统 SHALL 提供 `expensiveCompute` 纯函数，模拟一个可感知耗时的计算过程。

#### Scenario: 同一输入始终返回相同输出

- **WHEN** 多次调用 expensiveCompute(n) 且 n 相同
- **THEN** 返回值完全相同（纯函数特性）

#### Scenario: 计算耗时约 30ms

- **WHEN** 调用 expensiveCompute(n)
- **THEN** 函数执行耗时约 30ms（通过 while 循环同步阻塞实现）
- **AND** 耗时与输入值 n 正相关（n 越大计算量越大）
