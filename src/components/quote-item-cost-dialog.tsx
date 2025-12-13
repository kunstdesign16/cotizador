'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type CostBreakdown = {
    cost_article: number
    cost_workforce: number
    cost_packaging: number
    cost_transport: number
    cost_equipment: number
    cost_other: number
}

interface QuoteItemCostDialogProps {
    isOpen: boolean
    onClose: () => void
    title: string
    initialValues: CostBreakdown
    onSave: (values: CostBreakdown) => void
}

export default function QuoteItemCostDialog({ isOpen, onClose, title, initialValues, onSave }: QuoteItemCostDialogProps) {
    const [values, setValues] = useState<CostBreakdown>(initialValues)

    useEffect(() => {
        if (isOpen) {
            setValues(initialValues)
        }
    }, [isOpen, initialValues])

    const total = (values.cost_article || 0) + (values.cost_workforce || 0) + (values.cost_packaging || 0) + (values.cost_transport || 0) + (values.cost_equipment || 0) + (values.cost_other || 0)

    const handleChange = (field: keyof CostBreakdown, val: string) => {
        setValues(prev => ({ ...prev, [field]: Number(val) }))
    }

    const handleSave = () => {
        onSave(values)
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
                    >
                        <div className="bg-background border border-border rounded-xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h3 className="font-semibold text-lg">{title}</h3>
                                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">1. Costo Artículo</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                                <Input
                                                    type="number"
                                                    value={values.cost_article || ''}
                                                    onChange={e => handleChange('cost_article', e.target.value)}
                                                    className="pl-7"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">2. Mano de Obra</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                                <Input
                                                    type="number"
                                                    value={values.cost_workforce || ''}
                                                    onChange={e => handleChange('cost_workforce', e.target.value)}
                                                    className="pl-7"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">3. Empaque</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                                <Input
                                                    type="number"
                                                    value={values.cost_packaging || ''}
                                                    onChange={e => handleChange('cost_packaging', e.target.value)}
                                                    className="pl-7"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">4. Transporte</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                                <Input
                                                    type="number"
                                                    value={values.cost_transport || ''}
                                                    onChange={e => handleChange('cost_transport', e.target.value)}
                                                    className="pl-7"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">5. Equipos / Insumos</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                                <Input
                                                    type="number"
                                                    value={values.cost_equipment || ''}
                                                    onChange={e => handleChange('cost_equipment', e.target.value)}
                                                    className="pl-7"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">6. Otros</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                                <Input
                                                    type="number"
                                                    value={values.cost_other || ''}
                                                    onChange={e => handleChange('cost_other', e.target.value)}
                                                    className="pl-7"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-muted/30 rounded-lg flex justify-between items-center border border-muted">
                                    <span className="font-medium text-muted-foreground">Total Costo Interno</span>
                                    <span className="text-xl font-bold text-primary">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="p-4 border-t bg-muted/10 flex justify-end gap-2">
                                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                                <Button onClick={handleSave} className="gap-2">
                                    <Save className="h-4 w-4" /> Guardar Costos
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
