# 🚀 ANDB "Go Pro" Roadmap

Đây là bản kế hoạch chi tiết để nâng cấp `andb-ui` từ một tool cá nhân thành một sản phẩm commercial-ready. Kế hoạch được tái cấu trúc để ưu tiên sự ổn định (Stability) và tính năng thiết yếu cho môi trường Production.

## 🏁 Phase 1: MySQL Solid Core (Release v1.0)

_Mục tiêu: Đảm bảo app chạy mượt với MySQL/MariaDB, UX ngon nghẻ để release bản Community đầu tiên._

### 1.1 Integrity & Stability

- [ ] **Auto-Update System**: Setup `electron-builder` để app tự động update. (High Priority).
- [ ] **Form Validation**: Validation chặt chẽ form Connection.
- [ ] **i18n Completeness**: Đảm bảo không còn key nào bị thiếu.

### 1.2 UX Polish

- [ ] **Dashboard Revamp**: Quick Actions, Recent Activity.
- [ ] **Data Type Select**: Dropdown chọn loại DB (Hiện tại disable Postgres/SQLite).

---

## 🐘 Phase 2: The PostgreSQL Expansion (Technical Heavy)

_Mục tiêu: Mở rộng Core Engine để support PostgreSQL. Đây là phase tốn nhiều effort nhất về backend._

### 2.1 Core Logic Update (Backend) (Critical)

- [ ] **Schema Adapter**: Viết lại Adapter để handle cấu trúc `Schema > Table` của Postgres.
- [ ] **Data Types Mapping**: Map các type đặc thù (JSONB, Array, UUID, Enum) sang format chuẩn của ANDB.
- [ ] **Function/Procedure Parser**: Parser riêng cho cú pháp PL/pgSQL (khác hẳn MySQL).

### 2.2 UI Integration

- [ ] **Postgres Connection Form**: Default port 5432, thêm field `Schema` (default `public`).
- [ ] **UI Testing**: Verify hiển thị cây thư mục với cấu trúc mới.

---

## 🚀 Phase 3: Power User Utility (Tính năng "Sát thủ")

_Mục tiêu: Thêm các tính năng mà Dev/DevOps chuyên nghiệp bắt buộc phải có (SSH, SSL)._

### 3.1 Connectivity Pro

- [ ] **SSH Tunneling**:
  - Form config SSH (Host, Port, User, Key/Pass).
  - Tự động dựng tunnel khi connect.
- [ ] **SSL/TLS Certificates**: UI để upload CA Certs.

### 2.2 Structure & Safety

- [ ] **Project/Workspace**: Gom nhóm Connection theo dự án.
- [ ] **Environment Tagging**: Label màu (Prod=Red, Dev=Green) để tránh thao tác nhầm trên Prod.
- [ ] **Safe Mode**: Cảnh báo xác nhận 2 bước khi chạy query trên môi trường Production.

---

## 💎 Phase 3: Commercial & Enterprise (Bản thu tiền)

_Mục tiêu: Giải quyết các bài toán quy mô lớn, dữ liệu phức tạp và làm việc nhóm._

### 3.1 Data Management

- [ ] **Data Compare**: So sánh dữ liệu (Data Diff) giữa 2 bảng (dùng cho bảng Config, Lookup).
- [ ] **Seed Data Generator**: Tạo dữ liệu giả để test.

### 3.2 Advanced Migration

- [ ] **Drift Detection (Manual)**: So sánh state hiện tại với snapshot lần cuối để phát hiện thay đổi ngoài luồng.
- [ ] **Rollback Assistant**: Hỗ trợ generate script `DOWN` cơ bản (có cảnh báo rủi ro mất dữ liệu).

### 3.3 Collaboration

- [ ] **Shared Configuration**: Export/Import Connection config (có password protection hoặc exclude password) để share cho team.

---

## 🛠 Tech Tasks (Ongoing)

- [ ] **Refactor Architecture**: Tách rõ Layer UI và Core Logic (Chuẩn bị cho khả năng Port sang Web/Cloud trong tương lai).
- [ ] **Unit Tests**: Viết test cho các hàm generate SQL critical để đảm bảo không sai cú pháp.
