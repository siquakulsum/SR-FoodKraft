import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Download,
  Home,
  Share2,
  Star,
  Gift,
  Truck,
  ChefHat,
  Bell,
  Printer,
  RotateCcw,
  Heart,
  MessageCircle,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import Button from '../components/UI/Button';
import { useApp } from '../context/AppContext';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };
  const { state, dispatch } = useApp();
  const { order, paymentResult } = location.state || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  // Initialize data
  useEffect(() => {
    if (order) {
      // Calculate loyalty points (1 point per ₹10 spent)
      setLoyaltyPoints(Math.floor(order.totalAmount / 10));

      // Calculate estimated delivery time
      const eventDate = new Date(order.eventDate);
      const deliveryTime = new Date(eventDate);
      deliveryTime.setHours(eventDate.getHours() - 2); // 2 hours before event
      setEstimatedDelivery(deliveryTime.toLocaleString('en-IN'));

      // Simulate order timeline progression
      const timeline = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < 4) return prev + 1;
          return prev;
        });
      }, 3000);

      return () => clearInterval(timeline);
    }
  }, [order]);

  // Generate recommendations based on order items
  useEffect(() => {
    if (order?.items) {
      // Import menu data for recommendations
      import('../data/menuData').then(({ menuData }) => {
        // Get categories from current order
        const orderCategories = [...new Set(order.items.map(item => item.menuItem.category))];
        const orderedItemIds = order.items.map(item => item.menuItem.id);

        // Find items from same categories that weren't ordered
        const recommendedItems = menuData
          .filter(item =>
            orderCategories.includes(item.category) &&
            !orderedItemIds.includes(item.id)
          )
          .slice(0, 3) // Take first 3 recommendations
          .map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.pricePerKg || item.pricePerPiece || item.pricePerLiter,
            image: item.image,
            description: item.description
          }));

        // If not enough items from same categories, add popular items
        if (recommendedItems.length < 3) {
          const popularItems = menuData
            .filter(item => !orderedItemIds.includes(item.id))
            .slice(0, 3 - recommendedItems.length)
            .map(item => ({
              id: item.id,
              name: item.name,
              category: item.category,
              price: item.pricePerKg || item.pricePerPiece || item.pricePerLiter,
              image: item.image,
              description: item.description
            }));

          setRecommendations([...recommendedItems, ...popularItems]);
        } else {
          setRecommendations(recommendedItems);
        }
      }).catch(error => {
        console.error('Error loading menu data for recommendations:', error);
        // Fallback to mock recommendations
        const mockRecommendations = [
          { id: 'rec1', name: 'Chicken Biryani', category: 'Main Course', price: 250, image: '/api/placeholder/100/100', description: 'Aromatic basmati rice with tender chicken' },
          { id: 'rec2', name: 'Gulab Jamun', category: 'Dessert', price: 80, image: '/api/placeholder/100/100', description: 'Soft milk dumplings in rose syrup' },
          { id: 'rec3', name: 'Mango Lassi', category: 'Beverage', price: 60, image: '/api/placeholder/100/100', description: 'Refreshing yogurt drink with mango' }
        ];
        setRecommendations(mockRecommendations);
      });
    }
  }, [order]);

  // Helper functions
  const handleShare = async () => {
    const shareData = {
      title: 'Order Confirmed - SR Food Kraft',
      text: `I just ordered delicious food from SR Food Kraft! Order #${order.id}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
      alert('Order details copied to clipboard!');
    }
  };

  const handleReorder = () => {
    // Add all items from this order to cart
    order.items.forEach(item => {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          menuItem: item.menuItem,
          quantity: item.quantity,
          unit: item.unit
        }
      });
    });
    navigate('/cart');
  };

  const handleFeedbackSubmit = () => {
    // In real app, this would send feedback to backend
    console.log('Feedback submitted:', { rating, feedback });
    setShowFeedback(false);
    alert('Thank you for your feedback!');
  };

  const handlePrintInvoice = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - Order #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .company-address { font-size: 14px; color: #666; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-info, .customer-info { width: 45%; }
            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f5f5f5; font-weight: bold; }
            .total-section { text-align: right; margin-top: 20px; }
            .total-row { margin: 5px 0; }
            .final-total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="company-name">SR Food Kraft</div>
            <div class="company-address">
              123 Food Street, Culinary District<br>
              Mumbai, Maharashtra 400001<br>
              Phone: +91 98765 43210 | Email: orders@srfoodkraft.com
            </div>
          </div>
          
          <div class="invoice-details">
            <div class="invoice-info">
              <div class="section-title">Invoice Details</div>
              <p><strong>Invoice No:</strong> ${order.id}</p>
              <p><strong>Invoice Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Card Payment'}</p>
              ${paymentResult?.transactionId ? `<p><strong>Transaction ID:</strong> ${paymentResult.transactionId}</p>` : ''}
            </div>
            <div class="customer-info">
              <div class="section-title">Customer Details</div>
              <p><strong>Name:</strong> ${state.user?.name || 'Guest User'}</p>
              <p><strong>Email:</strong> ${state.user?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> ${state.user?.phone || 'N/A'}</p>
            </div>
          </div>
          
          <div class="section-title">Delivery Information</div>
          <p><strong>Event Date:</strong> ${(() => {
          const [year, month, day] = order.eventDate.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        })()}</p>
          <p><strong>Event Time:</strong> ${order.eventTime}</p>
          <p><strong>Delivery Address:</strong><br>
            ${order.deliveryAddress.street}<br>
            ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}
          </p>
          
          <div class="section-title">Order Items</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.menuItem.name}</td>
                  <td>${item.quantity} ${item.unit}</td>
                  <td>₹${(item.menuItem.pricePerKg || item.menuItem.pricePerPiece || item.menuItem.pricePerLiter).toFixed(2)}</td>
                  <td>₹${((item.menuItem.pricePerKg || item.menuItem.pricePerPiece || item.menuItem.pricePerLiter) * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">Subtotal: ₹${(order.totalAmount * 0.85).toFixed(2)}</div>
            <div class="total-row">GST (18%): ₹${(order.totalAmount * 0.15).toFixed(2)}</div>
            <div class="total-row">Delivery Charge: ₹50.00</div>
            <div class="total-row">Discount: -₹25.00</div>
            <div class="final-total">Total Amount: ₹${order.totalAmount.toFixed(2)}</div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing SR Food Kraft!</p>
            <p>For any queries, contact us at +91 98765 43210 or support@srfoodkraft.com</p>
            <p>This is a computer-generated invoice.</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-poppins font-semibold text-black mb-3 sm:mb-4">
            Order not found
          </h2>
          <Link to="/" onClick={scrollToTop}>
            <Button className="text-sm sm:text-base">Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="bg-green-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-black mb-3 sm:mb-4">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 font-inter text-base sm:text-lg px-4">
            Thank you for your order. We'll start preparing your delicious food soon.
          </p>
        </div>

        {/* Order Timeline - Mobile Aligned */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="font-poppins font-semibold text-lg sm:text-xl text-black mb-4 sm:mb-6">
            Order Timeline
          </h2>
          <div className="relative">
            {/* Timeline line - Desktop only */}
            <div className="absolute top-6 sm:top-7 left-0 right-0 h-0.5 bg-gray-300 hidden sm:block"></div>

            {/* Timeline steps */}
            <div className="flex items-start justify-between relative">
              {[
                { step: 1, icon: CheckCircle, label: 'Order Confirmed', color: 'text-green-600' },
                { step: 2, icon: ChefHat, label: 'Preparing', color: currentStep >= 2 ? 'text-blue-600' : 'text-gray-400' },
                { step: 3, icon: Truck, label: 'Out for Delivery', color: currentStep >= 3 ? 'text-orange-600' : 'text-gray-400' },
                { step: 4, icon: Gift, label: 'Delivered', color: currentStep >= 4 ? 'text-green-600' : 'text-gray-400' }
              ].map(({ step, icon: Icon, label, color }, index) => (
                <div key={step} className="flex flex-col items-center flex-1 relative">
                  {/* Icon container */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-3 sm:mb-4 relative z-10 ${currentStep >= step ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                    <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${color}`} />
                  </div>

                  {/* Label */}
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center px-1 leading-tight">
                    {label}
                  </span>

                  {/* Mobile connecting line - properly aligned */}
                  {index < 3 && (
                    <div className="absolute top-6 sm:hidden w-full h-0.5 left-1/2 transform translate-x-1/2 z-0">
                      <div className={`w-full h-full ${currentStep > step ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop progress line overlay */}
            <div className="absolute top-6 sm:top-7 left-0 h-0.5 bg-green-500 hidden sm:block"
              style={{
                width: currentStep > 1 ? `${((currentStep - 1) / 3) * 100}%` : '0%',
                transition: 'width 0.5s ease-in-out'
              }}>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="font-poppins font-semibold text-lg sm:text-xl text-black mb-4 sm:mb-6">
              Order Details
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center pb-3 sm:pb-4 border-b">
                <span className="font-inter text-gray-600 text-sm sm:text-base">Order ID</span>
                <span className="font-poppins font-bold text-black text-sm sm:text-base">#{order.id}</span>
              </div>

              <div className="flex justify-between items-center pb-3 sm:pb-4 border-b">
                <span className="font-inter text-gray-600 text-sm sm:text-base">Order Status</span>
                <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  Payment Confirmed
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 sm:pb-4 border-b">
                <span className="font-inter text-gray-600 text-sm sm:text-base">Total Amount</span>
                <span className="font-poppins font-bold text-gold text-base sm:text-lg">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 sm:pb-4 border-b">
                <span className="font-inter text-gray-600 text-sm sm:text-base">Payment Method</span>
                <span className="font-inter font-medium text-black capitalize text-sm sm:text-base">
                  {order.paymentMethod || 'Card Payment'}
                </span>
              </div>

              {paymentResult?.transactionId && (
                <div className="flex justify-between items-center pb-3 sm:pb-4 border-b">
                  <span className="font-inter text-gray-600 text-sm sm:text-base">Transaction ID</span>
                  <span className="font-inter font-medium text-black text-xs sm:text-sm break-all">
                    {paymentResult.transactionId}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pb-3 sm:pb-4 border-b">
                <span className="font-inter text-gray-600 text-sm sm:text-base">Loyalty Points Earned</span>
                <span className="font-inter font-medium text-gold flex items-center text-sm sm:text-base">
                  <Gift className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {loyaltyPoints} points
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-inter text-gray-600 text-sm sm:text-base">Order Date</span>
                <span className="font-inter font-medium text-black text-sm sm:text-base">
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Event & Delivery Info */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="font-poppins font-semibold text-lg sm:text-xl text-black mb-4 sm:mb-6">
              Event & Delivery Information
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gold mr-2 sm:mr-3 mt-0.5 sm:mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-inter font-medium text-black text-sm sm:text-base">Event Date</p>
                  <p className="font-inter text-gray-600 text-xs sm:text-sm">
                    {(() => {
                      // Parse the date string to avoid timezone issues
                      const [year, month, day] = order.eventDate.split('-').map(Number);
                      const date = new Date(year, month - 1, day);
                      return date.toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    })()}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gold mr-2 sm:mr-3 mt-0.5 sm:mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-inter font-medium text-black text-sm sm:text-base">Event Time</p>
                  <p className="font-inter text-gray-600 text-xs sm:text-sm">{order.eventTime}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gold mr-2 sm:mr-3 mt-0.5 sm:mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-inter font-medium text-black text-sm sm:text-base">Delivery Address</p>
                  <p className="font-inter text-gray-600 text-xs sm:text-sm">
                    {order.deliveryAddress.street}<br />
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-gold mr-2 sm:mr-3 mt-0.5 sm:mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-inter font-medium text-black text-sm sm:text-base">Estimated Delivery</p>
                  <p className="font-inter text-gray-600 text-xs sm:text-sm">
                    {estimatedDelivery}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gold mr-2 sm:mr-3 mt-0.5 sm:mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-inter font-medium text-black text-sm sm:text-base">Delivery Updates</p>
                  <p className="font-inter text-gray-600 text-xs sm:text-sm">
                    You'll receive SMS & email updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-6 sm:mt-8">
          <h2 className="font-poppins font-semibold text-lg sm:text-xl text-black mb-4 sm:mb-6">
            Order Items
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-3 sm:py-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center min-w-0 flex-1">
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg mr-3 sm:mr-4 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-poppins font-medium text-black text-sm sm:text-base truncate">
                      {item.menuItem.name}
                    </h3>
                    <p className="font-inter text-gray-600 text-xs sm:text-sm">
                      {item.quantity} {item.unit}
                    </p>
                    {item.specialInstructions && (
                      <p className="font-inter text-gray-500 text-xs mt-1">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-poppins font-semibold text-black text-sm sm:text-base">
                    ₹{((item.menuItem.pricePerKg || item.menuItem.pricePerPiece || item.menuItem.pricePerLiter) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's Next - Mobile Aligned */}
        <div className="bg-gradient-to-r from-gold to-yellow-500 rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
          <h2 className="font-poppins font-semibold text-lg sm:text-xl text-black mb-3 sm:mb-4">
            What's Next?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-black">
            <div className="text-center">
              <div className="bg-black bg-opacity-10 rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-3">
                <span className="font-poppins font-bold text-base sm:text-lg">1</span>
              </div>
              <p className="font-inter font-medium text-sm sm:text-base mb-1">Order Confirmation</p>
              <p className="font-inter text-xs sm:text-sm opacity-80">You'll receive an email confirmation shortly</p>
            </div>
            <div className="text-center">
              <div className="bg-black bg-opacity-10 rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-3">
                <span className="font-poppins font-bold text-base sm:text-lg">2</span>
              </div>
              <p className="font-inter font-medium text-sm sm:text-base mb-1">Preparation</p>
              <p className="font-inter text-xs sm:text-sm opacity-80">Our chefs will start preparing your order</p>
            </div>
            <div className="text-center">
              <div className="bg-black bg-opacity-10 rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-3">
                <span className="font-poppins font-bold text-base sm:text-lg">3</span>
              </div>
              <p className="font-inter font-medium text-sm sm:text-base mb-1">Delivery</p>
              <p className="font-inter text-xs sm:text-sm opacity-80">Fresh food delivered on your event date</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center mt-6 sm:mt-8">
          <Button
            variant="outline"
            className="flex items-center text-sm sm:text-base"
            onClick={handlePrintInvoice}
          >
            <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Print Invoice
          </Button>
          <Button
            variant="outline"
            className="flex items-center text-sm sm:text-base"
            onClick={handleShare}
          >
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Share Order
          </Button>
          <Button
            className="flex items-center text-sm sm:text-base"
            onClick={handleReorder}
          >
            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Reorder
          </Button>
          <Link to="/orders">
            <Button variant="secondary" className="flex items-center text-sm sm:text-base">
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Track Order
            </Button>
          </Link>
          <Link to="/" onClick={scrollToTop}>
            <Button variant="secondary" className="flex items-center text-sm sm:text-base">
              <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-6 sm:mt-8">
            <h2 className="font-poppins font-semibold text-lg sm:text-xl text-black mb-4 sm:mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {recommendations.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="w-full h-24 sm:h-32 bg-gray-200 rounded-lg mb-2 sm:mb-3 flex items-center justify-center">
                    <span className="text-gray-500 text-xs sm:text-sm">Image</span>
                  </div>
                  <h3 className="font-poppins font-medium text-black mb-1 text-sm sm:text-base">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">{item.category}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-poppins font-semibold text-gold text-sm sm:text-base">₹{item.price}</span>
                    <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Feedback */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-6 sm:mt-8">
          <h2 className="font-poppins font-semibold text-lg sm:text-xl text-black mb-3 sm:mb-4">
            How was your ordering experience?
          </h2>
          <div className="flex items-center space-x-1 sm:space-x-2 mb-3 sm:mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`p-1 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                <Star className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us about your experience (optional)"
                className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg resize-none text-sm sm:text-base"
                rows={3}
              />
              <Button onClick={handleFeedbackSubmit} className="w-full sm:w-auto text-sm sm:text-base">
                Submit Feedback
              </Button>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="text-center mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-md">
          <h3 className="font-poppins font-semibold text-base sm:text-lg text-black mb-2">
            Need Help?
          </h3>
          <p className="font-inter text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
            Our customer support team is here to help you with any questions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <a
              href="tel:+919876543210"
              className="flex items-center justify-center p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2" />
              <span className="text-green-700 font-inter font-medium text-sm sm:text-base">+91 98765 43210</span>
            </a>
            <a
              href="mailto:support@srfoodkraft.com"
              className="flex items-center justify-center p-3 sm:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2" />
              <span className="text-blue-700 font-inter font-medium text-sm sm:text-base">Email Support</span>
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2" />
              <span className="text-green-700 font-inter font-medium text-sm sm:text-base">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}