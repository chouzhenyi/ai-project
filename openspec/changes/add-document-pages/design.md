## Context

项目已有 EasyTable 和 EasyForm 两个配置化组件，分别支持表格展示/编辑和表单渲染。现有路由使用 react-router-dom v6 的 `createBrowserRouter`，所有视图 lazy-loaded，侧边栏使用 Ant Design Menu。

## Goals / Non-Goals

**Goals:**

- 在 `src/views/document/` 下新建单据列表页和新建/编辑页
- 单据列表使用 EasyTable 配置化表格，支持搜索、分页、操作列
- 单据表单使用 EasyForm + Ant Design Tabs 分组展示 7 个信息模块
- 通过路由参数 `:id` 区分新建/编辑模式
- 注册路由并集成侧边栏菜单

**Non-Goals:**

- 后端 API 实现（使用模拟数据）
- 附件真实上传功能（使用 Upload 组件展示 UI，实际上传逻辑由后续迭代完成）
- 权限控制
- 单据审批流程

## Decisions

### 目录结构

新页面放在 `src/views/document/` 目录下：

- `index.tsx` — 单据列表页（默认导出，用于 lazy import）
- `Form.tsx` — 单据新建/编辑页（默认导出，用于 lazy import）

理由：与现有 `src/views/` 下的扁平结构保持一致，每个功能模块独立目录。

### 新建/编辑页使用同一组件

通过 `useParams` 获取 `:id` 参数判断模式：有 `id` 为编辑模式，无 `id` 为新建模式。编辑模式时通过 `id` 加载已有数据填充表单。

理由：新建和编辑的界面和字段完全一致，共用组件避免重复代码。

### 表单布局：Tab 分组

单据包含 7 个信息模块，使用 Ant Design `Tabs` 组件分组展示，每个 Tab 内使用独立的 EasyForm 实例渲染该模块的字段。`Tabs` 上方放置全局的单据编号、名称等关键字段。

理由：字段数量多，Tab 分组提升可读性和填写效率。每个 Tab 独立 EasyForm 实例避免字段命名冲突，且每次仅渲染当前 Tab 的 EasyForm 降低初始渲染负担。

### 数据模型

所有单据字段扁平化存储在一个 data 对象中（配合 EasyForm），用一个顶层 `Record<string, unknown>` 表示。表单提交和列表展示均使用同一数据结构。

理由：EasyForm 和 EasyTable 均基于扁平 key-value 设计，无需嵌套数据结构。

### 模拟数据层

使用 `useState` 管理内存中的单据列表数据，`useCallback` 封装 CRUD 操作。列表页和表单页通过路由参数传递数据（编辑时传递 id，表单页从共享数据中查找）。

为避免跨页面数据共享的复杂性，在列表页维护一个 `documents` 状态数组，表单页通过 URL 参数获取 id 后从同一数据源读取。实际项目中这个状态会由状态管理库或 API 调用替代。

## Risks / Trade-offs

| Risk                                                               | Mitigation                                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Tab 过多导致单个 EasyForm 字段数量大，可能影响性能                 | 每个 Tab 使用独立 EasyForm 实例，仅渲染当前 Tab 的表单                     |
| 内存模拟数据在页面刷新后丢失                                       | 明确标注为 demo 数据，实际接入 API 后持久化                                |
| 编辑模式数据同步问题（用户在表单页修改后返回列表，列表可能未更新） | 表单提交时将更新数据通过回调传给列表页，或使用 `window.history.state` 传递 |

## Open Questions

- 配件信息 Tab 中的子表格是否需要支持行内编辑（EasyTable 的 `editable` 模式）？当前设计使用 EasyTable 的可编辑模式
- 关联单据的添加方式：从已有单据中选择还是手动输入？当前设计为手动输入表格
