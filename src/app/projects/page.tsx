import { prisma } from '@/lib/prisma'
import { ProjectsPageClient } from '@/components/projects-page-client'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {

    const projects = await prisma.project.findMany({
        include: {
            client: true,
            quotes: {
                orderBy: { version: 'desc' },
                take: 1
            }
        },
        orderBy: { updatedAt: 'desc' }
    })

    const clients = await prisma.client.findMany({
        orderBy: { name: 'asc' }
    })

    const serializedProjects = JSON.parse(JSON.stringify(projects))
    const serializedClients = JSON.parse(JSON.stringify(clients))

    return <ProjectsPageClient initialProjects={serializedProjects} clients={serializedClients} />
}
