# Connection Management System

## Overview

Hệ thống quản lý connection từ cơ bản đến nâng cao với các tính năng:

### Cơ bản
- Form tạo/sửa connection với validation
- Test connection real-time
- List connections với search/filter
- CRUD operations

### Nâng cao
- Connection templates
- Bulk operations (test, delete)
- Import/Export connections
- Advanced settings (SSL, timeouts, charset)
- Health monitoring

## Components

### 1. ConnectionForm.vue
**Features:**
- Form validation với real-time feedback
- Test connection với loading states
- Advanced settings (collapsible)
- Password visibility toggle
- Environment selection

**Props:**
- `connection?: DatabaseConnection` - Existing connection for edit mode

**Events:**
- `save: [connection: Omit<DatabaseConnection, 'id'>]`
- `cancel: []`

### 2. ConnectionList.vue
**Features:**
- Search và filter (environment, status)
- Bulk selection với actions
- Pagination
- Export/Import
- Status indicators
- Last tested timestamps

**Props:**
- `connections: DatabaseConnection[]`

**Events:**
- `add: []`
- `edit: [connection: DatabaseConnection]`
- `delete: [id: string]`
- `test: [id: string]`
- `bulkDelete: [ids: string[]]`
- `bulkTest: [ids: string[]]`
- `export: []`
- `import: []`

### 3. ConnectionTemplate.vue
**Features:**
- Save current form as template
- Load templates into form
- Template management (delete)
- Password inclusion option
- Template metadata

**Props:**
- `form: any` - Current form data
- `isFormValid: boolean`

**Events:**
- `loadTemplate: [template: ConnectionTemplate]`

## Data Structure

### DatabaseConnection
```typescript
interface DatabaseConnection {
  id: string
  name: string
  host: string
  port: number
  database: string
  username: string
  password?: string
  environment: 'DEV' | 'STAGE' | 'PROD'
  status: 'connected' | 'testing' | 'failed'
  lastTested?: Date
}
```

### ConnectionTemplate
```typescript
interface ConnectionTemplate {
  id: string
  name: string
  description?: string
  host: string
  port: number
  database: string
  username: string
  password?: string
  environment: string
  useSSL: boolean
  allowSelfSigned: boolean
  charset: string
  timezone: string
  timeout: number
  createdAt: Date
}
```

## Features

### Form Validation
- Required fields validation
- Port range validation (1-65535)
- Real-time error display
- Form state management

### Test Connection
- Async connection testing
- Loading states
- Success/Error feedback
- Individual và bulk testing

### Search & Filter
- Text search across name, host, database, username
- Environment filter (DEV/STAGE/PROD)
- Status filter (connected/testing/failed)
- Real-time filtering

### Bulk Operations
- Select all/none
- Bulk test connections
- Bulk delete with confirmation
- Progress indicators

### Templates
- Save current form as template
- Load templates into form
- Template metadata (name, description, created date)
- Password inclusion option
- Template management

### Advanced Settings
- SSL configuration
- Self-signed certificates
- Character set selection
- Timezone configuration
- Connection timeout

## Usage Examples

### Basic Connection Creation
```vue
<ConnectionForm @save="handleSave" @cancel="handleCancel" />
```

### Connection List with Actions
```vue
<ConnectionList 
  :connections="connections"
  @add="showAddForm"
  @edit="editConnection"
  @delete="deleteConnection"
  @test="testConnection"
  @bulkDelete="bulkDelete"
  @bulkTest="bulkTest"
/>
```

### Template Management
```vue
<ConnectionTemplate 
  :form="form"
  :is-form-valid="isFormValid"
  @load-template="loadTemplate"
/>
```

## Storage

### LocalStorage Keys
- `connection-templates` - Connection templates
- `andb-ui-settings` - App settings (theme, language)

### Data Persistence
- Templates saved to localStorage
- Settings persisted across sessions
- Connection data managed by Pinia store

## Future Enhancements

### Advanced Features
- Connection pooling configuration
- Health monitoring dashboard
- Connection performance metrics
- Automated connection testing
- Connection backup/restore

### Integration
- Database schema detection
- Connection string parsing
- Multiple database type support
- Cloud database integration

### Security
- Encrypted password storage
- Connection credential management
- Access control và permissions
- Audit logging

### UI/UX
- Drag & drop connection reordering
- Connection grouping
- Quick connection switching
- Keyboard shortcuts
- Connection status notifications
