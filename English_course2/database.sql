-- Tạo database
CREATE DATABASE english_course_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE english_course_system;

-- Bảng người dùng (Admin, Giáo viên, Học viên)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role (role)
);

-- Bảng khóa học
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    description TEXT,
    level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level (level)
);

-- Bảng đăng ký khóa học (học viên đăng ký cấp khóa)
CREATE TABLE course_students (
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (course_id, student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_course_student (student_id)
);

-- Bảng lớp học
CREATE TABLE classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    teacher_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_teacher (teacher_id)
);

-- Bảng học viên trong lớp
CREATE TABLE class_students (
    class_id INT NOT NULL,
    student_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id, student_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_student (student_id)
);

-- Bảng lịch học
CREATE TABLE schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    lesson_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_or_link VARCHAR(255),
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    INDEX idx_date (lesson_date)
);

-- Bảng điểm danh
CREATE TABLE attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('present', 'absent', 'excused') DEFAULT 'absent',
    note VARCHAR(255),
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_status (status)
);

-- DỮ LIỆU MẪU

-- Người dùng
INSERT INTO users (full_name, email, password, role) VALUES
('Admin System', 'admin@example.com', 'admin123', 'admin'),
('Nguyen Van A', 'teacher.a@example.com', 'teacher123', 'teacher'),
('Tran Thi B', 'teacher.b@example.com', 'teacher123', 'teacher'),
('Le Van C', 'student.c@example.com', 'student123', 'student'),
('Pham Thi D', 'student.d@example.com', 'student123', 'student');

-- Khóa học
INSERT INTO courses (course_name, description, level) VALUES
('Tiếng Anh Giao Tiếp', 'Khóa học luyện nói và phản xạ giao tiếp cơ bản.', 'Beginner'),
('IELTS Foundation', 'Khóa học nền tảng luyện thi IELTS.', 'Intermediate');

-- Đăng ký khóa học
INSERT INTO course_students (course_id, student_id) VALUES
(1, 4),
(1, 5),
(2, 4);

-- Lớp học
INSERT INTO classes (course_id, class_name, teacher_id, start_date, end_date) VALUES
(1, 'Giao Tiếp A1', 2, '2025-10-01', '2025-12-30'),
(2, 'IELTS F1', 3, '2025-10-05', '2026-01-15');

-- Học viên trong lớp
INSERT INTO class_students (class_id, student_id) VALUES
(1, 4),
(1, 5),
(2, 4);

-- Lịch học
INSERT INTO schedules (class_id, lesson_date, start_time, end_time, room_or_link) VALUES
(1, '2025-10-02', '18:00:00', '20:00:00', 'Phòng 101'),
(1, '2025-10-04', '18:00:00', '20:00:00', 'Phòng 101'),
(2, '2025-10-06', '19:00:00', '21:00:00', 'Zoom link: zoom.us/ielts-f1');

-- Điểm danh
INSERT INTO attendance (schedule_id, student_id, status) VALUES
(1, 4, 'present'),
(1, 5, 'absent'),
(2, 4, 'present');