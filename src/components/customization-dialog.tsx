'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { calculateCustomizationCost, getCustomizationServices } from '@/actions/customization'
import { Loader2, Calculator, CheckCircle2 } from 'lucide-react'

interface CustomizationDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (itemData: any) => void
    defaultQuantity?: number
}

export default function CustomizationDialog({ isOpen, onClose, onConfirm, defaultQuantity = 1 }: CustomizationDialogProps) {
    const [services, setServices] = useState<any[]>([])
    const [selectedServiceName, setSelectedServiceName] = useState<string>('')
    const [quantity, setQuantity] = useState<number>(defaultQuantity)
    const [time, setTime] = useState<number>(1) // Default 1 min
    const [loading, setLoading] = useState(false)
    const [calculating, setCalculating] = useState(false)
    const [result, setResult] = useState<any>(null)

    useEffect(() => {
        if (isOpen) {
            loadServices()
        }
    }, [isOpen])

    const loadServices = async () => {
        setLoading(true)
        try {
            const data = await getCustomizationServices()
            setServices(data)
            if (data.length > 0) {
                setSelectedServiceName(data[0].name)
            }
        } catch (error) {
            console.error('Error loading services:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCalculate = async () => {
        if (!selectedServiceName) return
        setCalculating(true)
        try {
            const data = await calculateCustomizationCost({
                serviceName: selectedServiceName,
                quantity: quantity,
                timeInMinutes: time
            })
            setResult(data)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setCalculating(false)
        }
    }

    // Auto-calculate when inputs change
    useEffect(() => {
        if (selectedServiceName && quantity > 0) {
            handleCalculate()
        }
    }, [selectedServiceName, quantity, time])

    const handleConfirm = () => {
        if (!result) return

        const selectedService = services.find(s => s.name === selectedServiceName)

        onConfirm({
            concept: `${selectedService?.label} x${quantity} (${time} min)`,
            quantity: quantity,
            internal_unit_cost: result.unitCost,
            profit_margin: result.breakdown.margin,
            unit_cost: result.unitPrice,
            subtotal: result.total,
            costBreakdown: result.breakdown
        })
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        Personalización Automática
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="service">Tipo de Servicio</Label>
                            <Select value={selectedServiceName} onValueChange={setSelectedServiceName}>
                                <SelectTrigger id="service">
                                    <SelectValue placeholder="Selecciona un servicio" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map(s => (
                                        <SelectItem key={s.id} value={s.name}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="qty">Cantidad</Label>
                                <Input
                                    id="qty"
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    min={1}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="time">Tiempo (Minutos)</Label>
                                <Input
                                    id="time"
                                    type="number"
                                    value={time}
                                    onChange={(e) => setTime(Number(e.target.value))}
                                    min={0}
                                    step={0.1}
                                />
                            </div>
                        </div>

                        {result && (
                            <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Precio Unitario:</span>
                                    <span className="font-bold text-lg">${result.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-primary/10">
                                    <span className="text-sm font-bold">Total Línea:</span>
                                    <span className="font-black text-xl text-primary">${result.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>
                                {result.breakdown.setupFee > 0 && (
                                    <p className="text-[10px] text-amber-600 font-medium text-right">
                                        * Incluye Setup Fee de ${result.breakdown.setupFee} por baja cantidad
                                    </p>
                                )}
                            </div>
                        )}

                        {calculating && (
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Recalculando...
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleConfirm} disabled={!result || loading || calculating} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Agregar al Cotizador
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
