## ADDED Requirements

### Requirement: 容器基础管理

系统 SHALL 支持容器（箱子、抽屉、柜子隔层等）的增删改查。

#### Scenario: 创建容器
- **WHEN** 用户指定容器名称、所属位置、存放条件
- **THEN** 系统创建容器记录并自动生成 QR 码

#### Scenario: 查看容器内容
- **WHEN** 用户查看某容器详情
- **THEN** 系统显示该容器内所有物品清单及数量

#### Scenario: 容器 QR 码生成
- **WHEN** 容器创建成功
- **THEN** 系统生成唯一 QR 码，格式为 C:短UUID

### Requirement: 容器存放条件

系统 SHALL 支持为容器标注环境条件（温度、湿度等）。

#### Scenario: 设置容器条件
- **WHEN** 用户编辑容器时填写存放条件
- **THEN** 系统保存容器的环境条件信息

#### Scenario: 条件不匹配提醒
- **WHEN** 物品要求干燥存放但容器标注潮湿
- **THEN** 系统在入库时给出条件不匹配提醒
