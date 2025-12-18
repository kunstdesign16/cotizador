import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { UserProfileForm } from "@/components/user-profile-form"

export default async function SettingsProfilePage() {
    const { prisma } = await import('@/lib/prisma')
    const cookieStore = await cookies() // Awaiting cookies() per Next.js 15+ / recent warnings
    const userEmail = cookieStore.get('user_email')?.value

    if (!userEmail) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { email: userEmail }
    })

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Configuración de Cuenta</h1>
            <UserProfileForm user={{
                name: user.name || '',
                email: user.email,
                role: user.role
            }} />
        </div>
    )
}
