import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { registerPayment } from '@/actions/payments';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PaymentDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    orderId?: string;
    quoteId?: string;
    supplierId?: string;
    orderTotal: number;
    suppliers?: { id: string, name: string }[];
}

export default function PaymentDialog({
    open,
    setOpen,
    orderId,
    quoteId,
    supplierId: initialSupplierId,
    orderTotal,
    suppliers = []
}: PaymentDialogProps) {
    const [type, setType] = useState<'ANTICIPO' | 'TOTAL'>('ANTICIPO');
    const [amount, setAmount] = useState('');
    const [includeIva, setIncludeIva] = useState(true);
    const [supplierId, setSupplierId] = useState(initialSupplierId || '');
    const router = useRouter();

    const numericAmount = parseFloat(amount) || 0;

    // Calculate breakdown
    let base = 0;
    let iva = 0;

    if (includeIva) {
        base = numericAmount / 1.16;
        iva = numericAmount - base;
    } else {
        base = numericAmount;
        iva = 0;
    }

    const percentage = orderTotal > 0 ? (numericAmount / orderTotal) * 100 : 0;

    const handleSubmit = async () => {
        if ((!orderId && !quoteId) || numericAmount <= 0) {
            alert('Por favor ingrese un monto válido');
            return;
        }

        const result = await registerPayment({
            orderId,
            quoteId,
            supplierId,
            type,
            amount: base,
            iva: iva
        });

        if (result.success) {
            setOpen(false);
            setAmount('');
            router.refresh();
        } else {
            alert(result.error || 'Error al registrar pago');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Pago</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {!orderId && suppliers.length > 0 && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="supplier" className="text-right">
                                Proveedor
                            </Label>
                            <select
                                id="supplier"
                                value={supplierId}
                                onChange={(e) => setSupplierId(e.target.value)}
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="">Seleccionar Proveedor</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Tipo
                        </Label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="ANTICIPO">Anticipo</option>
                            <option value="TOTAL">Pago Total</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Monto Total
                        </Label>
                        <div className="col-span-3 relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input
                                id="amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-7"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <div className="col-start-2 col-span-3 flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="includeIva"
                                checked={includeIva}
                                onChange={(e) => setIncludeIva(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="includeIva" className="font-normal cursor-pointer">
                                El monto incluye IVA
                            </Label>
                        </div>
                    </div>

                    {/* Breakdown Card */}
                    {numericAmount > 0 && (
                        <div className="col-span-4 bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal (Capital):</span>
                                <span className="font-medium">${base.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">IVA (16%):</span>
                                <span className="font-medium">${iva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="border-t pt-1 mt-1 flex justify-between font-bold">
                                <span>Total:</span>
                                <span>${numericAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="border-t pt-1 mt-1 flex justify-between text-blue-600">
                                <span>Progreso del Proyecto:</span>
                                <span>{percentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    )}

                    <Button onClick={handleSubmit} className="ml-auto">Confirmar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
