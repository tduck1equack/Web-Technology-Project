# Frontend Screens - EduTech Platform

Đây là hướng dẫn đầy đủ về các màn hình frontend được tạo cho dự án EduTech Platform.

## 📋 Tổng quan

Dự án frontend bao gồm các màn hình chính sau:

1. **Trang chủ (Home)** - Với trạng thái đăng nhập/chưa đăng nhập
2. **Danh sách lớp học** - Hiển thị tất cả các lớp học
3. **Chi tiết lớp học** - Xem chi tiết một lớp học cụ thể
4. **Trang cá nhân (Profile)** - Quản lý thông tin cá nhân

---

## 🏠 Trang Chủ (Home)

**Đường dẫn:** `/` `[d:\Web-Technology-Project\Web-Technology-Project\apps\web\app\page.tsx]`

### Tính năng:
- ✅ Hiển thị nội dung khác nhau dựa trên trạng thái đăng nhập
- ✅ Nếu chưa đăng nhập: Hiển thị nút "Đăng nhập" và "Đăng ký"
- ✅ Nếu đã đăng nhập: Tự động chuyển hướng đến `/classes`
- ✅ Hiển thị các thẻ thông tin (Features) về nền tảng

### Các phần chính:
- Header với logo và nút đăng nhập/trang cá nhân
- Hero section với CTA buttons
- Features grid (Học tập linh hoạt, Giảng viên chất lượng, Giải pháp đầy đủ)
- Footer với thông tin liên hệ

**Component:** [apps/web/components/home/HomePage.tsx](apps/web/components/home/HomePage.tsx)

---

## 📚 Danh sách Lớp Học

**Đường dẫn:** `/classes` (Protected Route)

### Tính năng:
- ✅ Lấy danh sách tất cả lớp học từ API
- ✅ Hiển thị lớp học dưới dạng grid
- ✅ Mỗi thẻ lớp học hiển thị:
  - Tên lớp và khóa học
  - Mã lớp
  - Giảng viên
  - Ngày bắt đầu/kết thúc
  - Thanh tiến độ ghi danh
  - Mô tả lớp học

### Xử lý lỗi:
- ✅ Hiển thị spinner khi đang tải
- ✅ Hiển thị thông báo lỗi nếu không thể tải dữ liệu
- ✅ Hiển thị thông báo nếu không có lớp học

**Page:** [apps/web/app/(protected)/classes/page.tsx](apps/web/app/(protected)/classes/page.tsx)

**Component:** [apps/web/components/classes/ClassesPage.tsx](apps/web/components/classes/ClassesPage.tsx)

---

## 🎓 Chi tiết Lớp Học

**Đường dẫn:** `/classes/[id]` (Protected Route)

### Tính năng:
- ✅ Lấy chi tiết một lớp học từ API bằng ID
- ✅ Hiển thị đầy đủ thông tin lớp học:
  - Tên lớp và khóa học
  - Mơ tả chi tiết
  - Thông tin giảng viên
  - Lịch trình (ngày bắt đầu/kết thúc)
  - Tình trạng ghi danh (thanh tiến độ)
  - Thông tin khóa học (mã, tín chỉ, v.v.)

- ✅ Nút hành động:
  - "Ghi danh" - Tham gia lớp học
  - "Hủy ghi danh" - Rời lớp học (nếu đã ghi danh)
  - "Quay lại" - Quay lại danh sách lớp

### Sidebar:
- ✅ Thông tin ghi danh (trạng thái, ngày bắt đầu/kết thúc)
- ✅ Nút hành động nhanh

### Breadcrumb:
- ✅ Điều hướng: Trang chủ > Lớp học > Tên lớp

**Page:** [apps/web/app/(protected)/classes/[id]/page.tsx](apps/web/app/(protected)/classes/[id]/page.tsx)

**Component:** [apps/web/components/classes/ClassDetailPage.tsx](apps/web/components/classes/ClassDetailPage.tsx)

---

## 👤 Trang Cá Nhân (Profile)

**Đường dẫn:** `/profile` (Protected Route)

### Tính năng:
- ✅ Lấy thông tin người dùng hiện tại từ API
- ✅ Hiển thị avatar của người dùng (với khả năng tải lên)
- ✅ Chế độ chỉnh sửa/xem
- ✅ Các trường thông tin:

#### Thông tin cá nhân:
- Tên (First Name)
- Họ (Last Name)
- Tên người dùng (Username) - chỉ đọc
- Email - chỉ đọc
- Tiểu sử (Bio)

#### Thông tin liên hệ:
- Số điện thoại
- Thành phố
- Địa chỉ
- Quốc gia

#### Thông tin tài khoản:
- Role (Sinh viên/Giảng viên/Admin)
- Trạng thái (Online/Offline/Away)
- Email verified
- Ngày tạo tài khoản

### Tính năng:
- ✅ Khi nhấn "Chỉnh sửa": Các trường trở thành có thể chỉnh sửa
- ✅ Có thể tải lên avatar mới
- ✅ Nút "Lưu thay đổi" để cập nhật thông tin
- ✅ Nút "Hủy" để thoát chế độ chỉnh sửa

**Page:** [apps/web/app/(protected)/profile/page.tsx](apps/web/app/(protected)/profile/page.tsx)

**Component:** [apps/web/components/profile/ProfilePage.tsx](apps/web/components/profile/ProfilePage.tsx)

---

## 🔌 API Utilities

### Classes API (`lib/api/classes.ts`)

```typescript
// Lấy danh sách tất cả lớp học
getClasses(): Promise<ClassInstance[]>

// Lấy chi tiết một lớp học
getClassById(id: string): Promise<ClassInstance>

// Ghi danh vào lớp học
enrollClass(classId: string): Promise<any>

// Rời khỏi lớp học
leaveClass(classId: string): Promise<any>
```

### Users API (`lib/api/users.ts`)

```typescript
// Lấy thông tin người dùng hiện tại
getCurrentUserProfile(): Promise<UserProfile>

// Cập nhật thông tin người dùng
updateUserProfile(data: UpdateProfileData): Promise<UserProfile>

// Tải lên avatar
uploadAvatar(file: File): Promise<{ url: string }>
```

---

## 🧩 Layout Components

### ProtectedHeader (`components/layout/ProtectedHeader.tsx`)

Hiển thị tại đầu mỗi trang được bảo vệ, bao gồm:
- Logo EduTech
- Thông tin người dùng
- Menu thả xuống với các tùy chọn:
  - Trang cá nhân
  - Lớp học của tôi
  - Đăng xuất

### Sidebar (`components/layout/Sidebar.tsx`)

Menu điều hướng bên cạnh các trang được bảo vệ (đã tồn tại).

---

## 🎨 UI Components

### LoadingSpinner (`components/ui/LoadingSpinner.tsx`)

Hiển thị spinner khi tải dữ liệu. Hỗ trợ các kích thước: `small`, `medium`, `large`.

---

## 📄 Utilities

### `lib/utils.ts`

Các hàm tiện ích:
- `cn()` - Merge Tailwind CSS classes
- `formatDate()` - Định dạng ngày tháng
- `formatDateTime()` - Định dạng ngày giờ
- `formatTime()` - Định dạng giờ
- `truncate()` - Cắt ngắn chuỗi
- `capitalize()` - Viết hoa chữ cái đầu
- `generateInitials()` - Tạo chữ cái đầu từ tên

---

## 🔐 Protected Routes

Các route sau yêu cầu người dùng phải đăng nhập (được xác thực bằng `useAuthStore`):

- `/classes` - Danh sách lớp học
- `/classes/[id]` - Chi tiết lớp học
- `/profile` - Trang cá nhân

**Layout:** `app/(protected)/layout.tsx` - Kiểm tra xác thực và chuyển hướng đến `/login` nếu cần.

---

## 🔄 Authentication Flow

1. Người dùng truy cập trang chủ (`/`)
2. Nếu chưa đăng nhập: Hiển thị nút "Đăng nhập" và "Đăng ký"
3. Người dùng nhấn "Đăng nhập" → Chuyển đến `/login`
4. Sau khi đăng nhập thành công → Chuyển đến `/classes`
5. Truy cập các route được bảo vệ → Kiểm tra xác thực, nếu không hợp lệ → Chuyển đến `/login`

---

## 📦 Dependencies

- **Next.js 16** - React framework
- **React 19** - UI library
- **TailwindCSS** - Styling
- **React Query** - Data fetching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Supabase** - Authentication & backend
- **Axios** - HTTP client

---

## 🚀 Bước tiếp theo (Optional)

1. Tạo các trang khác như:
   - Trang đăng nhập
   - Trang đăng ký
   - Trang quên mật khẩu
   - Dashboard

2. Thêm các tính năng:
   - Chat real-time
   - Thông báo
   - Nộp bài tập
   - Xem bảng điểm

3. Cải thiện UX:
   - Dark mode
   - Responsive design tốt hơn
   - Animations
   - PWA support

---

## 📝 Ghi chú

- Tất cả các API call được xác thực tự động qua interceptor Axios
- Hình ảnh được lưu cache bằng React Query (5 phút)
- Các form sử dụng React Hook Form + Zod cho validation
- Tất cả các trang được bảo vệ đều được xác thực qua `useAuthStore`

---

**Tạo ngày:** 11 tháng 4, 2026
**Phiên bản:** 1.0.0
