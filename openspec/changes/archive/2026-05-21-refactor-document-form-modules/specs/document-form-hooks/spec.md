## ADDED Requirements

### Requirement: useDocumentForm hook manages all document form state

The system SHALL provide a `useDocumentForm` custom hook at `src/views/document/hooks/useDocumentForm.ts` that centralizes all state and business logic for the document form page.

#### Scenario: Hook initializes module data from editDoc

- **GIVEN** the `useDocumentForm` hook
- **WHEN** called with `isEdit: true` and a valid `editDoc`
- **THEN** it SHALL initialize `moduleData` from `editDoc` fields: invoices → invoice, parts → parts, equipment → equipment, suppliers → supplier, attachments → attachment, relatedDocs → relatedDoc
- **WHEN** called with `isEdit: false` and `editDoc: undefined`
- **THEN** it SHALL initialize all module arrays as empty `[]`

#### Scenario: Hook exposes module CRUD operations

- **GIVEN** the `useDocumentForm` hook
- **WHEN** `handleDrawerSubmit` is called in create mode
- **THEN** the new item (with auto-generated `id`) SHALL be appended to the corresponding module array
- **WHEN** `handleDrawerSubmit` is called in edit mode
- **THEN** the matching item (by `id`) SHALL be updated with new values in the corresponding module array
- **WHEN** `handleModuleDelete` is called with a module key and row id
- **THEN** the row SHALL be removed from that module's array

#### Scenario: Hook manages drawer state

- **GIVEN** the `useDocumentForm` hook
- **WHEN** `openDrawer(moduleKey, "create")` is called
- **THEN** `drawerOpen` SHALL become `true`, `drawerModule` SHALL be set to `moduleKey`, `drawerMode` SHALL be `"create"`, `drawerEditRow` SHALL be `null`
- **WHEN** `closeDrawer()` is called
- **THEN** `drawerOpen` SHALL become `false`, `drawerModule` SHALL be reset to `""`, `drawerEditRow` SHALL be `null`

#### Scenario: Hook provides data collection function

- **GIVEN** the `useDocumentForm` hook
- **WHEN** `collectAllData()` is called
- **THEN** it SHALL validate the basic form ref and return `null` if invalid
- **THEN** it SHALL return a `Partial<DocumentData>` with all basic fields and module arrays mapped to the correct store property names (invoices/invoice, parts/parts, equipment/equipment, suppliers/supplier, attachments/attachment, relatedDocs/relatedDoc)

#### Scenario: Hook provides save and submit handlers

- **GIVEN** the `useDocumentForm` hook
- **WHEN** `handleSave()` is called
- **THEN** it SHALL call `collectAllData()`, then call `updateDocument` or `addDocument` based on `isEdit`, then navigate to `/document`
- **WHEN** `handleSubmitApproval()` is called
- **THEN** it SHALL set `status` to `"submitted"` before saving, then navigate to `/document`

#### Scenario: Hook provides discard handler

- **GIVEN** the `useDocumentForm` hook
- **WHEN** `handleDiscard()` is called in edit mode
- **THEN** it SHALL call `updateDocument` with `{ status: "abandoned" }` and navigate to `/document`
- **WHEN** `handleDiscard()` is called in create mode
- **THEN** it SHALL show a warning "新建单据无法废弃，请先保存" and NOT navigate

### Requirement: Hook uses useCallback for all handlers

The system SHALL wrap all callback functions returned by the hook in `useCallback` with correct dependency arrays to prevent unnecessary re-renders.

#### Scenario: All callbacks are memoized

- **GIVEN** the `useDocumentForm` hook
- **WHEN** inspecting the returned object
- **THEN** `openDrawer`, `closeDrawer`, `handleDrawerSubmit`, `handleModuleDelete`, `collectAllData`, `handleSave`, `handleSubmitApproval`, `handleDiscard` SHALL all be created with `useCallback`

### Requirement: Hook exposes currentStatus tracking

The system SHALL expose `currentStatus` from the hook, derived from the basic form's status field.

#### Scenario: Hook tracks status changes

- **GIVEN** the `useDocumentForm` hook
- **WHEN** the basic form status field changes
- **THEN** `currentStatus` SHALL update to reflect the new status value
- **WHEN** initialized with an editDoc
- **THEN** `currentStatus` SHALL be set to `editDoc.status`
- **WHEN** initializing a new document
- **THEN** `currentStatus` SHALL default to `"draft"`
