## ADDED Requirements

### Requirement: 物品废弃标记

系统 SHALL 支持将物品标记为废弃状态。

#### Scenario: 标记废弃
- **WHEN** 用户确认物品不再使用
- **THEN** 系统将物品状态标记为废弃

#### Scenario: 废弃原因记录
- **WHEN** 用户标记废弃
- **THEN** 系统要求填写废弃原因（用完/损坏/过期/其他）

### Requirement: 二手平台推荐

系统 SHALL 根据物品类型推荐适合的二手交易或回收平台。

#### Scenario: 处置建议生成
- **WHEN** 用户标记物品废弃并请求处置建议
- **THEN** 系统根据物品名称和分类推荐处置方案

#### Scenario: 处置结果反馈
- **WHEN** 用户确认已通过某平台处置物品
- **THEN** 系统记录处置方式和时间
