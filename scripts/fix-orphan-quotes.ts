import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixOrphanQuotes() {
    console.log('🔍 Buscando cotizaciones huérfanas...')

    // Encontrar cotizaciones sin projectId
    const orphanQuotes = await (prisma as any).quote.findMany({
        where: { projectId: null },
        include: { client: true }
    })

    console.log(`📊 Encontradas ${orphanQuotes.length} cotizaciones sin proyecto`)

    if (orphanQuotes.length === 0) {
        console.log('✅ No hay cotizaciones huérfanas. Todo está correcto.')
        return
    }

    for (const quote of orphanQuotes) {
        console.log(`\n📝 Procesando cotización: ${quote.project_name} (${quote.id})`)
        console.log(`   Cliente: ${quote.client.name}`)
        console.log(`   Fecha: ${quote.date.toISOString().split('T')[0]}`)

        // Buscar proyecto con el mismo nombre y cliente
        const matchingProject = await (prisma as any).project.findFirst({
            where: {
                name: quote.project_name,
                clientId: quote.clientId
            }
        })

        if (matchingProject) {
            // Vincular cotización al proyecto
            await (prisma as any).quote.update({
                where: { id: quote.id },
                data: { projectId: matchingProject.id }
            })
            console.log(`   ✅ Vinculada al proyecto existente: ${matchingProject.id}`)
        } else {
            // Crear proyecto nuevo
            const newProject = await (prisma as any).project.create({
                data: {
                    name: quote.project_name,
                    description: `Proyecto creado automáticamente desde cotización ${quote.id}`,
                    status: quote.isApproved ? 'APROBADO' : 'COTIZANDO',
                    clientId: quote.clientId
                }
            })

            // Vincular cotización al nuevo proyecto
            await (prisma as any).quote.update({
                where: { id: quote.id },
                data: { projectId: newProject.id }
            })
            console.log(`   ✅ Creado nuevo proyecto: ${newProject.id}`)
        }
    }

    console.log('\n✨ Migración completada')

    // Verificación final
    const remainingOrphans = await (prisma as any).quote.count({
        where: { projectId: null }
    })

    console.log(`\n📊 Verificación final: ${remainingOrphans} cotizaciones sin proyecto`)

    if (remainingOrphans === 0) {
        console.log('✅ Todas las cotizaciones están correctamente vinculadas')
    } else {
        console.log('⚠️  Todavía hay cotizaciones sin proyecto. Revisar manualmente.')
    }
}

fixOrphanQuotes()
    .catch((error) => {
        console.error('❌ Error en migración:', error)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
