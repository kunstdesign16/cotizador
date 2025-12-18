
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'kunstdesign16@gmail.com'
    const newPassword = 'kunstdesign_temp' // Temporary password

    console.log(`Resetting password for ${email}...`)

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'admin',
                isActive: true
            },
            create: {
                email,
                name: 'Administrador',
                password: hashedPassword,
                role: 'admin',
                isActive: true
            }
        })

        console.log(`Success! User ${user.email} updated.`)
        console.log(`New password: ${newPassword}`)
        console.log(`Role: ${user.role}`)
    } catch (e) {
        console.error('Error updating user:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
