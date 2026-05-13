# FEATURES.md — Chi tiết chức năng hệ thống

## Phân quyền

| Chức năng | Admin | Student | Lecturer |
|-----------|-------|---------|----------|
| Đăng nhập / Đổi mật khẩu | ✅ | ✅ | ✅ |
| Quản lý người dùng | ✅ | ❌ | ❌ |
| Quản lý danh mục SV, HP, HK | ✅ | ❌ | ❌ |
| Nhập / sửa điểm | ✅ | ❌ | ❌ |
| Xem bảng điểm của mình | ❌ | ✅ | ❌ |
| Nhập chỉ số hành vi | ❌ | ✅ | ❌ |
| Đặt mục tiêu GPA | ❌ | ✅ | ❌ |
| Xem dự báo AI | ❌ | ✅ | ❌ |
| Gợi ý học cải thiện | ❌ | ✅ | ❌ |
| Goal Seek | ❌ | ✅ | ❌ |
| Xem báo cáo SV nguy cơ | ❌ | ❌ | ✅ |
| Xuất báo cáo Excel/PDF | ✅ | ❌ | ✅ |
| Sao lưu / Khôi phục DB | ✅ | ❌ | ❌ |

---

## Mô tả chi tiết từng chức năng

### UC01 — Đăng nhập
- Input: email + password
- Validate: email hợp lệ, mật khẩu không rỗng
- Giới hạn thử: 5 lần sai → khóa tài khoản tạm thời
- Redirect sau đăng nhập: admin→/admin, student→/student/dashboard, lecturer→/lecturer/dashboard

### UC02 — Quản lý người dùng (Admin)
- Tạo tài khoản: tự sinh mật khẩu tạm thời hoặc nhập thủ công
- Vô hiệu hóa: set `is_active=0`, không cho đăng nhập nhưng không xóa dữ liệu
- Xóa: chỉ xóa được tài khoản không có dữ liệu liên kết

### UC03 — Phân quyền (Admin)
- 3 roles: admin / student / lecturer
- Nâng lên admin: yêu cầu xác nhận 2 lần

### UC06 — Quản lý danh mục sinh viên (Admin)
- Filter theo: khoa, khóa học, ngành
- Khi sửa SV đã có điểm → cảnh báo confirm trước

### UC07 — Quản lý danh mục học phần (Admin)
- Mã môn unique
- Liên kết với khoa

### UC08 — Quản lý học kỳ (Admin)
- Chỉ 1 học kỳ `is_current=1` tại một thời điểm
- Khi set học kỳ mới hiện hành → tự tắt học kỳ cũ

### UC09 — Nhập điểm học phần (Admin)
- 2 cột nhập:  GK, CK (thang 0-10)
- Backend tự tính: `total =  0.3*GK + 0.7*CK`
- Validate: giá trị trong [0, 10]
- GPA tích lũy của SV tự cập nhật sau khi lưu

### UC10 — Cập nhật bảng điểm (Admin)
- Phải nhập lý do khi sửa
- Hệ thống ghi audit log: ai sửa, lúc nào, giá trị cũ → mới
- Tính lại GPA tích lũy sau khi sửa

### UC14 — Thiết lập hồ sơ học tập (Student)
- Hiển thị GPA tích lũy hiện tại (từ bảng grades)
- SV xác nhận danh sách môn đang học trong kỳ

### UC15 — Cập nhật chỉ số hành vi (Student)
- Nhập theo học kỳ, lưu có timestamp
- Validate range:
  - study_hours: 0-16
  - sleep_hours: 0-12
  - class_attendance: 0-100 (%)
  - social_media_hours: 0-24
  - mental_stress: 0-9
  - assignment_score: 0-100
  - middle_exam_score: 0-100
  - screen_time_house: 1-23


### UC17 — Dự báo kết quả học tập (Student)
- Thu thập: lịch sử GPA + chỉ số hành vi hiện tại
- Gọi Python model → nhận kết quả
- Lưu vào `prediction_history`
- Hiển thị: GPA dự báo, màu cảnh báo, top 3 nhân tố ảnh hưởng

### UC18 — Phân loại nguy cơ (Tự động từ UC17)
- safe: GPA ≥ 2.5 và stress ≤ 7 → màu xanh
- warning: GPA 2.0-2.49 hoặc stress > 7 → màu vàng
- danger: GPA < 2.0 → màu đỏ

### UC19 — Hỗ trợ cải thiện GPA (Student)

1. Thiết lập & Kiểm tra mục tiêu (Target Setting)
- Input: Điểm GPA mục tiêu (Hệ 10).
- Validate: Khoảng điểm 0.0 - 10.0. Nếu nằm ngoài khoảng, hiển thị lỗi: "Điểm mục tiêu không hợp lệ".
- Cảnh báo nỗ lực: Nếu Mục tiêu - GPA hiện tại > 2.0, hiển thị thông báo: "Mục tiêu này rất cao, đòi hỏi sự bứt phá lớn trong học tập".
2. Phân tích điều kiện (Eligibility Check)
- Lọc môn: Quét danh sách bảng điểm tích lũy, chọn các môn có 4.0 <= total_score <= 5.6.- Xử lý ngoại lệ: Nếu danh sách rỗng, hiển thị cảnh báo: "Hiện tại bạn không có môn học nào đủ điều kiện để đăng ký học cải thiện theo quy chế".
3. Logic Tính toán & Tối ưu (Calculation & Optimization)
- Tính toán điểm tối thiểu:Sử dụng công thức bài toán ngược để tìm mức điểm $d_{new}$ cần đạt cho mỗi môn sao cho $GPA_{total} = GPA_{target}$.
- Nếu kết quả $d_{new} > 10.0$ cho một môn đơn lẻ, hệ thống tự động tính toán phương án kết hợp nhiều môn.
- Phân tích kịch bản "Mục tiêu quá cao":Nếu mục tiêu vẫn không đạt được dù tất cả các môn cải thiện đạt 10.0, hệ thống tính toán số tín chỉ mới cần học thêm ($S_{extra}$) với mức điểm giả định (ví dụ 8.5) để bù đắp khoảng cách.
- Xếp hạng ưu tiên: Tính mức tăng cho từng môn dựa trên công thức $gpa\_gain$. Sắp xếp giảm dần để sinh viên biết môn nào "đáng" học lại nhất.
- Hiển thị: bảng gồm tên môn, tín chỉ,  điểm cũ, điểm đề xuất, mức tăng GPA dự kiến


**Công thức tính mức tăng GPA:**
```
gpa_gain = (new_total * credits - old_total * credits) / total_credits
```
**Công thức tính mức điểm tối thiểu cần đạt: d_target **
  diem_targer = ((gpa_target * Tong_tinChitichluy)-(GPA_current*Tong_tinChitichluy)+(credits*diem_old))/ credits

### UC20 — Tính điểm mục tiêu / Goal Seek (Student)
- Input: mục tiêu GPA (từ UC19) + chọn môn muốn tính
- Giải phương trình ngược từ công thức GPA tích lũy
- Output: điểm cuối kỳ tối thiểu cần đạt từng môn
- Nếu cần điểm > 10: cảnh báo "Mục tiêu không thể đạt được"

### UC22 — Thống kê sinh viên nguy cơ (Lecturer)
- Filter: học kỳ, ngưỡng GPA dự báo, mức stress
- Hiển thị: mã SV, tên, GPA dự báo, mức nguy cơ, mức stress
- Liên kết: click vào SV → xem chi tiết hồ sơ học tập
- Xuất: Excel hoặc PDF

### UC23 — Báo cáo hiệu quả cải thiện (Lecturer)
- So sánh GPA dự báo ban đầu vs GPA thực tế sau cải thiện
- Hiển thị theo SV: môn đã cải thiện, điểm trước/sau, mức tăng thực tế

### UC24 — Sao lưu cơ sở dữ liệu (Admin)
- Admin nhấn "Tạo sao lưu" → hệ thống chạy `mysqldump` → lưu file `.sql` vào thư mục `backups/`
- Tên file tự động theo format: `backup_YYYYMMDD_HHmmss.sql`
- Ghi log vào bảng `system_backups`: tên file, dung lượng, loại backups, trạng thái, người tạo, thời gian
- Hiển thị danh sách các bản sao lưu: tên file, dung lượng, ngày tạo, trạng thái
- Cho phép tải xuống file `.sql`
- Xóa bản sao lưu cũ (có confirm)

**Node.js implementation:**
```javascript
// backupService.js
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

async function createBackup() {
  const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
  const filepath = path.join(__dirname, '../../backups', filename);

  const cmd = `mysqldump -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > ${filepath}`;

  return new Promise((resolve, reject) => {
    exec(cmd, (error) => {
      if (error) return reject(error);
      const stats = fs.statSync(filepath);
      resolve({ filename, filepath, size: stats.size });
    });
  });
}
```

### UC25 — Khôi phục cơ sở dữ liệu (Admin)
- Admin chọn file sao lưu từ danh sách → nhấn "Khôi phục"
- Hiển thị cảnh báo rõ ràng: "Toàn bộ dữ liệu hiện tại sẽ bị thay thế"
- Yêu cầu xác nhận 2 lần trước khi thực hiện
- Hệ thống chạy `mysql < file.sql` để restore
- Ghi log kết quả vào `system_backups`
- Nếu restore thất bại: hiển thị thông báo lỗi, không làm hỏng dữ liệu hiện tại

---

## Dashboard mỗi role

### Admin Dashboard
- Tổng số SV, GV, môn học, học kỳ
- Số tài khoản đang hoạt động / bị khóa
- Thống kê nhanh: SV nguy cơ trong học kỳ hiện tại

### Student Dashboard
- GPA tích lũy hiện tại (gauge chart)
- Kết quả dự báo gần nhất (màu safe/warning/danger)
- Biểu đồ GPA theo từng học kỳ (line chart)
- Biểu đồ radar: 5 chỉ số hành vi
- Nút nhanh: "Cập nhật hành vi", "Xem gợi ý cải thiện"

### Lecturer Dashboard
- Số SV nguy cơ học kỳ hiện tại (phân loại safe/warning/danger)
- Biểu đồ phân bố GPA dự báo của lớp
- Danh sách nhanh top SV cần quan tâm
