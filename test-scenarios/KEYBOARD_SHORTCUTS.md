# ⌨️ Keyboard Shortcuts

## 🎯 **Available Shortcuts**

### **Sidebar Toggle**
- **Windows/Linux**: `Ctrl + B`
- **macOS**: `Cmd + B`
- **Action**: Toggle sidebar expanded/collapsed
- **Global**: Works from any view

## 🔧 **Implementation Details**

### **Location**
- **File**: `src/App.vue`
- **Scope**: Global (app-wide)
- **Event**: `keydown`

### **Code**
```typescript
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+B or Cmd+B to toggle sidebar
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault()
    appStore.toggleSidebar()
  }
}
```

### **Features**
- ✅ **Cross-platform**: Supports both Ctrl and Cmd
- ✅ **Global scope**: Works from any component
- ✅ **Proper cleanup**: Event listener removed on unmount
- ✅ **Prevent default**: Stops browser default behavior

## 🧪 **Testing**

### **Test Steps**
1. **Start app**: `npm run electron:dev`
2. **Focus app**: Click anywhere in the app window
3. **Test shortcut**: Press `Ctrl+B` (Windows/Linux) or `Cmd+B` (macOS)
4. **Verify**: Sidebar should toggle

### **Expected Behavior**
- **First press**: Sidebar collapses (if expanded)
- **Second press**: Sidebar expands (if collapsed)
- **Smooth animation**: 300ms transition
- **Icons visible**: When collapsed, icons remain visible

### **Troubleshooting**
- **Not working**: Make sure app window is focused
- **Browser conflict**: Shortcut only works in Electron app
- **Multiple listeners**: Only one global listener active

## 📱 **Platform Support**

### **Windows**
- **Key**: `Ctrl + B`
- **Status**: ✅ Working

### **macOS**
- **Key**: `Cmd + B`
- **Status**: ✅ Working

### **Linux**
- **Key**: `Ctrl + B`
- **Status**: ✅ Working

## 🎉 **Success Criteria**

**Shortcut works when:**
- ✅ App window is focused
- ✅ No input fields are active
- ✅ Sidebar toggles smoothly
- ✅ Icons remain visible when collapsed
- ✅ Animation is smooth

---

**Last Updated**: January 2025
**Status**: Implemented ✅
