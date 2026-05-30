## ADDED Requirements

### Requirement: 多级位置管理

系统 SHALL 支持"房间 → 家具 → 容器"的三级位置层级管理。

#### Scenario: 创建位置节点
- **WHEN** 用户添加房间、家具或容器
- **THEN** 系统创建对应层级的位置节点并关联父节点

#### Scenario: 按位置浏览物品
- **WHEN** 用户按位置树浏览
- **THEN** 系统展示该位置节点下的所有子节点和物品

#### Scenario: 移动物品位置
- **WHEN** 用户将物品从一个容器转移到另一个容器
- **THEN** 系统更新物品的 location_id 并生成调拨记录

### Requirement: 位置可视化

系统 SHALL 以树形结构展示位置层级。

#### Scenario: 位置树展示
- **WHEN** 用户打开位置管理页面
- **THEN** 系统以树形结构展示所有房间→家具→容器层级

#### Scenario: 展开折叠节点
- **WHEN** 用户点击展开/折叠节点
- **THEN** 系统显示/隐藏子节点
