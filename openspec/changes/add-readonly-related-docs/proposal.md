## 目标

当前单据表单页面中，「关联单据」模块与其他模块（发票、配件、设备等）使用同一个 CRUD 风格的 `ModuleSection` 组件，包含增删改操作按钮。但关联单据是对其他已有单据的只读引用，用户不应在此处创建、编辑或删除关联关系。这造成了不好的用户体验，容易引起混淆。需要一个专门的只读展示组件。

## 变更内容

- 在 `src/views/document/components/` 下新建 `RelatedDocSection` 组件，以静态只读表格展示关联单据
- 修改 `DocumentForm.tsx`，将 `relatedDoc` 模块从 `ModuleSection` 切换为 `RelatedDocSection`
- 移除关联单据区域的增删改按钮和操作列
- 补充 Mock 数据，使至少一个单据拥有 3 条以上关联单据记录，便于展示
- 数据流保持不变（父组件通过 props 传入数据）

## 能力

### 新增能力

- `readonly-related-docs-section`：用于展示关联单据的只读业务组件，以静态表格呈现，无增删改能力

### 修改的能力

<!-- 无现有能力规格变更 -->

## 影响范围

- 新增文件：`src/views/document/components/RelatedDocSection.tsx`
- 修改文件：`src/views/document/Form.tsx` — 将 `relatedDoc` 的 `ModuleSection` 替换为 `RelatedDocSection`
- 修改文件：`src/views/document/store.ts` — 补充关联单据 Mock 数据
- hooks、config 无变化
