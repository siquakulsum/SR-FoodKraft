import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { offersService } from './offersService';
import { useToast } from '@/hooks/use-toast';

interface AddOfferModalProps {
    onOfferAdded: () => void;
}

const AddOfferModal: React.FC<AddOfferModalProps> = ({ onOfferAdded }) => {
    const [isOpen, setIsOpen] = useState(false);
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

    const resetForm = () => {
        setFormData({
            code: '',
            discount_type: 'percentage',
            discount_value: '',
            valid_from: '',
            valid_to: '',
            min_order_amount: '',
            max_discount_amount: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                discount_value: Number(formData.discount_value),
                min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : 0,
                max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
            };

            await offersService.createOffer(payload);

            toast({ title: 'Success', description: 'Offer created successfully' });
            onOfferAdded();
            setIsOpen(false);
            resetForm();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to create offer' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button className="bg-gold-500 hover:bg-gold-600 w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Offer
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl mx-4 sm:mx-0">
                <DialogHeader>
                    <DialogTitle>Add New Offer</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Offer Code</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="e.g., WELCOME50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discount_type">Discount Type</Label>
                            <select
                                id="discount_type"
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
                        <Label htmlFor="discount_value">
                            Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
                        </Label>
                        <Input
                            id="discount_value"
                            type="number"
                            step="0.01"
                            value={formData.discount_value}
                            onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="valid_from">Valid From</Label>
                            <Input
                                id="valid_from"
                                type="date"
                                value={formData.valid_from}
                                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="valid_to">Valid To</Label>
                            <Input
                                id="valid_to"
                                type="date"
                                value={formData.valid_to}
                                onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="min_order_amount">Min Order Amount (Optional)</Label>
                            <Input
                                id="min_order_amount"
                                type="number"
                                step="0.01"
                                value={formData.min_order_amount}
                                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max_discount_amount">Max Discount Amount (Optional)</Label>
                            <Input
                                id="max_discount_amount"
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
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-gold-500 hover:bg-gold-600" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Offer'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddOfferModal;
