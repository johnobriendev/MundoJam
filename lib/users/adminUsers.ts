import { prisma } from '@/lib/prisma'

export async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { hostedJams: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateUserRole(userId: string, role: 'USER' | 'ADMIN', adminId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  await prisma.adminAction.create({
    data: {
      adminId,
      actionType: 'UPDATE_USER_ROLE',
      targetType: 'USER',
      targetId: userId,
      note: role,
    },
  })

  return user
}
