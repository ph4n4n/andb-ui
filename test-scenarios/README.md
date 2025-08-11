# 🧪 Test Scenarios

## 📋 **Test Files Overview**

### **1. TEST_UI.md**
- **Purpose**: Comprehensive UI testing checklist
- **Content**: Feature tests, responsive design, technical tests
- **Use**: Complete UI validation

### **2. DEMO_GUIDE.md**
- **Purpose**: Demo guide for testing the app
- **Content**: UI features, interactions, expected behavior
- **Use**: Quick demo and feature showcase

### **3. UI_FIXES.md**
- **Purpose**: Summary of UI fixes and improvements
- **Content**: Problem descriptions, fixes applied, results
- **Use**: Track UI improvements and changes

## 🎯 **Quick Test Guide**

### **Start Testing**
```bash
npm run electron:dev
```

### **Test Order**
1. **Basic UI**: Check app loads, sidebar works
2. **Navigation**: Test all menu items
3. **Responsive**: Resize window, test mobile layout
4. **Interactions**: Click buttons, toggle sidebar
5. **Keyboard**: Test Ctrl+B / Cmd+B shortcuts

### **Key Features to Test**
- ✅ Sidebar toggle (button + keyboard)
- ✅ Navigation between views
- ✅ Connection pair selection
- ✅ Action buttons layout
- ✅ Responsive design
- ✅ Icons visibility when collapsed

## 📱 **Test Scenarios**

### **Desktop Testing**
- Full sidebar expanded/collapsed
- All navigation items working
- Connection selectors visible
- Action buttons with full text

### **Mobile Testing**
- Compact sidebar layout
- Hidden connection selectors
- Short button text
- Touch-friendly interactions

### **Keyboard Testing**
- `Ctrl+B` (Windows/Linux)
- `Cmd+B` (macOS)
- Sidebar toggle working
- No conflicts with other shortcuts

## 🎉 **Success Criteria**

**All tests PASS** when:
- ✅ App loads without errors
- ✅ All UI elements visible
- ✅ All interactions work
- ✅ Responsive design works
- ✅ Keyboard shortcuts work
- ✅ No console errors

---

**Last Updated**: January 2025
**Status**: Ready for testing
