import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import React from 'react';

interface OffersFiltersProps {
    filters: any;
    setFilters: (filters: any) => void;
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
    clearFilters: () => void;
}

const OffersFilters: React.FC<OffersFiltersProps> = ({
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    clearFilters
}) => {

    // Check if any filter is active
    const isFiltered = filters.status || filters.discount_type || filters.date_from || filters.date_to || filters.search;

    return (
        <div className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Search offers..."
                        value={filters.search || ''}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2 flex-1 sm:flex-none"
                    >
                        Filters
                    </Button>
                    {isFiltered && (
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="px-4 py-2 border-red-300 text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                        >
                            Clear All
                        </Button>
                    )}
                </div>
            </div>

            {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    {/* Offer Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Offer Type
                        </label>
                        <select
                            value={filters.discount_type || ''}
                            onChange={(e) => setFilters({ ...filters, discount_type: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                            <option value="">All Types</option>
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Status
                        </label>
                        <select
                            value={filters.status || ''}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Date Filters */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Valid From
                        </label>
                        <Input
                            type="date"
                            value={filters.date_from || ''}
                            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Valid To
                        </label>
                        <Input
                            type="date"
                            value={filters.date_to || ''}
                            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* Active Filters Badges */}
            {isFiltered && (
                <div className="flex flex-wrap gap-2">
                    {filters.discount_type && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm">
                            Type: {filters.discount_type}
                            <button onClick={() => setFilters({ ...filters, discount_type: '' })} className="ml-1 hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                        </span>
                    )}
                    {filters.status && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm">
                            Status: {filters.status}
                            <button onClick={() => setFilters({ ...filters, status: '' })} className="ml-1 hover:bg-green-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default OffersFilters;
