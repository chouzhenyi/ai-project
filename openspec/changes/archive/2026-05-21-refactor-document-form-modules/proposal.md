## Why

`src/views/document/Form.tsx` 目前为 783 行的单体组件，内联了 7 组业务模块的 Schema 定义、Column 定义、CRUD 逻辑和 Drawer 状态管理。随着业务模块持续增长，该文件的可维护性和可读性急剧下降，每次修改都需在一大段代码中定位目标模块，且不利于多人并行开发。本次重构旨在将按业务模块拆分为独立文件，使代码结构清晰、职责单一、易于扩展。

## What Changes

- 在 `src/views/document/` 下新建 `config/` 目录，将 7 组业务模块的 `FormSchema`、`ColumnSchema` 及 `MODULE_CONFIG` 注册表抽离为独立配置文件
- 在 `src/views/document/` 下新建 `components/` 目录，将以下 UI 片段抽离为独立组件：
  - `ActionBar` — 顶部操作按钮组（保存、提交审批、创建报账单、创建付款单、废弃）
  - `BasicInfoSection` — 基本信息 Card + EasyForm 区域
  - `ModuleSection` — 通用模块区域组件（Card + EasyTable + 增删改按钮）
  - `ModuleDrawer` — 通用 Drawer 弹窗组件（内含 EasyForm 表单）
- 将内联的状态管理和 CRUD 回调抽离为自定义 Hook `useDocumentForm`
- `Form.tsx` 精简为仅编排布局和组合子组件，预估从 783 行降至 ~120 行
- 不改变任何外部行为、路由、API 接口，属于纯代码重组（**非 breaking change**）

## Capabilities

### New Capabilities

- `document-module-configs`: 各业务模块的 Schema、Column 配置定义及模块注册表
- `document-module-components`: 模块化 UI 组件（BasicInfoSection、ModuleSection、ModuleDrawer）
- `document-form-hooks`: 单据表单的状态管理与业务逻辑 Hook

### Modified Capabilities

<!-- 无 spec 级别行为变更 -->

## Impact

**受影响的文件：**

- `src/views/document/Form.tsx` — 大幅精简，引用外部配置和组件
- `src/views/document/index.tsx` — 不直接影响，但需确保 `export` 路径不变

**新增文件（约 12 个）：**

- `src/views/document/config/basicInfo.ts`
- `src/views/document/config/invoice.ts`
- `src/views/document/config/parts.ts`
- `src/views/document/config/equipment.ts`
- `src/views/document/config/supplier.ts`
- `src/views/document/config/attachment.ts`
- `src/views/document/config/relatedDoc.ts`
- `src/views/document/config/index.ts`（MODULE_CONFIG 注册表）
- `src/views/document/components/ActionBar.tsx`
- `src/views/document/components/BasicInfoSection.tsx`
- `src/views/document/components/ModuleSection.tsx`
- `src/views/document/components/ModuleDrawer.tsx`
- `src/views/document/hooks/useDocumentForm.ts`

**不涉及：**

- 无路由变更
- 无 API 变更
- 无依赖变更
- 无测试改动（纯重构）

**回滚方案：** 若拆分后出现问题，可恢复 Form.tsx 至原始版本，删除新增目录即可。
