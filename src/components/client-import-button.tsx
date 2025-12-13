'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ClientImportButton() {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!confirm(`¿Importar clientes desde "${file.name}"? Los existentes se actualizarán.`)) {
            e.target.value = '' // Reset
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/clients/import', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error('Error en la importación')

            alert('Clientes importados correctamente')
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Falló la importación')
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,application/vnd.ms-excel,text/csv,text/plain"
                onChange={handleFileChange}
            />
            <Button variant="outline" onClick={handleClick} disabled={uploading} className="gap-2">
                <Upload className="h-4 w-4" />
                {uploading ? 'Subiendo...' : 'Subir Respaldo (CSV)'}
            </Button>
        </>
    )
}
