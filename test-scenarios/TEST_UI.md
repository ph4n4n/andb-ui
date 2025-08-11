# andb-ui UI Test Checklist

## 🧪 **Test Instructions**

### 1. **Start Application**
```bash
npm run electron:dev
```

### 2. **Verify Electron Window Opens**
- ✅ Electron window should open
- ✅ Should load Vue.js app
- ✅ Should show Dashboard as default view

## 🎯 **Feature Tests**

### **Sidebar Navigation**
- [ ] **Auto-hide**: Click ☰ button in header
- [ ] **Keyboard Shortcut**: Press Ctrl+B to toggle
- [ ] **Menu Items**: Click each menu item
  - [ ] Dashboard
  - [ ] Export
  - [ ] Compare
  - [ ] Migrate
  - [ ] Scripts
  - [ ] Settings
- [ ] **Connection Status**: Check status indicators
  - [ ] DEV1: Green dot (connected)
  - [ ] DEV2: Green dot (connected)
  - [ ] STAGE: Yellow dot (testing)
  - [ ] PROD: Red dot (failed)

### **Header Actions**
- [ ] **Connection Pair Selector**: 
  - [ ] Select Source: DEV1
  - [ ] Select Target: STAGE
- [ ] **Test Connections**: Click "Test Connections" button
- [ ] **Refresh**: Click "Refresh" button
- [ ] **Settings**: Click "Settings" button

### **Dashboard View**
- [ ] **Connection Pairs Table**: Should show DEV1 ↔ STAGE, etc.
- [ ] **Status Indicators**: Should show ✅ ⚠️ ❌
- [ ] **Recent Operations**: Should show mock data

### **Export View**
- [ ] **Database Objects**: Should show tables, procedures, functions, triggers
- [ ] **Checkboxes**: Should be able to select items
- [ ] **SQL Preview**: Should show preview when items selected
- [ ] **Resize Handle**: Should see visual resize handle between panes

### **Compare View**
- [ ] **Side-by-side**: Should show Source vs Destination
- [ ] **Status Icons**: Should show ✅ ⚠️ ❌ for each item
- [ ] **Legend**: Should show status explanation at bottom
- [ ] **Resize Handle**: Should see visual resize handle

### **Migration View**
- [ ] **Pending Changes**: Should show list of changes
- [ ] **Checkboxes**: Should be able to select changes
- [ ] **Migration History**: Should show history on right pane
- [ ] **Status Indicators**: Should show completed/partial status

### **Scripts View**
- [ ] **Configuration Form**: Should show form fields
- [ ] **Dropdowns**: Should be able to select environments
- [ ] **Generated Script**: Should show script preview
- [ ] **Copy/Save**: Should have copy and save buttons

### **Settings View**
- [ ] **General Settings**: Theme, Language, Auto-save, Notifications
- [ ] **andb-core Config**: Default environments, Export path
- [ ] **Connection Defaults**: Port, Timeout, Auto-test
- [ ] **Save/Reset**: Should have save and reset buttons

## 🎨 **UI/UX Tests**

### **Responsive Design**
- [ ] **Desktop**: Full sidebar + dual-pane content
- [ ] **Resize Window**: Should adapt to different sizes
- [ ] **Dark Theme**: Should have dark theme applied

### **Visual Elements**
- [ ] **Icons**: All Lucide icons should display correctly
- [ ] **Colors**: Blue accent colors should be visible
- [ ] **Typography**: Clean, modern font should be used
- [ ] **Cards**: Should have rounded corners and shadows

### **Interactions**
- [ ] **Hover Effects**: Buttons should have hover states
- [ ] **Transitions**: Sidebar should animate smoothly
- [ ] **Focus States**: Form elements should have focus indicators

## 🔧 **Technical Tests**

### **State Management**
- [ ] **Sidebar State**: Should remember collapsed/expanded state
- [ ] **Connection State**: Should update status when testing
- [ ] **Navigation State**: Should highlight active route

### **Performance**
- [ ] **Loading**: Should load quickly
- [ ] **Navigation**: Should switch views instantly
- [ ] **Hot Reload**: Should update when code changes

## 📝 **Expected Results**

### **All Tests Should Pass**
- ✅ No console errors
- ✅ All UI elements visible
- ✅ All interactions working
- ✅ Responsive design working
- ✅ State management working

### **If Issues Found**
- [ ] Check browser console for errors
- [ ] Check terminal for build errors
- [ ] Verify all dependencies installed
- [ ] Check TypeScript compilation

## 🎉 **Success Criteria**

**UI Test PASSED** if:
- ✅ All navigation works
- ✅ All views display correctly
- ✅ All interactions respond
- ✅ No errors in console
- ✅ Responsive design works
- ✅ State management works

---

**Test Date**: January 2025
**Tester**: Developer
**Status**: Ready for testing
