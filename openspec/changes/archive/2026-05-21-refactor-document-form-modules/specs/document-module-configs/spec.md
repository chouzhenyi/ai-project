## ADDED Requirements

### Requirement: Module config files exist per business module

The system SHALL place each business module's `FormSchema[]` and `ColumnSchema[]` definitions in a separate file under `src/views/document/config/`.

#### Scenario: Basic Info config file

- **GIVEN** the `config/` directory
- **WHEN** inspecting `config/basicInfo.ts`
- **THEN** it SHALL export `BASIC_INFO_SCHEMA` as `FormSchema[]` with fields: code, name, type, date, amount, currency, handler, department, remark, status
- **THEN** it SHALL NOT export any `ColumnSchema` (basic info has no sub-table)

#### Scenario: Invoice config file

- **WHEN** inspecting `config/invoice.ts`
- **THEN** it SHALL export `INVOICE_SCHEMA` as `FormSchema[]` with fields: invoiceType, invoiceNo, invoiceDate, invoiceAmount, taxRate, taxAmount, noTaxAmount, invoiceParty, invoiceRemark
- **THEN** it SHALL export `INVOICE_COLUMNS` as `ColumnSchema[]` with matching visible columns

#### Scenario: Parts config file

- **WHEN** inspecting `config/parts.ts`
- **THEN** it SHALL export `PARTS_SCHEMA` and `PARTS_COLUMNS`

#### Scenario: Equipment config file

- **WHEN** inspecting `config/equipment.ts`
- **THEN** it SHALL export `EQUIPMENT_SCHEMA` and `EQUIPMENT_COLUMNS`

#### Scenario: Supplier config file

- **WHEN** inspecting `config/supplier.ts`
- **THEN** it SHALL export `SUPPLIER_SCHEMA` and `SUPPLIER_COLUMNS`

#### Scenario: Attachment config file

- **WHEN** inspecting `config/attachment.ts`
- **THEN** it SHALL export `ATTACHMENT_SCHEMA` and `ATTACHMENT_COLUMNS`

#### Scenario: RelatedDoc config file

- **WHEN** inspecting `config/relatedDoc.ts`
- **THEN** it SHALL export `RELATED_DOC_SCHEMA` and `RELATED_DOC_COLUMNS`

### Requirement: MODULE_CONFIG registry aggregates all modules

The system SHALL provide a `config/index.ts` that imports all module configs and exports a unified `MODULE_CONFIG` record and the `ModuleConfig` interface.

#### Scenario: Registry exports MODULE_CONFIG

- **GIVEN** `config/index.ts`
- **WHEN** importing `MODULE_CONFIG`
- **THEN** it SHALL contain exactly 6 module entries: invoice, parts, equipment, supplier, attachment, relatedDoc
- **THEN** each entry SHALL have shape `{ label: string; schema: FormSchema[]; columns: ColumnSchema[] }`

#### Scenario: ModuleConfig type is exported

- **GIVEN** `config/index.ts`
- **WHEN** importing the `ModuleConfig` type
- **THEN** it SHALL match the interface `{ label: string; schema: FormSchema[]; columns: ColumnSchema[] }`

### Requirement: Config column formatters keep display consistency

Each module's column definitions SHALL preserve the original format functions that reference store constants.

#### Scenario: Invoice columns format function

- **GIVEN** `config/invoice.ts`
- **WHEN** rendering `invoiceType` column
- **THEN** it SHALL use `INVOICE_TYPE_MAP` from store.ts for display mapping
- **WHEN** rendering `invoiceAmount`, `taxAmount`, `noTaxAmount`
- **THEN** they SHALL format as `¥ ${Number(value).toLocaleString()}`

#### Scenario: Equipment columns format function

- **GIVEN** `config/equipment.ts`
- **WHEN** rendering `equipStatus` column
- **THEN** it SHALL use `EQUIP_STATUS_MAP` from store.ts for display mapping

#### Scenario: RelatedDoc columns format function

- **GIVEN** `config/relatedDoc.ts`
- **WHEN** rendering `relatedType` column
- **THEN** it SHALL use `RELATED_TYPE_MAP` from store.ts for display mapping
