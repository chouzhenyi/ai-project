## ADDED Requirements

### Requirement: Document list page with search

The system SHALL provide a document list page at `/document` that displays documents in a paginated table with search and filter capabilities.

#### Scenario: User views document list

- **WHEN** user navigates to `/document`
- **THEN** system displays a paginated table showing document records with columns: 单据编号, 单据名称, 供应商, 单据类型, 金额, 状态, 创建时间

#### Scenario: User searches documents

- **WHEN** user enters search criteria (单据编号/名称) in the search bar and clicks search
- **THEN** system filters and displays matching documents in the table

#### Scenario: User navigates to create page

- **WHEN** user clicks "新建单据" button
- **THEN** system navigates to `/document/form` with empty form

#### Scenario: User navigates to edit page

- **WHEN** user clicks "编辑" action on a document row
- **THEN** system navigates to `/document/form/:id` with the document data pre-filled

#### Scenario: User deletes a document

- **WHEN** user clicks "删除" action and confirms
- **THEN** system removes the document and refreshes the list

### Requirement: Document list states

The system SHALL handle loading, empty, and error states on the document list page.

#### Scenario: Loading state

- **WHEN** the page is fetching documents
- **THEN** the table shows a loading indicator

#### Scenario: Empty state

- **WHEN** no documents match the current filters
- **THEN** the table displays an empty placeholder message
