"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { FileText, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreateProjectDialog } from './create-project-dialog'

interface ProjectsPageClientProps {
    initialProjects: any[]
    clients: any[]
}

const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Todos (Activos)' },
    { value: 'COTIZANDO', label: 'Cotizando' },
    { value: 'APROBADO', label: 'Aprobado' },
    { value: 'EN_PRODUCCION', label: 'En producción' },
    { value: 'ENTREGADO', label: 'Entregado' },
    { value: 'CANCELADO', label: 'Cancelado' }
]

export function ProjectsPageClient({ initialProjects, clients }: ProjectsPageClientProps) {
    const [filter, setFilter] = useState('ALL')

    const filteredProjects = filter === 'ALL'
        ? initialProjects.filter((p: any) => p.status !== 'CANCELADO')
        : initialProjects.filter((p: any) => p.status === filter)

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
                        <p className="text-muted-foreground">Panel de gestión y control financiero</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/quotes/new">
                            <Button variant="outline" className="gap-2">
                                <FileText className="h-4 w-4" /> Nueva Cotización
                            </Button>
                        </Link>
                        <CreateProjectDialog clients={clients} />
                    </div>
                </header>

                {/* Status Filter */}
                <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((status) => (
                        <Button
                            key={status.value}
                            variant={filter === status.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter(status.value)}
                        >
                            {status.label}
                        </Button>
                    ))}
                </div>

                {/* Projects Table */}
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                    {filteredProjects.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            No hay proyectos en esta vista.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Proyecto</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Última Actividad</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase">Total Cotizado</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Estatus</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredProjects.map((project: any) => (
                                        <tr key={project.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{project.name}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">{project.quotes?.[0]?.project_name || 'Sin cotización'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{project?.client?.company || project?.client?.name || 'Sin cliente'}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {new Date(project.updatedAt).toLocaleDateString('es-MX')}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                ${project.totalCotizado?.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className={cn(
                                                    project.status === 'APROBADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        project.status === 'PRODUCCION' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-gray-50 text-gray-700 border-gray-200'
                                                )}>
                                                    {STATUS_OPTIONS.find(o => o.value === project.status)?.label || project.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Link href={`/projects/${project.id}`}>
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
