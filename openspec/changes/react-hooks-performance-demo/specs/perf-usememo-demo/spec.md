## ADDED Requirements

### Requirement: UseMemo Demo 展示缓存计算与每次重算的性能差异

系统 SHALL 提供 useMemo 对比实验区，包含「每次渲染都计算」和「useMemo 缓存」两个计算路径，展示耗时和计算次数的差异。

#### Scenario: 改变计算输入值时两者都重新计算

- **WHEN** 用户调整输入值（InputNumber 控件）
- **THEN** 两个计算路径都用新输入值执行 `expensiveCompute`
- **AND** 各自显示计算结果和耗时
- **AND** useMemo 版本的计算次数 +1

#### Scenario: 触发无关状态变化时仅无缓存版本重算

- **WHEN** 用户点击「触发重渲染」按钮（不改变计算输入）
- **THEN** 无缓存版本重新执行 `expensiveCompute`，计时器和计算次数更新
- **AND** useMemo 缓存版本直接返回上一次的缓存结果，耗时显示为 0ms 或接近 0
- **AND** useMemo 版本的计算次数不变

### Requirement: UseMemo Demo 提供优化开关

系统 SHALL 在 UseMemo Demo 区域提供 Switch 开关，允许用户动态启用/禁用 useMemo 缓存。

#### Scenario: 禁用 useMemo 后两个计算路径行为一致

- **WHEN** 用户将 useMemo 开关从 ON 切换到 OFF
- **THEN** 「useMemo 缓存」区域退化为每次渲染都执行计算
- **AND** 两个区域的耗时和计算次数趋于一致

#### Scenario: 启用 useMemo 后恢复缓存行为

- **WHEN** 用户将 useMemo 开关从 OFF 切回 ON
- **THEN** 缓存区域恢复为仅在依赖变化时计算的行为

### Requirement: UseMemo Demo 展示耗时和计算次数统计

系统 SHALL 在 UseMemo Demo 中实时展示每个计算路径的耗时 (ms) 和累计计算次数。

#### Scenario: 计算执行时显示耗时反馈

- **WHEN** `expensiveCompute` 正在执行（同步阻塞约 30ms）
- **THEN** 计算区域显示加载状态指示
- **AND** 完成后显示精确到小数点后 2 位的耗时数值
