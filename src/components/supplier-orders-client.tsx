"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Copy, Trash2, ChevronDown, ChevronRight, Package } from 'lucide-react'
import { duplicateSupplierOrder, deleteOrder, updatePaymentStatus } from '@/actions/supplier-orders'
import { useRouter } from 'next/navigation'
import PaymentDialog from '@/components/payment-dialog'
interface SupplierOrdersClientProps {
    initialOrders: any[]
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PARTIAL: 'bg-orange-50 text-orange-700 border-orange-200'
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    ORDERED: 'bg-blue-50 text-blue-600 border-blue-200',
    RECEIVED: 'bg-green-50 text-green-600 border-green-200'
}

export function SupplierOrdersClient({ initialOrders }: SupplierOrdersClientProps) {
    const [orders, setOrders] = useState(initialOrders)
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
    const router = useRouter()
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
    const [selectedOrderId, setSelectedOrderId] = useState<string>('')
    const [selectedOrderTotal, setSelectedOrderTotal] = useState<number>(0)


    const calculateTotal = (items: any[]) => {
        return items.reduce((sum, item) => sum + (item.unitCost || 0) * (item.quantity || 0), 0)
    }

    const handleDuplicate = async (orderId: string) => {
        const result = await duplicateSupplierOrder(orderId)
        if (result.success) {
            router.refresh()
        } else {
            alert(result.error || 'Error al duplicar orden')
        }
    }

    const handleDelete = async (orderId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta orden?')) return

        const result = await deleteOrder(orderId)
        if (result.success) {
            setOrders(orders.filter((o: any) => o.id !== orderId))
            router.refresh()
        } else {
            alert(result.error || 'Error al eliminar orden')
        }
    }

    const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
        setOrders(orders.map((o: any) =>
            o.id === orderId ? { ...o, paymentStatus: newStatus } : o
        ))

        const result = await updatePaymentStatus(orderId, newStatus)
        if (!result.success) {
            router.refresh()
            alert(result.error || 'Error al actualizar estatus de pago')
        }
    }

    const toggleProject = (projectName: string) => {
        const newExpanded = new Set(expandedProjects)
        if (newExpanded.has(projectName)) {
            newExpanded.delete(projectName)
        } else {
            newExpanded.add(projectName)
        }
        setExpandedProjects(newExpanded)
    }

    const expandAll = () => {
        const allProjects = orders.map(o => o.quote?.project_name || 'Sin proyecto')
        setExpandedProjects(new Set(allProjects))
    }

    const collapseAll = () => {
        setExpandedProjects(new Set())
    }

    // Group orders by project
    const groupedByProject = orders.reduce((acc: Record<string, any[]>, order: any) => {
        const projectName = order.quote?.project_name || 'Sin proyecto'
        if (!acc[projectName]) acc[projectName] = []
        acc[projectName].push(order)
        return acc
    }, {})

    // Calculate totals per project
    const projectData = Object.entries(groupedByProject).map(([projectName, projectOrders]) => {
        const totalCost = projectOrders.reduce((sum, order) => {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])
            return sum + calculateTotal(Array.isArray(items) ? items : [])
        }, 0)
        const clientName = projectOrders[0]?.quote?.client?.company || projectOrders[0]?.quote?.client?.name || 'Sin cliente'
        return { projectName, orders: projectOrders, totalCost, clientName }
    })

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ordenes de Compra</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">Historial completo de pedidos a proveedores</p>
                    </div>
                    <div className="flex gap-2 text-xs">
                        <button onClick={expandAll} className="text-primary hover:underline">Expandir todos</button>
                        <span className="text-muted-foreground">|</span>
                        <button onClick={collapseAll} className="text-primary hover:underline">Colapsar todos</button>
                    </div>
                </header>

                {/* Grouped by Project */}
                <div className="space-y-4">
                    {projectData.length === 0 ? (
                        <div className="bg-card border rounded-xl shadow-sm p-8 text-center text-muted-foreground">
                            No hay ordenes registradas.
                        </div>
                    ) : (
                        projectData.map(({ projectName, orders: projectOrders, totalCost, clientName }) => {
                            const isExpanded = expandedProjects.has(projectName)

                            return (
                                <div key={projectName} className="border rounded-xl bg-card shadow-sm overflow-hidden">
                                    {/* Project Header */}
                                    <button
                                        onClick={() => toggleProject(projectName)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? (
                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Package className="h-5 w-5 text-primary" />
                                                <div>
                                                    <h2 className="text-lg font-bold text-foreground">{projectName}</h2>
                                                    <span className="text-sm text-muted-foreground">{clientName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                                {projectOrders.length} orden{projectOrders.length !== 1 ? 'es' : ''}
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                ${totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </button>

                                    {/* Orders Table */}
                                    {isExpanded && (
                                        <div className="border-t">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-muted border-b">
                                                        <tr>
                                                            <th className="py-3 px-4 text-left font-medium whitespace-nowrap">Fecha</th>
                                                            <th className="py-3 px-4 text-left font-medium whitespace-nowrap">Proveedor</th>
                                                            <th className="py-3 px-4 text-left font-medium whitespace-nowrap">Estado</th>
                                                            <th className="py-3 px-4 text-left font-medium whitespace-nowrap">Pago</th>
                                                            <th className="py-3 px-4 text-right font-medium whitespace-nowrap">Total</th>
                                                            <th className="py-3 px-4 text-center font-medium whitespace-nowrap">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y">
                                                        {projectOrders.map((order: any) => {
                                                            const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items as any[] || [])
                                                            const total = calculateTotal(Array.isArray(items) ? items : [])

                                                            return (
                                                                <tr key={order.id} className="hover:bg-muted/50">
                                                                    <td className="py-3 px-4 whitespace-nowrap">
                                                                        {new Date(order.createdAt).toLocaleDateString('es-MX')}
                                                                    </td>
                                                                    <td className="py-3 px-4 font-medium whitespace-nowrap">
                                                                        <Link href={`/suppliers/${order.supplierId}`} className="hover:underline">
                                                                            {order.supplier.name}
                                                                        </Link>
                                                                    </td>
                                                                    <td className="py-3 px-4 whitespace-nowrap">
                                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                                            {order.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-3 px-4 whitespace-nowrap">
                                                                        <select
                                                                            value={order.paymentStatus || 'PENDING'}
                                                                            onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                                                                            className={`text-[10px] px-2 py-1 rounded-full border font-medium ${PAYMENT_STATUS_COLORS[order.paymentStatus || 'PENDING']}`}
                                                                        >
                                                                            <option value="PENDING">Pendiente</option>
                                                                            <option value="PAID">Pagado</option>
                                                                            <option value="PARTIAL">Parcial</option>
                                                                        </select>
                                                                    </td>
                                                                    <td className="py-3 px-4 text-right font-medium whitespace-nowrap">
                                                                        ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                                    </td>
                                                                    <td className="py-3 px-4">
                                                                        <div className="flex justify-center gap-1">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                className="h-8 w-8 p-0"
                                                                                onClick={() => handleDuplicate(order.id)}
                                                                                title="Duplicar orden"
                                                                            >
                                                                                <Copy className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                                                onClick={() => handleDelete(order.id)}
                                                                                title="Eliminar orden"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                            {order.paymentStatus !== 'PAID' && (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="default"
                                                                                    className="h-8 w-auto px-2"
                                                                                    onClick={() => {
                                                                                        setSelectedOrderId(order.id);
                                                                                        setSelectedOrderTotal(total);
                                                                                        setPaymentDialogOpen(true);
                                                                                    }}
                                                                                    title="Registrar Pago"
                                                                                >
                                                                                    Registrar Pago
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
            <PaymentDialog
                open={paymentDialogOpen}
                setOpen={setPaymentDialogOpen}
                orderId={selectedOrderId}
                orderTotal={selectedOrderTotal}
            />
        </div>
    )
}
