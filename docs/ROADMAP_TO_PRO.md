# 🚀 ANDB "Go Pro" Roadmap

Đây là bản kế hoạch chi tiết để nâng cấp `andb-ui` từ một tool cá nhân thành một sản phẩm commercial-ready. Kế hoạch được chia thành các Phase từ nền tảng đến nâng cao, đảm bảo đi từng bước chắc chắn.

## 🏁 Phase 1: Solid Core (Củng cố nền tảng)

_Mục tiêu: Đảm bảo app chạy mượt, UX ngon nghẻ để release bản Community._

### 1.1 Multi-Database Support UI

- [ ] **Dynamic Connection Form**:
  - Thêm dropdown `Database Type`: `MySQL`, `PostgreSQL (Coming Soon)`, `SQLite (Beta)`.
  - `SQLite`: Ẩn Host/Port/User/Pass, hiện nút **"Pick .sqlite file"**.
  - `PostgreSQL`: Đổi default port sang 5432.
- [ ] **Iconography**: Hiển thị icon DB tương ứng trong danh sách connection (để user dễ phân biệt).

### 1.2 UX Polish & Onboarding

- [ ] **Dashboard Revamp**:
  - Thêm "Quick Actions" card:"New Connection", "New Comparison", "Open Recent", click vào sẽ mở form componet setting tương ứng.
  - Hiển thị trạng thái các connection gần nhất (Last used).

---

## 🚀 Phase 2: Power User Utility (Tính năng "Sát thủ")

_Mục tiêu: Đảm bảo app chạy mượt, support đa database cơ bản._

_Mục tiêu: Thêm các tính năng mà Dev/DevOps chuyên nghiệp bắt buộc phải có. Đây là lý do họ rời bỏ tool cũ để sang dùng ANDB._

### 2.1 Connectivity Pro

- [ ] **SSH Tunneling**:
  - Form config SSH Tunnel (Host, Port, User, Private Key/Password) trong Connection Settings.
  - Tự động setup tunnel khi connect DB.
- [ ] **SSL/TLS Certificates**: UI để upload/paste CA Certs cho các connection bảo mật (Azure/AWS RDS often need this).

### 2.2 Structure & Organization

- [ ] **Project/Workspace Concept**:
  - Gom nhóm Connection theo Project (e.g., "E-commerce Project" gồm Dev/Staging/Prod).
  - Environment tagging: Label màu rõ ràng cho Prod (Đỏ), Dev (Xanh) để tránh tai nạn delete nhầm.

### 2.3 Advanced Migration

- [ ] **Drift Detection**: Cảnh báo nếu State hiện tại của DB khác với State được lưu lần cuối (phát hiện ai đó sửa nóng DB).
- [ ] **Rollback Generation**: Tự động generate script `DOWN` khi tạo migration `UP`.

---

## Phase 3: Core Fixes

- [ ] **Schema Loading**: Đảm bảo load schema của PostgreSQL ngon như MySQL (test kỹ các case Enum, Trigger, View).

---

## 💎 Phase 4: Commercial & Enterprise (Bản thu tiền)

_Mục tiêu: Các tính năng dành cho team lớn, giải quyết vấn đề quy trình và dữ liệu phức tạp._

### 4.1 Data Management

- [ ] **Data Compare**: So sánh dữ liệu giữa 2 bảng (thường dùng cho bảng Config, Lookup, Dictionary).
- [ ] **Seed Data Generator**: Generate dummy data để test performance.

### 4.2 Intelligence (AI)

- [ ] **Text-to-SQL Migration**: "Add column phone to users table" -> Generate `ALTER TABLE users ADD COLUMN phone VARCHAR(20)...`
- [ ] **Migration Explanation**: Giải thích script migration phức tạp bằng tiếng người.

### 3.3 Team Collaboration

- [ ] **Shared Configuration**: Export Project config thành file (đã encrypt pass) để share cho đồng đội.
- [ ] **Cloud Sync (Future)**: Sync connection setting qua tài khoản Cloud (cần backend service).

---

## 🛠 Tech Tasks (Behind the scenes)

- [ ] Setup `electron-builder` để auto-update app.
- [ ] Review lại Architecture: Tách rõ Layer UI và Layer Core Logic (để sau này dễ port sang Web version nếu cần).
- [ ] Viết Unit Test cho các hàm generate SQL critical.
