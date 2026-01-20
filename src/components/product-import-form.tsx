
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function ProductImportForm({ supplierId, supplierName }: { supplierId?: string, supplierName?: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [supplierNameInput, setSupplierNameInput] = useState(supplierName || 'LP Mexico')
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)
        setStatus(null)

        const formData = new FormData()
        formData.append('file', file)
        if (supplierId) {
            formData.append('supplierId', supplierId)
        } else {
            formData.append('supplierName', supplierNameInput)
        }

        try {
            const res = await fetch('/api/products/import', {
                method: 'POST',
                body: formData
            })

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.message || 'Error en la importación')
                }
                setStatus({ type: 'success', message: data.message })
                router.refresh()
            } else {
                const text = await res.text();
                console.error('Non-JSON response:', text);
                throw new Error(`Error del servidor (Status ${res.status}): ${text.slice(0, 100)}...`)
            }

            setFile(null)
            setTimeout(() => {
                setOpen(false)
                setStatus(null)
            }, 2000)
        } catch (error: any) {
            console.error(error)
            setStatus({ type: 'error', message: error.message || 'Ocurrió un error inesperado' })
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 w-full justify-center text-xs px-2">
                    <Upload className="h-4 w-4" /> Importar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        Importar Lista de Precios
                    </DialogTitle>
                    <DialogDescription>
                        Sube un archivo Excel para actualizar el catálogo de {supplierName || 'productos'}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    {!supplierId && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre del Proveedor</label>
                            <Input
                                value={supplierNameInput}
                                onChange={(e) => setSupplierNameInput(e.target.value)}
                                placeholder="Ej. LP Mexico"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Archivo Excel (.xlsx)</label>
                        <Input
                            type="file"
                            accept=".xlsx"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            El archivo debe tener las columnas estándar (Código, Nombre, Precio...).
                        </p>
                    </div>

                    {status && (
                        <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {status.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {status.message}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={uploading || !file}>
                        {uploading ? (
                            <>Importando...</>
                        ) : (
                            <><Upload className="mr-2 h-4 w-4" /> Cargar ahora</>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
