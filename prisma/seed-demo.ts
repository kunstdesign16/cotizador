import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Iniciando Instalación Limpia ---')

    // 1. Crear Usuario Admin único para acceso inicial
    const admin = await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {},
        create: {
            email: 'admin@test.com',
            name: 'Usuario Test',
            password: 'password123',
            role: 'admin'
        },
    })
    console.log('Usuario de acceso inicial creado:', admin.email)
    console.log('Password: password123')
    console.log('\n--- Instalación Limpia Completada ---')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
