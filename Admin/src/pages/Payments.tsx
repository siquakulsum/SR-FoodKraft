import { useState, useEffect } from 'react';
import { usePaymentStore } from '@/store/payment-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Download, Plus, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Payment } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';

const paymentModeColors: Record<string, string> = {
  cash: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  upi: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  card: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  netbanking: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  cod: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

// Add Payment Modal Component
function AddPaymentModal({ onSuccess }: { onSuccess: () => void }) {
  const { addPayment, isLoading } = usePaymentStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    transaction_id: '',
    order_id: '',
    amount: '',
    payment_mode: 'cash' as Payment['payment_mode'],
    status: 'completed' as Payment['status'],
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const paymentData = {
      transaction_id: formData.transaction_id,
      order_id: formData.order_id,
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_mode,
      status: formData.status,
    };

    try {
      await addPayment(paymentData);
      setIsOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Payment added successfully',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add payment',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      transaction_id: '',
      order_id: '',
      amount: '',
      payment_mode: 'cash',
      status: 'completed',
    });
  };

  // Generate transaction ID
  const generateTransactionId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN${timestamp}${random}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle>Add New Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Transaction ID
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.transaction_id}
                onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                placeholder="Enter transaction ID"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({ ...formData, transaction_id: generateTransactionId() })}
                className="px-3"
              >
                Generate
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Order ID *
            </label>
            <Input
              value={formData.order_id}
              onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
              placeholder="Enter Order ID"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Found in Orders page</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount (₹) *
            </label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Payment Mode *
            </label>
            <select
              value={formData.payment_mode}
              onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value as Payment['payment_mode'] })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">NetBanking</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Payment['status'] })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Add Payment
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Payments() {
  const {
    payments,
    stats,
    total,
    totalPages,
    currentPage,
    isLoading,
    fetchPayments,
    fetchStats,
    deletePayment,
    updatePaymentStatus,
    exportPayments
  } = usePaymentStore();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [localPage, setLocalPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();

  // Filter states
  const [modeFilter, setModeFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal / Editing states
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | null>(null);
  const [editStatus, setEditStatus] = useState<Payment['status']>('pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Load data on mount and when filters change
  useEffect(() => {
    const params: any = {
      page: localPage,
      limit: itemsPerPage,
      search: debouncedSearch,
    };

    if (modeFilter !== 'all') params.payment_method = modeFilter;
    if (statusFilter !== 'all') params.status = statusFilter;

    // Date filtering
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateFilter === 'today') {
      params.startDate = today.toISOString();
      params.endDate = new Date(today.getTime() + 86400000).toISOString();
    } else if (dateFilter === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      params.startDate = weekStart.toISOString();
      params.endDate = new Date(weekStart.getTime() + 7 * 86400000).toISOString();
    } else if (dateFilter === 'month') {
      params.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      params.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    } else if (dateFilter === 'custom' && customDateFrom) {
      params.startDate = new Date(customDateFrom).toISOString();
      if (customDateTo) params.endDate = new Date(customDateTo).toISOString();
    }

    fetchPayments(params);
    fetchStats();
  }, [localPage, itemsPerPage, debouncedSearch, modeFilter, statusFilter, dateFilter, customDateFrom, customDateTo, fetchPayments, fetchStats]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    const params: any = { search: debouncedSearch };
    if (modeFilter !== 'all') params.payment_method = modeFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    // Add date params if needed reusing logic above...
    try {
      await exportPayments(params);
      toast({ title: 'Export successful' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Export failed' });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setLocalPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setLocalPage(1);
  };

  const clearAllFilters = () => {
    setModeFilter('all');
    setStatusFilter('all');
    setDateFilter('all');
    setCustomDateFrom('');
    setCustomDateTo('');
    setSearchTerm('');
    setLocalPage(1);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      try {
        await deletePayment(id);
        toast({ title: 'Payment deleted' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to delete', description: error.message });
      }
    }
  };

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setViewMode('view');
  };

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setEditStatus(payment.status);
    setViewMode('edit');
  };

  const handleUpdateStatus = async () => {
    if (!selectedPayment) return;
    setIsUpdating(true);
    try {
      await updatePaymentStatus(selectedPayment.id, editStatus);
      toast({ title: 'Status updated' });
      setIsUpdating(false);
      setViewMode(null);
      setSelectedPayment(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: error.message });
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Payments</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View and manage payment transactions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <AddPaymentModal onSuccess={() => { }} />
          <Button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="bg-gold-500 hover:bg-gold-600 w-full sm:w-auto"
          >
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              ₹{stats.totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Transactions</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {stats.totalTransactions}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed Payments</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {stats.completedPayments}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                {(modeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' || searchTerm) && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="px-4 py-2 border-red-300 text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                {/* Payment Mode Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Payment Mode
                  </label>
                  <select
                    value={modeFilter}
                    onChange={(e) => setModeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Modes</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="netbanking">NetBanking</option>
                    <option value="cod">COD</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month' | 'custom')}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
              </div>
            )}

            {dateFilter === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    From Date
                  </label>
                  <Input type="date" value={customDateFrom} onChange={(e) => setCustomDateFrom(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    To Date
                  </label>
                  <Input type="date" value={customDateTo} onChange={(e) => setCustomDateTo(e.target.value)} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>
                {isLoading ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</span>
                ) : (
                  <>Showing {payments.length} of {total} transactions</>
                )}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-slate-500">No payments found</TableCell>
                  </TableRow>
                )}
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium font-mono">
                      {payment.transaction_id || '-'}
                    </TableCell>
                    <TableCell>{payment.customer_name || 'N/A'}</TableCell>
                    <TableCell>{Number(payment.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                    <TableCell>
                      <Badge className={paymentModeColors[payment.payment_mode] || 'bg-gray-100'}>
                        {payment.payment_mode?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[payment.status] || 'bg-gray-100'}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(payment.createdAt || payment.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(payment)}>
                          <Eye className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(payment)}>
                          <Pencil className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(payment.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white font-mono text-sm">
                        {payment.transaction_id || 'No ID'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{payment.customer_name || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{Number(payment.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={paymentModeColors[payment.payment_mode]}>
                      {payment.payment_mode?.toUpperCase()}
                    </Badge>
                    <Badge className={statusColors[payment.status]}>
                      {payment.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(payment.createdAt || payment.created_at).toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(payment)}>
                        <Eye className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(payment)}>
                        <Pencil className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(payment.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {total > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemName="payments"
        />
      )}

      {/* View/Edit Modal */}
      <Dialog open={!!viewMode} onOpenChange={(open) => { if (!open) { setViewMode(null); setSelectedPayment(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{viewMode === 'view' ? 'Payment Details' : 'Update Payment Status'}</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500">Transaction ID</label>
                  <p className="font-medium">{selectedPayment.transaction_id || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Amount</label>
                  <p className="font-medium">{Number(selectedPayment.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Customer</label>
                  <p className="font-medium">{selectedPayment.customer_name}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Order ID</label>
                  <p className="font-medium text-xs break-all">{selectedPayment.order_id}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Mode</label>
                  <p className="capitalize">{selectedPayment.payment_mode}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Date</label>
                  <p className="text-sm">{new Date(selectedPayment.createdAt || selectedPayment.created_at).toLocaleString()}</p>
                </div>
              </div>

              {viewMode === 'edit' ? (
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium mb-2">Update Status</label>
                  <select
                    className="w-full border rounded p-2 mb-4"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Payment['status'])}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleUpdateStatus} disabled={isUpdating}>
                      {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Update
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setViewMode(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t">
                  <label className="text-xs text-slate-500">Status</label>
                  <div>
                    <Badge className={statusColors[selectedPayment.status]}>{selectedPayment.status}</Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
