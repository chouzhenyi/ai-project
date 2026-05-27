## 背景

单据表单页面（`DocumentForm.tsx`）通过通用的 `ModuleSection` 组件渲染多个数据模块（发票、配件、设备、供应商、附件、关联单据），该组件提供完整的 CRUD 能力（增删改操作按钮）。`relatedDoc` 模块专门展示引用其他已有单据的数据——这些数据应是只读的。

现有 `ModuleSection` 通过 `Object.keys(MODULE_CONFIG)` 循环渲染，可以方便地将 `relatedDoc` 排除出循环单独处理。

当前 Mock 数据中 `id=1` 的单据仅有 1 条关联单据记录，需要补充至至少 3 条以展示组件效果。

## 目标与非目标

**目标：**

- 创建专用的 `RelatedDocSection` 组件，以静态只读表格展示关联单据
- 复用已有的 `RELATED_DOC_COLUMNS` 配置定义表格列
- 通过 props 接收 `dataSource` 属性（与 `ModuleSection` 相同的数据流）
- 将 `DocumentForm.tsx` 中 `relatedDoc` 的 `ModuleSection` 替换为 `RelatedDocSection`
- 补充 Mock 数据使 `id=1` 单据拥有 3 条关联单据记录

**非目标：**

- 不修改其他模块（发票、配件等）的渲染方式
- 不新增 API 或修改后端
- 不修改 `EasyTable` 组件本身

## 决策

- **独立组件 vs ModuleSection 属性**：创建独立的 `RelatedDocSection` 比在 `ModuleSection` 上添加 `readonly` 属性更清晰，因为关联单据组件具有根本不同的用途（只读引用 vs 可编辑数据录入）。
- **复用 `RELATED_DOC_COLUMNS`**：沿用 `config/relatedDoc.ts` 中现有的列配置，确保显示一致。
- **保持 props 数据流**：沿用现有的通过 props 传入 `dataSource` 的模式，避免不必要的重构。
- **非破坏性变更**：仅表单页面渲染逻辑变化，config、hook 均不受影响。

## 风险与权衡

- 无显著风险——这是一个局部 UI 重构，仅新增一个组件并修改两个文件。
