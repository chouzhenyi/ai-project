## 1. Create Directory Structure

- [x] 1.1 Create `src/views/document/config/` directory
- [x] 1.2 Create `src/views/document/components/` directory
- [x] 1.3 Create `src/views/document/hooks/` directory

## 2. Extract Module Config Files

- [x] 2.1 Create `config/basicInfo.ts` — export `BASIC_INFO_SCHEMA` (10 fields with original schema config: required, options, span, etc.)
- [x] 2.2 Create `config/invoice.ts` — export `INVOICE_SCHEMA` (9 fields) and `INVOICE_COLUMNS` (9 columns with format functions using `INVOICE_TYPE_MAP`)
- [x] 2.3 Create `config/parts.ts` — export `PARTS_SCHEMA` (6 fields) and `PARTS_COLUMNS` (6 columns with currency formatting)
- [x] 2.4 Create `config/equipment.ts` — export `EQUIPMENT_SCHEMA` (8 fields) and `EQUIPMENT_COLUMNS` (8 columns with `EQUIP_STATUS_MAP`)
- [x] 2.5 Create `config/supplier.ts` — export `SUPPLIER_SCHEMA` (7 fields) and `SUPPLIER_COLUMNS` (7 columns)
- [x] 2.6 Create `config/attachment.ts` — export `ATTACHMENT_SCHEMA` (5 fields, including Upload component) and `ATTACHMENT_COLUMNS` (4 columns)
- [x] 2.7 Create `config/relatedDoc.ts` — export `RELATED_DOC_SCHEMA` (5 fields) and `RELATED_DOC_COLUMNS` (5 columns with `RELATED_TYPE_MAP`)
- [x] 2.8 Create `config/index.ts` — import all configs, export `ModuleConfig` interface and `MODULE_CONFIG: Record<string, ModuleConfig>` registry

## 3. Build Module Components

- [x] 3.1 Create `components/ActionBar.tsx` — render save/submit/discard buttons with Popconfirm, accept `onSave`/`onSubmitApproval`/`onDiscard`/`isEdit` props
- [x] 3.2 Create `components/BasicInfoSection.tsx` — Card + EasyForm for basic info, accept `formRef`/`initialValues`/`onChange` props
- [x] 3.3 Create `components/ModuleSection.tsx` — Card + EasyTable with add/edit/delete actions, accept `config`/`dataSource`/`onAdd`/`onEdit`/`onDelete` props
- [x] 3.4 Create `components/ModuleDrawer.tsx` — Drawer + EasyForm for sub-module CRUD, accept `open`/`config`/`mode`/`editRow`/`onSubmit`/`onClose` props

## 4. Extract Business Logic Hook

- [x] 4.1 Create `hooks/useDocumentForm.ts` — implement `moduleData` state initialized from `editDoc`, with immutable update pattern for CRUD
- [x] 4.2 Implement drawer state management: `openDrawer(moduleKey, mode, row?)`, `closeDrawer()`, `handleDrawerSubmit(values)` with create/edit branching
- [x] 4.3 Implement `handleModuleDelete(moduleKey, rowId)` with filter
- [x] 4.4 Implement `collectAllData()` — validate basic form, merge basic values + module arrays, map to `DocumentData` shape
- [x] 4.5 Implement `handleSave()` and `handleSubmitApproval()` — collectAllData + updateDocument/addDocument + navigate
- [x] 4.6 Implement `handleDiscard()` — set status to "abandoned" or warn if new
- [x] 4.7 Wrap all callbacks with `useCallback`, expose `currentStatus` from basic form onChange

## 5. Refactor Form.tsx

- [x] 5.1 Replace inline `BASIC_INFO_SCHEMA`…`RELATED_DOC_COLUMNS` and `MODULE_CONFIG` with imports from `config/`
- [x] 5.2 Replace inline `renderModuleSection` and action buttons with `ActionBar`/`BasicInfoSection`/`ModuleSection`/`ModuleDrawer` components
- [x] 5.3 Replace inline state and callbacks with `useDocumentForm` hook
- [x] 5.4 Verify all imports are cleaned up (remove unused direct imports from store.ts)

## 6. Verify Build

- [x] 6.1 Run `pnpm build` (tsc + vite) and fix any type errors
- [x] 6.2 Run `pnpm lint` and fix any lint issues
- [x] 6.3 Start `pnpm dev` and verify document list → create/edit → save/submit flow works correctly
