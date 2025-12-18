import { UsersClient } from '@/components/users-client'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const { prisma } = await import('@/lib/prisma')

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    })

    const serializedUsers = JSON.parse(JSON.stringify(users))

    return <UsersClient initialUsers={serializedUsers} />
}
