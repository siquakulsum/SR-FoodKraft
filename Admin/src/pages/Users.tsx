import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCustomerStore } from '@/store/customer-store';
import { useOrderStore } from '@/store/order-store';
import { Search, Ban, Check, Eye, MessageSquare, Download, Star, TrendingUp, Clock, DollarSign, Plus, Users as UsersIcon, Send, Mail, Smartphone, Upload, FileText, Eye as PreviewIcon, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Customer, Order } from '@/types';
import { api } from '@/services/api';

// Add New User Modal Component
function AddUserModal() {
  const { addCustomer, isLoading } = useCustomerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.name && formData.email) {
      try {
        await addCustomer({
          ...formData,
        });
        setFormData({ name: '', email: '', phone: '', password: '' });
        setIsOpen(false);
      } catch (err: any) {
        setError(err.message || 'Failed to create customer');
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white">
          <Plus className="w-4 h-4" />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-gold-500" />
            Add New Customer
          </DialogTitle>
        </DialogHeader>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Initial Password (Optional)
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              placeholder="Leave blank to auto-generate"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
            >
              {isLoading ? 'Creating...' : 'Add Customer'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CustomerDetailModal({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await api.getCustomerById(customerId);
        setCustomer(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails(); // No check for customerId here as it's passed as prop only when non-null
  }, [customerId]);

  if (loading) return <DialogContent><p className="p-4">Loading...</p></DialogContent>;
  if (!customer) return <DialogContent><p className="p-4">Customer not found</p></DialogContent>;

  const customerOrders = customer.orders || [];
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-[#E63946] to-[#E63946]/80 rounded-full flex items-center justify-center text-white font-bold">
            {customer.name?.charAt(0).toUpperCase()}
          </div>
          {customer.name}
        </DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Contact Info</CardTitle></CardHeader>
              <CardContent>
                <div>Email: {customer.email}</div>
                <div>Phone: {customer.phone}</div>
                <div>Status: {customer.is_blocked ? 'Blocked' : 'Active'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Stats</CardTitle></CardHeader>
              <CardContent>
                <div>Orders: {customer.ordersCount || customerOrders.length}</div>
                <div>Spent: ₹{customer.totalSpent || 0}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          {customerOrders.length === 0 ? <p>No orders</p> : (
            customerOrders.map((o: any) => (
              <Card key={o.id} className="mb-2">
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <span>Order #{o.order_number}</span>
                    <span>₹{o.total_amount}</span>
                  </div>
                  <div className="text-sm text-gray-500">{o.status}</div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}

function SendMessageModal({ customers, selectedIds, onClose }: { customers: Customer[], selectedIds: string[], onClose: () => void }) {
  const { sendMessage, isLoading } = useCustomerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleSend = async () => {
    try {
      const idsToSend = selectedIds.length > 0 ? selectedIds : customers.map(c => c.id);

      if (idsToSend.length === 0) {
        setResult('No customers selected.');
        return;
      }

      await sendMessage({ customerIds: idsToSend, message, type: 'email' });
      setResult('Message sent successfully');
      onClose(); // Clear selection
      setTimeout(() => {
        setIsOpen(false);
        setResult(null);
        setMessage('');
      }, 2000);
    } catch (e: any) {
      setResult('Error: ' + e.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Bulk Message ({selectedIds.length > 0 ? selectedIds.length : 'All'})</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Send Bulk Message</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <p>Send a message to {selectedIds.length > 0 ? `${selectedIds.length} selected customers` : `all ${customers.length} currently listed customers`}.</p>
          <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message..." />
          {result && <p className={result.includes('Error') ? 'text-red-500' : 'text-green-500'}>{result}</p>}
          <Button onClick={handleSend} disabled={!message || isLoading}>
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Users() {
  const { customers, total, totalPages, currentPage, stats, isLoading, fetchCustomers, fetchStats, updateCustomerStatus } = useCustomerStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [itemsPerPage, setItemsPerPage] = useState(Number(searchParams.get('limit')) || 10);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at' | 'orders' | 'spending'>((searchParams.get('sortBy') as any) || 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('sortOrder') as any) || 'desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>((searchParams.get('status') as any) || 'all');

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]); // For bulk actions

  // Block Modal State
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [customerToBlock, setCustomerToBlock] = useState<Customer | null>(null);
  const [blockReason, setBlockReason] = useState('');

  // Fetch data on mount and dependencies
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Sync state to URL and fetch customers
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.set('limit', itemsPerPage.toString());
    params.set('page', currentPage.toString()); // Note: currentPage is in store, might need local ref or sync BACK to store if URL changes

    setSearchParams(params);

    const delay = setTimeout(() => {
      fetchCustomers({
        page: currentPage, // store should probably accept page from argument to update itself? Yes.
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder
      });
    }, 300); // 300ms debounce
    return () => clearTimeout(delay);
  }, [itemsPerPage, searchTerm, statusFilter, sortBy, sortOrder, currentPage, fetchCustomers, setSearchParams]);

  const handlePageChange = (page: number) => {
    fetchCustomers({ page, limit: itemsPerPage, search: searchTerm, status: statusFilter, sortBy, sortOrder });
  };

  const initBlock = (customer: Customer) => {
    setCustomerToBlock(customer);
    setBlockReason('');
    setBlockModalOpen(true);
  };

  const confirmBlock = async () => {
    if (customerToBlock) {
      await updateCustomerStatus(customerToBlock.id, true, blockReason);
    }
    setBlockModalOpen(false);
    setCustomerToBlock(null);
    setBlockReason('');
  };

  const handleUnblock = async (id: string) => {
    if (confirm('Are you sure you want to unblock this customer?')) {
      await updateCustomerStatus(id, false);
    }
  };

  const handleExport = () => {
    api.exportCustomers({ search: searchTerm, status: statusFilter });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Customer Management</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage customer accounts, view order history, and analyze customer behavior
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Customers</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Customers</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.activeCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Ban className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Blocked Customers</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.blockedCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Customer Management</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <AddUserModal />
              <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{isLoading ? 'Exporting...' : 'Export'}</span>
              </Button>
              <SendMessageModal
                customers={customers.filter(c => selectedCustomerIds.length > 0 ? selectedCustomerIds.includes(c.id) : true)}
                selectedIds={selectedCustomerIds}
                onClose={() => setSelectedCustomerIds([])}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="blocked">Blocked Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="created_at">Join Date</SelectItem>
                <SelectItem value="orders">Order Count</SelectItem>
                <SelectItem value="spending">Total Spending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 w-4">
                  <Checkbox
                    checked={customers.length > 0 && selectedCustomerIds.length === customers.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCustomerIds(customers.map(c => c.id));
                      } else {
                        setSelectedCustomerIds([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr> : customers.length === 0 ? <tr><td colSpan={7} className="p-4 text-center">No customers found.</td></tr> : customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 w-4">
                    <Checkbox
                      checked={selectedCustomerIds.includes(customer.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCustomerIds(prev => [...prev, customer.id]);
                        } else {
                          setSelectedCustomerIds(prev => prev.filter(id => id !== customer.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#E63946] to-[#E63946]/80 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {customer.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{customer.name}</div>
                        <div className="text-sm text-slate-500">ID: {customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-slate-900 dark:text-white">{customer.email}</div>
                    <div className="text-sm text-slate-500">{customer.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">{customer.ordersCount || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">₹{(customer.totalSpent || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={customer.is_blocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                      {customer.is_blocked ? 'Blocked' : 'Active'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedCustomerId(customer.id)} className="flex items-center gap-1">
                        <Eye className="w-4 h-4" /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => customer.is_blocked ? handleUnblock(customer.id) : initBlock(customer)}
                        className={customer.is_blocked ? 'text-green-700' : 'text-red-700'}
                      >
                        {customer.is_blocked ? 'Unblock' : 'Block'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={setItemsPerPage}
          itemName="customers"
        />
      </div>

      {/* Block Confirmation Modal */}
      <Dialog open={blockModalOpen} onOpenChange={setBlockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to block {customerToBlock?.name}?
              This will prevent them from placing future orders.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Reason</label>
            <Textarea value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Enter reason for blocking..." />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setBlockModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmBlock} disabled={!blockReason}>Block Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomerId} onOpenChange={(open) => !open && setSelectedCustomerId(null)}>
        {selectedCustomerId && <CustomerDetailModal customerId={selectedCustomerId} onClose={() => setSelectedCustomerId(null)} />}
      </Dialog>
    </div>
  );
}
