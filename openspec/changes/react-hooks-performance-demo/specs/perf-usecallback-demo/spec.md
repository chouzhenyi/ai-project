## ADDED Requirements

### Requirement: UseCallback Demo 展示三场景对比

系统 SHALL 提供 useCallback 三场景对比实验区，展示：无 memo 子组件 / 有 memo 但无 useCallback / 有 memo + 有 useCallback 三种组合下的渲染和引用变化行为。

#### Scenario: 无 memo 子组件时函数引用稳定性无关紧要

- **WHEN** 父组件渲染（点击无关状态触发器）且子组件未用 memo 包裹
- **THEN** 无论回调函数是否使用 useCallback 包裹，子组件都会重新渲染
- **AND** 引用追踪显示普通函数引用每次都变化，useCallback 引用保持稳定

#### Scenario: 有 memo 子组件但回调未用 useCallback 时 memo 失效

- **WHEN** 父组件渲染且子组件用了 React.memo 但回调是普通箭头函数
- **THEN** 每次父组件渲染都创建新的函数引用
- **AND** memo 的浅比较检测到引用变化，导致子组件仍然渲染（memo 失效）

#### Scenario: 有 memo 子组件 + useCallback 时 memo 生效

- **WHEN** 父组件渲染且子组件用了 React.memo 且回调使用了 useCallback
- **THEN** useCallback 保持函数引用稳定
- **AND** memo 的浅比较通过，子组件跳过渲染

### Requirement: UseCallback Demo 追踪函数引用变化次数

系统 SHALL 使用 useRefTrack 机制追踪并展示每个回调函数的引用变化累计次数。

#### Scenario: 展示两类回调的引用变化计数

- **WHEN** 用户查看 UseCallback Demo 区域
- **THEN** 显示普通箭头函数的累计引用变化次数
- **AND** 显示 useCallback 包裹函数的累计引用变化次数
- **AND** 两者的差异在父组件多次渲染后变得显著

### Requirement: UseCallback Demo 强调「必须配合 memo」的认知要点

系统 SHALL 在 UseCallback Demo 的原理说明区强调：useCallback 单独使用几乎无意义，其价值在于配合 React.memo 防止子组件被拖垮。

#### Scenario: 原理说明区展示核心认知

- **WHEN** 用户进入 useCallback Tab
- **THEN** 原理说明区包含醒目提示（⚠️ 标记）
- **AND** 说明文字解释为什么单独使用 useCallback 不能阻止子组件渲染
