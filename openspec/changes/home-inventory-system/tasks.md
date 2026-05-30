## 1. Monorepo 转型

- [x] 1.1 创建 pnpm-workspace.yaml，定义 packages/* 工作空间
- [x] 1.2 将现有 src/ 迁移到 packages/client/，调整 vite.config.ts、tsconfig.json
- [x] 1.3 新建 packages/server/，初始化 NestJS 项目
- [x] 1.4 新建 packages/shared/，放置共享类型（数据库表类型、API DTO、常量）
- [x] 1.5 调整根目录 package.json 脚本，支持同时启动 client 和 server
- [x] 1.6 验证原有前端功能在 monorepo 结构下正常运行

## 2. 后端基础搭建

- [x] 2.1 配置 SQLite 数据库连接（Drizzle ORM + better-sqlite3）
- [x] 2.2 创建所有数据库表的 schema 定义（locations, categories, items, transactions, ai_cache, alerts）
- [x] 2.3 运行首次数据库迁移，生成 store.db
- [x] 2.4 创建 NestJS 模块结构（items, containers, transactions, locations, alerts, ai, photos）
- [x] 2.5 实现全局异常过滤器、请求日志中间件

## 3. 物品管理模块 (item-management)

- [x] 3.1 实现物品 CRUD API（创建、查询、编辑、删除）
- [x] 3.2 实现物品列表 API（支持按名称/分类/位置筛选，分页）
- [x] 3.3 实现物品数量变更 API（增减操作，校验数量非负）
- [x] 3.4 前端：物品列表页，使用 EasyTable 展示
- [x] 3.5 前端：物品编辑表单，使用 EasyForm 配置
- [x] 3.6 前端：注意事项管理（手动输入 + AI 建议入口）

## 4. 容器管理模块 (container-management)

- [x] 4.1 实现容器 CRUD API
- [x] 4.2 实现容器内容查询 API（返回容器内所有物品及数量）
- [x] 4.3 实现 QR 码生成接口（生成 QR 码图片）
- [x] 4.4 前端：容器管理页，支持创建、查看内容
- [x] 4.5 前端：QR 码预览与打印

## 5. 位置层级 (location-hierarchy)

- [x] 5.1 实现位置节点 CRUD API（房间 → 家具 → 容器三级）
- [x] 5.2 实现位置树查询 API（返回嵌套树结构）
- [x] 5.3 实现移动物品位置 API
- [x] 5.4 前端：位置树组件，支持展开/折叠
- [x] 5.5 前端：按位置浏览物品

## 6. 出入库操作 (inventory-transaction)

- [x] 6.1 实现交易记录创建 API（入库/出库/调拨/调整）
- [x] 6.2 实现交易记录查询 API（按物品/容器/时间筛选）
- [x] 6.3 实现去向验证逻辑（出库时 destination 必填）
- [x] 6.4 前端：入库表单（扫描容器 → 添加物品 → 确认）
- [x] 6.5 前端：出库表单（选择物品 → 填去向 → 确认）
- [x] 6.6 前端：去向快捷选项 + 自定义输入 + 语音输入
- [x] 6.7 前端：操作历史列表，使用 EasyTable 展示

## 7. QR 码扫码 (qr-code)

- [x] 7.1 前端：拍照扫码组件（input capture + jsQR 解码）
- [x] 7.2 前端：扫码结果路由（C:前缀 → 容器页，I:前缀 → 物品页）
- [x] 7.3 前端：扫码失败提示与重拍

## 8. 照片管理 (photo-management)

- [x] 8.1 实现图片上传 API（接收图片 → sharp 压缩 → 保存）
- [x] 8.2 实现图片获取 API（原图 + 缩略图）
- [x] 8.3 实现图片删除 API
- [x] 8.4 前端：拍照/选择图片组件
- [x] 8.5 前端：图片画廊组件

## 9. 预警模块 (expiry-alert + storage-condition)

- [x] 9.1 实现保质期检查定时任务（每日扫描即将到期物品）
- [x] 9.2 实现预警记录 API
- [x] 9.3 实现存放条件匹配检查逻辑（入库时比较物品要求与容器条件）
- [x] 9.4 前端：仪表盘预警卡片（到期/低库存/条件不匹配）
- [x] 9.5 前端：预警列表与标记已处理

## 10. AI 辅助 (ai-assistant)

- [x] 10.1 实现 AI 服务抽象层（支持云端 API / 本地 Ollama 切换）
- [x] 10.2 实现物品信息识别 API（名称 → AI → 保质期/存放要求/注意事项）
- [x] 10.3 实现废弃处置建议 API（物品名/分类 → AI → 推荐平台）
- [x] 10.4 实现 AI 结果缓存（按物品名+分类缓存，避免重复请求）
- [x] 10.5 前端：AI 建议展示与确认组件

## 11. 语音输入 (voice-input)

- [x] 11.1 前端：语音识别组件（Web Speech API）
- [x] 11.2 前端：浏览器兼容性检测与降级处理
- [x] 11.3 集成到出库去向和备注输入框

## 13. monorepo 文件移动与配置（基础迁移已完成）

- [x] 13.1 移动 src/ public/ index.html vite.config.ts 到 packages/client/
- [x] 13.2 创建 packages/shared 共享类型和常量包
- [x] 13.3 创建 packages/server NestJS 项目骨架
- [x] 13.4 配置 pnpm-workspace.yaml 和 tsconfig 引用
- [x] 13.5 验证客户端构建正常
- [x] 13.6 验证服务端构建启动正常
- [x] 13.7 端到端 API 验证（创建容器/入库/出库/查询）

## 14. 移动端页面 (mobile)

- [x] 14.1 手机端扫码页 /m/scan (拍照扫码 + 结果跳转)
- [x] 14.2 手机端入库页 /m/checkin (分步向导：扫容器→填物品→确认)
- [x] 14.3 手机端出库页 /m/checkout (选物品→选去向→确认)
- [x] 14.4 手机端容器页 /m/box/:id (卡片式物品清单)
- [x] 14.5 手机端物品详情 /m/item/:id (信息+操作记录)
- [x] 14.6 底部导航栏 (扫码/入库/出库)
- [x] 14.7 main.tsx 设备检测 (PC→桌面路由, 手机→移动路由)

## 12. 部署与文档

- [x] 12.1 编写本地开发环境启动说明
- [x] 12.2 编写部署文档（SQLite 初始化、启动服务、LAN 访问）
- [x] 12.3 编写 QR 码打印与粘贴指南
- [ ] 12.4 首次部署验证：从扫码入库到出库的完整流程（等待真实部署测试）
