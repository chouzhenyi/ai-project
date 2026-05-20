## ADDED Requirements

### Requirement: Document form top action bar

The system SHALL display a top action bar at the top of the document form page with 5 buttons: 保存, 提交审批, 创建报账单, 创建付款单, 废弃.

#### Scenario: Action bar display

- **WHEN** user views the document form page (create or edit mode)
- **THEN** system displays an action bar at the top of the page with buttons: 保存, 提交审批, 创建报账单, 创建付款单, 废弃

#### Scenario: Save document

- **WHEN** user clicks the 保存 button
- **THEN** system validates all required fields, saves the current document data (create mode adds a new record, edit mode updates the existing record), and shows a success message without changing the document status

#### Scenario: Submit for approval

- **WHEN** user clicks the 提交审批 button
- **THEN** system validates all required fields, saves the document, sets the document status to "已提交审批", and shows a success message

#### Scenario: Create reimbursement

- **WHEN** user clicks the 创建报账单 button
- **THEN** system shows a message indicating that a reimbursement will be created based on this document (Demo mode: shows a tip/notification only, no actual downstream record created)

#### Scenario: Create payment

- **WHEN** user clicks the 创建付款单 button
- **THEN** system shows a message indicating that a payment will be created based on this document (Demo mode: shows a tip/notification only, no actual downstream record created)

#### Scenario: Discard document

- **WHEN** user clicks the 废弃 button and confirms the discard confirmation dialog
- **THEN** system sets the document status to "已废弃" and shows a success message

### Requirement: Document form page with vertically stacked sections

The system SHALL provide a document form page at `/document/form/:id?` with a top action bar and 7 vertically stacked sections below it for comprehensive document data entry. The basic info section uses an EasyForm for direct field entry; the remaining 6 sections use an EasyTable + Drawer pattern — each section displays a table of records with an operation column (edit/delete) and a top buttonGroup (new), with a shared Drawer containing an EasyForm for creating/editing records. All sections are arranged from top to bottom below the action bar, each separated by a Card component with a section title.

#### Scenario: New document form

- **WHEN** user navigates to `/document/form` (no id parameter)
- **THEN** system displays a page with a top action bar and below it 7 vertically stacked sections: 基本信息, 发票信息, 配件信息, 设备信息, 供应商信息, 附件信息, 关联单据信息

#### Scenario: Edit document form

- **WHEN** user navigates to `/document/form/123` (with id parameter)
- **THEN** system loads document data and pre-fills the basic info form and all table data across all sections

#### Scenario: Basic info section

- **WHEN** user views the 基本信息 section
- **THEN** system displays a single EasyForm with fields: 单据编号, 单据名称, 单据类型, 单据日期, 金额, 币种, 经办人, 部门, 备注, 状态

#### Scenario: Invoice info section — table view

- **WHEN** user views the 发票信息 section
- **THEN** system displays an EasyTable listing invoice records with columns: 发票类型, 发票号码, 开票日期, 发票金额, 税率, 税额, 不含税金额, 开票方, 发票备注, and a right-side operation column with 编辑 and 删除 buttons
- **AND** above the table, a buttonGroup with a 新建 button is displayed

#### Scenario: Invoice info section — drawer for new/edit

- **WHEN** user clicks 新建 or 编辑 on the 发票信息 section
- **THEN** system opens a Drawer containing an EasyForm with fields: 发票类型, 发票号码, 开票日期, 发票金额, 税率, 税额, 不含税金额, 开票方, 发票备注
- **AND** 新建 mode shows empty fields; 编辑 mode pre-fills fields with the selected row data
- **WHEN** user submits the Drawer form
- **THEN** system closes the Drawer, 新建 adds a new row to the table, 编辑 updates the existing row

#### Scenario: Parts info section — table view

- **WHEN** user views the 配件信息 section
- **THEN** system displays an EasyTable listing part records with columns: 配件名称, 规格型号, 单位, 数量, 单价, 金额, and a right-side operation column with 编辑 and 删除 buttons
- **AND** above the table, a buttonGroup with a 新建 button is displayed

#### Scenario: Parts info section — drawer for new/edit

- **WHEN** user clicks 新建 or 编辑 on the 配件信息 section
- **THEN** system opens a Drawer containing an EasyForm with fields: 配件名称, 规格型号, 单位, 数量, 单价, 金额
- **AND** 新建 mode shows empty fields; 编辑 mode pre-fills fields with the selected row data
- **WHEN** user submits the Drawer form
- **THEN** system closes the Drawer, 新建 adds a new row to the table, 编辑 updates the existing row

#### Scenario: Equipment info section — table view

- **WHEN** user views the 设备信息 section
- **THEN** system displays an EasyTable listing equipment records with columns: 设备名称, 设备类型, 规格型号, 序列号, 数量, 单价, 金额, 设备状态, and a right-side operation column with 编辑 and 删除 buttons
- **AND** above the table, a buttonGroup with a 新建 button is displayed

#### Scenario: Equipment info section — drawer for new/edit

- **WHEN** user clicks 新建 or 编辑 on the 设备信息 section
- **THEN** system opens a Drawer containing an EasyForm with fields: 设备名称, 设备类型, 规格型号, 序列号, 数量, 单价, 金额, 设备状态
- **AND** 新建 mode shows empty fields; 编辑 mode pre-fills fields with the selected row data
- **WHEN** user submits the Drawer form
- **THEN** system closes the Drawer, 新建 adds a new row to the table, 编辑 updates the existing row

#### Scenario: Supplier info section — table view

- **WHEN** user views the 供应商信息 section
- **THEN** system displays an EasyTable listing supplier records with columns: 供应商名称, 联系人, 联系电话, 联系地址, 开户银行, 银行账号, 税号, and a right-side operation column with 编辑 and 删除 buttons
- **AND** above the table, a buttonGroup with a 新建 button is displayed

#### Scenario: Supplier info section — drawer for new/edit

- **WHEN** user clicks 新建 or 编辑 on the 供应商信息 section
- **THEN** system opens a Drawer containing an EasyForm with fields: 供应商名称, 联系人, 联系电话, 联系地址, 开户银行, 银行账号, 税号
- **AND** 新建 mode shows empty fields; 编辑 mode pre-fills fields with the selected row data
- **WHEN** user submits the Drawer form
- **THEN** system closes the Drawer, 新建 adds a new row to the table, 编辑 updates the existing row

#### Scenario: Attachment info section — table view

- **WHEN** user views the 附件信息 section
- **THEN** system displays an EasyTable listing attachment records with columns: 附件名称, 附件大小, 上传日期, and a right-side operation column with 编辑 and 删除 buttons
- **AND** above the table, a buttonGroup with a 新建 button is displayed

#### Scenario: Attachment info section — drawer for new/edit

- **WHEN** user clicks 新建 or 编辑 on the 附件信息 section
- **THEN** system opens a Drawer containing an EasyForm with a Upload component for file selection and fields: 附件名称, 附件备注
- **AND** 新建 mode shows empty fields; 编辑 mode pre-fills fields with the selected row data
- **WHEN** user submits the Drawer form
- **THEN** system closes the Drawer, 新建 adds a new row to the table, 编辑 updates the existing row

#### Scenario: Related documents section — table view

- **WHEN** user views the 关联单据信息 section
- **THEN** system displays an EasyTable listing related document records with columns: 关联单据编号, 关联单据类型, 关联单据名称, 关联日期, 关联人, and a right-side operation column with 编辑 and 删除 buttons
- **AND** above the table, a buttonGroup with a 新建 button is displayed

#### Scenario: Related documents section — drawer for new/edit

- **WHEN** user clicks 新建 or 编辑 on the 关联单据信息 section
- **THEN** system opens a Drawer containing an EasyForm with fields: 关联单据编号, 关联单据类型, 关联单据名称, 关联日期, 关联人
- **AND** 新建 mode shows empty fields; 编辑 mode pre-fills fields with the selected row data
- **WHEN** user submits the Drawer form
- **THEN** system closes the Drawer, 新建 adds a new row to the table, 编辑 updates the existing row

### Requirement: Form validation

The system SHALL validate required fields before submission.

#### Scenario: Submit with missing required fields

- **WHEN** user clicks submit with empty required fields
- **THEN** system highlights the first section containing errors and shows validation error messages on each invalid field

#### Scenario: Successful submission

- **WHEN** user fills all required fields and clicks submit
- **THEN** system saves the document and navigates back to the document list with a success message

### Requirement: Form mode distinction

The system SHALL distinguish between create and edit mode based on the route parameter `:id`.

#### Scenario: Create mode

- **WHEN** route has no `:id` parameter
- **THEN** form title displays "新建单据", basic info form fields are empty, and submit creates a new document

#### Scenario: Edit mode

- **WHEN** route has an `:id` parameter
- **THEN** form title displays "编辑单据", basic info form fields and all table data are pre-filled with existing data, and submit updates the document

### Requirement: Drawer interaction pattern

The system SHALL use a shared Drawer component for creating and editing records in the table-based sections.

#### Scenario: Open drawer for new record

- **WHEN** user clicks the 新建 button in a table section's buttonGroup
- **THEN** system opens a Drawer with an empty EasyForm for that section's fields

#### Scenario: Open drawer for edit record

- **WHEN** user clicks the 编辑 button in a table row's operation column
- **THEN** system opens a Drawer with an EasyForm pre-filled with that row's data

#### Scenario: Submit drawer form for new record

- **WHEN** user fills the Drawer form and clicks submit (新建 mode)
- **THEN** system adds a new row to the table, closes the Drawer, and shows a success message

#### Scenario: Submit drawer form for edit record

- **WHEN** user modifies the Drawer form and clicks submit (编辑 mode)
- **THEN** system updates the corresponding row in the table, closes the Drawer, and shows a success message

#### Scenario: Delete table row

- **WHEN** user clicks the 删除 button in a table row's operation column and confirms the deletion
- **THEN** system removes the row from the table and shows a success message
