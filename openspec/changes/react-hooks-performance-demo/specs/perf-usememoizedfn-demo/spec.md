## ADDED Requirements

### Requirement: UseMemoizedFn Demo Part A — 引用稳定性对比

系统 SHALL 提供引用稳定性对比区，展示普通函数与 `useMemoizedFn` 包裹函数在多次父组件渲染下的引用变化差异。

#### Scenario: 父组件渲染时 useMemoizedFn 引用永远不变

- **WHEN** 用户点击无关状态触发器导致父组件多次渲染
- **THEN** 普通箭头函数的引用变化计数随渲染次数增长
- **AND** `useMemoizedFn` 包裹的函数引用变化计数始终为 0（mount 后）

#### Scenario: 配合 memo 子组件时差异更明显

- **WHEN** 上述两种函数分别传递给 React.memo 包裹的子组件
- **THEN** 接收普通函数的 memo 子组件因引用变化而反复渲染
- **AND** 接收 `useMemoizedFn` 函数的 memo 子组件保持跳过渲染

### Requirement: UseMemoizedFn Demo Part B — 闭包陷阱演示

系统 SHALL 提供闭包陷阱 (Stale Closure) 演示区，通过「延迟读 state」场景展示 `useCallback(fn, [])` 与 `useMemoizedFn` 的关键差异。

#### Scenario: useCallback 空依赖数组导致读取陈旧 state 值

- **GIVEN** count 初始值为 0
- **WHEN** 用户连续 3 次点击 [+1] 按钮（count 变为 3）
- **AND** 用户点击 [延迟打印 count]（触发 setTimeout 2秒后执行）
- **THEN** 2 秒后 `useCallback(fn, [])` 版本输出 count 值为 0（mount 时闭包捕获的值）
- **AND** 结果以红色/警告样式标记为「⚠️ 陈旧值」

#### Scenario: useMemoizedFn 始终读取最新 state 值

- **GIVEN** count 当前值为 3
- **WHEN** 用户点击 [延迟打印 count]（useMemoizedFn 版本）
- **THEN** 2 秒后输出 count 值为 3（最新值）
- **AND** 结果以绿色/成功样式标记为「✅ 最新值」

#### Scenario: 多次延迟打印结果按顺序记录

- **WHEN** 用户多次触发延迟打印操作
- **THEN** 每次的结果（值 + 是否陈旧 + 时间戳）追加到结果列表中
- **AND** 结果列表区分显示 useCallback 版本和 useMemoizedFn 版本的输出

### Requirement: UseMemoizedFn Demo 展示两者原理差异说明

系统 SHALL 在闭包陷阱演示区下方提供原理对比说明，解释为什么会产生上述差异。

#### Scenario: 说明 useCallback 的闭包机制

- **WHEN** 用户查看原理说明区
- **THEN** 解释：`useCallback(fn, [])` 在 mount 时创建一次 fn，闭包捕获当时的 state 快照
- **AND** 之后无论 state 如何变化，fn 内部读到的永远是创建时的快照

#### Scenario: 说明 useMemoizedFn 的 ref 机制

- **WHEN** 用户查看原理说明区
- **THEN** 解释：`useMemoizedFn` 内部用 ref 存储最新的 fn 引用
- **AND** 每次调用时从 ref 取出最新 fn 执行，始终读到当前 render 的 state

### Requirement: UseMemoizedFn Demo 提供优化开关

系统 SHALL 提供 Switch 开关允许用户动态切换 `useMemoizedFn` 为普通函数，观察闭包陷阱暴露。

#### Scenario: 关闭开关后两部分行为一致且都存在闭包问题

- **WHEN** 用户将 useMemoizedFn 开关切换到 OFF
- **THEN** 「useMemoizedFn」区域退化为使用普通函数或 useCallback
- **AND** 两边的延迟打印都输出陈旧值
