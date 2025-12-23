'use client'

import { AlertTriangle, Clock, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ControlListsProps {
    negativeUtilityProjects: any[]
    pendingOrders: any[]
    agedProjects: any[]
}

export function ControlLists({ negativeUtilityProjects, pendingOrders, agedProjects }: ControlListsProps) {
    return (
        <div className="grid gap-6 xl:grid-cols-3">
            {/* Proyectos con Utilidad Negativa */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h3 className="font-semibold text-lg">Utilidad Negativa</h3>
                    <Badge variant="destructive">{negativeUtilityProjects.length}</Badge>
                </div>
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    {negativeUtilityProjects.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">No hay proyectos con balance negativo.</div>
                    ) : (
                        <div className="divide-y">
                            {negativeUtilityProjects.map((p) => (
                                <div key={p.id} className="p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-medium text-sm truncate max-w-[180px]">{p.name}</h4>
                                        <span className="text-xs font-bold text-red-600">
                                            -${(p.totalEgresado - p.totalIngresado).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase">{p.client?.name || 'Varios'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Órdenes con Saldo Pendiente */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold text-lg">Saldos Pendientes (Prov)</h3>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                        {pendingOrders.length}
                    </Badge>
                </div>
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    {pendingOrders.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">No hay órdenes con saldos pendientes.</div>
                    ) : (
                        <div className="divide-y">
                            {pendingOrders.map((o) => (
                                <div key={o.id} className="p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-medium text-sm truncate max-w-[180px]">{o.supplier?.name}</h4>
                                        <span className="text-xs font-bold text-amber-600">
                                            ${o.balance.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-muted-foreground">Total: ${o.total.toLocaleString()}</span>
                                        <span className="text-muted-foreground">Vence: {o.expectedDate ? new Date(o.expectedDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Proyectos Antiguos (>30 días) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-lg">Proyectos Estancados</h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                        {agedProjects.length}
                    </Badge>
                </div>
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    {agedProjects.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">No hay proyectos estancados.</div>
                    ) : (
                        <div className="divide-y">
                            {agedProjects.map((p) => (
                                <div key={p.id} className="p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-medium text-sm truncate max-w-[180px]">{p.name}</h4>
                                        <Badge variant="outline" className="text-[9px] uppercase">{p.status}</Badge>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Abierto hace {formatDistanceToNow(new Date(p.createdAt), { locale: es })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
