import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, CheckCircle, AlertCircle, Loader2, Calculator, ChevronDown, ChevronUp, X } from 'lucide-react';
import Button from '../components/UI/Button';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventType: '',
    guestCount: '',
    message: '',
  });

  // Form validation and submission states
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string, type: 'success' | 'error', message: string }>>([]);

  // Quote calculator states
  const [quoteData, setQuoteData] = useState({
    eventType: '',
    guestCount: 0,
    serviceLevel: 'standard',
    duration: 4,
    location: 'same-city',
  });

  // FAQ states
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);


  // Availability calendar states
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);

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

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Phone number is invalid';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addNotification('error', 'Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmitSuccess(true);
      addNotification('success', 'Thank you for your inquiry! We will contact you within 24 hours.');

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        eventDate: '',
        eventType: '',
        guestCount: '',
        message: '',
      });

      // Hide success animation after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);

    } catch (error) {
      addNotification('error', 'Failed to send inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quote calculator functions
  const calculateQuote = () => {
    const basePrice = 500; // Base price per person
    const guestCount = quoteData.guestCount;

    let multiplier = 1;

    // Event type multipliers
    switch (quoteData.eventType) {
      case 'wedding':
        multiplier = 1.5;
        break;
      case 'corporate':
        multiplier = 1.2;
        break;
      case 'birthday':
        multiplier = 1.0;
        break;
      case 'anniversary':
        multiplier = 1.3;
        break;
      default:
        multiplier = 1.1;
    }

    // Service level multipliers
    switch (quoteData.serviceLevel) {
      case 'premium':
        multiplier *= 1.5;
        break;
      case 'standard':
        multiplier *= 1.0;
        break;
      case 'basic':
        multiplier *= 0.8;
        break;
    }

    // Duration multiplier
    multiplier *= (quoteData.duration / 4);

    // Location multiplier
    if (quoteData.location === 'out-of-city') {
      multiplier *= 1.3;
    }

    const totalPrice = Math.round(basePrice * guestCount * multiplier);
    return totalPrice;
  };

  // Handle detailed quote request
  const handleDetailedQuote = () => {
    if (!quoteData.eventType || !quoteData.guestCount) {
      addNotification('error', 'Please fill in event type and guest count first');
      return;
    }

    // Pre-fill the main form with quote data
    setFormData(prev => ({
      ...prev,
      eventType: quoteData.eventType,
      guestCount: quoteData.guestCount.toString(),
      eventDate: selectedDate, // Fill the event date from the preferred date selection
    }));

    // Scroll to the main form
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }

    addNotification('success', 'Form pre-filled with your quote details. Please complete the remaining information.');
  };

  // Generate available dates (next 30 days excluding Sundays)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Exclude Sundays (day 0)
      if (date.getDay() !== 0) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }

    return dates;
  };

  // Initialize available dates
  React.useEffect(() => {
    setAvailableDates(generateAvailableDates());
  }, []);


  // FAQ data
  const faqData = [
    {
      question: "How far in advance should I book catering services?",
      answer: "We recommend booking at least 2-4 weeks in advance for standard events, and 6-8 weeks for weddings or large corporate events to ensure availability and proper planning."
    },
    {
      question: "Do you provide setup and cleanup services?",
      answer: "Yes, we provide complete setup and cleanup services. Our team will arrive early to set up all equipment, serve the food, and clean up afterward, leaving your venue spotless."
    },
    {
      question: "Can you accommodate dietary restrictions and allergies?",
      answer: "Absolutely! We can accommodate vegetarian, vegan, gluten-free, and other dietary restrictions. Please inform us of any allergies or special dietary needs when placing your order."
    },
    {
      question: "What is your minimum order requirement?",
      answer: "Our minimum order is typically 25 people for delivery and 50 people for full-service catering. However, we can accommodate smaller orders with a minimum service charge."
    },
    {
      question: "Do you offer tastings before the event?",
      answer: "Yes, we offer complimentary tastings for events with 100+ guests. For smaller events, we can arrange tastings for a nominal fee that will be credited toward your final bill."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, bank transfers, UPI payments, and cash. A 50% deposit is required to confirm your booking, with the balance due 48 hours before the event."
    }
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+91 98765 43210', '+91 87654 32109'],
      action: 'tel:+919876543210',
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@srfoodkraft.com', 'orders@srfoodkraft.com'],
      action: 'mailto:info@srfoodkraft.com',
    },
    {
      icon: MapPin,
      title: 'Address',
      details: ['123 Catering Street', 'Food District, City 560001'],
      action: null,
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Mon - Sat: 9:00 AM - 8:00 PM', 'Sun: 10:00 AM - 6:00 PM'],
      action: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* SEO Header */}
      <header style={{ display: 'none' }}>
        <h1>Contact SR FoodKraft - Get Quote for Catering Services</h1>
        <p>Contact SR FoodKraft for premium catering services. Call +91-98765-43210 or email info@srfoodkraft.com for personalized quotes and event planning.</p>
      </header>

      {/* Hero Section - Responsive */}
      <section className="bg-gradient-to-r from-black to-gray-900 text-white py-12 sm:py-16" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-poppins font-bold mb-4 sm:mb-6" itemProp="name">
            Contact <span className="text-gold">Us</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl font-inter max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto px-4" itemProp="description">
            Have questions about our catering services? We're here to help you plan
            the perfect event with delicious food and exceptional service.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-poppins font-bold text-black mb-3 sm:mb-4">
                Get a Quote
              </h2>
              <p className="text-gray-600 font-inter text-sm sm:text-base">
                Fill out the form below and we'll get back to you with a personalized quote for your event.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full p-2.5 sm:p-3 border rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm sm:text-base ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-2.5 sm:p-3 border rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm sm:text-base ${formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your email"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full p-2.5 sm:p-3 border rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm sm:text-base ${formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your phone number"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="eventDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="eventType" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Event Type
                  </label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="">Select event type</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="birthday">Birthday Party</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="guestCount" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    id="guestCount"
                    name="guestCount"
                    value={formData.guestCount}
                    onChange={handleInputChange}
                    className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm sm:text-base"
                    placeholder="Approximate guest count"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Additional Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent resize-none text-sm sm:text-base"
                  placeholder="Tell us about your event requirements, dietary preferences, or any special requests..."
                />
              </div>

              <div className="relative">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-sm sm:text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Send Inquiry
                    </>
                  )}
                </Button>

                {/* Success Animation */}
                {submitSuccess && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500 rounded-lg">
                    <div className="flex items-center space-x-2 text-white">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="font-semibold text-sm sm:text-base">Sent Successfully!</span>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-poppins font-bold text-black mb-4 sm:mb-6">
                Contact Information
              </h2>

              <div className="space-y-4 sm:space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-gold rounded-full p-2 sm:p-3 mr-3 sm:mr-4 flex-shrink-0">
                      <info.icon className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-poppins font-semibold text-base sm:text-lg text-black mb-1 sm:mb-2">
                        {info.title}
                      </h3>
                      <div className="space-y-1">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="font-inter text-gray-600 text-sm sm:text-base">
                            {info.action && idx === 0 ? (
                              <a
                                href={info.action}
                                className="hover:text-gold transition-colors"
                              >
                                {detail}
                              </a>
                            ) : (
                              detail
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Contact */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                <h3 className="font-poppins font-semibold text-base sm:text-lg text-black">
                  Quick WhatsApp Contact
                </h3>
              </div>
              <p className="text-gray-600 font-inter mb-3 sm:mb-4 text-sm sm:text-base">
                Get instant responses to your queries via WhatsApp
              </p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-inter font-medium text-sm sm:text-base"
              >
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Chat on WhatsApp
              </a>
            </div>

          </div>
        </div>

        {/* Visit Our Kitchen - Interactive Map */}
        <div className="mt-12 sm:mt-16">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <h3 className="font-poppins font-semibold text-base sm:text-lg text-black mb-3 sm:mb-4">
              Visit Our Kitchen
            </h3>
            <div className="bg-gray-200 rounded-lg h-40 sm:h-48 flex items-center justify-center relative overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.1234567890!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzUnNDAuNiJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Quote Calculator Section */}
        <div className="mt-12 sm:mt-16">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-black mb-3 sm:mb-4">
                Get Instant Quote
              </h2>
              <p className="text-gray-600 font-inter text-sm sm:text-base">
                Use our calculator to get an estimated price for your event
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Event Type
                  </label>
                  <select
                    value={quoteData.eventType}
                    onChange={(e) => setQuoteData({ ...quoteData, eventType: e.target.value })}
                    className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="">Select event type</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="birthday">Birthday Party</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    value={quoteData.guestCount}
                    onChange={(e) => setQuoteData({ ...quoteData, guestCount: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter number of guests"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Service Level
                  </label>
                  <select
                    value={quoteData.serviceLevel}
                    onChange={(e) => setQuoteData({ ...quoteData, serviceLevel: e.target.value })}
                    className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="basic">Basic Service</option>
                    <option value="standard">Standard Service</option>
                    <option value="premium">Premium Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Event Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={quoteData.duration}
                    onChange={(e) => setQuoteData({ ...quoteData, duration: parseInt(e.target.value) || 4 })}
                    className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm sm:text-base"
                    min="1"
                    max="12"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Preferred Event Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="">Select a date</option>
                    {availableDates.map((date) => {
                      const dateObj = new Date(date);
                      const formattedDate = dateObj.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                      return (
                        <option key={date} value={date}>
                          {formattedDate}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="bg-gold-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-poppins font-bold text-black mb-3 sm:mb-4">
                  Estimated Quote
                </h3>
                {quoteData.eventType && quoteData.guestCount > 0 ? (
                  <div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gold-600 mb-2">
                      ₹{calculateQuote().toLocaleString()}
                    </div>
                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                      Starting from ₹{Math.round(calculateQuote() * 0.8).toLocaleString()} - ₹{Math.round(calculateQuote() * 1.2).toLocaleString()}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      *This is an estimated quote. Final pricing may vary based on menu selection and specific requirements.
                    </p>
                    <Button
                      className="w-full text-sm sm:text-base"
                      onClick={handleDetailedQuote}
                    >
                      Get Detailed Quote
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Calculator className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
                    <p className="text-sm sm:text-base">Fill in the details to get your quote</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 sm:mt-16">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-black mb-3 sm:mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 font-inter text-sm sm:text-base">
                Find answers to common questions about our catering services
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-poppins font-semibold text-base sm:text-lg text-black pr-4">
                      {faq.question}
                    </h3>
                    {openFAQ === index ? (
                      <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {openFAQ === index && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-gray-600 font-inter leading-relaxed text-sm sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}