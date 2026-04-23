import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashed = await bcrypt.hash('admin123', 12)

  await prisma.user.upsert({
    where: { email: 'admin@mundojam.com' },
    update: {},
    create: {
      email: 'admin@mundojam.com',
      password: hashed,
      name: 'Admin',
      role: 'ADMIN',
      isDiscoverable: false,
    },
  })

  console.log('Seeded admin user: admin@mundojam.com / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
