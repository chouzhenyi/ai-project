## Context

`src/views/document/Form.tsx` 是单据详情页的单体组件，783 行代码内包含了基本信息表单、6 个业务子模块（发票/配件/设备/供应商/附件/关联单据）的 Schema/Column 定义、CRUD 逻辑、Drawer 弹窗状态管理。当前状态下，任何模块的修改都需要在该文件中定位并影响全局上下文，新增业务模块也需将 Schema/Column/逻辑全部塞入同一文件。

**现有架构：**

- EasyForm 渲染基本信息区
- EasyTable × 6 渲染各子模块表格
- Drawer + EasyForm 作为子模块的新建/编辑弹窗
- 状态通过多个 `useState` 散落在组件体内
- 模块配置通过常量 `MODULE_CONFIG` 注册

**约束：**

- 只做代码重组，不改 UI 布局和交互行为
- 不引入新依赖
- 不改变路由、API、store 接口
- TypeScript 严格模式

## Goals / Non-Goals

**Goals:**

- 将 7 组业务模块的 Schema/Column 定义抽离为独立配置文件（`config/`）
- 将 UI 片段抽离为 4 个独立组件（ActionBar/BasicInfoSection/ModuleSection/ModuleDrawer）
- 将状态与逻辑抽离为自定义 Hook（`useDocumentForm`）
- `Form.tsx` 缩减为纯编排层（~120 行），只做子组件组合和 Hook 绑定
- 保持零外部行为变更

**Non-Goals:**

- 不优化 EasyForm/EasyTable 组件自身
- 不增加新功能或业务模块
- 不重构 store.ts 的数据结构
- 不引入状态管理库（保持 useState / useCallback 模式）
- 不添加单元测试（纯重构，逻辑不变）

## Decisions

### 1. 配置抽取策略：每个模块一个文件 + index 聚合

每个业务模块的 `FormSchema[]` 和 `ColumnSchema[]` 定义各自独立成文件，通过 `config/index.ts` 统一导出 `MODULE_CONFIG` 注册表。

```
config/
  basicInfo.ts    → 导出 BASIC_INFO_SCHEMA
  invoice.ts      → 导出 INVOICE_SCHEMA + INVOICE_COLUMNS
  parts.ts        → 导出 PARTS_SCHEMA + PARTS_COLUMNS
  equipment.ts    → 导出 EQUIPMENT_SCHEMA + EQUIPMENT_COLUMNS
  supplier.ts     → 导出 SUPPLIER_SCHEMA + SUPPLIER_COLUMNS
  attachment.ts   → 导出 ATTACHMENT_SCHEMA + ATTACHMENT_COLUMNS
  relatedDoc.ts   → 导出 RELATED_DOC_SCHEMA + RELATED_DOC_COLUMNS
  index.ts        → 聚合所有模块到 MODULE_CONFIG，并导出 ModuleConfig 类型
```

**理由：** 按业务模块分文件最符合 "关注点分离" 原则，新增业务模块时只需在 config/ 下加一个文件并在 index.ts 注册即可。易于并行开发和代码审查。

### 2. 组件拆分粒度：4 个独立组件

| 组件               | 职责                     | 接收的 Props                                               |
| ------------------ | ------------------------ | ---------------------------------------------------------- |
| `ActionBar`        | 顶部操作按钮组           | `onSave`, `onSubmitApproval`, `onDiscard`, `isEdit`        |
| `BasicInfoSection` | 基本信息 Card + EasyForm | `formRef`, `schema`, `initialValues`, `onChange`           |
| `ModuleSection`    | 子模块 Card + EasyTable  | `config`, `data`, `onAdd`, `onEdit`, `onDelete`            |
| `ModuleDrawer`     | Drawer 弹窗 + EasyForm   | `open`, `config`, `mode`, `editRow`, `onSubmit`, `onClose` |

**理由：** 4 个组件分别对应页面上的 4 个视觉区域，职责单一。其中 ActionBar/BasicInfoSection 各出现一次，ModuleSection/ModuleDrawer 通过 props 复用（6 个业务模块共用同一套组件逻辑）。不将每个业务模块各自封装为独立组件（如 InvoiceSection/PartsSection），因为它们的渲染逻辑完全一致，差异仅体现在 config 配置上。

### 3. 状态管理：`useDocumentForm` Hook

抽离以下状态和回调到 `hooks/useDocumentForm.ts`：

- `moduleData` — 6 个子模块的表格数据
- `drawerOpen / drawerModule / drawerMode / drawerEditRow` — Drawer 状态
- `openDrawer / closeDrawer` — Drawer 开关
- `handleDrawerSubmit / handleModuleDelete` — 子模块 CRUD
- `collectAllData` — 收集全部数据
- `handleSave / handleSubmitApproval / handleDiscard` — 全局操作

Hook 返回所有状态和回调，Form.tsx 解构后传递给各子组件。

**理由：** 保持 React hooks 风格一致，不引入额外抽象。Hook 内部逻辑与当前 Form.tsx 中的逻辑逐行对应，降低回归风险。调用方（Form.tsx）只需一行 `const { ... } = useDocumentForm(isEdit, editDoc)` 即可获取所有能力。

### 4. 类型维护：就近声明，统一导出

- `ModuleConfig` 接口保留在 `config/index.ts` 中
- 组件的 Props 类型在各组件文件内就近声明（`ActionBarProps` 等）
- `DrawerMode` 类型放在 `hooks/useDocumentForm.ts` 中
- store.ts 中的 `DocumentData` 等类型保持不变

### 5. 不采用方案对比

| 方案                                          | 否决理由                                                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 每个业务模块一个独立组件（InvoiceSection 等） | 6 个子模块渲染逻辑完全一样，会导致大量样板代码；差异只在配置层面，用 props 传 config 即可 |
| 引入 zustand/jotai 管理状态                   | 当前状态只在单页面内使用，useState 足够；引入外部库增加依赖和心智负担                     |
| 用文件目录自动注册模块                        | 项目没有此类基础设施，手动注册（config/index.ts）更直观且类型安全                         |

## Risks / Trade-offs

| 风险                                                                                                    | 缓解措施                                                                              |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Hook 返回大量状态（10+ 项），可能导致不必要的重渲染                                                     | 所有回调使用 `useCallback` 包裹；子组件接收的 props 粒度细分，不传递整个 hook 返回值  |
| 拆分后文件数量增加（从 1 → 13），查找特定逻辑需跨文件                                                   | 遵循一致的目录命名（config/ /components/ /hooks/），IDE 的模糊搜索可抵消此成本        |
| 合并冲突风险：如果在拆分期间有其他人修改 Form.tsx                                                       | 重构应在一个 PR 内完成；先做文件拆分，再迁入逻辑，减少冲突窗口                        |
| 模块配置的 format 函数中引用了 store 的常量（INVOICE_TYPE_MAP 等），拆入 config/ 后需要保持导入路径正确 | 所有 format 函数保留在 config 文件中并显式 import store 中的 map 常量，不依赖外部闭包 |
