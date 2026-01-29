import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useEffect, useState } from 'react';
import { offersService } from './offersService';
import { useToast } from '@/hooks/use-toast';
import { Offer } from '@/types';

interface EditOfferModalProps {
    offer: Offer | null;
    isOpen: boolean;
    onClose: () => void;
    onOfferUpdated: () => void;
}

const EditOfferModal: React.FC<EditOfferModalProps> = ({ offer, isOpen, onClose, onOfferUpdated }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        valid_from: '',
        valid_to: '',
        min_order_amount: '',
        max_discount_amount: ''
    });

    useEffect(() => {
        if (offer) {
            setFormData({
                code: offer.code,
                discount_type: offer.discount_type,
                discount_value: String(offer.discount_value),
                valid_from: offer.valid_from ? new Date(offer.valid_from).toISOString().split('T')[0] : '',
                valid_to: offer.valid_to ? new Date(offer.valid_to).toISOString().split('T')[0] : '',
                // @ts-ignore - these fields might be added to Offer type or returned from backend
                min_order_amount: offer.min_order_amount ? String(offer.min_order_amount) : '',
                // @ts-ignore
                max_discount_amount: offer.max_discount_amount ? String(offer.max_discount_amount) : '',
            });
        }
    }, [offer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!offer) return;

        setLoading(true);
        try {
            const payload = {
                ...formData,
                discount_value: Number(formData.discount_value),
                min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : 0,
                max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
            };

            await offersService.updateOffer(offer.id, payload);

            toast({ title: 'Success', description: 'Offer updated successfully' });
            onOfferUpdated();
            onClose();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to update offer' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl mx-4 sm:mx-0">
                <DialogHeader>
                    <DialogTitle>Edit Offer</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_code">Offer Code</Label>
                            <Input
                                id="edit_code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="e.g., WELCOME50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_discount_type">Discount Type</Label>
                            <select
                                id="edit_discount_type"
                                value={formData.discount_type}
                                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit_discount_value">
                            Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
                        </Label>
                        <Input
                            id="edit_discount_value"
                            type="number"
                            step="0.01"
                            value={formData.discount_value}
                            onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_valid_from">Valid From</Label>
                            <Input
                                id="edit_valid_from"
                                type="date"
                                value={formData.valid_from}
                                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_valid_to">Valid To</Label>
                            <Input
                                id="edit_valid_to"
                                type="date"
                                value={formData.valid_to}
                                onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_min_order_amount">Min Order Amount (Optional)</Label>
                            <Input
                                id="edit_min_order_amount"
                                type="number"
                                step="0.01"
                                value={formData.min_order_amount}
                                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_max_discount_amount">Max Discount Amount (Optional)</Label>
                            <Input
                                id="edit_max_discount_amount"
                                type="number"
                                step="0.01"
                                value={formData.max_discount_amount}
                                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                disabled={formData.discount_type !== 'percentage'}
                                placeholder={formData.discount_type !== 'percentage' ? 'N/A' : ''}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-gold-500 hover:bg-gold-600" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Offer'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditOfferModal;
