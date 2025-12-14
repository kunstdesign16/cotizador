'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ItemProductAutocomplete } from '@/components/item-product-autocomplete'

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
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">1. Costo Artículo</label>
                                        <ItemProductAutocomplete
                                            value={values.cost_article.toString()}
                                            onChange={(val) => setValues(prev => ({ ...prev, cost_article: Number(val) || 0 }))}
                                            onSelect={(product) => setValues(prev => ({ ...prev, cost_article: product.price }))}
                                            placeholder="Buscar producto o ingresar monto..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">2. Mano de Obra</label>
                                        <ItemProductAutocomplete
                                            value={values.cost_workforce.toString()}
                                            onChange={(val) => setValues(prev => ({ ...prev, cost_workforce: Number(val) || 0 }))}
                                            onSelect={(product) => setValues(prev => ({ ...prev, cost_workforce: product.price }))}
                                            placeholder="Buscar producto o ingresar monto..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">3. Empaque</label>
                                        <ItemProductAutocomplete
                                            value={values.cost_packaging.toString()}
                                            onChange={(val) => setValues(prev => ({ ...prev, cost_packaging: Number(val) || 0 }))}
                                            onSelect={(product) => setValues(prev => ({ ...prev, cost_packaging: product.price }))}
                                            placeholder="Buscar producto o ingresar monto..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">4. Transporte</label>
                                        <ItemProductAutocomplete
                                            value={values.cost_transport.toString()}
                                            onChange={(val) => setValues(prev => ({ ...prev, cost_transport: Number(val) || 0 }))}
                                            onSelect={(product) => setValues(prev => ({ ...prev, cost_transport: product.price }))}
                                            placeholder="Buscar producto o ingresar monto..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">5. Equipos / Insumos</label>
                                        <ItemProductAutocomplete
                                            value={values.cost_equipment.toString()}
                                            onChange={(val) => setValues(prev => ({ ...prev, cost_equipment: Number(val) || 0 }))}
                                            onSelect={(product) => setValues(prev => ({ ...prev, cost_equipment: product.price }))}
                                            placeholder="Buscar producto o ingresar monto..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">6. Otros</label>
                                        <ItemProductAutocomplete
                                            value={values.cost_other.toString()}
                                            onChange={(val) => setValues(prev => ({ ...prev, cost_other: Number(val) || 0 }))}
                                            onSelect={(product) => setValues(prev => ({ ...prev, cost_other: product.price }))}
                                            placeholder="Buscar producto o ingresar monto..."
                                        />
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
