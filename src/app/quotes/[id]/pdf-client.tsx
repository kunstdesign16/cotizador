'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Share2, Loader2 } from 'lucide-react'
import { downloadOrShareFile } from '@/lib/mobile-utils'
import { toast } from 'sonner'

export default function QuotePDFClient({ quote }: { quote: any }) {
    const [loading, setLoading] = useState(false)
    const pdfUrl = `/quotes/${quote.id}/pdf`
    const fileName = `Cotizacion_${quote.project_name.replace(/[^a-z0-9]/gi, '_')}.pdf`

    const handleDownloadOrShare = async () => {
        const { isShareSupported, downloadOrShareFile } = await import('@/lib/mobile-utils');

        if (!isShareSupported()) {
            window.location.href = pdfUrl;
            return;
        }

        setLoading(true)
        try {
            const response = await fetch(pdfUrl)
            if (!response.ok) throw new Error('Error al generar PDF')

            const blob = await response.blob()
            await downloadOrShareFile(blob, fileName, `Cotización: ${quote.project_name}`)
        } catch (error) {
            console.error(error)
            toast.error('No se pudo descargar el PDF. Intente de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="default"
            className="gap-2"
            onClick={handleDownloadOrShare}
            disabled={loading}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <>
                    <Share2 className="h-4 w-4" />
                    Descargar o Compartir PDF
                </>
            )}
        </Button>
    )
}
