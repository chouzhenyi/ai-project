# 家庭物品存放系统 部署指南

## 环境要求

- Node.js >= 22
- pnpm >= 9

## 快速启动

```bash
# 1. 安装依赖
pnpm install

# 2. 初始化数据库
pnpm --filter server db:generate
pnpm --filter server db:migrate

# 3. 构建（首次运行需要）
pnpm --filter server build

# 4. 启动服务端（端口 3000）
pnpm --filter server start

# 5. 启动前端（另一个终端，端口 5173）
pnpm --filter client dev
```

## 配置

复制 `packages/server/.env.example` 为 `packages/server/.env` 并按需修改：

```env
PORT=3000                    # 服务端口
DB_PATH=./data/store.db     # 数据库文件路径
UPLOAD_DIR=./uploads        # 照片存储目录

# AI 配置（可选）
LLM_PROVIDER=none           # none | openai | deepseek | ollama
LLM_API_KEY=                # API Key
LLM_BASE_URL=https://api.deepseek.com
```

## LAN 访问

在局域网内其他设备访问：

1. 查看主机 IP: `ipconfig` (Windows) / `ifconfig` (Mac/Linux)
2. 修改 `packages/client/vite.config.ts`，将 `server.host` 设为 `"0.0.0.0"`
3. 手机浏览器访问: `http://192.168.x.x:5173`

> 注意：扫码功能使用 `<input capture>` 拍照模式，不需要 HTTPS。

## 生产部署

```bash
# 构建前端
pnpm --filter client build
# 构建服务端
pnpm --filter server build
# 启动（服务端同时托管前端静态文件）
node packages/server/dist/main.js
```

## QR 码使用

1. 在容器管理页创建位置节点（房间→家具→容器）
2. 每个容器自动生成 QR 码
3. 点击"打印"下载 QR 码图片
4. 打印后贴到对应容器上
5. 扫码时使用手机浏览器打开应用，点击扫码按钮拍照

## 备份

SQLite 数据库文件在 `packages/server/data/store.db`，直接复制即可备份：

```bash
cp packages/server/data/store.db backup-$(date +%Y%m%d).db
```
