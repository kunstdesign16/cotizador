
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const projectName = 'CALENDARIO DE PARED (1400)'

    console.log(`Checking project and quotes for: ${projectName}`)

    const project = await (prisma as any).project.findFirst({
        where: { name: { contains: projectName, mode: 'insensitive' } },
        include: {
            quotes: {
                select: {
                    id: true,
                    project_name: true,
                    status: true,
                    isApproved: true,
                    version: true
                }
            }
        }
    })

    if (!project) {
        console.log('Project not found')
        return
    }

    console.log('Project Status:', project.status)
    console.log('Project ID:', project.id)
    console.log('Quotes:')
    project.quotes.forEach((q: any) => {
        console.log(`- ID: ${q.id}, Name: ${q.project_name}, Status: ${q.status}, isApproved: ${q.isApproved}, Version: ${q.version}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
