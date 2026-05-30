## Context

当前是一个纯前端 Vite + React 18 + Ant Design 5 项目，核心组件为 EasyForm 和 EasyTable 两套配置化组件，已有单据管理模块作为功能蓝本。需改造为 monorepo 并在后端新增家庭物品存放系统的完整服务。

目标用户：家庭成员 1-4 人，物品规模数百件，操作频率低。
部署环境：家庭局域网内的旧电脑/NAS/树莓派，无云服务，无域名。

## Goals / Non-Goals

**Goals:**
- 将项目改造为 pnpm monorepo（client/server/shared 三包结构）
- 后端使用 NestJS + SQLite，提供 RESTful API
- 覆盖物品管理、容器管理、位置层级、出入库操作、保质期预警、存放条件提醒
- 支持拍照扫码、AI 辅助识别、语音输入
- 手机浏览器可扫码操作，零安装（PWA 添加到桌面）
- 完全自托管，零云服务成本

**Non-Goals:**
- 不涉及多用户/权限系统（家庭场景单用户）
- 不做实时扫码（用拍照扫码替代，降低 HTTPS 依赖）
- 不接入微信小程序（PWA 替代）
- 不做实时同步/离线优先（LAN 下始终在线）

## Decisions

### 1. 数据库：SQLite + Drizzle ORM

| 方案 | 选型 |
|------|------|
| **SQLite** | 零配置，单文件，`cp` 即备份。家庭数据量 (<5000 条记录) 完全够用 |
| **Drizzle ORM** | 轻量、SQL-like 语法、类型安全、良好 SQLite 支持。比 Prisma 更轻，无代码生成步骤 |
| **better-sqlite3** | 同步高性能，NestJS 中可用。配合 Drizzle 的 drizzle-orm/better-sqlite3 driver |

SQLite 不支持 ENUM → 用 `text()` + Zod 运行时校验替代。

### 2. 后端框架：NestJS

| 替代方案 | 比较 |
|---------|------|
| **NestJS** | 结构清晰，DI/模块化，TypeScript 原生。项目已用 TS，NestJS 自然的扩展 |
| Express | 太轻，需自行组装项目结构，家庭项目也希望代码整洁 |
| Fastify | 性能好但社区生态不如 NestJS 丰富 |

### 3. QR 码方案

- 容器 QR 内容格式：`C:短UUID`（如 `C:a1b2c3d4-e5f6`）
- 物品 QR 内容格式（可选）：`I:短UUID`
- 扫描方式：`<input type="file" accept="image/*" capture="environment">`
  - 浏览器调用后置摄像头拍照 → jsQR 解码图片
  - 不需要 HTTPS（与实时流方案的关键区别）
- 生成：`qrcode` npm 包，打印后贴到容器/物品上

### 4. AI 能力架构

```
┌──────────┐    拍照/物品名    ┌──────────┐    API 调用    ┌──────────────┐
│  手机浏览器 │ ─────────────→ │ NestJS   │ ────────────→ │ LLM (云端/本地) │
│  (PWA)    │ ←───────────── │  Server  │ ←──────────── │              │
└──────────┘  AI 结果预填表单  └──────────┘  AI 响应      └──────────────┘
```

- 策略：先手动输入，无数据时发起 AI 请求兜底
  - 入库时用户填物品名 → 可选"AI 补充" → 后端调 LLM 生成保质期/注意事项/存放要求
  - AI 结果作为建议展示，用户确认/修改后保存
- 模型支持：云端 DeepSeek/通义千问 API（低用量，月费 ≈ 0），同时预留 Ollama 本地模型接口
- 缓存：同类物品的 AI 结果缓存到数据库，减少重复调用

### 5. 照片存储

- 文件系统存储，路径格式：`uploads/{yyyy}/{mm}/{uuid}.{ext}`
- DB 只存相对路径，不存 blob
- 图片压缩：sharp 库生成缩略图（640px），原图保留
- 后续可扩展为 MinIO/S3，当前文件系统足够

### 6. 语音输入

- Web Speech API（`webkitSpeechRecognition`）
- Chrome Android / Desktop 支持中文
- Safari 不支持 → 降级为纯文本输入
- 用在：出库去向填写、入库备注、搜索

### 7. 数据库核心表设计

```sql
-- 位置层级（房间 → 家具 → 容器）
CREATE TABLE locations (
  id TEXT PRIMARY KEY,           -- UUID
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES locations(id),
  type TEXT NOT NULL CHECK(type IN ('house', 'room', 'furniture', 'container')),
  qr_code TEXT UNIQUE,           -- C:short-uuid
  photo_path TEXT,
  conditions TEXT,               -- JSON: {"temperature": "cool", "humidity": "dry"}
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 物品分类
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES categories(id),
  icon TEXT,
  created_at TEXT NOT NULL
);

-- 物品
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id),
  brand TEXT,
  model TEXT,
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT '个',
  photo_paths TEXT,              -- JSON array
  location_id TEXT REFERENCES locations(id),
  production_date TEXT,          -- ISO date
  expiry_date TEXT,              -- ISO date
  storage_requirements TEXT,     -- JSON: {"temperature": "0-4", "humidity": "dry"}
  notes TEXT,                    -- 注意事项（用户填写或AI生成）
  qr_code TEXT UNIQUE,           -- I:short-uuid (可选)
  min_stock REAL,                -- 低库存预警阈值
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 库存操作记录
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES items(id),
  type TEXT NOT NULL CHECK(type IN ('inbound', 'outbound', 'transfer', 'adjustment')),
  quantity_change REAL NOT NULL,
  quantity_before REAL NOT NULL,
  quantity_after REAL NOT NULL,
  from_location_id TEXT REFERENCES locations(id),
  to_location_id TEXT REFERENCES locations(id),
  destination TEXT NOT NULL,      -- 去向（出库必填）
  destination_type TEXT,          -- 快捷去向类型
  operator TEXT NOT NULL DEFAULT '家人',
  photo_paths TEXT,               -- JSON array
  notes TEXT,
  created_at TEXT NOT NULL
);

-- AI 请求缓存
CREATE TABLE ai_cache (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT,
  result TEXT NOT NULL,           -- JSON: AI 返回的完整结果
  created_at TEXT NOT NULL
);

-- 预警记录
CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  item_id TEXT REFERENCES items(id),
  type TEXT NOT NULL CHECK(type IN ('expiry', 'condition_mismatch', 'low_stock')),
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('info', 'warning', 'critical')),
  resolved INTEGER NOT NULL DEFAULT 0,
  resolved_at TEXT,
  created_at TEXT NOT NULL
);
```

### 8. 出入库流程（含去向和 AI）

```
入库流程:
  [扫容器 QR] → [容器详情页] → [点"入库"]
    → [拍照 / 扫条形码 / 输名称]
      → [AI 自动建议: 保质期, 注意事项, 存放要求]
        → [用户确认/修改]
          → [填数量]
            → [确认 → 更新 DB + 记录 transaction]

出库流程:
  [扫容器 QR] → [容器详情页] → [勾选物品 + 填数量]
    → [填去向 (必填)]
      ┌─ 快捷点选: 在用/车上/公司/送人/扔了/挪到其他箱
      ├─ 手动输入: 自定义文本
      └─ 语音输入: Web Speech API
    → [如果是"挪到其他箱" → 扫目标容器 QR]
    → [拍照 (可选)]
    → [确认 → 更新数量 + 记录 transaction]
```

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| 拍照扫码体验不如实时扫码流畅 | 照片可同时作为入库出库证据，一举两得 |
| Web Speech API 在 Safari 不支持 | 降级为文本输入，不影响核心流程 |
| LLM API 需联网 | 家庭场景下不联网也能手动录入，AI 不是必选项 |
| SQLite 并发写锁 | 家庭单用户场景无并发；WAL 模式进一步提升 |
| 照片占用存储空间 | sharp 压缩缩略图，原图可选保留；家庭场景可控 |
| 自托管机器故障 | SQLite 单文件备份简单，复制到另一台机器即可恢复 |

## Open Questions

- NestJS 版本选哪个？（当前稳定版即可）
- AI 模型优先级：先接云端 API 还是先支持 Ollama？
- 首次部署：先跑在开发机上验证，再决定部署到哪台机器？
