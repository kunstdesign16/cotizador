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
import { DollarSign, Wallet } from 'lucide-react'
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
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('TRANSFER')

    // Calculation
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])
    const totalOrdered = Array.isArray(items) ? items.reduce((sum: number, item: any) =>
        sum + (item.unitCost || 0) * (item.quantity || 0), 0
    ) : 0
    const totalPaid = order.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0
    const pendingBalance = totalOrdered - totalPaid

    const handleSubmit = async () => {
        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error('Ingrese un monto válido')
            return
        }

        if (numAmount > pendingBalance + 0.01) {
            toast.error(`El monto excede el saldo pendiente ($${pendingBalance.toFixed(2)})`)
            return
        }

        setIsSubmitting(true)
        try {
            const res = await registerOrderPayment(order.id, numAmount, description, paymentMethod)
            if (res.success) {
                toast.success('Pago registrado correctamente')
                setOpen(false)
                setAmount('')
                setDescription('')
                router.refresh()
            } else {
                toast.error(res.error || 'Error al registrar pago')
            }
        } catch (error) {
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
                        <div className="space-y-2">
                            <Label htmlFor="amount">Monto a Pagar</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    className="pl-7"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    step="0.01"
                                />
                                <Button
                                    className="absolute right-1 top-1 h-7 text-[10px] px-2"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setAmount(pendingBalance.toFixed(2))}
                                >
                                    Pagar todo
                                </Button>
                            </div>
                        </div>

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
                    <Button onClick={handleSubmit} disabled={isSubmitting || !amount} className="gap-2">
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
