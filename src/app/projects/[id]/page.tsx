import { notFound } from 'next/navigation'
import { ProjectHubClient } from '@/components/project-hub-client'

export const dynamic = 'force-dynamic'

interface ProjectPageProps {
    params: { id: string }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = params
    const { prisma } = await import('@/lib/prisma')

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            client: true,
            user: true,
            quotes: {
                include: { items: true },
                orderBy: { version: 'desc' }
            },
            supplierOrders: {
                include: { supplier: true }
            },
            supplierTasks: {
                include: { supplier: true }
            },
            incomes: true,
            expenses: {
                include: { supplier: true }
            }
        }
    })

    if (!project) {
        notFound()
    }

    const serializedProject = JSON.parse(JSON.stringify(project))

    return <ProjectHubClient project={serializedProject} />
}
