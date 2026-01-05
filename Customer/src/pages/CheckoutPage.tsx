import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Calendar, Clock, Shield, ArrowLeft, DollarSign, CheckCircle, Sparkles, Loader2, AlertCircle, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/UI/Button';
import { Address, Order } from '../types';
import { processPayment, getAvailableBanks, formatCardNumber, formatExpiryDate, generateUpiQrData, PaymentMethod, PaymentResult } from '../services/paymentService';

export default function CheckoutPage() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const checkoutData = location.state;

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    state.user?.addresses?.[0] || null
  );
  const [newAddress, setNewAddress] = useState({
    type: 'home' as 'home' | 'office' | 'other',
    name: '',
    phone: '',
    doorNo: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'cod' | 'emi' | 'wallet'>(checkoutData?.selectedPaymentMethod || 'card');

  // Debug payment method changes
  useEffect(() => {
    console.log('Payment method changed to:', paymentMethod);
  }, [paymentMethod]);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [upiId, setUpiId] = useState('');
  const [upiPaymentType, setUpiPaymentType] = useState<'upiId' | 'qrCode'>('upiId');
  const [netBankingDetails, setNetBankingDetails] = useState({
    bank: '',
    accountNumber: '',
  });
  const [emiDetails, setEmiDetails] = useState({
    provider: '',
    tenure: 6,
  });
  const [walletProvider, setWalletProvider] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!checkoutData || !state.isLoggedIn) {
    navigate('/cart');
    return null;
  }

  // Safety check to prevent page from emptying
  if (!checkoutData.items || checkoutData.items.length === 0) {
    console.error('No items in checkout data, redirecting to cart');
    navigate('/cart');
    return null;
  }

  const {
    eventDate,
    eventTime,
    eventTimeDisplay,
    items = [],
    totalAmount = 0,
    deliveryMethod,
    deliveryCharge = 0,
    subtotal: cartSubtotal = 0,
    gstAmount = 0,
    promoCode,
    promoDiscount = 0
  } = checkoutData || {};
  const finalAmount = totalAmount || 0;

  const handleAddressSubmit = () => {
    // Create the full address string from components
    const fullAddress = [
      newAddress.doorNo,
      newAddress.street,
      newAddress.city,
      newAddress.state,
      newAddress.zipCode
    ].filter(Boolean).join(', ');

    const address: Address = {
      id: Date.now().toString(),
      type: newAddress.type,
      name: newAddress.name,
      address: fullAddress,
      phone: newAddress.phone,
      isDefault: false,
      // Keep detailed fields for future use
      doorNo: newAddress.doorNo,
      street: newAddress.street,
      city: newAddress.city,
      state: newAddress.state,
      zipCode: newAddress.zipCode,
    };

    dispatch({ type: 'ADD_ADDRESS', payload: address });
    setSelectedAddress(address);
    setShowNewAddressForm(false);

    setNewAddress({
      type: 'home',
      street: '',
      city: '',
      state: '',
      zipCode: '',
    });
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      setPaymentError('Please select a delivery address');
      return;
    }

    setIsProcessing(true);
    setPaymentError('');

    try {
      // Prepare payment method data
      console.log('Processing payment for method:', paymentMethod);
      let paymentData: PaymentMethod;

      switch (paymentMethod) {
        case 'card':
          paymentData = {
            type: 'card',
            details: cardDetails
          };
          break;
        case 'upi':
          paymentData = {
            type: 'upi',
            details: {
              upiId: upiPaymentType === 'upiId' ? upiId : undefined,
              qrCode: upiPaymentType === 'qrCode'
            }
          };
          break;
        case 'netbanking':
          paymentData = {
            type: 'netbanking',
            details: netBankingDetails
          };
          break;
        case 'emi':
          paymentData = {
            type: 'emi',
            details: {
              provider: emiDetails.provider || 'bajaj',
              tenure: emiDetails.tenure
            }
          };
          break;
        case 'wallet':
          paymentData = {
            type: 'wallet',
            details: {
              provider: walletProvider || 'phonepe'
            }
          };
          break;
        case 'cod':
          paymentData = {
            type: 'cod',
            details: {}
          };
          break;
        default:
          throw new Error('Invalid payment method');
      }

      // Process payment
      console.log('About to process payment with data:', paymentData);
      const paymentResult: PaymentResult = await processPayment(paymentData, finalAmount);
      console.log('Payment result:', paymentResult);

      if (!paymentResult.success) {
        setPaymentError(paymentResult.error || 'Payment failed');
        return;
      }

      // Payment successful - create order
      const order: Order = {
        id: `ORD${Date.now()}`,
        userId: state.user?.id || 'guest',
        items,
        eventDate,
        eventTime,
        deliveryAddress: selectedAddress || {} as Address,
        totalAmount: finalAmount,
        status: paymentMethod === 'cod' ? 'placed' : 'paid',
        createdAt: new Date().toISOString(),
        // Add payment details
        paymentMethod: paymentMethod,
        transactionId: paymentResult.transactionId,
        paymentTimestamp: paymentResult.timestamp
      };

      dispatch({ type: 'ADD_ORDER', payload: order });
      dispatch({ type: 'CLEAR_CART' });

      setPaymentSuccess(true);

      // Navigate to confirmation after a brief success display
      setTimeout(() => {
        navigate('/order-confirmation', {
          state: { order, paymentResult }
        });
      }, 1500);

    } catch (error) {
      console.error('Payment failed:', error);
      console.error('Payment method:', paymentMethod);
      console.error('Error details:', error);
      setPaymentError(`Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add error boundary to prevent page from emptying
  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gold-50">
        {/* Premium Header - Responsive */}
        <div className="bg-gradient-to-r from-black-900 via-black-800 to-black-900 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-transparent" />
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F59E0B' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }} />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-gold-500/20 backdrop-blur-sm border border-gold-400/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gold-400" />
                <span className="font-inter font-semibold text-gold-100 text-sm sm:text-base">Secure Checkout</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-playfair font-bold text-white mb-4 sm:mb-6">
                Complete Your Order
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto px-4">
                Finalize your order details and secure payment to complete your booking
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Event Details */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gold-100 shadow-soft p-6 sm:p-8">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                  <div className="p-1.5 sm:p-2 bg-gold-100 rounded-lg sm:rounded-xl">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gold-600" />
                  </div>
                  <h2 className="font-poppins font-semibold text-lg sm:text-xl lg:text-2xl text-black-900">Event Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-r from-gold-50 to-gold-100 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gold-600" />
                      <span className="font-inter font-semibold text-black-900 text-sm sm:text-base">Event Date</span>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base">{(() => {
                      // Parse the date string to avoid timezone issues
                      const [year, month, day] = eventDate.split('-').map(Number);
                      const date = new Date(year, month - 1, day);
                      return date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    })()}</p>
                  </div>

                  <div className="bg-gradient-to-r from-gold-50 to-gold-100 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gold-600" />
                      <span className="font-inter font-semibold text-black-900 text-sm sm:text-base">Event Time</span>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base">{eventTimeDisplay || eventTime}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gold-100 shadow-soft p-6 sm:p-8">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                  <div className="p-1.5 sm:p-2 bg-gold-100 rounded-lg sm:rounded-xl">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gold-600" />
                  </div>
                  <h2 className="font-poppins font-semibold text-lg sm:text-xl lg:text-2xl text-black-900">Delivery Address</h2>
                </div>

                {state.user?.addresses && state.user.addresses.length > 0 && (
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    {state.user.addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 cursor-pointer ${selectedAddress?.id === address.id
                          ? 'border-gold-500 bg-gold-50'
                          : 'border-gray-200 hover:border-gold-300'
                          }`}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 mt-0.5 sm:mt-1 ${selectedAddress?.id === address.id
                            ? 'border-gold-500 bg-gold-500'
                            : 'border-gray-300'
                            }`}>
                            {selectedAddress?.id === address.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-inter font-semibold text-black-900 capitalize text-sm sm:text-base">
                                {address.type}
                              </span>
                              {selectedAddress?.id === address.id && (
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gold-500 text-white text-xs rounded-full font-medium">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm sm:text-base">
                              {address.street}, {address.city}, {address.state} - {address.zipCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!showNewAddressForm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowNewAddressForm(true)}
                    className="w-full text-sm sm:text-base"
                  >
                    + Add New Address
                  </Button>
                ) : (
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
                    <h3 className="font-poppins font-semibold text-base sm:text-lg text-black-900 mb-3 sm:mb-4">Add New Address</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">Address Name</label>
                        <input
                          type="text"
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                          placeholder="e.g., Home, Office, My Place"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">Address Type</label>
                        <select
                          value={newAddress.type}
                          onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as 'home' | 'office' | 'other' })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                        >
                          <option value="home">Home</option>
                          <option value="office">Office</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">Door/House Number</label>
                        <input
                          type="text"
                          value={newAddress.doorNo}
                          onChange={(e) => setNewAddress({ ...newAddress, doorNo: e.target.value })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                          placeholder="e.g., 123, A-45, Flat 2B"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">Street Address</label>
                        <input
                          type="text"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                          placeholder="Enter street address, area, landmark"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">City</label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                          placeholder="Enter city"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">State</label>
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                          placeholder="Enter state"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">ZIP Code</label>
                        <input
                          type="text"
                          value={newAddress.zipCode}
                          onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                          placeholder="Enter ZIP code"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <Button onClick={handleAddressSubmit} className="flex-1 text-sm sm:text-base">
                        Save Address
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowNewAddressForm(false)}
                        className="flex-1 text-sm sm:text-base"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gold-100 shadow-soft p-6 sm:p-8">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                  <div className="p-1.5 sm:p-2 bg-gold-100 rounded-lg sm:rounded-xl">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-gold-600" />
                  </div>
                  <h2 className="font-poppins font-semibold text-lg sm:text-xl lg:text-2xl text-black-900">Payment Method</h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {[
                    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                    { id: 'upi', label: 'UPI', icon: Shield },
                    { id: 'netbanking', label: 'Net Banking', icon: Shield },
                    { id: 'emi', label: 'EMI', icon: Calendar },
                    { id: 'wallet', label: 'Wallet', icon: Shield },
                    { id: 'cod', label: 'Cash on Delivery', icon: DollarSign },
                  ].map((method) => (
                    <div
                      key={method.id}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 cursor-pointer ${paymentMethod === method.id
                        ? 'border-gold-500 bg-gold-50'
                        : 'border-gray-200 hover:border-gold-300'
                        }`}
                      onClick={() => setPaymentMethod(method.id as any)}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 ${paymentMethod === method.id
                          ? 'border-gold-500 bg-gold-500'
                          : 'border-gray-300'
                          }`}>
                          {paymentMethod === method.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50" />
                          )}
                        </div>
                        <method.icon className="h-4 w-4 sm:h-5 sm:w-5 text-gold-600" />
                        <span className="font-inter font-semibold text-black-900 text-sm sm:text-base">{method.label}</span>
                        {paymentMethod === method.id && (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gold-500 text-white text-xs rounded-full font-medium ml-auto">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Details Forms */}
                {paymentMethod === 'card' && (
                  <div className="mt-4 sm:mt-6 bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
                    <h3 className="font-poppins font-semibold text-base sm:text-lg text-black-900 mb-3 sm:mb-4">Card Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">Card Number</label>
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">Expiry Date</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiryDate(e.target.value) })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">CVV</label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="mt-4 sm:mt-6 bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
                    <h3 className="font-poppins font-semibold text-base sm:text-lg text-black-900 mb-3 sm:mb-4">UPI Payment</h3>

                    {/* UPI Payment Type Selection */}
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-2 sm:mb-3">Choose Payment Method</label>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setUpiPaymentType('upiId')}
                          className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 ${upiPaymentType === 'upiId'
                            ? 'border-gold-500 bg-gold-50 text-gold-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gold-300'
                            }`}
                        >
                          <div className="text-center">
                            <div className="text-xs sm:text-sm font-medium">UPI ID</div>
                            <div className="text-xs text-gray-500 mt-1">Enter UPI ID</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiPaymentType('qrCode')}
                          className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 ${upiPaymentType === 'qrCode'
                            ? 'border-gold-500 bg-gold-50 text-gold-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gold-300'
                            }`}
                        >
                          <div className="text-center">
                            <div className="text-xs sm:text-sm font-medium">QR Code</div>
                            <div className="text-xs text-gray-500 mt-1">Scan to Pay</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* UPI ID Input */}
                    {upiPaymentType === 'upiId' && (
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">UPI ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                          placeholder="yourname@paytm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Enter your UPI ID (e.g., yourname@paytm, yourname@phonepe)
                        </p>
                      </div>
                    )}

                    {/* QR Code Display */}
                    {upiPaymentType === 'qrCode' && (
                      <div className="text-center">
                        <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 border-gray-200 inline-block">
                          <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                            <div className="text-center">
                              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-black rounded-lg flex items-center justify-center mb-2">
                                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded grid grid-cols-8 gap-0.5 p-1">
                                  {Array.from({ length: 64 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                                        }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="text-xs text-gray-600">QR Code</div>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm font-medium text-gray-900 mb-2">
                            Scan QR Code to Pay
                          </div>
                          <div className="text-xs text-gray-500 mb-3 sm:mb-4">
                            Amount: ₹{finalAmount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            Merchant: srfoodkraft@paytm
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 sm:mt-4">
                          Open any UPI app (Paytm, PhonePe, Google Pay) and scan this QR code to complete payment
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="mt-4 sm:mt-6 bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
                    <h3 className="font-poppins font-semibold text-base sm:text-lg text-black-900 mb-3 sm:mb-4">Net Banking Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">Select Bank</label>
                        <select
                          value={netBankingDetails.bank}
                          onChange={(e) => setNetBankingDetails({ ...netBankingDetails, bank: e.target.value })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                        >
                          <option value="">Select your bank</option>
                          {getAvailableBanks().map((bank) => (
                            <option key={bank} value={bank}>{bank}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">Account Number</label>
                        <input
                          type="text"
                          value={netBankingDetails.accountNumber}
                          onChange={(e) => setNetBankingDetails({ ...netBankingDetails, accountNumber: e.target.value })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                          placeholder="Enter account number"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* EMI Payment Form */}
                {paymentMethod === 'emi' && (
                  <div className="mt-4 sm:mt-6 bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
                    <h3 className="font-poppins font-semibold text-base sm:text-lg text-black-900 mb-3 sm:mb-4">EMI Payment</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">EMI Provider</label>
                        <select
                          value={emiDetails.provider}
                          onChange={(e) => setEmiDetails({ ...emiDetails, provider: e.target.value })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                        >
                          <option value="">Select EMI Provider</option>
                          <option value="amex">American Express EMI</option>
                          <option value="bajaj">Bajaj Finserv EMI</option>
                          <option value="hdfc">HDFC Bank EMI</option>
                          <option value="icici">ICICI Bank EMI</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-1 sm:mb-2">EMI Tenure</label>
                        <select
                          value={emiDetails.tenure}
                          onChange={(e) => setEmiDetails({ ...emiDetails, tenure: parseInt(e.target.value) })}
                          className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                        >
                          <option value="3">3 Months</option>
                          <option value="6">6 Months</option>
                          <option value="9">9 Months</option>
                          <option value="12">12 Months</option>
                        </select>
                      </div>
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                        <div className="text-xs sm:text-sm text-blue-800">
                          <strong>EMI Amount:</strong> ₹{(finalAmount / 6).toFixed(2)} for 6 months
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Interest rate: 12% p.a. | Processing fee: ₹99
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Wallet Payment Form */}
                {paymentMethod === 'wallet' && (
                  <div className="mt-4 sm:mt-6 bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
                    <h3 className="font-poppins font-semibold text-base sm:text-lg text-black-900 mb-3 sm:mb-4">Wallet Payment</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-2">Select Wallet</label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <button
                            onClick={() => setWalletProvider('phonepe')}
                            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 ${walletProvider === 'phonepe'
                              ? 'border-gold-500 bg-gold-50'
                              : 'border-gray-200 hover:border-gold-300'
                              }`}
                          >
                            <div className="text-center">
                              <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-1 sm:mb-2" />
                              <div className="text-xs sm:text-sm font-medium">PhonePe</div>
                            </div>
                          </button>
                          <button
                            onClick={() => setWalletProvider('mobikwik')}
                            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 ${walletProvider === 'mobikwik'
                              ? 'border-gold-500 bg-gold-50'
                              : 'border-gray-200 hover:border-gold-300'
                              }`}
                          >
                            <div className="text-center">
                              <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-1 sm:mb-2" />
                              <div className="text-xs sm:text-sm font-medium">Mobikwik</div>
                            </div>
                          </button>
                          <button
                            onClick={() => setWalletProvider('airtel')}
                            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 ${walletProvider === 'airtel'
                              ? 'border-gold-500 bg-gold-50'
                              : 'border-gray-200 hover:border-gold-300'
                              }`}
                          >
                            <div className="text-center">
                              <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mx-auto mb-1 sm:mb-2" />
                              <div className="text-xs sm:text-sm font-medium">Airtel Money</div>
                            </div>
                          </button>
                          <button
                            onClick={() => setWalletProvider('paytm')}
                            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 ${walletProvider === 'paytm'
                              ? 'border-gold-500 bg-gold-50'
                              : 'border-gray-200 hover:border-gold-300'
                              }`}
                          >
                            <div className="text-center">
                              <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-1 sm:mb-2" />
                              <div className="text-xs sm:text-sm font-medium">Paytm</div>
                            </div>
                          </button>
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                        <div className="text-xs sm:text-sm text-green-800">
                          <strong>Wallet Balance:</strong> ₹1,250.00
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          Sufficient balance available for this transaction
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl sm:rounded-3xl border border-gold-200 shadow-soft p-6 sm:p-8 sticky top-20 sm:top-24">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                  <div className="p-1.5 sm:p-2 bg-gold-500 rounded-lg sm:rounded-xl">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg sm:text-xl text-black-900">Order Summary</h3>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {items && items.length > 0 ? items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 sm:space-x-3">
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-inter font-medium text-black-900 text-sm sm:text-base truncate">{item.menuItem.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{item.quantity} {item.unit}</p>
                      </div>
                      <span className="font-inter font-semibold text-gold-600 text-sm sm:text-base">
                        ₹{((item.menuItem.pricePerKg || item.menuItem.pricePerPiece || item.menuItem.pricePerLiter) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-gray-500 text-sm sm:text-base">
                      No items in cart
                    </div>
                  )}
                </div>

                <div className="space-y-2 sm:space-y-3 border-t border-gold-200 pt-3 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-inter text-gray-600 text-sm sm:text-base">Subtotal</span>
                    <span className="font-inter font-semibold text-sm sm:text-base">₹{(cartSubtotal || totalAmount || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-inter text-gray-600 text-sm sm:text-base">GST (18%)</span>
                    <span className="font-inter font-semibold text-sm sm:text-base">₹{(gstAmount || (totalAmount * 0.15) || 0).toFixed(2)}</span>
                  </div>

                  {deliveryMethod === 'door' && (
                    <div className="flex justify-between items-center">
                      <span className="font-inter text-gray-600 text-sm sm:text-base">Delivery Charge</span>
                      <span className="font-inter font-semibold text-sm sm:text-base">₹{deliveryCharge.toFixed(2)}</span>
                    </div>
                  )}

                  {promoCode && promoDiscount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="font-inter text-sm sm:text-base">Promo Discount ({promoCode})</span>
                      <span className="font-inter font-semibold text-sm sm:text-base">-₹{promoDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-gold-200 pt-2 sm:pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-poppins font-bold text-base sm:text-lg text-black-900">Total</span>
                      <span className="font-poppins font-bold text-xl sm:text-2xl text-gold-600">
                        ₹{finalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Error Display */}
                {paymentError && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="font-medium text-sm sm:text-base">{paymentError}</span>
                    </div>
                  </div>
                )}

                {/* Payment Success Display */}
                {paymentSuccess && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl">
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="font-medium text-sm sm:text-base">Payment successful! Redirecting...</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePayment}
                  loading={isProcessing}
                  className="w-full shadow-gold text-sm sm:text-base"
                  size="lg"
                  disabled={!selectedAddress || isProcessing || paymentSuccess}
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span>Processing Payment...</span>
                    </div>
                  ) : paymentSuccess ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Payment Successful!</span>
                    </div>
                  ) : (
                    `Pay ₹${finalAmount.toFixed(2)}`
                  )}
                </Button>

                <div className="flex items-center space-x-2 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Your payment is secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('CheckoutPage error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">There was an error loading the checkout page.</p>
          <button
            onClick={() => navigate('/cart')}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }
}