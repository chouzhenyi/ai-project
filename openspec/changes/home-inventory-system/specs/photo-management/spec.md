## ADDED Requirements

### Requirement: 物品照片管理

系统 SHALL 支持为物品拍摄和上传照片。

#### Scenario: 拍照上传
- **WHEN** 用户入库时选择拍照
- **THEN** 系统调用系统相机拍照，压缩后上传保存

#### Scenario: 多照片管理
- **WHEN** 用户为同一物品拍摄多张照片
- **THEN** 系统保存所有照片，第一张为封面图

#### Scenario: 照片查看
- **WHEN** 用户查看物品详情
- **THEN** 系统以画廊形式展示物品照片，支持点击放大

#### Scenario: 照片删除
- **WHEN** 用户删除物品照片
- **THEN** 系统删除图片文件并更新记录

### Requirement: 图片压缩与存储

系统 SHALL 对上传图片进行压缩以节省存储空间。

#### Scenario: 自动压缩
- **WHEN** 用户上传图片
- **THEN** 系统使用 sharp 库生成 640px 宽缩略图，原图保留

#### Scenario: 存储路径
- **WHEN** 图片保存
- **THEN** 系统按 uploads/YYYY/MM/UUID.ext 结构存储
