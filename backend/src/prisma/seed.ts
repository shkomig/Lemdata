import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Define UserRole enum locally as fallback
enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  ADMIN = 'ADMIN',
}

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lemdata.com' },
    update: {},
    create: {
      email: 'admin@lemdata.com',
      password: adminPassword,
      name: 'מנהל מערכת',
      role: 'ADMIN' as any,
    },
  })
  console.log('✅ Created admin user:', admin.email)

  // Create teacher user
  const teacherPassword = await bcrypt.hash('teacher123', 10)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@lemdata.com' },
    update: {},
    create: {
      email: 'teacher@lemdata.com',
      password: teacherPassword,
      name: 'מורה דוגמה',
      role: 'TEACHER' as any,
    },
  })
  console.log('✅ Created teacher user:', teacher.email)

  // Create student user
  const studentPassword = await bcrypt.hash('student123', 10)
  const student = await prisma.user.upsert({
    where: { email: 'student@lemdata.com' },
    update: {},
    create: {
      email: 'student@lemdata.com',
      password: studentPassword,
      name: 'תלמיד דוגמה',
      role: 'STUDENT' as any,
    },
  })
  console.log('✅ Created student user:', student.email)

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




