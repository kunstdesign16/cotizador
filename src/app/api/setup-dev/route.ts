import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const bcrypt = await import('bcryptjs')
        const email = 'admin@kunst.mx'
        const hashedPassword = await bcrypt.hash('password123', 10)

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'admin'
            },
            create: {
                email,
                name: 'Dev Admin',
                password: hashedPassword,
                role: 'admin'
            }
        })

        return NextResponse.json({
            success: true,
            message: 'User created/updated successfully',
            user: { email: user.email, role: user.role }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
