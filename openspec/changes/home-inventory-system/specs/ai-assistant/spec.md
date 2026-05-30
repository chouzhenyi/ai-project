## ADDED Requirements

### Requirement: AI 辅助识别物品信息

系统 SHALL 支持根据物品名称或照片调用 LLM 识别保质期、存放要求、注意事项。

#### Scenario: 根据名称识别
- **WHEN** 用户输入物品名称后请求 AI 补充
- **THEN** 系统调用 LLM 返回该物品的典型保质期、存放要求、注意事项

#### Scenario: 识别结果展示
- **WHEN** AI 返回识别结果
- **THEN** 系统以可编辑表单展示，供用户确认修改后保存

#### Scenario: 识别结果缓存
- **WHEN** 系统已缓存同类物品的 AI 结果
- **THEN** 系统直接返回缓存，不重复调用 LLM

### Requirement: AI 废弃处置建议

系统 SHALL 支持根据物品信息推荐二手处置平台或废弃方式。

#### Scenario: 处置建议
- **WHEN** 用户标记物品为"废弃"并请求建议
- **THEN** 系统根据物品类型推荐处置方案

#### Scenario: 平台推荐规则
- **WHEN** 物品为电子产品
- **THEN** 系统推荐"爱回收/转转"
- **WHEN** 物品为书籍
- **THEN** 系统推荐"多抓鱼/闲鱼"
- **WHEN** 物品为品牌服饰
- **THEN** 系统推荐"得物/闲鱼"
- **WHEN** 物品为普通日用品
- **THEN** 系统推荐"闲鱼/小区二手群"

### Requirement: LLM 接口抽象

系统 SHALL 支持切换多种 LLM 后端（云端 API / 本地 Ollama）。

#### Scenario: 云端模式
- **WHEN** 系统配置为使用云端 API
- **THEN** 系统通过 HTTP 调用 DeepSeek/通义千问 API

#### Scenario: 本地模式
- **WHEN** 系统配置为使用本地 Ollama
- **THEN** 系统通过 HTTP 调用本地 Ollama 服务

#### Scenario: API 失败降级
- **WHEN** LLM 调用超时或失败
- **THEN** 系统提示"AI 服务暂不可用"并允许用户手动填写
