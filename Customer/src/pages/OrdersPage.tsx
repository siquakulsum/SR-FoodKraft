import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Clock, Package, CheckCircle, XCircle, Download, AlertTriangle,
  Search, Filter, SortAsc, SortDesc, RotateCcw, Share2, Heart, MessageSquare,
  FileText, Eye, EyeOff, MoreVertical, RefreshCw,
  MapPin, Phone, Mail, Printer, Copy, Bookmark, BookmarkCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import RatingModal from '../components/UI/RatingModal';
import StarRating from '../components/UI/StarRating';

export default function OrdersPage() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<{ id: string, name: string, image: string } | null>(null);

  // New state for enhanced features
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'eventDate' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    amountRange: { min: '', max: '' },
    paymentMethod: '',
    status: ''
  });
  const [favoriteOrders, setFavoriteOrders] = useState<string[]>([]);
  const [orderNotes, setOrderNotes] = useState<{ [key: string]: string }>({});


  // Use actual orders from app state
  const userOrders = state.orders.filter(order => order.userId === state.user?.id);

  // Debug logging
  console.log('User orders:', userOrders);
  console.log('User ID:', state.user?.id);
  console.log('All orders:', state.orders);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'preparing':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return 'Order Placed';
      case 'paid':
        return 'Payment Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
    }
  };

  const canCancelOrder = (order: Order) => {
    const eventDate = new Date(order.eventDate);
    const today = new Date();
    const hoursUntilEvent = (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60);

    // Can cancel if order is placed/paid and event is more than 24 hours away
    return (order.status === 'placed' || order.status === 'paid') && hoursUntilEvent > 24;
  };

  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = () => {
    if (orderToCancel) {
      dispatch({ type: 'CANCEL_ORDER', payload: orderToCancel.id });
      setShowCancelModal(false);
      setOrderToCancel(null);
    }
  };

  const handleRateItem = (item: { id: string, name: string, image: string }) => {
    setSelectedMenuItem(item);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = (rating: number, review: string) => {
    if (selectedMenuItem) {
      const newRating = {
        id: Date.now().toString(),
        menuItemId: selectedMenuItem.id,
        userId: state.user?.id || '',
        rating,
        review,
        createdAt: new Date().toISOString(),
        userName: state.user?.name || 'Anonymous'
      };

      dispatch({ type: 'ADD_RATING', payload: newRating });
      setShowRatingModal(false);
      setSelectedMenuItem(null);
    }
  };

  // Enhanced filtering and sorting logic
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = userOrders.filter(order => {
      // Tab filtering
      const tabMatch = (() => {
        switch (activeTab) {
          case 'upcoming':
            return order.status !== 'cancelled' && order.status !== 'delivered';
          case 'past':
            return order.status === 'delivered';
          case 'cancelled':
            return order.status === 'cancelled';
          default:
            return true;
        }
      })();

      // Search filtering
      const searchMatch = !searchTerm ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.deliveryAddress.address.toLowerCase().includes(searchTerm.toLowerCase());

      // Advanced filters
      const dateMatch = !filters.dateRange.start || !filters.dateRange.end ||
        (new Date(order.eventDate) >= new Date(filters.dateRange.start) &&
          new Date(order.eventDate) <= new Date(filters.dateRange.end));

      const amountMatch = (!filters.amountRange.min || order.totalAmount >= parseFloat(filters.amountRange.min)) &&
        (!filters.amountRange.max || order.totalAmount <= parseFloat(filters.amountRange.max));

      const paymentMatch = !filters.paymentMethod || order.paymentMethod === filters.paymentMethod;
      const statusMatch = !filters.status || order.status === filters.status;

      return tabMatch && searchMatch && dateMatch && amountMatch && paymentMatch && statusMatch;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'amount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'eventDate':
          aValue = new Date(a.eventDate).getTime();
          bValue = new Date(b.eventDate).getTime();
          break;
        case 'status':
          const statusOrder = { 'placed': 1, 'paid': 2, 'preparing': 3, 'delivered': 4, 'cancelled': 5 };
          aValue = statusOrder[a.status] || 0;
          bValue = statusOrder[b.status] || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [userOrders, activeTab, searchTerm, sortBy, sortOrder, filters]);

  // Removed analytics feature

  if (!state.isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-poppins font-semibold text-black mb-4">
            Please login to view your orders
          </h2>
          <p className="text-gray-600 font-inter">
            You need to be logged in to access this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-poppins font-bold text-black mb-2">
                My Orders
              </h1>
              <p className="text-gray-600 font-inter text-lg">
                Track and manage your catering orders
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Analytics Panel removed */}

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders, items, or addresses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-3">
                {/* Sort */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="sort-select" className="text-sm font-inter text-gray-600">Sort by:</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gold"
                  >
                    <option value="date">Order Date</option>
                    <option value="amount">Amount</option>
                    <option value="eventDate">Event Date</option>
                    <option value="status">Status</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </button>
                </div>

                {/* View Mode */}
                <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gold text-black' : 'text-gray-500'}`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gold text-black' : 'text-gray-500'}`}
                  >
                    <Package className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`p-2 ${viewMode === 'compact' ? 'bg-gold text-black' : 'text-gray-500'}`}
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                </div>

                {/* Filters */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${showFilters ? 'bg-gold text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-inter text-gray-600 mb-1">Date Range</label>
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-inter text-gray-600 mb-1">Amount Range</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.amountRange.min}
                        onChange={(e) => setFilters(prev => ({ ...prev, amountRange: { ...prev.amountRange, min: e.target.value } }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.amountRange.max}
                        onChange={(e) => setFilters(prev => ({ ...prev, amountRange: { ...prev.amountRange, max: e.target.value } }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="payment-method-select" className="block text-sm font-inter text-gray-600 mb-1">Payment Method</label>
                    <select
                      id="payment-method-select"
                      value={filters.paymentMethod}
                      onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">All Methods</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="netbanking">Net Banking</option>
                      <option value="cod">Cash on Delivery</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="status-select" className="block text-sm font-inter text-gray-600 mb-1">Status</label>
                    <select
                      id="status-select"
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="placed">Placed</option>
                      <option value="paid">Paid</option>
                      <option value="preparing">Preparing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setFilters({ dateRange: { start: '', end: '' }, amountRange: { min: '', max: '' }, paymentMethod: '', status: '' })}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { key: 'upcoming', label: 'Upcoming Orders', count: userOrders.filter(o => o.status !== 'cancelled' && o.status !== 'delivered').length },
                { key: 'past', label: 'Past Orders', count: userOrders.filter(o => o.status === 'delivered').length },
                { key: 'cancelled', label: 'Cancelled Orders', count: userOrders.filter(o => o.status === 'cancelled').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${activeTab === tab.key
                    ? 'border-gold text-gold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${activeTab === tab.key
                    ? 'bg-gold text-black'
                    : 'bg-gray-100 text-gray-600'
                    }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="bg-gold rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-inter font-medium text-black">
                  {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedOrders([])}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear Selection
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    // Export selected orders
                    const selectedOrdersData = filteredAndSortedOrders.filter(order =>
                      selectedOrders.includes(order.id)
                    );
                    const dataStr = JSON.stringify(selectedOrdersData, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `orders-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-inter font-medium"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={() => {
                    // Add all selected orders to favorites
                    setFavoriteOrders(prev => [...new Set([...prev, ...selectedOrders])]);
                    setSelectedOrders([]);
                    alert('Selected orders added to favorites!');
                  }}
                  className="flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-inter font-medium"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Add to Favorites
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-6">
          {filteredAndSortedOrders.length > 0 ? (
            filteredAndSortedOrders.map((order) => (
              <div key={order.id} className={`bg-white rounded-lg shadow-md p-6 transition-all ${selectedOrders.includes(order.id) ? 'ring-2 ring-gold bg-yellow-50' : ''
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {/* Bulk Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(prev => [...prev, order.id]);
                        } else {
                          setSelectedOrders(prev => prev.filter(id => id !== order.id));
                        }
                      }}
                      className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                    />

                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className="font-poppins font-semibold text-lg text-black">
                        Order #{order.id}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-orange-800'
                      }`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Favorite Button */}
                    <button
                      onClick={() => {
                        if (favoriteOrders.includes(order.id)) {
                          setFavoriteOrders(prev => prev.filter(id => id !== order.id));
                        } else {
                          setFavoriteOrders(prev => [...prev, order.id]);
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${favoriteOrders.includes(order.id)
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600'
                        }`}
                    >
                      {favoriteOrders.includes(order.id) ?
                        <BookmarkCheck className="h-4 w-4" /> :
                        <Bookmark className="h-4 w-4" />
                      }
                    </button>

                    <div className="text-right">
                      <p className="font-poppins font-bold text-lg text-gold">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-gray-500 font-inter text-sm">
                        Ordered on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="font-inter text-sm">
                      Event Date: {new Date(order.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="font-inter text-sm">
                      Event Time: {order.eventTime}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-inter text-sm text-gray-600">
                        Delivery Address: {order.deliveryAddress.address}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center px-4 py-2 bg-gold text-black rounded-lg hover:bg-yellow-500 transition-colors font-inter font-medium"
                      >
                        View Details
                      </button>

                      {/* Reorder Button */}
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => {
                            // Add items to cart for reorder
                            order.items.forEach(item => {
                              dispatch({
                                type: 'ADD_TO_CART',
                                payload: {
                                  menuItem: item,
                                  quantity: item.quantity,
                                  unit: item.unit
                                }
                              });
                            });
                            alert('Items added to cart for reorder!');
                          }}
                          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-inter font-medium"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reorder
                        </button>
                      )}

                      {/* Share Button */}
                      <button
                        onClick={async () => {
                          const shareData = {
                            title: `Order #${order.id} - SR Food Kraft`,
                            text: `Check out my order from SR Food Kraft! Total: ₹${order.totalAmount.toFixed(2)}`,
                            url: window.location.href
                          };
                          try {
                            await navigator.share(shareData);
                          } catch (err) {
                            navigator.clipboard.writeText(`Order #${order.id} - SR Food Kraft - ₹${order.totalAmount.toFixed(2)}`);
                            alert('Order details copied to clipboard!');
                          }
                        }}
                        className="flex items-center px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </button>

                      {canCancelOrder(order) && (
                        <button
                          onClick={() => handleCancelOrder(order)}
                          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-inter font-medium"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <button
                          onClick={() => {
                            // Generate and download invoice
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                  <title>Invoice - Order #${order.id}</title>
                                  <style>
                                    body { font-family: Arial, sans-serif; margin: 20px; }
                                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                                    .company-name { font-size: 24px; font-weight: bold; }
                                    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
                                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                    .items-table th { background-color: #f5f5f5; }
                                    .total { text-align: right; font-size: 18px; font-weight: bold; }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <div class="company-name">SR Food Kraft</div>
                                    <p>Invoice #${order.id}</p>
                                  </div>
                                  <div class="invoice-details">
                                    <div>
                                      <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                                      <p><strong>Event Date:</strong> ${new Date(order.eventDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <p><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
                                    </div>
                                  </div>
                                  <table class="items-table">
                                    <thead>
                                      <tr>
                                        <th>Item</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${order.items.map(item => `
                                        <tr>
                                          <td>${item.name}</td>
                                          <td>${item.quantity} ${item.unit}</td>
                                          <td>₹${item.price.toFixed(2)}</td>
                                          <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                      `).join('')}
                                    </tbody>
                                  </table>
                                  <div class="total">Total: ₹${order.totalAmount.toFixed(2)}</div>
                                </body>
                                </html>
                              `);
                              printWindow.document.close();
                              printWindow.print();
                            }
                          }}
                          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Progress */}
                {order.status !== 'cancelled' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      {['placed', 'paid', 'preparing', 'delivered'].map((step, index) => {
                        const isCompleted = ['placed', 'paid', 'preparing', 'delivered'].indexOf(order.status) >= index;
                        const isCurrent = order.status === step;

                        return (
                          <div key={step} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${isCompleted
                              ? 'bg-gold text-black'
                              : 'bg-gray-200 text-gray-500'
                              }`}>
                              {index + 1}
                            </div>
                            <span className={`text-xs mt-1 ${isCurrent ? 'text-gold font-medium' : 'text-gray-500'
                              }`}>
                              {step.charAt(0).toUpperCase() + step.slice(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="relative mt-2">
                      <div className="absolute top-0 left-0 h-1 bg-gray-200 rounded-full" style={{ width: '100%' }}></div>
                      <div
                        className="absolute top-0 left-0 h-1 bg-gold rounded-full transition-all duration-300"
                        style={{
                          width: `${((['placed', 'paid', 'preparing', 'delivered'].indexOf(order.status) + 1) / 4) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-poppins font-semibold text-black mb-2">
                {searchTerm || Object.values(filters).some(f => f !== '' && f !== null && f !== undefined)
                  ? 'No orders found'
                  : `No ${activeTab} orders`}
              </h3>
              <p className="text-gray-600 font-inter mb-6">
                {searchTerm || Object.values(filters).some(f => f !== '' && f !== null && f !== undefined)
                  ? 'Try adjusting your search or filter criteria'
                  : activeTab === 'upcoming'
                    ? "You don't have any upcoming orders"
                    : activeTab === 'past'
                      ? "You don't have any past orders"
                      : "You don't have any cancelled orders"}
              </p>
              {(searchTerm || Object.values(filters).some(f => f !== '' && f !== null && f !== undefined)) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({ dateRange: { start: '', end: '' }, amountRange: { min: '', max: '' }, paymentMethod: '', status: '' });
                  }}
                  className="px-6 py-3 bg-gold text-black rounded-lg hover:bg-yellow-500 transition-colors font-inter font-medium"
                >
                  Clear Search & Filters
                </button>
              )}
              {activeTab === 'upcoming' && !searchTerm && !Object.values(filters).some(f => f !== '' && f !== null && f !== undefined) && (
                <button
                  onClick={() => window.location.href = '/menu'}
                  className="px-6 py-3 bg-gold text-black rounded-lg hover:bg-yellow-500 transition-colors font-inter font-medium"
                >
                  Browse Menu
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details - #${selectedOrder?.id}`}
      >
        {selectedOrder ? (
          <div className="space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(selectedOrder.status)}
                <span className="font-poppins font-semibold text-lg">
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>
              <span className="text-gold font-poppins font-bold text-xl">
                ₹{selectedOrder.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Event Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-poppins font-semibold text-black mb-3">Event Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-inter text-gray-700">
                    {new Date(selectedOrder.eventDate).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-inter text-gray-700">
                    {selectedOrder.eventTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-poppins font-semibold text-black mb-3">Delivery Address</h4>
              <div className="font-inter text-gray-700">
                <p className="capitalize font-medium">{selectedOrder.deliveryAddress.name} Address</p>
                <p>{selectedOrder.deliveryAddress.address}</p>
                <p>Phone: {selectedOrder.deliveryAddress.phone}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-poppins font-semibold text-black mb-3">Order Items</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => {
                  const existingRating = state.ratings.find(r => r.menuItemId === item.id && r.userId === state.user?.id);

                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg mr-3"
                          />
                          <div>
                            <p className="font-inter font-medium text-black text-sm">
                              {item.name}
                            </p>
                            <p className="font-inter text-gray-500 text-xs">
                              {item.quantity} {item.unit}
                            </p>
                          </div>
                        </div>
                        <p className="font-inter font-medium text-black text-sm">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Rating Section */}
                      {selectedOrder.status === 'delivered' && (
                        <div className="border-t border-gray-200 pt-3">
                          {existingRating ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <StarRating
                                  rating={existingRating.rating}
                                  readonly={true}
                                  size="sm"
                                />
                                <span className="text-xs text-gray-600 font-inter">
                                  You rated this item
                                </span>
                              </div>
                              <button
                                onClick={() => handleRateItem({
                                  id: item.id,
                                  name: item.name,
                                  image: item.image
                                })}
                                className="text-xs text-gold hover:text-yellow-600 font-medium"
                              >
                                Edit Rating
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <StarRating
                                  rating={0}
                                  onRatingChange={(rating) => {
                                    if (rating > 0) {
                                      handleRateItem({
                                        id: item.id,
                                        name: item.name,
                                        image: item.image
                                      });
                                    }
                                  }}
                                  size="sm"
                                />
                                <span className="text-xs text-gray-600 font-inter">
                                  Rate this menu now
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Timeline */}
            <div>
              <h4 className="font-poppins font-semibold text-black mb-3">Order Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gold rounded-full"></div>
                  <div>
                    <p className="font-inter font-medium text-black">Order Placed</p>
                    <p className="font-inter text-sm text-gray-500">
                      {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {selectedOrder.status !== 'placed' && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gold rounded-full"></div>
                    <div>
                      <p className="font-inter font-medium text-black">Payment Confirmed</p>
                      <p className="font-inter text-sm text-gray-500">
                        {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}

                {(selectedOrder.status === 'preparing' || selectedOrder.status === 'delivered') && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gold rounded-full"></div>
                    <div>
                      <p className="font-inter font-medium text-black">Preparation Started</p>
                      <p className="font-inter text-sm text-gray-500">
                        Kitchen team has started preparing your order
                      </p>
                    </div>
                  </div>
                )}

                {selectedOrder.status === 'delivered' && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-inter font-medium text-black">Order Delivered</p>
                      <p className="font-inter text-sm text-gray-500">
                        Successfully delivered to your event location
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t">
              {canCancelOrder(selectedOrder) && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder)}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-inter font-medium"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Order
                </button>
              )}
              {selectedOrder.status === 'delivered' && (
                <button className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-inter font-medium">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-inter font-medium"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading order details...</p>
          </div>
        )}
      </Modal>

      {/* Cancel Order Confirmation Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-2">
              Cancel Order
            </h3>
            <p className="text-sm font-inter text-gray-600 mb-6">
              Are you sure you want to cancel order #{orderToCancel?.id}? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
                className="flex-1"
              >
                Keep Order
              </Button>
              <Button
                onClick={confirmCancelOrder}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Cancel Order
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setSelectedMenuItem(null);
        }}
        menuItemName={selectedMenuItem?.name || ''}
        menuItemImage={selectedMenuItem?.image || ''}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
}