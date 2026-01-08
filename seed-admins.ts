import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const admins = [
        { email: 'direccion@kunstdesign.com.mx', name: 'Dirección Kunst Design' },
        { email: 'mayelam@kunstdesign.com.mx', name: 'Mayela M.' }
    ]

    const tempPassword = 'KunstDesign2024!'
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    console.log('Creating admin accounts...')

    for (const admin of admins) {
        const user = await prisma.user.upsert({
            where: { email: admin.email },
            update: {
                role: 'admin',
                isActive: true
            },
            create: {
                email: admin.email,
                name: admin.name,
                password: hashedPassword,
                role: 'admin',
                isActive: true
            }
        })
        console.log(`User ${user.email} created/updated as ADMIN.`)
    }

    console.log('-----------------------------------')
    console.log('Temporary Password: ', tempPassword)
    console.log('-----------------------------------')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
