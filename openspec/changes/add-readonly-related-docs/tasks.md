## 1. Mock 数据补充

- [x] 1.1 在 `store.ts` 中为 `id=1` 的单据补充关联单据 Mock 数据至至少 3 条

## 2. 组件实现

- [x] 2.1 创建 `RelatedDocSection` 组件，使用 `RELATED_DOC_COLUMNS` 渲染静态只读 EasyTable
- [x] 2.2 将 `RelatedDocSection` 集成到 `DocumentForm.tsx`，将 `relatedDoc` 从 `ModuleSection` 循环中排除
