## Why

家中柜子箱子多，暂时不用的物品放入后时间一长就忘记存放位置，需要用时找不到只能重新购买。需要一个家庭物品存放系统，记录物品信息、存放位置、存入取出时间，借助拍照、扫码快速完成出入库记录。当前项目为纯前端，需改造为 pnpm monorepo 并新增服务端应用。

## What Changes

- 将单前端项目改造为 pnpm monorepo（packages/client + packages/server + packages/shared）
- 新增后端服务（NestJS + SQLite），提供 RESTful API
- 新增家庭物品管理系统，覆盖物品、容器、位置、操作记录、预警等模块
- 前端新增物品入库/出库/查询/预警等页面
- 支持 QR 码扫码（拍照扫码，依赖浏览器 input capture）
- 支持 AI 辅助（后端调用 LLM，支持本地 Ollama 或云端 API）
- 支持语音输入（Web Speech API）
- 支持 PWA，手机浏览器可添加到桌面

## Capabilities

### New Capabilities
- `item-management`: 物品 CRUD、基本信息、照片、分类、数量管理
- `container-management`: 容器（箱子/抽屉）CRUD、位置层级、QR 码生成
- `inventory-transaction`: 入库/出库/调拨操作记录、去向必填、数量变化追踪
- `location-hierarchy`: 房间-家具-容器的多级位置管理
- `expiry-alert`: 保质期追踪、到期预警、低库存预警
- `storage-condition`: 存放条件要求记录、存入不当容器时提醒
- `ai-assistant`: AI 辅助识别物品信息、生成注意事项、推荐二手处置平台
- `voice-input`: 语音输入去向和备注
- `qr-code`: QR 码生成与扫描解析
- `photo-management`: 物品照片上传与管理
- `disposal-suggestion`: 废弃物品二手平台推荐

### Modified Capabilities
- 无（当前项目无相关已有能力）

## Impact

- 项目结构：从单包改为 monorepo，现有 `src/` 需要迁移到 `packages/client/`
- 构建配置：新增 pnpm-workspace.yaml，调整 tsconfig 和 vite 配置
- 新增依赖：NestJS、better-sqlite3（或 drizzle-orm）、sharp（图片处理）
- 开发流程：需要同时启动前端 dev server 和后端 dev server
- 部署：自托管方案，运行在家庭网络内的机器上（旧电脑/NAS/树莓派）
- 无需云服务、无需域名、无需 HTTPS（拍照扫码方案不依赖实时流）
- 无需使用微信小程序，通过 PWA + 响应式页面实现手机端访问
- 回滚方案：保留当前分支，monorepo 转换后前端功能维持不变，后端可单独回退
