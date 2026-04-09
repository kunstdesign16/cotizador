
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findUnique({ where: { email: 'direccion@kunstdesign.com.mx' } })
    if (!user) { console.log('User not found'); return }
    const match = await bcrypt.compare('Pkbuboso16', user.password)
    console.log('Password hash prefix:', user.password.substring(0, 20) + '...')
    console.log('Password matches:', match)
    if (!match) {
        const hash = await bcrypt.hash('Pkbuboso16', 10)
        await prisma.user.update({ where: { email: 'direccion@kunstdesign.com.mx' }, data: { password: hash } })
        console.log('Password RESET to Pkbuboso16')
    }
}

main().finally(() => prisma.$disconnect())
