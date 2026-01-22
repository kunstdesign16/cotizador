
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'

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
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)
        setStatus(null)
        setProgress(0)

        try {
            // 1. Read file as ArrayBuffer
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data)
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

            if (jsonData.length < 2) {
                throw new Error('El archivo está vacío o no tiene el formato correcto')
            }

            // 2. Detect Format & Parse Rows
            const headerRow = jsonData[0]
            const col1Header = String(headerRow[0] || '').toUpperCase()
            const col2Header = String(headerRow[1] || '').toUpperCase()
            const col3Header = String(headerRow[2] || '').toUpperCase()

            let format: 'LP_MEXICO' | 'PROMO_OPCION' = 'LP_MEXICO'
            if (col1Header.includes('CÓDIGO') && col2Header.includes('NOMBRE') && col3Header.includes('PRECIO')) {
                format = 'PROMO_OPCION'
            } else if (col2Header.includes('NOMBRE') && col3Header.includes('PRECIO')) {
                format = 'PROMO_OPCION'
            }

            const START_ROW = format === 'PROMO_OPCION' ? 1 : 7
            const products = []

            for (let i = START_ROW; i < jsonData.length; i++) {
                const row = jsonData[i]
                if (!row || row.length === 0) continue

                let code, parentCode = null, name, category = null, priceType = null, price = 0

                if (format === 'PROMO_OPCION') {
                    code = String(row[0] || '').trim()
                    name = String(row[1] || '').trim()
                    const priceVal = row[2]

                    if (!code || !name) continue

                    if (typeof priceVal === 'string') {
                        price = parseFloat(priceVal.replace(/[$,\s]/g, '')) || 0
                    } else {
                        price = Number(priceVal) || 0
                    }
                } else {
                    // LP_MEXICO: Cols 3-8 (index 2-7)
                    code = String(row[2] || '').trim()
                    parentCode = row[3] ? String(row[3]).trim() : null
                    name = String(row[4] || '').trim()
                    category = row[5] ? String(row[5]).trim() : null
                    const priceVal = row[6]
                    priceType = row[7] ? String(row[7]).trim() : null

                    if (!code || !name) continue

                    if (typeof priceVal === 'string') {
                        price = parseFloat(priceVal.replace(/[^0-9.]/g, '')) || 0
                    } else {
                        price = Number(priceVal) || 0
                    }
                }

                products.push({ code, parentCode, name, category, price, priceType })
            }

            // 3. Sequential Chunk Upload
            const CHUNK_SIZE = 150
            let uploadedSupplierId = supplierId

            for (let i = 0; i < products.length; i += CHUNK_SIZE) {
                const chunk = products.slice(i, i + CHUNK_SIZE)
                const currentProgress = Math.round((i / products.length) * 100)
                setProgress(currentProgress)

                const res = await fetch('/api/products/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        products: chunk,
                        supplierId: uploadedSupplierId,
                        supplierName: supplierNameInput
                    })
                })

                if (!res.ok) {
                    const errorData = await res.json()
                    throw new Error(errorData.message || 'Error en un bloque de carga')
                }

                const result = await res.json()
                if (!uploadedSupplierId) {
                    uploadedSupplierId = result.supplierId
                }
            }

            setProgress(100)
            setStatus({ type: 'success', message: `Importación completa: ${products.length} productos procesados.` })
            router.refresh()

            setFile(null)
            setTimeout(() => {
                setOpen(false)
                setStatus(null)
                setProgress(0)
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

                    {uploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span>Procesando catálogo...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-primary h-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

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
