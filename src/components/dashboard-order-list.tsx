"use client"

import Link from 'next/link'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateSupplierOrderStatus, updateSupplierOrderPaymentStatus } from "@/actions/supplier-orders"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import PaymentDialog from '@/components/payment-dialog'

interface Order {
    id: string
    supplier: {
        id: string
        name: string
    }
    createdAt: Date
    items: any
    status: 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED'
    paymentStatus: 'PENDING' | 'PAID' | 'PARTIAL'
}

interface DashboardOrderListProps {
    orders: Order[]
}

const statusOptions = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'ORDERED', label: 'Pedida' },
    { value: 'RECEIVED', label: 'Recibida' },
    { value: 'CANCELLED', label: 'Cancelada' },
]

export function DashboardOrderList({ orders }: DashboardOrderListProps) {
    const router = useRouter()
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
    const [selectedOrderId, setSelectedOrderId] = useState<string>('')
    const [selectedOrderTotal, setSelectedOrderTotal] = useState<number>(0)

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await updateSupplierOrderStatus(orderId, newStatus as any)
            toast.success("Estatus actualizado")
            router.refresh()
        } catch {
            toast.error("Error al actualizar estatus")
        }
    }

    const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
        try {
            await updateSupplierOrderPaymentStatus(orderId, newPaymentStatus as any)
            toast.success("Estatus de pago actualizado")
            // Manually refresh to update totals if needed, or let router handle it
            router.refresh()
        } catch {
            toast.error("Error al actualizar pago")
        }
    }

    if (orders.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground text-sm">
                No hay órdenes registradas.
            </div>
        )
    }

    return (
        <div className="divide-y">
            {orders.map((order) => {
                // Handle parsing items if string (Prisma sometimes returns Json as string in client components depending on serialization)
                // In this case, we passed serialized data from server component, so it should be fine, but good to be safe if types vary
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items as any[])
                const total = Array.isArray(items) ? items.reduce((sum: number, item: any) =>
                    sum + (item.unitCost || 0) * (item.quantity || 0), 0
                ) : 0

                return (
                    <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors block">
                        <div className="flex justify-between items-start mb-2">
                            <Link href={`/suppliers/${order.supplier.id}?orderId=${order.id}`} className="block">
                                <span className="font-semibold text-sm block truncate w-[180px]" title={Array.isArray(items) ? items.map((i: any) => i.name || i.code).join(', ') : ''}>
                                    {Array.isArray(items) && items.length > 0
                                        ? items.map((i: any) => `${i.quantity}x ${i.name || i.code}`).join(', ')
                                        : 'Sin conceptos'}
                                </span>
                                <div className="flex flex-col gap-0.5 mt-1">
                                    <span className="text-xs font-medium text-foreground/80">{order.supplier.name}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {new Date(order.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                    </span>
                                </div>
                            </Link>
                            <div className="text-right">
                                <div className="font-medium text-sm">
                                    ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3 items-center justify-end">
                            <div className="w-[110px]">
                                <Select
                                    defaultValue={order.status}
                                    onValueChange={(val: string) => handleStatusChange(order.id, val)}
                                >
                                    <SelectTrigger className={`h-6 text-[10px] border-0 px-2 rounded-full
                                        ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                                            order.status === 'ORDERED' ? 'bg-blue-50 text-blue-600' :
                                                order.status === 'RECEIVED' ? 'bg-green-50 text-green-600' :
                                                    'bg-gray-100 text-gray-600'
                                        }`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-[100px]">
                                <Select
                                    defaultValue={order.paymentStatus}
                                    onValueChange={(val: string) => handlePaymentStatusChange(order.id, val)}
                                >
                                    <SelectTrigger className={`h-6 text-[10px] border-0 px-2 rounded-full
                                        ${order.paymentStatus === 'PAID'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : order.paymentStatus === 'PARTIAL'
                                                ? 'bg-orange-50 text-orange-700'
                                                : 'bg-yellow-50 text-yellow-700'
                                        }`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pendiente</SelectItem>
                                        <SelectItem value="PARTIAL">Parcial</SelectItem>
                                        <SelectItem value="PAID">Pagado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2"
                                onClick={() => {
                                    setSelectedOrderId(order.id);
                                    setSelectedOrderTotal(total);
                                    setPaymentDialogOpen(true);
                                }}
                            >
                                Pagar
                            </Button>
                        </div>
                    </div>
                )
            })}

            <PaymentDialog
                open={paymentDialogOpen}
                setOpen={setPaymentDialogOpen}
                orderId={selectedOrderId}
                orderTotal={selectedOrderTotal}
            />
        </div>
    )
}
