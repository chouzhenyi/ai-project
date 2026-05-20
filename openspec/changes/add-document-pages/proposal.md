## Why

当前系统缺少单据管理功能，业务需要使用单据进行日常运营管理。需要新增一套完整的单据功能页面，支持单据的查询、新建和编辑操作，覆盖从基本信息到关联单据的完整数据录入场景。

## What Changes

- 在 `src/views/` 下新增 `document/` 目录，包含单据列表页（`index.tsx`）和新建/编辑页（`Form.tsx`）
- 单据列表页：支持搜索过滤、分页展示、新增/编辑/删除操作，使用 EasyTable 配置化表格
- 单据新建/编辑页：页面顶部为操作栏模块（保存、提交审批、创建报账单、创建付款单、废弃），下方 7 个信息模块从上到下依次排列，基本信息模块使用 EasyForm 配置化表单；发票信息、配件信息、设备信息、供应商信息、附件信息、关联单据信息等模块各为一个 EasyTable 配置化表格（右侧操作列提供编辑/删除功能，表格顶部 buttonGroup 提供新建入口），新建和编辑共用同一 Drawer 抽屉，抽屉内使用 EasyForm 表单录入数据
- 路由配置：新增 `/document`（列表）和 `/document/form/:id?`（新建/编辑）两条路由
- 侧边栏菜单新增"单据管理"入口

## Capabilities

### New Capabilities

- `document-list`: 单据列表查询页面，支持搜索过滤、分页、批量操作，提供新增/编辑/删除入口
- `document-form`: 单据新建与编辑页面，页面顶部为操作栏（保存、提交审批、创建报账单、创建付款单、废弃），下方 7 个信息模块从上到下依次排列，基本信息模块使用 EasyForm 表单；其余模块使用 EasyTable 表格 + Drawer 抽屉模式
- `document-routes`: 路由注册与侧边栏菜单集成，将单据页面接入现有路由系统

### Modified Capabilities

<!-- No existing capability requirements are changing -->

## Impact

- `src/views/` 目录：新增 `document/index.tsx` 和 `document/Form.tsx`
- `src/router/index.tsx`：新增两条懒加载路由和菜单项
- `src/components/EasyTable`：复用配置化表格组件（无需修改）
- `src/components/EasyForm`：复用配置化表单组件（无需修改）
