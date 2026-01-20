import { cookies } from 'next/headers'

export async function getCurrentUser() {
    const cookieStore = await cookies()
    const email = cookieStore.get('user_email')?.value
    const _role = cookieStore.get('user_role')?.value

    if (!email) return null

    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true, email: true, name: true }
    })

    return user
}
