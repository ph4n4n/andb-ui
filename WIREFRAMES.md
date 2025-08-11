# andb-ui Wireframe Mockups

## 🎨 Design System Overview
- **Color Scheme**: Dark theme with blue accents
- **Typography**: Clean, modern sans-serif
- **Icons**: Lucide icons for consistency
- **Layout**: Auto-hide sidebar + Header + Resizable dual-pane main content
- **Responsive**: Collapsible sidebar with toggle button

---

## 📱 Main Layout Structure

### Expanded Sidebar View
```
┌─────────────────────────────────────────────────────────────┐
│ [☰] Header: Connection Pair + Quick Actions                │
├─────────────┬───────────────────────────────────────────────┤
│             │                                               │
│ Sidebar     │                                               │
│ Navigation  │                                               │
│             │                                               │
│ • Dashboard │                                               │
│ • Export    │                                               │
│ • Compare   │                                               │
│ • Migrate   │                                               │
│ • Scripts   │                                               │
│ • Settings  │                                               │
│             │                                               │
│ [Connections]│                                               │
│ • DEV1      │                                               │
│ • DEV2      │                                               │
│ • STAGE     │                                               │
│ • PROD      │                                               │
│             │                                               │
│ [Add New]   │                                               │
└─────────────┴───────────────────────────────────────────────┘
```

### Collapsed Sidebar View
```
┌─────────────────────────────────────────────────────────────┐
│ [☰] Header: Connection Pair + Quick Actions                │
├─┬───────────────────────────────────────────────────────────┤
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
│ │                                                           │
└─┴───────────────────────────────────────────────────────────┘
```

---

## 🏠 Dashboard/Home Screen

```
┌─────────────────────────────────────────────────────────────┐
│ [☰] [DEV1] ↔ [STAGE] | Test Connections | Refresh | Settings│
├─┬───────────────────────────────────────────────────────────┤
│ │ ┌─ Dashboard Overview ─────────────────────────────────┐ │
│ │ │                                                       │ │
│ │ │ Connection Pairs:                                     │ │
│ │ │ ┌─────────┬─────────┬─────────────────┐               │ │
│ │ │ │ Source  │ Target  │ Status          │               │ │
│ │ │ ├─────────┼─────────┼─────────────────┤               │ │
│ │ │ │ DEV1    │ STAGE   │ ✅ Connected    │               │ │
│ │ │ │ DEV2    │ PROD    │ ⚠️ Testing      │               │ │
│ │ │ │ STAGE   │ PROD    │ ❌ Failed       │               │ │
│ │ │ └─────────┴─────────┴─────────────────┘               │ │
│ │ │                                                       │ │
│ │ │ Recent Operations:                                    │ │
│ │ │ • Export tables from DEV1 (2 min ago)                │ │
│ │ │ • Compare DEV1 ↔ STAGE (5 min ago)                   │ │
│ │ │ • Migration STAGE → PROD (1 hour ago)                │ │
│ │ │                                                       │ │
│ │ └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Connection Manager Screen

```
┌─────────────────────────────────────────────────────────────┐
│ [☰] Connection Manager | [Add New Connection]               │
├─┬───────────────────────────────────────────────────────────┤
│ │ ┌─ Database Connections ─────────────────────────────────┐ │
│ │ │                                                         │ │
│ │ │ ┌─ DEV1 (Development) ───────────────────────────────┐ │ │
│ │ │ │ Host: localhost:3306                              │ │ │
│ │ │ │ Database: dev_db                                  │ │ │
│ │ │ │ User: dev_user                                    │ │ │
│ │ │ │ Status: ✅ Connected                              │ │ │
│ │ │ │ [Edit] [Test] [Delete]                            │ │ │
│ │ │ └───────────────────────────────────────────────────┘ │ │
│ │ │                                                         │ │
│ │ │ ┌─ DEV2 (Development) ───────────────────────────────┐ │ │
│ │ │ │ Host: dev2-server:3306                            │ │ │
│ │ │ │ Database: dev2_db                                 │ │ │
│ │ │ │ User: dev2_user                                   │ │ │
│ │ │ │ Status: ✅ Connected                              │ │ │
│ │ │ │ [Edit] [Test] [Delete]                            │ │ │
│ │ │ └───────────────────────────────────────────────────┘ │ │
│ │ │                                                         │ │
│ │ │ ┌─ STAGE (Staging) ──────────────────────────────────┐ │ │
│ │ │ │ Host: stage-server:3306                           │ │ │
│ │ │ │ Database: stage_db                                │ │ │
│ │ │ │ User: stage_user                                  │ │ │
│ │ │ │ Status: ⚠️ Testing                                │ │ │
│ │ │ │ [Edit] [Test] [Delete]                            │ │ │
│ │ │ └───────────────────────────────────────────────────┘ │ │
│ │ │                                                         │ │
│ │ │ ┌─ PROD (Production) ────────────────────────────────┐ │ │
│ │ │ │ Host: prod-server:3306                            │ │ │
│ │ │ │ Database: prod_db                                 │ │ │
│ │ │ │ User: prod_user                                   │ │ │
│ │ │ │ Status: ❌ Failed                                 │ │ │
│ │ │ │ [Edit] [Test] [Delete]                            │ │ │
│ │ │ └───────────────────────────────────────────────────┘ │ │
│ │ └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Export View Screen (Dual-Pane Preview)

```
┌─────────────────────────────────────────────────────────────┐
│ [☰] Export from: [DEV1] | [Export All] | [Refresh]         │
├─┬───────────────────────────────────────────────────────────┤
│ │ ┌─ Database Objects ─┐ [⋮⋮] ┌─ Preview ──────────────┐   │
│ │ │                    │      │                         │   │
│ │ │ ┌─ Tables ───────┐ │      │┌─ users.sql ──────────┐│   │
│ │ │ │ [✓] users      │ │      ││ CREATE TABLE users ( ││   │
│ │ │ │ [✓] products   │ │      ││   id INT PRIMARY KEY,││   │
│ │ │ │ [✓] orders     │ │      ││   name VARCHAR(255), ││   │
│ │ │ │ [✓] categories │ │      ││   email VARCHAR(255) ││   │
│ │ │ │ [ ] Select All │ │      ││ );                   ││   │
│ │ │ └────────────────┘ │      │└──────────────────────┘│   │
│ │ │                    │      │                         │   │
│ │ │ ┌─ Procedures ───┐ │      │┌─ get_user.sql ──────┐│   │
│ │ │ │ [✓] get_user   │ │      ││ DELIMITER //        ││   │
│ │ │ │ [✓] create_order│ │      ││ CREATE PROCEDURE   ││   │
│ │ │ │ [✓] update_prod│ │      ││   get_user(id INT)  ││   │
│ │ │ │ [ ] Select All │ │      ││ BEGIN               ││   │
│ │ │ └────────────────┘ │      ││   SELECT * FROM     ││   │
│ │ │                    │      ││   users WHERE id=id;││   │
│ │ │ ┌─ Functions ────┐ │      ││ END //              ││   │
│ │ │ │ [✓] calc_total │ │      │└──────────────────────┘│   │
│ │ │ │ [✓] format_date│ │      │                         │   │
│ │ │ │ [ ] Select All │ │      │                         │   │
│ │ │ └────────────────┘ │      │                         │   │
│ │ │                    │      │                         │   │
│ │ │ ┌─ Triggers ─────┐ │      │                         │   │
│ │ │ │ [✓] update_ts  │ │      │                         │   │
│ │ │ │ [✓] audit_log  │ │      │                         │   │
│ │ │ │ [ ] Select All │ │      │                         │   │
│ │ │ └────────────────┘ │      │                         │   │
│ │ └────────────────────┘      └─────────────────────────┘   │
│ │                                                           │
│ │ [Export Selected] [Export All] [Clear Selection]          │
│ └───────────────────────────────────────────────────────────┘
```

### Preview Features
- **Live preview**: Show selected object's SQL content
- **Syntax highlighting**: SQL syntax colors
- **File size**: Show estimated export size
- **Dependencies**: Highlight related objects

---

## 🔄 Compare View Screen (Resizable Dual-Pane)

```
┌─────────────────────────────────────────────────────────────┐
│ [☰] Compare: [DEV1] ↔ [STAGE] | [Compare All] | [Export Diff]│
├─┬───────────────────────────────────────────────────────────┤
│ │ ┌─ Source (DEV1) ─┐ [⋮⋮] ┌─ Destination (STAGE) ─┐      │
│ │ │                 │      │                         │      │
│ │ │ ┌─ Tables ─────┐│      │┌─ Tables ─────────────┐│      │
│ │ │ │ users ✅     ││      ││ users ✅             ││      │
│ │ │ │ products ⚠️  ││      ││ products ⚠️          ││      │
│ │ │ │ orders ✅    ││      ││ orders ❌            ││      │
│ │ │ │ categories ✅││      ││ categories ✅         ││      │
│ │ │ └─────────────┘│      │└──────────────────────┘│      │
│ │ │                 │      │                         │      │
│ │ │ ┌─ Procedures ─┐│      │┌─ Procedures ─────────┐│      │
│ │ │ │ get_user ✅  ││      ││ get_user ✅          ││      │
│ │ │ │ create_order ││      ││ create_order ⚠️      ││      │
│ │ │ │ update_prod ❌││      ││ update_prod ✅       ││      │
│ │ │ └─────────────┘│      │└──────────────────────┘│      │
│ │ │                 │      │                         │      │
│ │ │ ┌─ Functions ──┐│      │┌─ Functions ──────────┐│      │
│ │ │ │ calc_total ✅││      ││ calc_total ✅        ││      │
│ │ │ │ format_date ✅││      ││ format_date ❌       ││      │
│ │ │ └─────────────┘│      │└──────────────────────┘│      │
│ │ └─────────────────┘      └─────────────────────────┘      │
│ │                                                           │
│ │ Legend: ✅ Same | ⚠️ Different | ❌ Missing | 🔄 Loading  │
│ └───────────────────────────────────────────────────────────┘
```

### Resize Handle Interaction
- **Drag handle [⋮⋮]**: Resize source/destination panes
- **Auto-snap**: Snap to 50/50, 30/70, 70/30 ratios
- **Min width**: 200px per pane
- **Keyboard shortcuts**: Ctrl+Left/Right to adjust

---

## 🚀 Migration View Screen (Dual-Pane)

```
┌─────────────────────────────────────────────────────────────┐
│ [☰] Migrate: [STAGE] → [PROD] | [Create Migration] | [History]│
├─┬───────────────────────────────────────────────────────────┤
│ │ ┌─ Pending Changes ─┐ [⋮⋮] ┌─ Migration History ─────┐   │
│ │ │                   │      │                           │   │
│ │ │ [✓] Add table:    │      │ 2024-01-15 14:30:       │   │
│ │ │    audit_logs     │      │ DEV1 → STAGE             │   │
│ │ │ [✓] Modify proc:  │      │ - Added 3 tables         │   │
│ │ │    create_order   │      │ - Updated 2 procedures   │   │
│ │ │ [✓] Add function: │      │ Status: ✅ Completed     │   │
│ │ │    validate_email │      │                           │   │
│ │ │ [✓] Update trigger│      │ 2024-01-14 10:15:       │   │
│ │ │    update_timestamp│      │ STAGE → PROD             │   │
│ │ │                   │      │ - Added 1 function       │   │
│ │ │ [ ] Select All    │      │ Status: ✅ Completed     │   │
│ │ │ [Create Migration]│      │                           │   │
│ │ │                   │      │ 2024-01-13 16:45:       │   │
│ │ │                   │      │ DEV2 → STAGE             │   │
│ │ │                   │      │ - Modified 2 triggers    │   │
│ │ │                   │      │ Status: ⚠️ Partial       │   │
│ │ └───────────────────┘      └───────────────────────────┘   │
│ │                                                           │
│ │ [Create Migration] [Rollback Last] [View Details]         │
│ └───────────────────────────────────────────────────────────┘
```

---

## ⚙️ Settings Screen

```
┌─────────────────────────────────────────────────────────────┐
│ [☰] Settings | [Save] | [Reset to Default]                  │
├─┬───────────────────────────────────────────────────────────┤
│ │ ┌─ Application Settings ─────────────────────────────────┐ │
│ │ │                                                         │ │
│ │ │ ┌─ General ───────────────────────────────────────────┐ │ │
│ │ │ │ Theme: [Dark] [Light] [Auto]                        │ │ │
│ │ │ │ Language: [English] [Vietnamese]                    │ │ │
│ │ │ │ Auto-save: [✓] Enabled                              │ │ │
│ │ │ │ Notifications: [✓] Enabled                          │ │ │
│ │ │ └─────────────────────────────────────────────────────┘ │ │
│ │ │                                                         │ │
│ │ │ ┌─ andb-core Configuration ───────────────────────────┐ │ │
│ │ │ │ Default environments: [DEV,STAGE,PROD]              │ │ │
│ │ │ │ Export path: [./exports]                             │ │ │
│ │ │ │ Backup enabled: [✓] Yes                              │ │ │
│ │ │ │ Auto-compare: [ ] No                                 │ │ │
│ │ │ └─────────────────────────────────────────────────────┘ │ │
│ │ │                                                         │ │
│ │ │ ┌─ Connection Defaults ───────────────────────────────┐ │ │
│ │ │ │ Default port: [3306]                                │ │ │
│ │ │ │ Connection timeout: [30s]                           │ │ │
│ │ │ │ Auto-test connections: [✓] Yes                      │ │ │
│ │ │ │ Save passwords: [ ] No                              │ │ │
│ │ │ └─────────────────────────────────────────────────────┘ │ │
│ │ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key UI Patterns

### Connection Pair Selector
```
┌─ Source: [DEV1 ▼] ↔ Target: [STAGE ▼] ─┐
│                                         │
│ Available Connections:                  │
│ • DEV1 (localhost:3306)                │
│ • DEV2 (dev2-server:3306)              │
│ • STAGE (stage-server:3306)            │
│ • PROD (prod-server:3306)              │
│                                         │
│ [Test Connection Pair] [Apply]          │
└─────────────────────────────────────────┘
```

### Status Indicators
- ✅ **Connected**: Green checkmark
- ⚠️ **Testing**: Yellow spinner
- ❌ **Failed**: Red X
- 🔄 **Loading**: Blue spinner

### Action Buttons
- **Primary**: Blue background, white text
- **Secondary**: Gray border, dark text
- **Danger**: Red background, white text
- **Success**: Green background, white text

### Sidebar Toggle
- **☰ Button**: Toggle sidebar visibility
- **Hover effect**: Show tooltip with connection status
- **Keyboard shortcut**: Ctrl+B to toggle
- **Auto-hide**: Hide when window width < 1200px

### Resize Handles
- **⋮⋮ Handle**: Drag to resize panes
- **Visual feedback**: Highlight on hover
- **Snap points**: 25%, 50%, 75% ratios
- **Min/Max**: 200px min, 800px max per pane

---

## 📱 Responsive Considerations
- **Desktop**: Full sidebar + dual-pane main content
- **Tablet**: Collapsible sidebar + single-pane content
- **Mobile**: Bottom navigation tabs + stacked content

---

*Wireframes created for andb-ui project*
