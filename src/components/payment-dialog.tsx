import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { registerPayment } from '@/actions/payments';

interface PaymentDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    orderId: string;
}

export default function PaymentDialog({ open, setOpen, orderId }: PaymentDialogProps) {
    const [type, setType] = useState<'ANTICIPO' | 'TOTAL'>('ANTICIPO');
    const [amount, setAmount] = useState('');
    const router = useRouter();

    const handleSubmit = async () => {
        const numericAmount = parseFloat(amount);
        if (!orderId || isNaN(numericAmount) || numericAmount <= 0) {
            alert('Por favor ingrese un monto válido');
            return;
        }
        const result = await registerPayment({ orderId, type, amount: numericAmount });
        if (result.success) {
            setOpen(false);
            router.refresh();
        } else {
            alert(result.error || 'Error al registrar pago');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar Pago</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-2">
                        <label className="font-medium">Tipo:</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="border rounded px-2 py-1"
                        >
                            <option value="ANTICIPO">Anticipo</option>
                            <option value="TOTAL">Pago Total</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="font-medium">Monto:</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="border rounded px-2 py-1 w-32"
                        />
                    </div>
                    <Button onClick={handleSubmit}>Confirmar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
