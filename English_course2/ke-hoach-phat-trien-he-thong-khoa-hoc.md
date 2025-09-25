# Kế Hoạch Phát Triển Hệ Thống Quản Lý Khóa Học Trực Tuyến

## 1. Phân Tích Database Schema

### 1.1 Tổng Quan Database
- **Database Name**: `english_course_system`
- **Character Set**: `utf8mb4_unicode_ci`
- **Số bảng**: 7 bảng chính
- **Mục đích**: Quản lý khóa học tiếng Anh với lịch học và điểm danh

### 1.2 Luồng Đăng Ký Khóa Học Chi Tiết
**Quy trình đăng ký 2 cấp:**
1. **Cấp Khóa học (Course Level)**: Học viên đăng ký vào khóa học tổng quát
   - Bảng `course_students`: Lưu trữ đăng ký khóa học
   - Mục đích: Thể hiện ý định học và quyền truy cập khóa học
2. **Cấp Lớp học (Class Level)**: Admin/Teacher phân lớp cụ thể cho học viên
   - Bảng `class_students`: Lưu trữ học viên trong lớp học cụ thể
   - Mục đích: Quản lý lịch học và điểm danh thực tế

### 1.3 Cấu Trúc Bảng Chi Tiết

#### **Bảng `users`** - Quản lý người dùng
- **Primary Key**: `user_id`
- **Vai trò**: 3 loại (`admin`, `teacher`, `student`)
- **Thông tin**: Họ tên, email, mật khẩu, vai trò
- **Mối quan hệ**: Liên kết với `classes` (teacher), `class_students` (student), `attendance`

#### **Bảng `courses`** - Danh mục khóa học
- **Primary Key**: `course_id`
- **Cấp độ**: 3 mức (`Beginner`, `Intermediate`, `Advanced`)
- **Thông tin**: Tên khóa học, mô tả, cấp độ
- **Mối quan hệ**: Một khóa học có nhiều lớp học

#### **Bảng `classes`** - Lớp học cụ thể
- **Primary Key**: `class_id`
- **Foreign Keys**: `course_id`, `teacher_id`
- **Thông tin**: Tên lớp, ngày bắt đầu/kết thúc
- **Mối quan hệ**: Thuộc về một khóa học, có một giáo viên, nhiều học viên

#### **Bảng `course_students`** - Đăng ký khóa học (Cấp 1)
- **Composite Primary Key**: (`course_id`, `student_id`)
- **Mục đích**: Quản lý đăng ký khóa học của học viên
- **Thông tin**: Ngày đăng ký
- **Business Logic**: Học viên tự đăng ký, thể hiện ý định học

#### **Bảng `class_students`** - Học viên trong lớp (Cấp 2)
- **Composite Primary Key**: (`class_id`, `student_id`)
- **Mục đích**: Quản lý phân lớp học viên cụ thể
- **Thông tin**: Ngày tham gia lớp
- **Business Logic**: Admin/Teacher phân lớp dựa trên đăng ký khóa học

#### **Bảng `schedules`** - Lịch học
- **Primary Key**: `schedule_id`
- **Foreign Key**: `class_id`
- **Thông tin**: Ngày học, giờ bắt đầu/kết thúc, phòng/link
- **Mối quan hệ**: Thuộc về một lớp học

#### **Bảng `attendance`** - Điểm danh
- **Primary Key**: `attendance_id`
- **Foreign Keys**: `schedule_id`, `student_id`
- **Trạng thái**: `present`, `absent`, `excused`
- **Thông tin**: Ghi chú điểm danh

### 1.4 Business Logic Phân Tích
1. **Phân quyền 3 cấp**: Admin → Teacher → Student
2. **Luồng đăng ký 2 cấp**:
   - **Cấp 1**: Student → Course Registration (Tự đăng ký)
   - **Cấp 2**: Admin/Teacher → Class Assignment (Phân lớp)
3. **Quản lý lịch học**: Schedule → Attendance tracking
4. **Mối quan hệ**: 1-n giữa Course-Class, Class-Student, Class-Schedule

### 1.5 Đặc Điểm Quan Trọng Của Database
- **Tách biệt đăng ký khóa và phân lớp**: Cho phép linh hoạt trong quản lý
- **Cascade Delete**: Đảm bảo tính toàn vẹn dữ liệu khi xóa
- **Indexing**: Tối ưu hóa truy vấn theo role, level, date, status
- **Sample Data**: Có sẵn dữ liệu mẫu để test và phát triển

## 2. Kiến Trúc Hệ Thống

### 2.1 Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: MySQL 8.0
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Date Handling**: date-fns

### 2.2 Cấu Trúc Thư Mục
```
src/
├── app/                    # App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── teacher/           # Teacher dashboard
│   ├── student/           # Student dashboard
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utilities
│   ├── db.ts            # Database connection
│   ├── auth.ts          # Authentication config
│   └── utils.ts         # Helper functions
├── types/               # TypeScript types
└── hooks/               # Custom hooks
```

### 2.3 Database Connection
- **ORM**: Prisma với MySQL connector
- **Connection Pooling**: Built-in Prisma connection pooling
- **Environment**: Separate configs for dev/prod

## 3. Breakdown Tính Năng Theo Module

### 3.1 Module Authentication & Authorization
**Chức năng:**
- Đăng nhập/Đăng xuất
- Phân quyền theo role (admin/teacher/student)
- Quản lý session
- Password reset

**Components:**
- LoginForm
- RegisterForm (admin only)
- ProtectedRoute
- RoleGuard

### 3.2 Module Admin Dashboard
**Chức năng:**
- Quản lý người dùng (CRUD)
- Quản lý khóa học (CRUD)
- Quản lý lớp học (CRUD)
- Thống kê tổng quan
- Báo cáo hệ thống

**Pages:**
- `/admin/dashboard` - Tổng quan
- `/admin/users` - Quản lý người dùng
- `/admin/courses` - Quản lý khóa học
- `/admin/classes` - Quản lý lớp học
- `/admin/reports` - Báo cáo

### 3.3 Module Teacher Dashboard
**Chức năng:**
- Xem lớp học được phân công
- Quản lý lịch học
- Điểm danh học viên
- Xem danh sách học viên
- Báo cáo điểm danh

**Pages:**
- `/teacher/dashboard` - Tổng quan
- `/teacher/classes` - Lớp học của tôi
- `/teacher/schedule` - Lịch dạy
- `/teacher/attendance` - Điểm danh
- `/teacher/students` - Danh sách học viên

### 3.4 Module Student Dashboard
**Chức năng:**
- **Đăng ký khóa học**: Browse và đăng ký khóa học mới
- **Quản lý đăng ký**: Xem khóa học đã đăng ký, trạng thái phân lớp
- **Lịch học**: Xem lịch học của các lớp đã được phân
- **Điểm danh**: Xem lịch sử điểm danh cá nhân
- **Thông tin cá nhân**: Cập nhật profile

**Pages:**
- `/student/dashboard` - Tổng quan với thống kê cá nhân
- `/student/courses` - Khóa học của tôi (đã đăng ký)
- `/student/courses/browse` - Duyệt và đăng ký khóa học mới
- `/student/classes` - Lớp học đã được phân
- `/student/schedule` - Lịch học chi tiết
- `/student/attendance` - Lịch sử điểm danh
- `/student/profile` - Thông tin cá nhân

### 3.5 Module Course Registration (Mới)
**Chức năng chính:**
- **Course Catalog**: Hiển thị danh sách khóa học có sẵn
- **Course Details**: Thông tin chi tiết khóa học (mô tả, cấp độ, lịch dự kiến)
- **Registration Process**: Quy trình đăng ký khóa học
- **Registration Status**: Theo dõi trạng thái đăng ký và phân lớp
- **Enrollment History**: Lịch sử đăng ký khóa học

**Components:**
- `CourseCard` - Hiển thị thông tin khóa học
- `CourseDetailModal` - Chi tiết khóa học
- `RegistrationForm` - Form đăng ký
- `RegistrationStatus` - Trạng thái đăng ký
- `EnrollmentHistory` - Lịch sử đăng ký

## 4. API Endpoints

### 4.1 Authentication APIs
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/register (admin only)
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### 4.2 User Management APIs
```
GET    /api/users
POST   /api/users
GET    /api/users/[id]
PUT    /api/users/[id]
DELETE /api/users/[id]
GET    /api/users/teachers
GET    /api/users/students
```

### 4.3 Course Management APIs
```
GET    /api/courses
POST   /api/courses
GET    /api/courses/[id]
PUT    /api/courses/[id]
DELETE /api/courses/[id]
```

### 4.4 Class Management APIs
```
GET    /api/classes
POST   /api/classes
GET    /api/classes/[id]
PUT    /api/classes/[id]
DELETE /api/classes/[id]
GET    /api/classes/[id]/students
POST   /api/classes/[id]/students
DELETE /api/classes/[id]/students/[studentId]
```

### 4.5 Course Registration APIs (Mới)
```
# Course browsing and registration
GET    /api/courses/available          # Khóa học có thể đăng ký
POST   /api/courses/[id]/register      # Đăng ký khóa học
DELETE /api/courses/[id]/unregister    # Hủy đăng ký khóa học
GET    /api/students/[id]/courses      # Khóa học đã đăng ký của học viên
GET    /api/students/[id]/classes      # Lớp học đã được phân của học viên

# Registration status and history
GET    /api/students/[id]/registrations        # Lịch sử đăng ký
GET    /api/courses/[id]/registration-stats    # Thống kê đăng ký khóa học
```

### 4.6 Schedule APIs
```
GET    /api/schedules
POST   /api/schedules
GET    /api/schedules/[id]
PUT    /api/schedules/[id]
DELETE /api/schedules/[id]
GET    /api/classes/[id]/schedules
```

### 4.7 Attendance APIs
```
GET    /api/attendance
POST   /api/attendance
PUT    /api/attendance/[id]
GET    /api/schedules/[id]/attendance
POST   /api/schedules/[id]/attendance/bulk
```

## 5. Timeline Phát Triển

### 5.1 Phase 1: Setup & Foundation (Tuần 1-2)
**Mục tiêu**: Thiết lập môi trường và cấu trúc cơ bản

**Tasks:**
- [ ] Setup Next.js project với TypeScript
- [ ] Cấu hình Tailwind CSS + shadcn/ui
- [ ] Setup Prisma với MySQL
- [ ] Tạo database schema từ SQL file
- [ ] Cấu hình NextAuth.js
- [ ] Tạo layout components cơ bản
- [ ] Setup environment variables

**Deliverables:**
- Project structure hoàn chỉnh
- Database connection working
- Basic authentication flow
- UI components library

### 5.2 Phase 2: Authentication & User Management (Tuần 3)
**Mục tiêu**: Hoàn thành hệ thống xác thực và quản lý người dùng

**Tasks:**
- [ ] Implement login/logout functionality
- [ ] Create user registration (admin only)
- [ ] Role-based access control
- [ ] User CRUD operations
- [ ] Password reset functionality
- [ ] User profile management

**Deliverables:**
- Complete authentication system
- Admin user management interface
- Role-based routing

### 5.3 Phase 3: Course & Class Management (Tuần 4-5)
**Mục tiêu**: Xây dựng core business logic và hệ thống đăng ký

**Tasks:**
- [ ] Course CRUD operations (Admin)
- [ ] Class CRUD operations (Admin)
- [ ] **Course Registration System** (Student)
  - [ ] Course catalog với filter và search
  - [ ] Course detail modal với thông tin đầy đủ
  - [ ] Registration form với validation
  - [ ] Registration status tracking
- [ ] **Class Assignment System** (Admin/Teacher)
  - [ ] View registered students per course
  - [ ] Assign students to specific classes
  - [ ] Bulk assignment operations
- [ ] Teacher assignment to classes
- [ ] Course catalog interface
- [ ] Class management dashboard

**Deliverables:**
- Complete course management system
- **Student course registration workflow**
- **Admin class assignment interface**
- Teacher-class assignment system

### 5.4 Phase 4: Schedule & Attendance (Tuần 6-7)
**Mục tiêu**: Hoàn thành tính năng lịch học và điểm danh

**Tasks:**
- [ ] Schedule CRUD operations
- [ ] Calendar view for schedules
- [ ] Attendance tracking system
- [ ] Bulk attendance operations
- [ ] Attendance reports
- [ ] Schedule notifications

**Deliverables:**
- Complete scheduling system
- Attendance tracking interface
- Reporting dashboard

### 5.5 Phase 5: Dashboard & Reports (Tuần 8)
**Mục tiêu**: Hoàn thiện dashboard và báo cáo

**Tasks:**
- [ ] Admin dashboard with statistics
- [ ] Teacher dashboard
- [ ] Student dashboard
- [ ] Attendance reports
- [ ] Class performance analytics
- [ ] Export functionality

**Deliverables:**
- Role-specific dashboards
- Comprehensive reporting system
- Data visualization

### 5.6 Phase 6: Testing & Polish (Tuần 9-10)
**Mục tiêu**: Testing, bug fixes và cải thiện UX

**Tasks:**
- [ ] Unit testing for API routes
- [ ] Integration testing
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation

**Deliverables:**
- Tested and stable application
- Performance optimized
- Complete documentation

## 6. Danh Sách Pages/Components Cần Phát Triển

### 6.1 Authentication Pages
- `app/(auth)/login/page.tsx` - Trang đăng nhập
- `app/(auth)/register/page.tsx` - Trang đăng ký (admin)
- `app/(auth)/forgot-password/page.tsx` - Quên mật khẩu
- `app/(auth)/reset-password/page.tsx` - Đặt lại mật khẩu

### 6.2 Admin Pages
- `app/admin/dashboard/page.tsx` - Dashboard admin
- `app/admin/users/page.tsx` - Quản lý người dùng
- `app/admin/users/[id]/page.tsx` - Chi tiết người dùng
- `app/admin/courses/page.tsx` - Quản lý khóa học
- `app/admin/courses/[id]/page.tsx` - Chi tiết khóa học
- `app/admin/classes/page.tsx` - Quản lý lớp học
- `app/admin/classes/[id]/page.tsx` - Chi tiết lớp học
- `app/admin/reports/page.tsx` - Báo cáo tổng hợp

### 6.3 Teacher Pages
- `app/teacher/dashboard/page.tsx` - Dashboard giáo viên
- `app/teacher/classes/page.tsx` - Lớp học của tôi
- `app/teacher/classes/[id]/page.tsx` - Chi tiết lớp học
- `app/teacher/schedule/page.tsx` - Lịch dạy
- `app/teacher/attendance/page.tsx` - Điểm danh
- `app/teacher/attendance/[scheduleId]/page.tsx` - Điểm danh buổi học
- `app/teacher/students/page.tsx` - Danh sách học viên

### 6.4 Student Pages
- `app/student/dashboard/page.tsx` - Dashboard học viên
- `app/student/courses/page.tsx` - Khóa học đã đăng ký
- `app/student/courses/browse/page.tsx` - **Duyệt và đăng ký khóa học mới**
- `app/student/courses/[id]/page.tsx` - **Chi tiết khóa học và trạng thái đăng ký**
- `app/student/classes/page.tsx` - **Lớp học đã được phân**
- `app/student/classes/[id]/page.tsx` - **Chi tiết lớp học**
- `app/student/schedule/page.tsx` - Lịch học
- `app/student/attendance/page.tsx` - Lịch sử điểm danh
- `app/student/profile/page.tsx` - Thông tin cá nhân

### 6.5 Shared Components
- `components/layout/DashboardLayout.tsx` - Layout chung
- `components/layout/Sidebar.tsx` - Sidebar navigation
- `components/layout/Header.tsx` - Header với user menu
- `components/ui/DataTable.tsx` - Bảng dữ liệu
- `components/ui/Calendar.tsx` - Calendar component
- `components/forms/UserForm.tsx` - Form người dùng
- `components/forms/CourseForm.tsx` - Form khóa học
- `components/forms/ClassForm.tsx` - Form lớp học
- `components/forms/ScheduleForm.tsx` - Form lịch học
- `components/attendance/AttendanceTable.tsx` - Bảng điểm danh
- `components/charts/StatisticsChart.tsx` - Biểu đồ thống kê

### 6.6 Course Registration Components (Mới)
- `components/courses/CourseCatalog.tsx` - **Danh sách khóa học có thể đăng ký**
- `components/courses/CourseCard.tsx` - **Card hiển thị thông tin khóa học**
- `components/courses/CourseDetailModal.tsx` - **Modal chi tiết khóa học**
- `components/courses/CourseFilter.tsx` - **Filter khóa học theo level, tên**
- `components/courses/RegistrationForm.tsx` - **Form đăng ký khóa học**
- `components/courses/RegistrationStatus.tsx` - **Hiển thị trạng thái đăng ký**
- `components/courses/EnrollmentHistory.tsx` - **Lịch sử đăng ký**
- `components/classes/ClassAssignment.tsx` - **Giao diện phân lớp (Admin)**
- `components/classes/StudentClassList.tsx` - **Danh sách lớp của học viên**

## 7. Chi Tiết Quy Trình Đăng Ký Khóa Học

### 7.1 User Journey - Học Viên Đăng Ký Khóa Học

**Bước 1: Duyệt khóa học**
- Truy cập `/student/courses/browse`
- Xem danh sách khóa học có sẵn
- Filter theo level (Beginner/Intermediate/Advanced)
- Search theo tên khóa học

**Bước 2: Xem chi tiết khóa học**
- Click vào khóa học quan tâm
- Modal hiển thị thông tin chi tiết:
  - Mô tả khóa học
  - Cấp độ yêu cầu
  - Thời gian dự kiến
  - Số lượng đã đăng ký
  - Trạng thái (có thể đăng ký/đã đầy/đã đăng ký)

**Bước 3: Đăng ký khóa học**
- Click "Đăng ký khóa học"
- Xác nhận đăng ký trong modal
- Hệ thống tạo record trong `course_students`
- Hiển thị thông báo thành công

**Bước 4: Theo dõi trạng thái**
- Truy cập `/student/courses` để xem khóa học đã đăng ký
- Trạng thái: "Chờ phân lớp" / "Đã phân lớp"
- Khi được phân lớp, có thể xem chi tiết lớp tại `/student/classes`

### 7.2 Admin Workflow - Phân Lớp Học Viên

**Bước 1: Xem danh sách đăng ký**
- Truy cập `/admin/courses/[id]`
- Xem danh sách học viên đã đăng ký khóa học
- Thông tin: Tên, email, ngày đăng ký, trạng thái phân lớp

**Bước 2: Tạo lớp học**
- Tạo lớp học mới cho khóa học
- Gán giáo viên cho lớp
- Thiết lập thời gian bắt đầu/kết thúc

**Bước 3: Phân lớp học viên**
- Select học viên từ danh sách đăng ký
- Assign vào lớp học cụ thể
- Bulk operations cho nhiều học viên
- Hệ thống tạo record trong `class_students`

### 7.3 Database Operations

**Course Registration:**
```sql
-- Đăng ký khóa học
INSERT INTO course_students (course_id, student_id, registered_at)
VALUES (?, ?, NOW());

-- Kiểm tra đã đăng ký chưa
SELECT * FROM course_students
WHERE course_id = ? AND student_id = ?;

-- Lấy danh sách khóa học đã đăng ký
SELECT c.*, cs.registered_at
FROM courses c
JOIN course_students cs ON c.course_id = cs.course_id
WHERE cs.student_id = ?;
```

**Class Assignment:**
```sql
-- Phân lớp học viên
INSERT INTO class_students (class_id, student_id, joined_at)
VALUES (?, ?, NOW());

-- Lấy danh sách học viên chưa phân lớp
SELECT u.*, cs.registered_at
FROM users u
JOIN course_students cs ON u.user_id = cs.student_id
LEFT JOIN class_students cls ON u.user_id = cls.student_id
WHERE cs.course_id = ? AND cls.student_id IS NULL;
```

## 8. Quy Trình Testing

### 8.1 Unit Testing
**Framework**: Jest + React Testing Library

**Test Coverage:**
- [ ] API route handlers
- [ ] **Course registration API endpoints**
- [ ] **Class assignment operations**
- [ ] Database operations (Prisma queries)
- [ ] Utility functions
- [ ] Form validation logic
- [ ] Authentication helpers

**Test Files:**
```
__tests__/
├── api/
│   ├── users.test.ts
│   ├── courses.test.ts
│   ├── course-registration.test.ts  # Mới
│   ├── classes.test.ts
│   ├── class-assignment.test.ts     # Mới
│   └── attendance.test.ts
├── components/
│   ├── forms/
│   └── ui/
└── lib/
    ├── auth.test.ts
    └── utils.test.ts
```

### 8.2 Integration Testing
**Framework**: Playwright

**Test Scenarios:**
- [ ] Complete user authentication flow
- [ ] Course creation and management
- [ ] **Complete course registration workflow (Student)**
- [ ] **Class assignment workflow (Admin)**
- [ ] **Registration status tracking**
- [ ] Student enrollment process
- [ ] Attendance tracking workflow
- [ ] Role-based access control
- [ ] Data persistence across pages

### 8.3 Manual Testing Checklist
**Authentication:**
- [ ] Login with different roles
- [ ] Password reset flow
- [ ] Session management
- [ ] Unauthorized access prevention

**Admin Functions:**
- [ ] User CRUD operations
- [ ] Course management
- [ ] Class creation and assignment
- [ ] Reports generation

**Teacher Functions:**
- [ ] Class schedule management
- [ ] Student attendance tracking
- [ ] Student list viewing

**Student Functions:**
- [ ] **Course browsing and filtering**
- [ ] **Course registration process**
- [ ] **Registration status tracking**
- [ ] Course enrollment viewing
- [ ] **Class assignment viewing**
- [ ] Schedule viewing
- [ ] Attendance history

**Course Registration Specific:**
- [ ] Course catalog loading and display
- [ ] Course detail modal functionality
- [ ] Registration form validation
- [ ] Duplicate registration prevention
- [ ] Registration success/error handling
- [ ] Status updates after class assignment

## 9. Deployment Strategy

### 9.1 Environment Setup
**Development:**
- Local MySQL database
- Environment variables in `.env.local`
- Hot reload for development

**Staging:**
- Cloud MySQL (PlanetScale/Railway)
- Vercel preview deployments
- Test data seeding

**Production:**
- Production MySQL database
- Vercel production deployment
- Environment variables in Vercel dashboard

### 9.2 Database Migration
**Tools**: Prisma Migrate

**Process:**
1. Generate migration files
2. Review migration SQL
3. Apply to staging environment
4. Test data integrity
5. Apply to production
6. Backup before migration

**Commands:**
```bash
# Generate migration
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

### 9.3 Deployment Pipeline
**Platform**: Vercel

**Steps:**
1. Code push to GitHub
2. Automatic build trigger
3. Run tests
4. Deploy to preview (staging)
5. Manual approval for production
6. Deploy to production
7. Health check

**Environment Variables:**
```
DATABASE_URL=mysql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
```

## 10. Security Considerations

### 10.1 Authentication Security
- [ ] Password hashing with bcrypt
- [ ] JWT token security
- [ ] Session management
- [ ] CSRF protection
- [ ] Rate limiting for login attempts

### 10.2 Data Protection
- [ ] Input validation and sanitization
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS protection
- [ ] Role-based access control
- [ ] Sensitive data encryption

### 10.3 API Security
- [ ] Authentication middleware
- [ ] Request validation with Zod
- [ ] Error handling without data leakage
- [ ] CORS configuration
- [ ] API rate limiting

## 11. Performance Optimization

### 11.1 Database Optimization
- [ ] Proper indexing on foreign keys
- [ ] Query optimization
- [ ] Connection pooling
- [ ] Database query caching

### 11.2 Frontend Optimization
- [ ] Code splitting
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Bundle size optimization
- [ ] Caching strategies

### 11.3 Monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Database query monitoring
- [ ] User analytics

## 12. Maintenance & Support

### 12.1 Documentation
- [ ] API documentation
- [ ] User manual
- [ ] Admin guide
- [ ] Developer documentation
- [ ] Deployment guide

### 12.2 Backup Strategy
- [ ] Daily database backups
- [ ] Code repository backups
- [ ] Environment configuration backups
- [ ] Recovery procedures

### 12.3 Updates & Maintenance
- [ ] Regular security updates
- [ ] Dependency updates
- [ ] Performance monitoring
- [ ] Bug fix procedures
- [ ] Feature enhancement process

## 13. Rủi Ro và Giải Pháp

### 13.1 Technical Risks
**Risk**: Database connection issues
**Solution**: Connection pooling, retry logic, health checks

**Risk**: Authentication vulnerabilities
**Solution**: Use proven libraries (NextAuth.js), regular security audits

**Risk**: Performance bottlenecks
**Solution**: Database indexing, query optimization, caching

### 13.2 Business Risks
**Risk**: Data loss
**Solution**: Regular backups, database replication

**Risk**: Scalability issues
**Solution**: Modular architecture, cloud-native deployment

**Risk**: User adoption
**Solution**: Intuitive UI/UX, comprehensive testing

## 14. Kết Luận

Hệ thống quản lý khóa học này được thiết kế với:
- **Tính đơn giản**: Dựa trên database schema có sẵn với luồng đăng ký 2 cấp rõ ràng
- **Khả năng mở rộng**: Kiến trúc modular, dễ thêm tính năng
- **Bảo mật**: Authentication và authorization đầy đủ
- **Hiệu suất**: Tối ưu hóa database và frontend
- **Dễ bảo trì**: Code structure rõ ràng, documentation đầy đủ
- **User Experience**: Quy trình đăng ký khóa học trực quan và dễ sử dụng

**Tính năng nổi bật:**
- **Course Registration System**: Học viên có thể duyệt và đăng ký khóa học một cách dễ dàng
- **Two-tier Enrollment**: Tách biệt đăng ký khóa học và phân lớp để quản lý linh hoạt
- **Real-time Status Tracking**: Theo dõi trạng thái đăng ký và phân lớp theo thời gian thực
- **Comprehensive Admin Tools**: Công cụ quản lý đầy đủ cho admin và giáo viên

**Timeline tổng thể**: 10 tuần
**Effort estimate**: 1-2 developers
**Complexity**: Medium (phù hợp cho team nhỏ)

Kế hoạch này có thể điều chỉnh linh hoạt dựa trên resources và requirements cụ thể của dự án. Đặc biệt, hệ thống đăng ký khóa học đã được thiết kế chi tiết để đảm bảo trải nghiệm người dùng tốt nhất.
