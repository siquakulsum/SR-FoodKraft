import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Calendar, Clock, ShoppingBag, Truck, MapPin, Sparkles, Award, CheckCircle, AlertCircle, X, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { menuData } from '../data/menuData';
import Button from '../components/UI/Button';

export default function CartPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'door'>('pickup');

  // Custom calendar states
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCodeError, setPromoCodeError] = useState('');

  // Notification states
  const [notifications, setNotifications] = useState<Array<{ id: string, type: 'success' | 'error', message: string }>>([]);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [savedForLater, setSavedForLater] = useState<any[]>([]);


  // Check if a date is already booked
  const isDateBooked = (date: string) => {
    return state.orders.some(order => {
      // Only consider active orders (not cancelled)
      if (order.status === 'cancelled') return false;

      // Check if the date matches
      return order.eventDate === date;
    });
  };


  // Calendar utility functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateForAPI = (date: Date) => {
    // Use local date to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateBookedInCalendar = (date: Date) => {
    const dateString = formatDateForAPI(date);
    return isDateBooked(dateString);
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 6; // 6 AM
    const endHour = 22; // 10 PM

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) { // 30-minute slots
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const period = hour < 12 ? 'AM' : 'PM';
        const displayTime = `${time12}:${minute.toString().padStart(2, '0')} ${period}`;

        slots.push({
          value: time24,
          display: displayTime,
          isBooked: isTimeSlotBooked(formatDateForAPI(selectedDate!), time24)
        });
      }
    }
    return slots;
  };

  // Check if a specific time slot is booked
  const isTimeSlotBooked = (date: string, time: string) => {
    return state.orders.some(order =>
      order.eventDate === date &&
      order.eventTime === time &&
      order.status !== 'cancelled'
    );
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (isDateInPast(date) || isDateBookedInCalendar(date)) {
      return;
    }

    setSelectedDate(date);
    setEventDate(formatDateForAPI(date));
    setShowTimeSlots(true);
    setSelectedTimeSlot('');
    setEventTime('');
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setEventTime(timeSlot);
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Promo code validation and application
  const validatePromoCode = (code: string) => {
    const validPromoCodes = {
      'WELCOME10': { discount: 10, type: 'percentage', description: '10% off on your first order' },
      'SAVE20': { discount: 20, type: 'percentage', description: '20% off on orders above ₹2000' },
      'FREEDEL': { discount: 99, type: 'fixed', description: 'Free delivery on your order' },
      'FESTIVE15': { discount: 15, type: 'percentage', description: '15% off festive special' },
      'NEWUSER': { discount: 200, type: 'fixed', description: '₹200 off for new users' }
    };

    return validPromoCodes[code.toUpperCase() as keyof typeof validPromoCodes] || null;
  };

  const applyPromoCode = () => {
    setPromoCodeError('');

    if (!promoCode.trim()) {
      setPromoCodeError('Please enter a promo code');
      return;
    }

    const promoDetails = validatePromoCode(promoCode);

    if (!promoDetails) {
      setPromoCodeError('Invalid promo code');
      return;
    }

    // Check minimum order value for certain codes
    if (promoCode.toUpperCase() === 'SAVE20' && totalAmount < 2000) {
      setPromoCodeError('Minimum order value of ₹2000 required for this promo code');
      return;
    }

    setAppliedPromoCode(promoCode.toUpperCase());

    if (promoDetails.type === 'percentage') {
      setPromoDiscount((totalAmount * promoDetails.discount) / 100);
    } else {
      setPromoDiscount(promoDetails.discount);
    }

    addNotification('success', `Promo code applied! ${promoDetails.description}`);
  };

  const removePromoCode = () => {
    setAppliedPromoCode(null);
    setPromoDiscount(0);
    setPromoCode('');
    setPromoCodeError('');
    addNotification('success', 'Promo code removed');
  };

  // Notification system
  const addNotification = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Save for later functionality
  const moveToSavedForLater = (item: any) => {
    if (!state.user) {
      addNotification('error', 'Please login to save items for later');
      return;
    }

    setSavedForLater(prev => [...prev, item]);
    dispatch({ type: 'REMOVE_FROM_CART', payload: item.id });
    addNotification('success', `${item.menuItem.name} saved for later`);
  };

  // Move back to cart from saved for later
  const moveBackToCart = (item: any) => {
    const cartItem = {
      id: item.id,
      menuItem: item.menuItem,
      quantity: item.quantity,
      unit: item.unit,
      specialInstructions: item.specialInstructions
    };
    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    setSavedForLater(prev => prev.filter(savedItem => savedItem.id !== item.id));
    addNotification('success', `${item.menuItem.name} moved back to cart`);
  };

  // Remove from saved for later
  const removeFromSavedForLater = (item: any) => {
    setSavedForLater(prev => prev.filter(savedItem => savedItem.id !== item.id));
    addNotification('success', `${item.menuItem.name} removed from saved items`);
  };

  // Get recommendations based on cart items
  const getRecommendations = () => {
    try {
      if (state.cart.length === 0) return [];

      // Get categories from cart items
      const cartCategories = state.cart.map(item => item.menuItem.category);
      const cartTypes = state.cart.map(item => item.menuItem.isVegetarian);

      return menuData.filter((item: any) => {
        const isInCart = state.cart.some(cartItem => cartItem.menuItem.id === item.id);
        const matchesCategory = cartCategories.includes(item.category);
        const matchesType = cartTypes.includes(item.isVegetarian);

        return !isInCart && (matchesCategory || matchesType);
      }).slice(0, 4);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    const item = state.cart.find(cartItem => cartItem.id === id);
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: id });
      if (item) {
        addNotification('success', `${item.menuItem.name} removed from cart`);
      }
    } else {
      dispatch({ type: 'UPDATE_CART_ITEM', payload: { id, quantity: newQuantity } });

      // Check for cart errors after dispatch
      setTimeout(() => {
        if (state.cartError) {
          addNotification('error', state.cartError.message);
          dispatch({ type: 'CLEAR_CART_ERROR' });
        } else if (item) {
          addNotification('success', `${item.menuItem.name} quantity updated`);
        }
      }, 100);
    }
  };

  const removeItem = (id: string) => {
    const item = state.cart.find(cartItem => cartItem.id === id);
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    if (item) {
      addNotification('success', `${item.menuItem.name} removed from cart`);
    }
  };

  const subtotal = state.cart.reduce((sum, item) => {
    const price = item.menuItem.pricePerKg || item.menuItem.pricePerPiece || item.menuItem.pricePerLiter || 0;
    return sum + (price * item.quantity);
  }, 0);

  const totalUnits = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryCharge = deliveryMethod === 'door'
    ? (totalUnits <= 5 ? 99 : totalUnits <= 15 ? 199 : totalUnits <= 30 ? 299 : 399)
    : 0;

  // Calculate GST (18%)
  const gstAmount = (subtotal * 18) / 100;

  // Calculate total before promo discount
  const totalBeforeDiscount = subtotal + gstAmount + deliveryCharge;

  // Apply promo discount
  const finalPromoDiscount = appliedPromoCode === 'FREEDEL' ? deliveryCharge : promoDiscount;

  // Final total
  const totalAmount = totalBeforeDiscount - finalPromoDiscount;

  const handleCheckout = () => {
    setAttemptedSubmit(true);
    if (!state.isLoggedIn) {
      navigate('/login?redirect=/cart');
      return;
    }

    if (!eventDate || !eventTime) {
      return;
    }

    // Check if selected date and time slot is booked
    if (isTimeSlotBooked(eventDate, eventTime)) {
      addNotification('error', 'Selected time slot is already booked. Please choose another time.');
      return;
    }

    // Get display time for the selected slot
    const selectedSlot = generateTimeSlots().find(slot => slot.value === eventTime);
    const eventTimeDisplay = selectedSlot ? selectedSlot.display : eventTime;

    navigate('/checkout', {
      state: {
        eventDate,
        eventTime,
        eventTimeDisplay,
        items: state.cart,
        deliveryMethod,
        deliveryCharge,
        subtotal,
        gstAmount,
        promoCode: appliedPromoCode,
        promoDiscount: finalPromoDiscount,
        totalAmount
      }
    });
  };

  if (state.cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gold-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gold-100 to-gold-200 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-gold-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-black-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-xs sm:max-w-md mx-auto px-4">
              Start adding delicious items to your cart and create an unforgettable culinary experience
            </p>
            <Link to="/menu" onClick={scrollToTop}>
              <Button size="lg" className="shadow-gold text-sm sm:text-base">
                Browse Our Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gold-50">
      {/* Notification Container */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center space-x-3 p-4 rounded-xl shadow-lg backdrop-blur-sm border transition-all duration-300 max-w-sm ${notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
              }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            )}
            <span className="font-medium text-sm flex-1">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {/* Enhanced Premium Header */}
      <div className="bg-gradient-to-br from-gray-900 via-black-900 to-gray-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 via-transparent to-gold-500/5" />
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23F59E0B' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 xl:py-24 relative">
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Badge - Mobile Optimized */}
            <div className="inline-flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-gold-500/20 to-gold-400/20 backdrop-blur-sm border border-gold-400/30 rounded-full px-4 py-2 sm:px-6 sm:py-3 shadow-lg">
              <div className="p-1 sm:p-1.5 bg-gold-500/20 rounded-full">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-gold-300" />
              </div>
              <span className="font-inter font-semibold text-gold-100 text-sm sm:text-base">Your Order</span>
            </div>

            {/* Main Title - Responsive Typography */}
            <div className="space-y-2 sm:space-y-4">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-bold text-white leading-tight">
                Shopping Cart
              </h1>
              <div className="w-16 sm:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto rounded-full"></div>
            </div>

            {/* Subtitle - Mobile Optimized */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto leading-relaxed px-2">
              Review your order details and schedule your perfect culinary experience
            </p>

            {/* Cart Summary - Mobile Layout */}
            <div className="flex items-center justify-center space-x-6 sm:space-x-8 pt-2 sm:pt-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gold-400">{state.cart.length}</div>
                <div className="text-xs sm:text-sm text-gray-400">Items</div>
              </div>
              <div className="w-px h-8 sm:h-12 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gold-400">
                  ₹{state.cart.reduce((sum, item) => {
                    const price = item.menuItem.pricePerKg || item.menuItem.pricePerPiece || item.menuItem.pricePerLiter || 0;
                    return sum + (price * item.quantity);
                  }, 0).toFixed(0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Subtotal</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Cart Items - Mobile First Layout */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Cart Items Section - Mobile Responsive */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-8">
              {/* Section Header - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-gold-100 to-gold-200 rounded-xl sm:rounded-2xl shadow-sm">
                    <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-gold-600" />
                  </div>
                  <div>
                    <h2 className="font-poppins font-bold text-xl sm:text-2xl lg:text-3xl text-gray-900">
                      Order Items
                    </h2>
                    <p className="text-gray-600 font-medium text-sm sm:text-base">{state.cart.length} {state.cart.length === 1 ? 'item' : 'items'} in your cart</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                  <span className="sm:hidden">Total:</span>
                  <span className="font-bold text-gold-600 text-base sm:text-lg">
                    ₹{state.cart.reduce((sum, item) => {
                      const price = item.menuItem.pricePerKg || item.menuItem.pricePerPiece || item.menuItem.pricePerLiter || 0;
                      return sum + (price * item.quantity);
                    }, 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Cart Items List - Mobile Responsive */}
              <div className="space-y-4 sm:space-y-6">
                {state.cart.map((item) => (
                  <div key={item.id} className="group bg-gradient-to-r from-white to-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 hover:border-gold-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                      {/* Item Image - Mobile Responsive */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl object-cover shadow-md"
                        />
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-gold-500 to-gold-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                          {item.quantity}
                        </div>
                      </div>

                      {/* Item Details - Mobile Responsive */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <h3 className="font-poppins font-bold text-base sm:text-lg lg:text-xl text-gray-900 mb-1">
                            {item.menuItem.name}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 text-xs sm:text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gold-400 rounded-full"></span>
                              <span>{item.quantity} {item.unit}</span>
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.menuItem.isVegetarian
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                              }`}>
                              {item.menuItem.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gold-600">
                              ₹{((item.menuItem.pricePerKg || item.menuItem.pricePerPiece || item.menuItem.pricePerLiter || 0) * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              ₹{item.menuItem.pricePerKg || item.menuItem.pricePerPiece || item.menuItem.pricePerLiter || 0} per {item.unit}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls & Actions - Mobile Responsive */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                          <div className="flex items-center bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 0.5)}
                              disabled={item.quantity <= (item.menuItem.minQuantity || 0.5)}
                              className="p-2 sm:p-3 hover:bg-gold-50 rounded-l-lg sm:rounded-l-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                            </button>
                            <div className="px-3 sm:px-4 py-2 sm:py-3 border-x border-gray-200">
                              <span className="font-bold text-sm sm:text-lg text-gray-900 min-w-[2.5rem] sm:min-w-[3rem] text-center block">
                                {item.quantity}
                              </span>
                            </div>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 0.5)}
                              disabled={item.quantity >= (item.menuItem.maxQuantity || 10)}
                              className="p-2 sm:p-3 hover:bg-gold-50 rounded-r-lg sm:rounded-r-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                            </button>
                          </div>

                          {/* Limits Info - Hidden on mobile */}
                          <div className="hidden sm:block text-xs text-gray-500 space-y-1">
                            <div>Min: {item.menuItem.minQuantity || 0.5}</div>
                            <div>Max: {item.menuItem.maxQuantity || 10}</div>
                          </div>
                        </div>

                        {/* Action Buttons - Mobile Optimized */}
                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end sm:justify-start">
                          <button
                            onClick={() => moveToSavedForLater(item)}
                            className="p-2 sm:p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg sm:rounded-xl transition-all duration-200 border border-gray-200 hover:border-blue-200"
                            title="Save for later"
                          >
                            <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 sm:p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-200 border border-gray-200 hover:border-red-200"
                            title="Remove from cart"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved for Later Section - Responsive */}
            {savedForLater.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gold-100 shadow-soft p-4 sm:p-6 lg:p-8">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <h2 className="font-poppins font-semibold text-lg sm:text-xl lg:text-2xl text-black-900">
                    Saved for Later ({savedForLater.length})
                  </h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {savedForLater.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-300 transition-colors">
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-inter font-semibold text-gray-900 text-sm sm:text-base truncate">{item.menuItem.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{item.quantity} {item.unit}</p>
                        <p className="font-inter font-semibold text-gold-600 text-sm sm:text-base">
                          ₹{((item.menuItem.pricePerKg || item.menuItem.pricePerPiece || item.menuItem.pricePerLiter || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex space-x-2 w-full sm:w-auto">
                        <button
                          onClick={() => moveBackToCart(item)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors text-xs sm:text-sm font-medium"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => removeFromSavedForLater(item)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Remove"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations Section - Responsive */}
            {showRecommendations && getRecommendations() && getRecommendations().length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gold-100 shadow-soft p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gold-100 rounded-xl">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-gold-600" />
                    </div>
                    <h3 className="font-poppins font-semibold text-lg sm:text-xl text-black-900">
                      You Might Also Like
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowRecommendations(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {getRecommendations()?.map((recommendation: any) => (
                    <div key={recommendation.id} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl hover:border-gold-300 transition-colors">
                      <img
                        src={recommendation.image}
                        alt={recommendation.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-poppins font-semibold text-black-900 mb-1 text-sm sm:text-base truncate">
                          {recommendation.name}
                        </h4>
                        <p className="text-gray-600 text-xs sm:text-sm mb-2">
                          {recommendation.category} • {recommendation.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                          <span className="text-gold-600 font-semibold text-sm sm:text-base">
                            ₹{recommendation.pricePerKg || recommendation.pricePerPiece || recommendation.pricePerLiter}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => {
                              const cartItem = {
                                id: `${recommendation.id}-${recommendation.pricePerKg ? 'kg' : 'piece'}`,
                                menuItem: recommendation,
                                quantity: recommendation.minQuantity || 1,
                                unit: (recommendation.pricePerKg ? 'kg' : 'pieces') as 'kg' | 'pieces' | 'liters',
                                specialInstructions: '',
                              };
                              dispatch({ type: 'ADD_TO_CART', payload: cartItem });
                              addNotification('success', `${recommendation.name} added to cart`);
                            }}
                            className="text-xs px-2 sm:px-3 py-1 w-full sm:w-auto"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Responsive Sidebar */}
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Event Details Section - Mobile Responsive */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-5">
              {/* Section Header - Mobile Optimized */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-gold-100 to-gold-200 rounded-lg sm:rounded-xl">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-base sm:text-lg text-gray-900">
                    Event Details
                  </h3>
                  <p className="text-gray-600 text-xs">Select date and time</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Event Date & Time</label>

                  {/* Mobile Responsive Calendar */}
                  <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg sm:rounded-xl p-3 mb-3 shadow-sm">
                    {/* Mobile Calendar Header */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <button
                        onClick={goToPreviousMonth}
                        className="p-1 sm:p-1.5 hover:bg-gold-100 rounded-md sm:rounded-lg transition-colors group"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 group-hover:text-gold-600" />
                      </button>
                      <h3 className="font-bold text-sm sm:text-base text-gray-900">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                        onClick={goToNextMonth}
                        className="p-1 sm:p-1.5 hover:bg-gold-100 rounded-md sm:rounded-lg transition-colors group"
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 group-hover:text-gold-600" />
                      </button>
                    </div>

                    {/* Mobile Calendar Grid */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-0.5 sm:p-1 text-center text-xs font-medium text-gray-500 flex items-center justify-center min-h-[1rem] sm:min-h-[1.25rem]">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                      {Array.from({ length: getFirstDayOfMonth(currentMonth) }, (_, i) => (
                        <div key={`empty-${i}`} className="p-0.5 sm:p-1"></div>
                      ))}

                      {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => {
                        const day = i + 1;
                        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                        const isPast = isDateInPast(date);
                        const isBooked = isDateBookedInCalendar(date);
                        const isSelected = selectedDate && selectedDate.getTime() === date.getTime();
                        const isToday = date.toDateString() === new Date().toDateString();

                        return (
                          <button
                            key={day}
                            onClick={() => handleDateSelect(date)}
                            disabled={isPast || isBooked}
                            className={`
                              p-0.5 sm:p-1 text-xs rounded-sm sm:rounded-md transition-all duration-200
                              flex flex-col items-center justify-center min-h-[1.5rem] sm:min-h-[1.75rem]
                              ${isPast
                                ? 'text-gray-300 cursor-not-allowed'
                                : isBooked
                                  ? 'text-red-500 bg-red-50 cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-gold-500 text-white font-semibold'
                                    : isToday
                                      ? 'bg-gold-100 text-gold-700 font-semibold hover:bg-gold-200'
                                      : 'text-gray-700 hover:bg-gray-100'
                              }
                            `}
                          >
                            <span className="leading-tight">{day}</span>
                            {isBooked && (
                              <div className="w-0.5 h-0.5 bg-red-500 rounded-full mt-0.5"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Responsive Time Slots */}
                  {showTimeSlots && selectedDate && (
                    <div className="bg-gradient-to-br from-gold-50 to-white border border-gold-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                        <div className="p-1 sm:p-1.5 bg-gold-100 rounded-md sm:rounded-lg">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gold-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                            Available Time Slots
                          </h4>
                          <p className="text-xs text-gray-600">
                            {selectedDate.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-1.5">
                        {generateTimeSlots().map((slot) => (
                          <button
                            key={slot.value}
                            onClick={() => handleTimeSlotSelect(slot.value)}
                            disabled={slot.isBooked}
                            className={`
                              p-1.5 sm:p-2 text-xs rounded-md border-2 transition-all duration-200 font-medium
                              flex flex-col items-center justify-center min-h-[1.75rem] sm:min-h-[2rem]
                              ${slot.isBooked
                                ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed'
                                : selectedTimeSlot === slot.value
                                  ? 'border-gold-500 bg-gold-500 text-white'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gold-300 hover:bg-gold-50'
                              }
                            `}
                          >
                            <span className="leading-tight">{slot.display}</span>
                            {slot.isBooked && (
                              <span className="text-xs text-red-500 mt-0.5 leading-tight">Booked</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compact Selection Summary */}
                  {selectedDate && selectedTimeSlot && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
                      <div className="flex items-center space-x-2 text-green-700">
                        <div className="p-1 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-green-800 text-xs">Event Scheduled!</p>
                          <p className="text-green-600 text-xs">
                            {selectedDate.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })} at {generateTimeSlots().find(slot => slot.value === selectedTimeSlot)?.display}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {attemptedSubmit && !eventDate && (
                    <p className="text-red-500 text-xs sm:text-sm mt-2">Please select an event date and time</p>
                  )}
                </div>

              </div>
            </div>

            {/* Delivery Method Section - Mobile Responsive */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-5">
              {/* Section Header - Mobile Optimized */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-gold-100 to-gold-200 rounded-lg sm:rounded-xl">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-base sm:text-lg text-gray-900">
                    Delivery Method
                  </h3>
                  <p className="text-gray-600 text-xs">Choose delivery option</p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`w-full p-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${deliveryMethod === 'pickup'
                    ? 'border-gold-500 bg-gradient-to-r from-gold-50 to-gold-100 shadow-md'
                    : 'border-gray-200 hover:border-gold-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-md sm:rounded-lg ${deliveryMethod === 'pickup' ? 'bg-gold-200' : 'bg-gray-100'}`}>
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gold-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-gray-900 text-sm sm:text-base">Pick Up</p>
                      <p className="text-gray-600 text-xs">Collect from our kitchen</p>
                    </div>
                    {deliveryMethod === 'pickup' && (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gold-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setDeliveryMethod('door')}
                  className={`w-full p-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${deliveryMethod === 'door'
                    ? 'border-gold-500 bg-gradient-to-r from-gold-50 to-gold-100 shadow-md'
                    : 'border-gray-200 hover:border-gold-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-md sm:rounded-lg ${deliveryMethod === 'door' ? 'bg-gold-200' : 'bg-gray-100'}`}>
                      <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-gold-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-gray-900 text-sm sm:text-base">Door Delivery</p>
                      <p className="text-gray-600 text-xs">
                        {deliveryCharge === 0 ? 'Free delivery' : `₹${deliveryCharge} delivery charge`}
                      </p>
                    </div>
                    {deliveryMethod === 'door' && (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gold-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Responsive Order Summary */}
            <div className="bg-gradient-to-br from-gold-50 via-gold-100 to-gold-200 rounded-xl sm:rounded-2xl border border-gold-300 shadow-lg p-4 sm:p-5">
              {/* Section Header - Mobile Optimized */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg sm:rounded-xl shadow-md">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-base sm:text-lg text-gray-900">
                    Order Summary
                  </h3>
                  <p className="text-gray-700 text-xs">Review your order</p>
                </div>
              </div>

              {/* Mobile Responsive Promo Code Section */}
              <div className="mb-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 sm:p-1.5 bg-orange-100 rounded-md sm:rounded-lg">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                    </div>
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">Have a promo code?</span>
                  </div>
                  {!appliedPromoCode && (
                    <span className="text-xs text-gray-500 hidden sm:block">Save more</span>
                  )}
                </div>

                {!appliedPromoCode ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Enter promo code"
                          className="w-full px-3 py-2 pr-12 sm:pr-14 rounded-md sm:rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 font-inter text-xs sm:text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                        />
                        <button
                          onClick={applyPromoCode}
                          disabled={!promoCode.trim()}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 px-2 sm:px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                    {promoCodeError && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <p className="text-xs">{promoCodeError}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-gray-500">Popular:</span>
                      {['WELCOME10', 'SAVE20', 'FREEDEL'].map((code) => (
                        <button
                          key={code}
                          onClick={() => setPromoCode(code)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-green-100 rounded-full">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-green-800 text-xs sm:text-sm">{appliedPromoCode}</span>
                          <span className="px-2 py-1 text-xs bg-green-200 text-green-700 rounded-full">Applied</span>
                        </div>
                        <p className="text-xs text-green-600">You saved ₹{finalPromoDiscount.toFixed(2)}</p>
                      </div>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-inter text-gray-600 text-sm">Subtotal</span>
                  <span className="font-inter font-semibold text-sm">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-inter text-gray-600 text-sm">GST (18%)</span>
                  <span className="font-inter font-semibold text-sm">₹{gstAmount.toFixed(2)}</span>
                </div>

                {deliveryMethod === 'door' && (
                  <div className="flex justify-between items-center">
                    <span className="font-inter text-gray-600 text-sm">Delivery Charge</span>
                    <span className="font-inter font-semibold text-sm">₹{deliveryCharge.toFixed(2)}</span>
                  </div>
                )}

                {appliedPromoCode && finalPromoDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="font-inter text-sm">Promo Discount ({appliedPromoCode})</span>
                    <span className="font-inter font-semibold text-sm">-₹{finalPromoDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-gold-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-poppins font-bold text-base text-gray-900">Total</span>
                    <span className="font-poppins font-bold text-lg text-gold-600">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Responsive Checkout Button */}
              <div className="mt-4 sm:mt-6 space-y-3">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                  size="lg"
                  disabled={!state.isLoggedIn}
                >
                  {state.isLoggedIn ? 'Proceed to Checkout' : 'Login to Continue'}
                </Button>

                {!state.isLoggedIn && (
                  <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <Link to="/login?redirect=/cart" className="font-semibold text-blue-600 hover:text-blue-700 underline">
                        Sign in
                      </Link>{' '}
                      to continue with your order
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}