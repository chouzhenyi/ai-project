## 新增需求

### 需求：以静态只读表格展示关联单据

系统应提供 `RelatedDocSection` 组件，使用 `RELATED_DOC_COLUMNS` 列配置以静态只读表格展示关联单据列表。

- 组件应从父组件接收 `dataSource` 属性，类型为 `Record<string, unknown>[]`
- 表格不得显示任何操作按钮（无增删改）
- 表格不得显示「新建」按钮
- 列定义应复用 `config/relatedDoc.ts` 中的 `RELATED_DOC_COLUMNS`
- 表格应包裹在 Ant Design `Card` 中，标题为「关联单据」
- 组件位于 `src/views/document/components/RelatedDocSection.tsx`

#### 场景：有数据时渲染

- **当** `RelatedDocSection` 接收到非空 `dataSource` 数组
- **则** 表格应使用 `RELATED_DOC_COLUMNS` 渲染 `dataSource` 中的所有行
- **且** 不应出现操作按钮和新建按钮

#### 场景：无数据时渲染

- **当** `RelatedDocSection` 接收到空 `dataSource` 数组
- **则** 表格应显示「暂无数据」空状态
- **且** 不应出现操作按钮和新建按钮

#### 场景：无操作按钮

- **当** `RelatedDocSection` 渲染时
- **则** 表格行级不应有操作按钮（无编辑、无删除）
- **且** 表格头部不应有「新建」按钮

### 需求：将 RelatedDocSection 集成到 DocumentForm

单据表单页面应对 `relatedDoc` 模块使用 `RelatedDocSection` 而非通用的 `ModuleSection`。

- 表单页面应在所有其他 `ModuleSection` 组件之后渲染 `RelatedDocSection`
- `dataSource` 属性应传入 `moduleData.relatedDoc`
- `relatedDoc` 应从 `ModuleSection` 循环中排除

#### 场景：关联单据独立渲染

- **当** `DocumentForm` 渲染时
- **则** `relatedDoc` 模块应使用 `RelatedDocSection` 而非 `ModuleSection`
- **且** 关联单据区域不应显示增删改操作按钮

### 需求：补充关联单据 Mock 数据

Mock 数据中 `id=1` 的单据应至少有 3 条 `relatedDocs` 记录，以验证只读组件的展示效果。

#### 场景：编辑 id=1 的单据时展示 3 条关联单据

- **当** 编辑 `id=1` 的服务器采购单时
- **则** 关联单据区域应显示 3 条记录，包含不同类型（付款单、报账单、退货单）
