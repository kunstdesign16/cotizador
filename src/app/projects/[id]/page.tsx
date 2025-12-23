import { notFound } from 'next/navigation'
import { ProjectHubClient } from '@/components/project-hub-client'

export const dynamic = 'force-dynamic'

interface ProjectPageProps {
    params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params

    try {
        const { prisma } = await import('@/lib/prisma')

        const project = await (prisma as any).project.findUnique({
            where: { id },
            include: {
                client: true,
                user: true,
                quotes: {
                    include: { items: true },
                    orderBy: { version: 'desc' }
                },
                supplierOrders: {
                    include: {
                        supplier: true,
                        expenses: true
                    }
                },
                supplierTasks: {
                    include: { supplier: true }
                },
                incomes: true,
                expenses: {
                    include: { supplier: true }
                }
            } as any
        })

        if (!project) {
            notFound()
        }

        const serializedProject = JSON.parse(JSON.stringify(project))

        return <ProjectHubClient project={serializedProject} />
    } catch (error: any) {
        console.error('Error in ProjectPage:', error)
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-xl font-bold text-red-600">Error en el Hub del Proyecto</h1>
                <p className="text-sm text-muted-foreground">{error.message}</p>
                <div className="p-4 bg-muted rounded text-[10px] font-mono whitespace-pre-wrap text-left max-h-[200px] overflow-auto">
                    {error.stack}
                </div>
            </div>
        )
    }
}
