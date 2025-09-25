import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12)
  const teacherPassword = await bcrypt.hash('teacher123', 12)
  const studentPassword = await bcrypt.hash('student123', 12)

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      fullName: 'Admin System',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    },
  })

  const teacher1 = await prisma.user.upsert({
    where: { email: 'teacher.a@example.com' },
    update: {},
    create: {
      fullName: 'Nguyen Van A',
      email: 'teacher.a@example.com',
      password: teacherPassword,
      role: 'teacher',
    },
  })

  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher.b@example.com' },
    update: {},
    create: {
      fullName: 'Tran Thi B',
      email: 'teacher.b@example.com',
      password: teacherPassword,
      role: 'teacher',
    },
  })

  const student1 = await prisma.user.upsert({
    where: { email: 'student.c@example.com' },
    update: {},
    create: {
      fullName: 'Le Van C',
      email: 'student.c@example.com',
      password: studentPassword,
      role: 'student',
    },
  })

  const student2 = await prisma.user.upsert({
    where: { email: 'student.d@example.com' },
    update: {},
    create: {
      fullName: 'Pham Thi D',
      email: 'student.d@example.com',
      password: studentPassword,
      role: 'student',
    },
  })

  // Create courses
  const course1 = await prisma.course.upsert({
    where: { courseId: 1 },
    update: {},
    create: {
      courseName: 'Tiếng Anh Giao Tiếp',
      description: 'Khóa học luyện nói và phản xạ giao tiếp cơ bản.',
      level: 'Beginner',
    },
  })

  const course2 = await prisma.course.upsert({
    where: { courseId: 2 },
    update: {},
    create: {
      courseName: 'IELTS Foundation',
      description: 'Khóa học nền tảng luyện thi IELTS.',
      level: 'Intermediate',
    },
  })

  // Create course registrations
  await prisma.courseStudent.upsert({
    where: {
      courseId_studentId: {
        courseId: course1.courseId,
        studentId: student1.userId,
      },
    },
    update: {},
    create: {
      courseId: course1.courseId,
      studentId: student1.userId,
    },
  })

  await prisma.courseStudent.upsert({
    where: {
      courseId_studentId: {
        courseId: course1.courseId,
        studentId: student2.userId,
      },
    },
    update: {},
    create: {
      courseId: course1.courseId,
      studentId: student2.userId,
    },
  })

  await prisma.courseStudent.upsert({
    where: {
      courseId_studentId: {
        courseId: course2.courseId,
        studentId: student1.userId,
      },
    },
    update: {},
    create: {
      courseId: course2.courseId,
      studentId: student1.userId,
    },
  })

  // Create classes
  const class1 = await prisma.class.upsert({
    where: { classId: 1 },
    update: {},
    create: {
      courseId: course1.courseId,
      className: 'Giao Tiếp A1',
      teacherId: teacher1.userId,
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-12-30'),
    },
  })

  const class2 = await prisma.class.upsert({
    where: { classId: 2 },
    update: {},
    create: {
      courseId: course2.courseId,
      className: 'IELTS F1',
      teacherId: teacher2.userId,
      startDate: new Date('2025-10-05'),
      endDate: new Date('2026-01-15'),
    },
  })

  // Create class enrollments
  await prisma.classStudent.upsert({
    where: {
      classId_studentId: {
        classId: class1.classId,
        studentId: student1.userId,
      },
    },
    update: {},
    create: {
      classId: class1.classId,
      studentId: student1.userId,
    },
  })

  await prisma.classStudent.upsert({
    where: {
      classId_studentId: {
        classId: class1.classId,
        studentId: student2.userId,
      },
    },
    update: {},
    create: {
      classId: class1.classId,
      studentId: student2.userId,
    },
  })

  await prisma.classStudent.upsert({
    where: {
      classId_studentId: {
        classId: class2.classId,
        studentId: student1.userId,
      },
    },
    update: {},
    create: {
      classId: class2.classId,
      studentId: student1.userId,
    },
  })

  // Create schedules
  const schedule1 = await prisma.schedule.create({
    data: {
      classId: class1.classId,
      lessonDate: new Date('2025-10-02'),
      startTime: new Date('1970-01-01T18:00:00Z'),
      endTime: new Date('1970-01-01T20:00:00Z'),
      roomOrLink: 'Phòng 101',
    },
  })

  const schedule2 = await prisma.schedule.create({
    data: {
      classId: class1.classId,
      lessonDate: new Date('2025-10-04'),
      startTime: new Date('1970-01-01T18:00:00Z'),
      endTime: new Date('1970-01-01T20:00:00Z'),
      roomOrLink: 'Phòng 101',
    },
  })

  const schedule3 = await prisma.schedule.create({
    data: {
      classId: class2.classId,
      lessonDate: new Date('2025-10-06'),
      startTime: new Date('1970-01-01T19:00:00Z'),
      endTime: new Date('1970-01-01T21:00:00Z'),
      roomOrLink: 'Zoom link: zoom.us/ielts-f1',
    },
  })

  // Create attendance records
  await prisma.attendance.create({
    data: {
      scheduleId: schedule1.scheduleId,
      studentId: student1.userId,
      status: 'present',
    },
  })

  await prisma.attendance.create({
    data: {
      scheduleId: schedule1.scheduleId,
      studentId: student2.userId,
      status: 'absent',
    },
  })

  await prisma.attendance.create({
    data: {
      scheduleId: schedule3.scheduleId,
      studentId: student1.userId,
      status: 'present',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user: admin@example.com / admin123')
  console.log('👨‍🏫 Teacher users: teacher.a@example.com / teacher123')
  console.log('👨‍🎓 Student users: student.c@example.com / student123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
