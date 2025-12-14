'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ItemProductAutocomplete from './item-product-autocomplete'

interface QuoteItemCostDialogProps {
    isOpen: boolean
    onClose: () => void
    title: string
    initialValues: {
        cost_article: number
        cost_workforce: number
        cost_packaging: number
        cost_transport: number
        cost_equipment: number
        cost_other: number
    }
    onSave: (values: QuoteItemCostDialogProps['initialValues']) => void
}

export default function QuoteItemCostDialog({ isOpen, onClose, title, initialValues, onSave }: QuoteItemCostDialogProps) {
    const [values, setValues] = useState(initialValues)

    const handleSave = () => {
        onSave(values)
        onClose()
    }

    const total = values.cost_article + values.cost_workforce + values.cost_packaging + values.cost_transport + values.cost_equipment + values.cost_other

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Artículo</label>
                        <ItemProductAutocomplete
                            value={values.cost_article.toString()}
                            onChange={(val) => setValues({ ...values, cost_article: Number(val) || 0 })}
                            onSelect={(product) => setValues({ ...values, cost_article: product.price })}
                            placeholder="Buscar producto o ingresar monto..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Mano de Obra / Personalización</label>
                        <ItemProductAutocomplete
                            value={values.cost_workforce.toString()}
                            onChange={(val) => setValues({ ...values, cost_workforce: Number(val) || 0 })}
                            onSelect={(product) => setValues({ ...values, cost_workforce: product.price })}
                            placeholder="Buscar producto o ingresar monto..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Empaque</label>
                        <ItemProductAutocomplete
                            value={values.cost_packaging.toString()}
                            onChange={(val) => setValues({ ...values, cost_packaging: Number(val) || 0 })}
                            onSelect={(product) => setValues({ ...values, cost_packaging: product.price })}
                            placeholder="Buscar producto o ingresar monto..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Transporte</label>
                        <ItemProductAutocomplete
                            value={values.cost_transport.toString()}
                            onChange={(val) => setValues({ ...values, cost_transport: Number(val) || 0 })}
                            onSelect={(product) => setValues({ ...values, cost_transport: product.price })}
                            placeholder="Buscar producto o ingresar monto..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Equipos / Insumos</label>
                        <ItemProductAutocomplete
                            value={values.cost_equipment.toString()}
                            onChange={(val) => setValues({ ...values, cost_equipment: Number(val) || 0 })}
                            onSelect={(product) => setValues({ ...values, cost_equipment: product.price })}
                            placeholder="Buscar producto o ingresar monto..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Otros</label>
                        <ItemProductAutocomplete
                            value={values.cost_other.toString()}
                            onChange={(val) => setValues({ ...values, cost_other: Number(val) || 0 })}
                            onSelect={(product) => setValues({ ...values, cost_other: product.price })}
                            placeholder="Buscar producto o ingresar monto..."
                        />
                    </div>
                    <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Costo Total Interno:</span>
                            <span className="text-blue-600">
                                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
