## ADDED Requirements

### Requirement: 保质期记录

系统 SHALL 支持记录物品的生产日期和保质期/到期日。

#### Scenario: 设置保质期
- **WHEN** 用户入库时填写生产日期和保质期（或到期日）
- **THEN** 系统保存保质期信息

#### Scenario: AI 识别保质期
- **WHEN** 用户拍照上传物品且未手动填写保质期
- **THEN** 系统调用 AI 识别图片中包装上的保质期信息并预填

### Requirement: 到期预警

系统 SHALL 在物品临近到期时向用户发出预警。

#### Scenario: 到期预警展示
- **WHEN** 物品到期日在 30 天内
- **THEN** 系统在首页/仪表盘展示该物品的到期预警

#### Scenario: 预警等级区分
- **WHEN** 物品已过期
- **THEN** 系统标记为 critical 级别预警
- **WHEN** 物品即将在 7 天内到期
- **THEN** 系统标记为 warning 级别预警
- **WHEN** 物品将在 30 天内到期
- **THEN** 系统标记为 info 级别预警

### Requirement: 低库存预警

系统 SHALL 在物品数量低于阈值时提醒用户。

#### Scenario: 设置预警阈值
- **WHEN** 用户编辑物品时设置最低库存量
- **THEN** 系统保存阈值信息

#### Scenario: 低库存提醒
- **WHEN** 物品当前数量低于最低库存阈值
- **THEN** 系统在仪表盘展示低库存预警
