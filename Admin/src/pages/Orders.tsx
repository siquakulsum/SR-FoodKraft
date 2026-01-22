import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrderStore } from '@/store/order-store';
import { Search, Eye, Pencil, Trash2, X, Check, Clock, CheckCircle, Truck, Package, AlertCircle, MapPin, Store, Phone, Mail, Loader2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { Order } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';

const statusConfig = {
  pending: {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: Clock,
    label: 'Pending'
  },
  confirmed: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: CheckCircle,
    label: 'Confirmed'
  },
  preparing: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    icon: Package,
    label: 'Preparing'
  },
  out_for_delivery: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    icon: Truck,
    label: 'Out for Delivery'
  },
  delivered: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    icon: CheckCircle,
    label: 'Delivered'
  },
  cancelled: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    icon: AlertCircle,
    label: 'Cancelled'
  },
};

export default function Orders() {
  const {
    orders,
    totalOrders,
    totalPages,
    loading,
    fetchOrders,
    updateOrderStatus,
    deleteOrder,
    getOrderById
  } = useOrderStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit') || '10'));

  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>((searchParams.get('status') as Order['status']) || 'all');
  const [typeFilter, setTypeFilter] = useState<Order['order_type'] | 'all'>((searchParams.get('type') as Order['order_type']) || 'all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');

  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal / Editing states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Inline Status Edit
  const [editStatus, setEditStatus] = useState<Order['status']>('pending');
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [tempStatus, setTempStatus] = useState<Order['status']>('pending');

  // Load orders on mount and when filters change
  useEffect(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch,
    };

    if (statusFilter !== 'all') params.status = statusFilter;
    if (typeFilter !== 'all') params.type = typeFilter;

    // Map date filters to backend params
    const mapDateFilter = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateFilter === 'today') {
        params.start_date = today.toISOString();
        params.end_date = new Date(today.getTime() + 86399999).toISOString();
      } else if (dateFilter === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        params.start_date = weekStart.toISOString();
        params.end_date = new Date(weekStart.getTime() + 7 * 86400000).toISOString();
      } else if (dateFilter === 'month') {
        params.start_date = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        params.end_date = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
      } else if (dateFilter === 'custom' && customDateFrom) {
        params.start_date = new Date(customDateFrom).toISOString();
        if (customDateTo) params.end_date = new Date(customDateTo).toISOString();
      }
    };
    mapDateFilter();

    fetchOrders(params);

    // Update URL params
    const urlParams: any = { page: currentPage.toString(), limit: itemsPerPage.toString() };
    if (debouncedSearch) urlParams.search = debouncedSearch;
    if (statusFilter !== 'all') urlParams.status = statusFilter;
    if (typeFilter !== 'all') urlParams.type = typeFilter;
    setSearchParams(urlParams, { replace: true });

  }, [currentPage, itemsPerPage, debouncedSearch, statusFilter, typeFilter, dateFilter, customDateFrom, customDateTo, fetchOrders, setSearchParams]);

  // Handle URL parameter to open specific order on load
  useEffect(() => {
    const openOrderId = searchParams.get('openOrder');
    if (openOrderId) {
      handleView({ id: openOrderId } as any); // Partial Object just for ID
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('openOrder');
      setSearchParams(newParams, { replace: true });
    }
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
    setViewMode(null);
    setSelectedOrder(null);
  };

  const handleInlineStatusEdit = (order: Order) => {
    setEditingStatus(order.id);
    setTempStatus(order.status);
  };

  const handleInlineStatusSave = async (orderId: string) => {
    await updateOrderStatus(orderId, tempStatus);
    setEditingStatus(null);
  };

  const handleInlineStatusCancel = () => {
    setEditingStatus(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setDateFilter('all');
    setCustomDateFrom('');
    setCustomDateTo('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleDelete = async (orderId: string, orderNumber: string) => {
    if (confirm(`Are you sure you want to delete order ${orderNumber}?`)) {
      await deleteOrder(orderId);
      // If deleted last item on page, go back one page if possible
      if (orders.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    }
  };

  const handleView = async (order: Order) => {
    setDetailLoading(true);
    setViewMode('view');
    // Fetch full details
    const fullOrder = await getOrderById(order.id);
    setSelectedOrder(fullOrder || order);
    setDetailLoading(false);
  };

  const handleEdit = async (order: Order) => {
    setDetailLoading(true);
    setViewMode('edit');
    const fullOrder = await getOrderById(order.id);
    const targetOrder = fullOrder || order;
    setSelectedOrder(targetOrder);
    setEditStatus(targetOrder.status);
    setDetailLoading(false);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setViewMode(null);
  };

  const StatusBadge = ({ status, onClick, isEditable = false }: { status: Order['status'], onClick?: () => void, isEditable?: boolean }) => {
    const config = statusConfig[status] || statusConfig['pending'];
    const IconComponent = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-300 ${config.color} ${isEditable ? 'cursor-pointer hover:scale-105 hover:shadow-lg hover:border-opacity-80 group' : ''
          }`}
        onClick={onClick}
        title={isEditable ? "Click to edit status" : ""}
      >
        <IconComponent className="w-4 h-4" />
        <span>{config.label}</span>
        {isEditable && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Pencil className="w-3 h-3" />
          </div>
        )}
      </div>
    );
  };

  const OrderTypeBadge = ({ orderType }: { orderType: Order['order_type'] }) => {
    const isDelivery = orderType === 'delivery';
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${isDelivery
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
        }`}>
        {isDelivery ? <MapPin className="w-3 h-3" /> : <Store className="w-3 h-3" />}
        <span className="capitalize">{orderType}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Orders</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage and track customer orders
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex-1 sm:flex-none"
              >
                Filters
              </button>
              {(statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all' || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex-1 sm:flex-none"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Order Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as Order['order_type'] | 'all')}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
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

          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" /> Loading orders...
                </span>
              ) : (
                <>Showing {orders.length} of {totalOrders} orders</>
              )}
            </span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto min-h-[400px]">
          {loading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-slate-500">Loading orders...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                    Status
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">(Click to edit)</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 border-b border-slate-200 dark:border-slate-700">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{order.order_number}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <div>{order.user?.name || order.customer_name || 'Unknown'}</div>
                      {order.user?.phone && <div className="text-xs text-slate-400">{order.user.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <OrderTypeBadge orderType={order.order_type} />
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {order.items?.slice(0, 3).map((item: any, idx) => (
                        <div key={idx} className="text-sm">
                          {item.quantity} {item.unit_type || 'x'} {item.menu_item_name}
                        </div>
                      ))}
                      {(order.items?.length || 0) > 3 && <div className="text-xs text-slate-400">+{order.items.length - 3} more</div>}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">₹{order.total_amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {editingStatus === order.id ? (
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600 shadow-md">
                          <div className="relative">
                            <select
                              value={tempStatus}
                              onChange={(e) => setTempStatus(e.target.value as Order['status'])}
                              className="appearance-none px-4 py-2.5 pr-10 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="preparing">Preparing</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleInlineStatusSave(order.id)}
                              className="p-2.5 text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                              title="Save Changes"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleInlineStatusCancel}
                              className="p-2.5 text-white bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 rounded-xl transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <StatusBadge
                          status={order.status}
                          onClick={() => handleInlineStatusEdit(order)}
                          isEditable={true}
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(order)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-sm"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(order)}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-sm"
                          title="Edit Order"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id, order.order_number)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-sm"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                {/* Header with Order Number and Type */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{order.order_number}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{order.user?.name || order.customer_name}</p>
                  </div>
                  <OrderTypeBadge orderType={order.order_type} />
                </div>

                {/* Items List */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Items:</h4>
                  <div className="space-y-1">
                    {order.items?.map((item: any, idx) => (
                      <div key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                        {item.quantity} {item.unit_type || 'x'} {item.menu_item_name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amount and Date */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">₹{order.total_amount.toLocaleString()}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Status Section */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status:</h4>
                  {editingStatus === order.id ? (
                    <div className="space-y-3">
                      <select
                        value={tempStatus}
                        onChange={(e) => setTempStatus(e.target.value as Order['status'])}
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInlineStatusSave(order.id)}
                          className="flex-1 px-3 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleInlineStatusCancel}
                          className="flex-1 px-3 py-2 text-white bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleInlineStatusEdit(order)}
                      className="cursor-pointer"
                    >
                      <StatusBadge status={order.status} isEditable={true} />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => handleView(order)}
                    className="flex-1 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(order)}
                    className="flex-1 px-3 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(order.id, order.order_number)}
                    className="flex-1 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalOrders > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalOrders}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemName="orders"
          />
        )}
      </div>

      {selectedOrder && viewMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10001] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
            {detailLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
              </div>
            ) : (
              <>
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                    {viewMode === 'view' ? 'Order Details' : 'Edit Order'}
                  </h2>
                  <button onClick={closeModal} className="text-slate-500 hover:text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Order Number
                      </label>
                      <p className="text-slate-900 dark:text-white font-medium">{selectedOrder.order_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Customer
                      </label>
                      <p className="text-slate-900 dark:text-white">{selectedOrder.user?.name || selectedOrder.customer_name}</p>
                      {selectedOrder.user && (
                        <div className="mt-2 space-y-1">
                          {selectedOrder.user.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Phone className="w-4 h-4" />
                              <span>{selectedOrder.user.phone}</span>
                            </div>
                          )}
                          {selectedOrder.user.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Mail className="w-4 h-4" />
                              <span>{selectedOrder.user.email}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Order Type
                    </label>
                    <OrderTypeBadge orderType={selectedOrder.order_type} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {selectedOrder.order_type === 'delivery' ? 'Delivery Address' : 'Pickup Address'}
                    </label>
                    <div className="text-slate-900 dark:text-white">
                      {/* Handle Address JSON or String */}
                      {typeof selectedOrder.delivery_address_json === 'object' ? (
                        <>
                          <p>{selectedOrder.delivery_address_json.street}</p>
                          <p>{selectedOrder.delivery_address_json.city}, {selectedOrder.delivery_address_json.zip}</p>
                        </>
                      ) : (
                        <p>{selectedOrder.delivery_address || 'No address provided'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Order Items
                    </label>
                    <div className="space-y-2">
                      {selectedOrder.items?.map((item: any, idx) => {
                        // Prefer item snapshot data
                        return (
                          <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{item.menu_item_name}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {item.quantity} {item.unit_type || 'x'} @ ₹{item.unit_price || item.price}
                              </p>
                            </div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              ₹{((item.quantity) * (item.unit_price || item.price)).toLocaleString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                        <span className="text-slate-900 dark:text-white">
                          ₹{selectedOrder.subtotal?.toLocaleString() || '0'}
                        </span>
                      </div>

                      {(selectedOrder.delivery_charges || 0) > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">Delivery Charges</span>
                          <span className="text-slate-900 dark:text-white">
                            ₹{selectedOrder.delivery_charges.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {(selectedOrder.service_charges || 0) > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">Service Charges</span>
                          <span className="text-slate-900 dark:text-white">
                            ₹{selectedOrder.service_charges.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {(selectedOrder.gst_amount || 0) > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">GST</span>
                          <span className="text-slate-900 dark:text-white">
                            ₹{selectedOrder.gst_amount.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-slate-900 dark:text-white">Total Amount</span>
                          <span className="text-lg font-bold text-slate-900 dark:text-white">
                            ₹{selectedOrder.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {viewMode === 'edit' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        update Status
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as Order['status'])}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, editStatus)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Timeline / History could go here */}
                  {selectedOrder.history && selectedOrder.history.length > 0 && (
                    <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                      <h3 className="text-md font-semibold text-slate-900 dark:text-white mb-3">History</h3>
                      <div className="space-y-3">
                        {selectedOrder.history.map((h: any, i: number) => (
                          <div key={i} className="flex gap-3 text-sm">
                            <div className="text-slate-500 w-32 shrink-0">
                              {new Date(h.created_at).toLocaleString()}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{h.status.replace('_', ' ')}</span>
                              {h.notes && <span className="text-slate-500 ml-2">- {h.notes}</span>}
                              {h.changer && <div className="text-xs text-slate-400 mt-0.5">by {h.changer.name}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
