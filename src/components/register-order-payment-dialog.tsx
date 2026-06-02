'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DollarSign, Wallet, Receipt } from 'lucide-react'
import { registerOrderPayment } from '@/actions/supplier-orders'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface RegisterOrderPaymentDialogProps {
    order: any
}

export function RegisterOrderPaymentDialog({ order }: RegisterOrderPaymentDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [subtotal, setSubtotal] = useState('')
    const [ivaAmount, setIvaAmount] = useState('')
    const [description, setDescription] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('TRANSFER')

    // Calculation — totalOrdered is the subtotal of order items (no IVA on costs)
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])
    const totalOrdered = Array.isArray(items) ? items.reduce((sum: number, item: any) =>
        sum + (item.unitCost || 0) * (item.quantity || 0), 0
    ) : 0
    // totalPaid is the sum of expense.amount (subtotals, sin IVA)
    const totalPaid = order.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0
    const pendingBalance = totalOrdered - totalPaid

    // Derived values from input
    const numSubtotal = parseFloat(subtotal) || 0
    const numIva = parseFloat(ivaAmount) || 0
    const totalConIva = numSubtotal + numIva

    const handleSubtotalChange = (val: string) => {
        setSubtotal(val)
        const n = parseFloat(val) || 0
        setIvaAmount((n * 0.16).toFixed(2))
    }

    const handlePayAll = () => {
        const sub = pendingBalance
        setSubtotal(sub.toFixed(2))
        setIvaAmount((sub * 0.16).toFixed(2))
    }

    const handleSubmit = async () => {
        if (isNaN(numSubtotal) || numSubtotal <= 0) {
            toast.error('Ingrese un subtotal válido')
            return
        }

        if (numSubtotal > pendingBalance + 0.01) {
            toast.error(`El subtotal excede el saldo pendiente ($${pendingBalance.toFixed(2)})`)
            return
        }

        setIsSubmitting(true)
        try {
            const res = await registerOrderPayment(order.id, numSubtotal, numIva, description, paymentMethod)
            if (res.success) {
                toast.success('Pago registrado correctamente')
                setOpen(false)
                setSubtotal('')
                setIvaAmount('')
                setDescription('')
                router.refresh()
            } else {
                toast.error(res.error || 'Error al registrar pago')
            }
        } catch {
            toast.error('Error de red al registrar pago')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 gap-1 border-primary/20 text-primary hover:bg-primary/5">
                    <DollarSign className="h-3 w-4" />
                    Registrar Pago
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar Pago a Proveedor</DialogTitle>
                    <DialogDescription>
                        Ingrese el monto para la orden de <strong>{order.supplier?.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Balance summary */}
                    <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg border">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Saldo Pendiente</p>
                            <p className="text-2xl font-bold text-primary">
                                ${pendingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="text-right space-y-1 text-xs">
                            <p className="text-muted-foreground">Total Orden: ${totalOrdered.toLocaleString('es-MX')}</p>
                            <p className="text-muted-foreground">Pagado: ${totalPaid.toLocaleString('es-MX')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Subtotal field */}
                        <div className="space-y-2">
                            <Label htmlFor="subtotal">Subtotal (sin IVA)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input
                                    id="subtotal"
                                    type="number"
                                    placeholder="0.00"
                                    className="pl-7"
                                    value={subtotal}
                                    onChange={(e) => handleSubtotalChange(e.target.value)}
                                    step="0.01"
                                />
                                <Button
                                    className="absolute right-1 top-1 h-7 text-[10px] px-2"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handlePayAll}
                                    type="button"
                                >
                                    Pagar todo
                                </Button>
                            </div>
                        </div>

                        {/* IVA field */}
                        <div className="space-y-2">
                            <Label htmlFor="iva">IVA (16%)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input
                                    id="iva"
                                    type="number"
                                    placeholder="0.00"
                                    className="pl-7"
                                    value={ivaAmount}
                                    onChange={(e) => setIvaAmount(e.target.value)}
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {/* Total display */}
                        {numSubtotal > 0 && (
                            <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                    <Receipt className="h-4 w-4" />
                                    Total a Pagar (con IVA)
                                </div>
                                <span className="text-lg font-bold text-primary">
                                    ${totalConIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}

                        {/* Payment method */}
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Método de Pago</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TRANSFER">Transferencia</SelectItem>
                                    <SelectItem value="CASH">Efectivo</SelectItem>
                                    <SelectItem value="CARD">Tarjeta</SelectItem>
                                    <SelectItem value="CHECK">Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción (opcional)</Label>
                            <Input
                                id="description"
                                placeholder="Ej. Pago inicial, liquidación..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !subtotal} className="gap-2">
                        {isSubmitting ? 'Registrando...' : (
                            <>
                                <Wallet className="h-4 w-4" />
                                Confirmar Pago
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
