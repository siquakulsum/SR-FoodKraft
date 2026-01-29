import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Offer } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';

interface OffersTableProps {
    offers: Offer[];
    onEdit: (offer: Offer) => void;
    onDelete: (offer: Offer) => void;
    onToggleStatus: (id: string) => void;
}

const OffersTable: React.FC<OffersTableProps> = ({ offers, onEdit, onDelete, onToggleStatus }) => {

    // Helper to determine display status - though backend is source of truth
    const getOfferStatus = (offer: Offer) => {
        if (!offer.is_active) return 'Inactive';
        const now = new Date();
        const validTo = new Date(offer.valid_to);
        if (now > validTo) return 'Expired';
        return 'Active';
    };

    return (
        <div>
            {/* Desktop Table View */}
            <div className="hidden lg:block rounded-md border border-slate-200 dark:border-slate-700">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Valid From</TableHead>
                            <TableHead>Valid To</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {offers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    No offers found
                                </TableCell>
                            </TableRow>
                        ) : (
                            offers.map((offer) => {
                                const status = getOfferStatus(offer);
                                return (
                                    <TableRow key={offer.id}>
                                        <TableCell className="font-medium font-mono">
                                            {offer.code}
                                        </TableCell>
                                        <TableCell>
                                            {offer.discount_type === 'percentage'
                                                ? `${offer.discount_value}%`
                                                : `₹${offer.discount_value}`}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(offer.valid_from).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(offer.valid_to).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => onToggleStatus(offer.id)}
                                                className="focus:outline-none"
                                            >
                                                {status === 'Active' && (
                                                    <Badge className="bg-success/10 text-success hover:bg-success/20">Active</Badge>
                                                )}
                                                {status === 'Inactive' && (
                                                    <Badge variant="secondary" className="hover:bg-slate-200">Inactive</Badge>
                                                )}
                                                {status === 'Expired' && (
                                                    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Expired</Badge>
                                                )}
                                            </button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onEdit(offer)}
                                                    disabled={status === 'Expired'}
                                                    title={status === 'Expired' ? 'Cannot edit expired offer' : 'Edit'}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => onDelete(offer)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {offers.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No offers found</div>
                ) : (
                    offers.map((offer) => {
                        const status = getOfferStatus(offer);
                        return (
                            <div
                                key={offer.id}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white font-mono text-lg">
                                                {offer.code}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {offer.discount_type === 'percentage'
                                                    ? `${offer.discount_value}% off`
                                                    : `₹${offer.discount_value} off`}
                                            </p>
                                        </div>
                                        <div>
                                            <button onClick={() => onToggleStatus(offer.id)}>
                                                {status === 'Active' && (
                                                    <Badge className="bg-success/10 text-success">Active</Badge>
                                                )}
                                                {status === 'Inactive' && (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                                {status === 'Expired' && (
                                                    <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Expired</Badge>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-600 dark:text-slate-400">Valid From:</span>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {new Date(offer.valid_from).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-slate-600 dark:text-slate-400">Valid To:</span>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {new Date(offer.valid_to).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onEdit(offer)}
                                            className="flex-1"
                                            disabled={status === 'Expired'}
                                        >
                                            <Pencil className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => onDelete(offer)}
                                            className="flex-1"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default OffersTable;
