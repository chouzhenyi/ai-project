## ADDED Requirements

### Requirement: Document form page with tabbed sections

The system SHALL provide a document form page at `/document/form/:id?` with 7 tabbed sections for comprehensive document data entry.

#### Scenario: New document form

- **WHEN** user navigates to `/document/form` (no id parameter)
- **THEN** system displays empty form with 7 tabs: 基本信息, 发票信息, 配件信息, 设备信息, 供应商信息, 附件信息, 关联单据信息

#### Scenario: Edit document form

- **WHEN** user navigates to `/document/form/123` (with id parameter)
- **THEN** system loads document data and pre-fills all form fields across all tabs

#### Scenario: Basic info tab

- **WHEN** user views the 基本信息 tab
- **THEN** system displays fields: 单据编号, 单据名称, 单据类型, 单据日期, 金额, 币种, 经办人, 部门, 备注, 状态

#### Scenario: Invoice info tab

- **WHEN** user views the 发票信息 tab
- **THEN** system displays fields: 发票类型, 发票号码, 开票日期, 发票金额, 税率, 税额, 不含税金额, 开票方, 发票备注

#### Scenario: Parts info tab

- **WHEN** user views the 配件信息 tab
- **THEN** system displays a sub-table for adding/editing/deleting multiple parts, with fields: 配件名称, 规格型号, 单位, 数量, 单价, 金额

#### Scenario: Equipment info tab

- **WHEN** user views the 设备信息 tab
- **THEN** system displays form fields: 设备名称, 设备类型, 规格型号, 序列号, 数量, 单价, 金额, 设备状态

#### Scenario: Supplier info tab

- **WHEN** user views the 供应商信息 tab
- **THEN** system displays fields: 供应商名称, 联系人, 联系电话, 联系地址, 开户银行, 银行账号, 税号

#### Scenario: Attachment info tab

- **WHEN** user views the 附件信息 tab
- **THEN** system displays a file upload component supporting multiple file attachments with file name and upload date

#### Scenario: Related documents tab

- **WHEN** user views the 关联单据信息 tab
- **THEN** system displays a table listing related documents with fields: 关联单据编号, 关联单据类型, 关联单据名称, 关联日期, 关联人

### Requirement: Form validation

The system SHALL validate required fields before submission.

#### Scenario: Submit with missing required fields

- **WHEN** user clicks submit with empty required fields
- **THEN** system highlights the first tab containing errors and shows validation error messages on each invalid field

#### Scenario: Successful submission

- **WHEN** user fills all required fields and clicks submit
- **THEN** system saves the document and navigates back to the document list with a success message

### Requirement: Form mode distinction

The system SHALL distinguish between create and edit mode based on the route parameter `:id`.

#### Scenario: Create mode

- **WHEN** route has no `:id` parameter
- **THEN** form title displays "新建单据", all fields are empty, and submit creates a new document

#### Scenario: Edit mode

- **WHEN** route has an `:id` parameter
- **THEN** form title displays "编辑单据", all fields are pre-filled with existing data, and submit updates the document
