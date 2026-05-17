## ADDED Requirements

### Requirement: Document routes registration

The system SHALL register `/document` and `/document/form/:id?` routes with lazy-loaded page components.

#### Scenario: Document list route

- **WHEN** user navigates to `/document`
- **THEN** system lazily loads and renders the document list page component

#### Scenario: Document form route

- **WHEN** user navigates to `/document/form` or `/document/form/123`
- **THEN** system lazily loads and renders the document form page component with the `:id` parameter (if present)

### Requirement: Sidebar menu integration

The system SHALL add a "单据管理" menu item in the sidebar that highlights when on document pages.

#### Scenario: Menu item appears

- **WHEN** user views any page
- **THEN** sidebar displays "单据管理" menu item

#### Scenario: Active state for document list

- **WHEN** user is on `/document`
- **THEN** the "单据管理" menu item is highlighted

#### Scenario: Active state for document form

- **WHEN** user is on `/document/form` or `/document/form/:id`
- **THEN** the "单据管理" menu item is highlighted
