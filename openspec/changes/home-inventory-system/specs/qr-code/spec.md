## ADDED Requirements

### Requirement: QR 码生成

系统 SHALL 在创建容器（或物品）时自动生成唯一 QR 码。

#### Scenario: 容器 QR 生成
- **WHEN** 新容器创建成功
- **THEN** 系统生成 QR 码，内容为 C:短UUID，并可在页面预览/下载打印

#### Scenario: 物品 QR 生成（可选）
- **WHEN** 用户要求为特定物品生成 QR 码
- **THEN** 系统生成 QR 码，内容为 I:短UUID

### Requirement: QR 码扫描解析

系统 SHALL 支持通过拍照识别 QR 码内容。

#### Scenario: 拍照扫码
- **WHEN** 用户点击扫码按钮
- **THEN** 系统打开系统相机拍照
- **WHEN** 用户拍照完成
- **THEN** 系统使用 jsQR 库解码图片中的 QR 码

#### Scenario: 容器码解析
- **WHEN** 系统解码到 C:开头的 QR 码
- **THEN** 系统跳转到对应容器详情页

#### Scenario: 物品码解析
- **WHEN** 系统解码到 I:开头的 QR 码
- **THEN** 系统跳转到对应物品详情页

#### Scenario: 扫码失败处理
- **WHEN** 系统无法从照片中识别 QR 码
- **THEN** 系统提示"未识别到二维码，请重拍"

### Requirement: 二维码打印

系统 SHALL 支持导出 QR 码为图片供打印。

#### Scenario: 批量导出
- **WHEN** 用户选择多个容器
- **THEN** 系统导出包含所有 QR 码的打印页

#### Scenario: 单个导出
- **WHEN** 用户点击单个容器旁的打印按钮
- **THEN** 系统弹出该容器的 QR 码图片供打印
