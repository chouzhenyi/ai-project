## ADDED Requirements

### Requirement: Memo Demo 展示普通子组件与 memo 子组件的渲染差异

系统 SHALL 提供 React.memo 对比实验区，包含两组子组件（普通 / memo 包裹），在父组件发生无关状态变化时展示渲染次数的差异。

#### Scenario: 点击无关状态触发器时普通子组件渲染而 memo 子组件跳过

- **WHEN** 用户点击「更新无关状态」按钮
- **THEN** 所有普通子组件 (NormalChild) 的渲染计数 +1
- **AND** 所有 memo 包裹的子组件 (MemoChild) 的渲染计数保持不变
- **AND** 数据面板显示节省渲染百分比增加

#### Scenario: 传递给子组件的 props 变化时两类子组件都重新渲染

- **WHEN** 用户点击改变传递给子组件的 prop 值（如 count+1）
- **THEN** 普通子组件和 memo 子组件的渲染计数都 +1
- **AND** 数据面板更新两组的渲染次数

### Requirement: Memo Demo 提供优化开关

系统 SHALL 在 Memo Demo 区域提供 Switch 开关，允许用户动态启用/禁用 React.memo。

#### Scenario: 禁用 memo 开关后所有子组件退化为普通组件

- **WHEN** 用户将 memo 开关从 ON 切换到 OFF
- **THEN** 原 MemoChild 组件退化为 NormalChild 行为
- **AND** 所有子组件的渲染计数归零（key 变化触发 remount）
- **AND** 后续点击无关状态触发器时所有子组件渲染计数都 +1

#### Scenario: 重新启用 memo 开关后恢复优化效果

- **WHEN** 用户将 memo 开关从 OFF 切回 ON
- **THEN** 子组件恢复为 memo 包裹版本
- **AND** 渲染计数归零重新开始统计

### Requirement: Memo Demo 展示数据面板

系统 SHALL 在 Memo Demo 底部提供数据面板，显示各组子组件的渲染次数和优化效果量化指标。

#### Scenario: 数据面板实时显示渲染统计

- **WHEN** 用户进行任意操作导致子组件渲染
- **THEN** 数据面板显示每个子组件的当前渲染次数
- **AND** 显示总节省渲染数和百分比
- **AND** 百分比进度条颜色根据阈值动态变化（≥80% 绿色, 50-79% 橙色, <50% 红色）
