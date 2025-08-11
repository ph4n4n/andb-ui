# 🎯 andb-ui Demo Guide

## 🚀 **App đang chạy!**

Electron window đã mở và hiển thị UI. Hãy test các tính năng sau:

## 🎨 **UI Features để Test**

### **1. Sidebar Navigation**
- **Toggle Sidebar**: Click ☰ button hoặc press `Ctrl+B`
- **Menu Items**: Click từng item để navigate
  - Dashboard (mặc định)
  - Export
  - Compare  
  - Migrate
  - Scripts
  - Settings

### **2. Header Actions**
- **Connection Pairs**: Chọn Source và Target từ dropdown
- **Test Connections**: Click "Test Connections" button
- **Refresh**: Click "Refresh" button
- **Settings**: Click "Settings" button

### **3. Dashboard View**
- **Connection Pairs Table**: Hiển thị các cặp kết nối
- **Status Indicators**: ✅ ⚠️ ❌ cho từng pair
- **Recent Operations**: Mock data cho recent activities

### **4. Export View**
- **Database Objects**: Tables, Procedures, Functions, Triggers
- **Checkboxes**: Select items để export
- **SQL Preview**: Preview SQL khi select items
- **Dual-Pane Layout**: Resizable panes

### **5. Compare View**
- **Side-by-side**: Source vs Destination
- **Status Icons**: ✅ ⚠️ ❌ cho từng object
- **Legend**: Giải thích status ở bottom
- **Visual Diff**: Highlight differences

### **6. Migration View**
- **Pending Changes**: List changes cần migrate
- **Checkboxes**: Select changes
- **Migration History**: History trên right pane
- **Status**: Completed/Partial indicators

### **7. Scripts View**
- **Configuration Form**: Form fields cho script generation
- **Dropdowns**: Environment selection
- **Generated Script**: Preview script
- **Copy/Save**: Buttons để copy/save

### **8. Settings View**
- **General Settings**: Theme, Language, Auto-save
- **andb-core Config**: Default environments, Export path
- **Connection Defaults**: Port, Timeout settings
- **Save/Reset**: Buttons để save/reset

## 🎯 **Key Features để Test**

### **Responsive Design**
- Resize window để test responsive
- Sidebar auto-hide khi window nhỏ
- Dual-pane layout adapts

### **State Management**
- Sidebar state được remember
- Connection status updates
- Navigation state highlights active route

### **Visual Elements**
- Modern UI với Tailwind CSS
- Blue accent colors
- Lucide icons
- Smooth transitions

## 🔧 **Technical Features**

### **Hot Reload**
- Thay đổi code → app tự update
- Vue.js hot reload working
- Electron main process reload

### **Build System**
- ✅ Development: `npm run electron:dev`
- ✅ Production Build: `npm run build`
- ✅ Electron Package: `npm run electron:build`

## 📱 **Expected Behavior**

### **App Window**
- Size: 1400x900 (min: 800x600)
- Title: "andb-ui"
- DevTools: Open in development mode

### **Performance**
- Fast loading
- Smooth navigation
- No console errors

## 🎉 **Success Indicators**

**Demo PASSED** nếu:
- ✅ App window opens
- ✅ All navigation works
- ✅ UI elements display correctly
- ✅ Interactions respond
- ✅ No errors in console
- ✅ Responsive design works

---

**Demo Date**: January 2025
**Status**: Ready for testing
**App URL**: http://localhost:5173 (Vite dev server)
