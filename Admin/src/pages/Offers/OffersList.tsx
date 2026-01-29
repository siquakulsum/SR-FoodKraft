import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Offer } from '@/types';
import OffersFilters from './OffersFilters';
import OffersTable from './OffersTable';
import AddOfferModal from './AddOfferModal';
import EditOfferModal from './EditOfferModal';
import { offersService } from './offersService';

const OffersList = () => {
    const { toast } = useToast();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters State
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        discount_type: '',
        date_from: '',
        date_to: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // Stats State
    const [totalCount, setTotalCount] = useState(0);

    // Edit Modal State
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchOffers = async () => {
        setLoading(true);
        try {
            const data = await offersService.getOffers(filters);
            setOffers(data.data);

            const countData = await offersService.getOffersCount(filters);
            setTotalCount(countData.count);
        } catch (error: any) {
            console.error('Error fetching offers:', error);
            // Optional: toast error only if not initial load or handled nicely
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOffers();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const handleOfferAdded = () => {
        fetchOffers();
    };

    const handleOfferUpdated = () => {
        fetchOffers();
    };

    const handleEditClick = (offer: Offer) => {
        setEditingOffer(offer);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = async (offer: Offer) => {
        if (confirm(`Are you sure you want to delete offer "${offer.code}"?`)) {
            try {
                await offersService.deleteOffer(offer.id);
                toast({ title: 'Success', description: 'Offer deleted successfully' });
                fetchOffers();
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete offer' });
            }
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await offersService.toggleOfferStatus(id);
            // toast({ title: 'Success', description: 'Status updated' }); // Optional, UI update is enough usually
            fetchOffers();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to update status' });
        }
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            status: '',
            discount_type: '',
            date_from: '',
            date_to: ''
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Offers Management</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage discount codes, track usage, and filter by status.
                    </p>
                </div>
                <AddOfferModal onOfferAdded={handleOfferAdded} />
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>
                            All Offers ({totalCount})
                        </CardTitle>
                    </div>
                    <OffersFilters
                        filters={filters}
                        setFilters={setFilters}
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                        clearFilters={clearFilters}
                    />
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading offers...</div>
                    ) : (
                        <OffersTable
                            offers={offers}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            onToggleStatus={handleToggleStatus}
                        />
                    )}
                </CardContent>
            </Card>

            <EditOfferModal
                offer={editingOffer}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onOfferUpdated={handleOfferUpdated}
            />
        </div>
    );
};

export default OffersList;
