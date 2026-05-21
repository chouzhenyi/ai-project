## ADDED Requirements

### Requirement: ActionBar renders top action buttons

The system SHALL provide an `ActionBar` component at `src/views/document/components/ActionBar.tsx` that renders the document-level action buttons.

#### Scenario: ActionBar renders all buttons

- **GIVEN** the `ActionBar` component
- **WHEN** rendering with `isEdit: true`
- **THEN** it SHALL display "保存", "提交审批", "创建报账单", "创建付款单", "废弃" buttons in a horizontal Space
- **WHEN** rendering with `isEdit: false`
- **THEN** it SHALL display all buttons except "废弃" is disabled with a tooltip "新建单据无法废弃，请先保存"

#### Scenario: ActionBar calls correct handlers

- **GIVEN** the `ActionBar` component
- **WHEN** user clicks "保存"
- **THEN** it SHALL invoke the `onSave` prop
- **WHEN** user clicks "提交审批"
- **THEN** it SHALL invoke the `onSubmitApproval` prop
- **WHEN** user clicks "废弃"
- **THEN** it SHALL show a Popconfirm with text "确定废弃此单据吗？废弃后不可恢复。" before invoking the `onDiscard` prop

#### Scenario: ActionBar accepts proper props

- **GIVEN** the `ActionBar` component
- **WHEN** typing its props interface
- **THEN** it SHALL accept `onSave: () => void`, `onSubmitApproval: () => void`, `onDiscard: () => void`, `isEdit: boolean`

### Requirement: BasicInfoSection renders basic info form

The system SHALL provide a `BasicInfoSection` component at `src/views/document/components/BasicInfoSection.tsx` that renders the basic information Card with an embedded EasyForm.

#### Scenario: BasicInfoSection renders Card with EasyForm

- **GIVEN** the `BasicInfoSection` component
- **WHEN** rendering
- **THEN** it SHALL render a `Card` with title "基本信息"
- **THEN** it SHALL render an `EasyForm` inside with `BASIC_INFO_SCHEMA`, 3 columns, no action buttons

#### Scenario: BasicInfoSection passes initialValues

- **GIVEN** the `BasicInfoSection` component
- **WHEN** `initialValues` prop is provided
- **THEN** the EasyForm SHALL receive those values as `initialValues`
- **WHEN** no `initialValues` are provided
- **THEN** it SHALL default to `{ status: "draft", currency: "CNY" }`

#### Scenario: BasicInfoSection delegates onChange

- **GIVEN** the `BasicInfoSection` component
- **WHEN** the EasyForm triggers `onChange`
- **THEN** it SHALL invoke the `onChange` prop with the form values

#### Scenario: BasicInfoSection accepts proper props

- **GIVEN** the `BasicInfoSection` component
- **WHEN** typing its props interface
- **THEN** it SHALL accept `formRef: RefObject<FormInstance>`, `initialValues?: Record<string, unknown>`, `onChange?: (values: Record<string, unknown>) => void`

### Requirement: ModuleSection renders a reusable module table

The system SHALL provide a `ModuleSection` component at `src/views/document/components/ModuleSection.tsx` that renders a Card containing an EasyTable for a business sub-module.

#### Scenario: ModuleSection renders Card with EasyTable

- **GIVEN** the `ModuleSection` component
- **WHEN** rendering with `config` prop
- **THEN** it SHALL render a `Card` with title from `config.label`
- **THEN** it SHALL render an `EasyTable` with columns from `config.columns` and data from `dataSource` prop

#### Scenario: ModuleSection shows add button

- **GIVEN** the `ModuleSection` component
- **WHEN** user clicks "新建" button
- **THEN** it SHALL invoke the `onAdd` prop

#### Scenario: ModuleSection shows row actions

- **GIVEN** the `ModuleSection` component
- **WHEN** rendering table rows
- **THEN** each row SHALL show "编辑" and "删除" action buttons
- **WHEN** user clicks "编辑"
- **THEN** it SHALL invoke the `onEdit` prop with the row record
- **WHEN** user clicks "删除"
- **THEN** it SHALL show a confirm dialog before invoking the `onDelete` prop with the row id

#### Scenario: ModuleSection limits table height

- **GIVEN** the `ModuleSection` component
- **WHEN** rendering
- **THEN** the EasyTable SHALL have `maxBodyHeight: 300`

#### Scenario: ModuleSection accepts proper props

- **GIVEN** the `ModuleSection` component
- **WHEN** typing its props interface
- **THEN** it SHALL accept `config: ModuleConfig`, `dataSource: Record<string, unknown>[]`, `onAdd: () => void`, `onEdit: (record: Record<string, unknown>) => void`, `onDelete: (id: unknown) => void`

### Requirement: ModuleDrawer renders a reusable drawer form

The system SHALL provide a `ModuleDrawer` component at `src/views/document/components/ModuleDrawer.tsx` that renders a Drawer with an embedded EasyForm for creating/editing sub-module items.

#### Scenario: ModuleDrawer shows drawer with form

- **GIVEN** the `ModuleDrawer` component
- **WHEN** `open` is `true`
- **THEN** it SHALL render an open `Drawer` with width 600 and `destroyOnClose`
- **THEN** the Drawer title SHALL be "新建{模块名}" in create mode or "编辑{模块名}" in edit mode
- **THEN** it SHALL render an `EasyForm` inside with 2 columns, schema from `config.schema`

#### Scenario: ModuleDrawer pre-fills edit values

- **GIVEN** the `ModuleDrawer` component
- **WHEN** in edit mode with an `editRow` prop
- **THEN** the EasyForm SHALL receive `editRow` as `initialValues`

#### Scenario: ModuleDrawer submits form

- **GIVEN** the `ModuleDrawer` component
- **WHEN** user clicks "确定"
- **THEN** it SHALL validate the form and invoke the `onSubmit` prop with the form values
- **WHEN** user clicks "取消"
- **THEN** it SHALL invoke the `onClose` prop

#### Scenario: ModuleDrawer accepts proper props

- **GIVEN** the `ModuleDrawer` component
- **WHEN** typing its props interface
- **THEN** it SHALL accept `open: boolean`, `config: ModuleConfig | null`, `mode: 'create' | 'edit'`, `editRow: Record<string, unknown> | null`, `onSubmit: (values: Record<string, unknown>) => void`, `onClose: () => void`
