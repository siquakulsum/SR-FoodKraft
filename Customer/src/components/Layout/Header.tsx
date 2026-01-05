import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, Heart, Search, Tag, Star, ChevronDown, Plus, Minus, Share2, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { menuData } from '../../data/menuData';
import { MenuItem } from '../../types';
import NotificationCenter from '../Notifications/NotificationCenter';
import Button from '../UI/Button';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Product modal state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [notifications, setNotifications] = useState<Array<{ id: string, type: 'success' | 'error', message: string }>>([]);
  const { state, dispatch } = useApp();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    setIsUserMenuOpen(false);
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to menu page with search term
      window.location.href = `/menu?search=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  // Helper functions for modal
  const getUnit = (item: MenuItem) => {
    if (item.pricePerKg) return 'kg';
    if (item.pricePerPiece) return 'pieces';
    if (item.pricePerLiter) return 'liters';
    return 'kg';
  };

  const getSimilarItems = (item: MenuItem) => {
    return menuData
      .filter(menuItem =>
        menuItem.id !== item.id &&
        (menuItem.category === item.category || menuItem.subcategory === item.subcategory)
      )
      .slice(0, 3);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const addNotification = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000);
  };

  const handleAddToCart = async (item: MenuItem, quantity: number, unit: string) => {
    const itemKey = `${item.id}-${unit}`;
    setLoadingStates(prev => ({ ...prev, [itemKey]: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const cartItem = {
        id: itemKey,
        menuItem: item,
        quantity,
        unit: unit as 'kg' | 'pieces' | 'liters',
      };
      dispatch({ type: 'ADD_TO_CART', payload: cartItem });
      setTimeout(() => {
        if (state.cartError) {
          addNotification('error', state.cartError.message);
          dispatch({ type: 'CLEAR_CART_ERROR' });
        } else {
          addNotification('success', `${item.name} added to cart successfully!`);
        }
      }, 100);
    } catch (error) {
      addNotification('error', 'Failed to add item to cart. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [itemKey]: false }));
    }
  };

  const cartItemCount = state.cart.length;

  // Filter menu items based on search term
  const searchResults = searchTerm.length > 0
    ? menuData.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 6)
    : [];

  // Sample offers data
  const currentOffers = [
    {
      id: 'offer-1',
      title: '20% Off Wedding Packages',
      description: 'Get 20% discount on orders above ₹10,000 for wedding events',
      discount: '20%',
      minOrder: 10000,
      validUntil: '2025-02-28',
      code: 'WEDDING20'
    },
    {
      id: 'offer-2',
      title: 'Free Delivery',
      description: 'Free delivery on orders above ₹5,000',
      discount: 'Free',
      minOrder: 5000,
      validUntil: '2025-03-15',
      code: 'FREEDEL'
    },
    {
      id: 'offer-3',
      title: 'Corporate Discount',
      description: '15% off for corporate events with 50+ guests',
      discount: '15%',
      minOrder: 15000,
      validUntil: '2025-04-30',
      code: 'CORP15'
    }
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-xl shadow-large border-b border-gray-200'
        : 'bg-white/90 backdrop-blur-lg'
        }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            {/* Logo */}
            <Link to="/" onClick={scrollToTop} className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 group">
              {/* Logo Image */}
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 flex items-center justify-center">
                <img
                  src="/SR logo.png"
                  alt="SR FoodKraft Logo"
                  className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 object-contain transition-all duration-300 group-hover:scale-110"
                  style={{ transform: 'scale(1.2)' }}
                />
              </div>

              {/* Text Content */}
              <div className="hidden sm:block">
                <h1 className={`font-playfair text-lg sm:text-xl lg:text-2xl font-bold transition-colors duration-300 group-hover:text-gold-400 ${isScrolled ? 'text-black-900' : 'text-black-900'
                  }`}>
                  SR FoodKraft
                </h1>
                <p className={`text-xs sm:text-sm font-inter font-medium transition-colors duration-300 ${isScrolled ? 'text-gold-600' : 'text-gold-600'
                  }`}>Premium Catering</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={scrollToTop}
                  className={`relative font-inter font-medium transition-all duration-300 group text-sm lg:text-base ${location.pathname === item.href
                    ? (isScrolled ? 'text-gold-600' : 'text-gold-600')
                    : (isScrolled ? 'text-black-700 hover:text-gold-600' : 'text-black-700 hover:text-gold-600')
                    }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gold-500 to-gold-600 transition-all duration-300 group-hover:w-full ${location.pathname === item.href ? 'w-full' : ''
                    }`}></span>
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              {/* Inline Search Bar */}
              <div className="relative hidden md:block">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                      className="w-48 lg:w-64 xl:w-72 px-3 sm:px-4 py-2 sm:py-2.5 pl-8 sm:pl-10 pr-8 sm:pr-10 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 text-xs sm:text-sm lg:text-base bg-white/90 backdrop-blur-sm"
                    />
                    <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    )}
                  </div>
                </form>

                {/* Search Results Dropdown */}
                {isSearchFocused && searchResults.length > 0 && (
                  <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 lg:w-80 bg-white rounded-xl sm:rounded-2xl shadow-large border border-gold-100 p-3 sm:p-4 animate-slide-down z-50">
                    <div className="space-y-1 sm:space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedItem(item);
                            setIsModalOpen(true);
                            setIsSearchFocused(false);
                            setSearchTerm('');
                          }}
                          className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 hover:bg-gold-50 rounded-lg sm:rounded-xl transition-colors duration-200 text-left"
                        >
                          <img src={item.image} alt={item.name} className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-inter font-medium text-black-900 text-xs sm:text-sm lg:text-base truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 truncate">{item.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>


              {/* Offers - Desktop Only */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsOffersOpen(!isOffersOpen)}
                  className="flex items-center space-x-1 p-1.5 sm:p-2 rounded-xl transition-all duration-300 text-black-700 hover:text-gold-600 hover:bg-gold-100"
                  aria-label="View offers"
                  aria-expanded={isOffersOpen}
                >
                  <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden md:block font-inter font-medium text-sm lg:text-base">Offers</span>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block" />
                </button>

                {isOffersOpen && (
                  <div className="absolute right-0 top-full mt-4 sm:mt-6 mr-[-120px] sm:mr-[-180px] lg:mr-0 lg:mt-2 w-64 sm:w-72 lg:w-80 bg-white rounded-xl sm:rounded-2xl shadow-large border border-gold-100 p-3 sm:p-4 animate-slide-down z-50">
                    <h3 className="font-poppins font-semibold text-base sm:text-lg text-black-900 mb-3 sm:mb-4">Current Offers</h3>
                    <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                      {currentOffers.map((offer) => (
                        <div key={offer.id} className="p-2 sm:p-3 lg:p-4 bg-gradient-to-r from-gold-50 to-yellow-50 rounded-lg sm:rounded-xl border border-gold-200">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-inter font-semibold text-black-900 text-xs sm:text-sm lg:text-base">{offer.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{offer.description}</p>
                              <p className="text-xs text-gray-500 mt-1 sm:mt-2">Valid until: {offer.validUntil}</p>
                            </div>
                            <span className="bg-gold-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold flex-shrink-0 ml-1 sm:ml-2">
                              {offer.discount}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <NotificationCenter />

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-1.5 sm:p-2 rounded-xl transition-all duration-300 group text-black-700 hover:text-gold-600 hover:bg-gold-100"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center animate-bounce-gentle">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {state.isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-xl transition-all duration-300 text-black-700 hover:text-gold-600 hover:bg-gold-100"
                    aria-label="User menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden md:block font-inter font-medium text-sm lg:text-base">{state.user?.name}</span>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-4 sm:mt-6 mr-[-120px] sm:mr-[-180px] lg:mr-0 lg:mt-2 w-40 sm:w-48 bg-white rounded-xl sm:rounded-2xl shadow-large border border-gold-100 py-1 sm:py-2 animate-slide-down z-50">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-gold-50 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-inter text-sm sm:text-base">Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-gold-50 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-inter text-sm sm:text-base">Orders</span>
                      </Link>
                      <Link
                        to="/favorites"
                        className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-gold-50 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-inter text-sm sm:text-base">Favorites</span>
                      </Link>
                      <hr className="my-1 sm:my-2 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 w-full text-left hover:bg-red-50 text-red-600 transition-colors duration-200"
                        aria-label="Logout"
                      >
                        <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-inter text-sm sm:text-base">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-inter font-semibold rounded-lg sm:rounded-xl hover:from-gold-600 hover:to-gold-700 transition-all duration-300 shadow-gold hover:shadow-gold-lg transform hover:-translate-y-0.5 text-xs sm:text-sm lg:text-base"
                >
                  <span className="hidden sm:inline">Login</span>
                  <span className="sm:hidden">Login</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-xl transition-all duration-300 text-black-700 hover:text-gold-600 hover:bg-gold-100"
                aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-black-900 border-t border-gold-100 shadow-large animate-slide-down">
            <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
              {/* Mobile Search */}
              <div className="mb-3 sm:mb-4">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-8 sm:pl-10 pr-8 sm:pr-10 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-300 text-sm"
                    />
                    <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    )}
                  </div>
                </form>

                {searchResults.length > 0 && (
                  <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item);
                          setIsModalOpen(true);
                          setIsMobileMenuOpen(false);
                          setSearchTerm('');
                        }}
                        className="w-full flex items-center space-x-2 sm:space-x-3 p-2 bg-white/10 rounded-lg transition-colors duration-200 text-left hover:bg-white/20"
                      >
                        <img src={item.image} alt={item.name} className="h-6 w-6 sm:h-8 sm:w-8 rounded object-cover flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-inter font-medium text-white text-xs sm:text-sm truncate">{item.name}</p>
                          <p className="text-xs text-gray-300 truncate">{item.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Offers */}
              <div className="mb-3 sm:mb-4">
                <button
                  onClick={() => setIsOffersOpen(!isOffersOpen)}
                  className="flex items-center space-x-2 w-full px-3 sm:px-4 py-2.5 sm:py-3 text-white hover:bg-gold-500/20 rounded-lg sm:rounded-xl transition-all duration-300"
                >
                  <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-inter font-medium text-sm sm:text-base">Current Offers</span>
                  <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 ml-auto transition-transform duration-300 ${isOffersOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOffersOpen && (
                  <div className="mt-2 space-y-1 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
                    {currentOffers.map((offer) => (
                      <div key={offer.id} className="p-2 sm:p-3 bg-gradient-to-r from-gold-500/20 to-yellow-500/20 rounded-lg border border-gold-400/30">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-inter font-semibold text-white text-xs sm:text-sm">{offer.title}</h4>
                            <p className="text-xs text-gray-300 mt-1">{offer.description}</p>
                            <p className="text-xs text-gray-400 mt-1">Valid until: {offer.validUntil}</p>
                          </div>
                          <span className="bg-gold-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold flex-shrink-0 ml-1 sm:ml-2">
                            {offer.discount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 sm:px-4 py-2.5 sm:py-3 font-inter font-medium rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base ${location.pathname === item.href
                    ? 'bg-gold-500/20 text-gold-400'
                    : 'text-white hover:bg-gold-500/20 hover:text-gold-400'
                    }`}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToTop();
                  }}
                >
                  {item.name}
                </Link>
              ))}

              {!state.isLoggedIn && (
                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-inter font-semibold rounded-lg sm:rounded-xl hover:from-gold-600 hover:to-gold-700 transition-all duration-300 text-sm sm:text-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Overlay for dropdowns */}
      {(isSearchFocused || isOffersOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setIsSearchFocused(false);
            setIsOffersOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}

      {/* Product Details Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div
            className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-poppins font-bold text-black">
                  {selectedItem.name}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Left Column - Image and Basic Info */}
                <div>
                  <div className="relative mb-4 sm:mb-6">
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg sm:rounded-xl"
                    />
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold ${selectedItem.isVegetarian
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}>
                        {selectedItem.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gold-600 mb-1 sm:mb-2">
                        ₹{selectedItem.pricePerKg || selectedItem.pricePerPiece || selectedItem.pricePerLiter}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Per {selectedItem.pricePerKg ? 'kg' : selectedItem.pricePerPiece ? 'piece' : 'liter'}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-black mb-1 sm:mb-2 text-sm sm:text-base">Description</h4>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                        {selectedItem.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h4 className="font-semibold text-black mb-2 sm:mb-3 text-sm sm:text-base">Category</h4>
                        <span className="text-gray-600 text-sm sm:text-base">{selectedItem.category}</span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-black mb-2 sm:mb-3 text-sm sm:text-base">Type</h4>
                        {selectedItem.subcategory ? (
                          <span className="px-2 py-1 bg-gold-100 text-gold-800 rounded-full text-xs font-medium w-fit">
                            {selectedItem.subcategory}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm sm:text-base">-</span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold text-black mb-2 sm:mb-3 text-sm sm:text-base">Availability</h4>
                        <span className={`font-semibold text-sm sm:text-base ${selectedItem.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedItem.isAvailable ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-black mb-2 sm:mb-3 text-sm sm:text-base">Servings</h4>
                        {selectedItem.servings ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium w-fit">
                            {selectedItem.servings} servings
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm sm:text-base">-</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-black mb-1 sm:mb-2 text-sm sm:text-base">Pre-order Time</h4>
                      <p className="text-gray-600 text-sm sm:text-base">2 hours</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-black mb-1 sm:mb-2 text-sm sm:text-base">Rating</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 sm:h-5 sm:w-5 fill-gold-400 text-gold-400" />
                          ))}
                        </div>
                        <span className="text-gray-600 text-sm sm:text-base">4.8 (127 reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Actions and Similar Items */}
                <div>
                  <div className="space-y-4 sm:space-y-6">
                    {/* Quantity Selector */}
                    <div>
                      <h4 className="font-semibold text-black mb-2 sm:mb-3 text-sm sm:text-base">
                        Quantity
                        <span className="text-gray-500 font-normal ml-2 text-xs">
                          (Min: {selectedItem?.minQuantity || 0.5}, Max: {selectedItem?.maxQuantity || 10})
                        </span>
                      </h4>
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <button
                          onClick={() => {
                            const minQty = selectedItem?.minQuantity || 0.5;
                            setQuantities(prev => ({
                              ...prev,
                              [`${selectedItem.id}-${getUnit(selectedItem)}`]: Math.max(minQty, (prev[`${selectedItem.id}-${getUnit(selectedItem)}`] || selectedItem.minQuantity) - 0.5)
                            }));
                          }}
                          disabled={(quantities[`${selectedItem.id}-${getUnit(selectedItem)}`] || selectedItem.minQuantity) <= (selectedItem?.minQuantity || 0.5)}
                          className="p-1.5 sm:p-2 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:bg-gold-50 hover:border-gold-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </button>
                        <span className="font-semibold text-base sm:text-lg w-10 sm:w-12 text-center">
                          {quantities[`${selectedItem.id}-${getUnit(selectedItem)}`] || selectedItem.minQuantity}
                        </span>
                        <button
                          onClick={() => {
                            const maxQty = selectedItem?.maxQuantity || 10;
                            setQuantities(prev => ({
                              ...prev,
                              [`${selectedItem.id}-${getUnit(selectedItem)}`]: Math.min(maxQty, (prev[`${selectedItem.id}-${getUnit(selectedItem)}`] || selectedItem.minQuantity) + 0.5)
                            }));
                          }}
                          disabled={(quantities[`${selectedItem.id}-${getUnit(selectedItem)}`] || selectedItem.minQuantity) >= (selectedItem?.maxQuantity || 10)}
                          className="p-1.5 sm:p-2 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:bg-gold-50 hover:border-gold-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 sm:space-y-3">
                      <Button
                        onClick={() => handleAddToCart(selectedItem, quantities[`${selectedItem.id}-${getUnit(selectedItem)}`] || selectedItem.minQuantity, getUnit(selectedItem))}
                        className="w-full text-sm sm:text-base"
                        disabled={!selectedItem.isAvailable || (quantities[`${selectedItem.id}-${getUnit(selectedItem)}`] || selectedItem.minQuantity) < (selectedItem.minQuantity || 0.5) || (quantities[`${selectedItem.id}-${getUnit(selectedItem)}`] || selectedItem.minQuantity) > (selectedItem.maxQuantity || 10)}
                      >
                        Add to Cart - ₹{((selectedItem?.pricePerKg || selectedItem?.pricePerPiece || selectedItem?.pricePerLiter || 0) * (quantities[`${selectedItem.id}-${getUnit(selectedItem)}`] || selectedItem.minQuantity)).toFixed(2)}
                      </Button>

                      <div className="flex space-x-2 sm:space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (state.user) {
                              if (state.user.favorites.includes(selectedItem.id)) {
                                dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: selectedItem.id });
                                addNotification('success', 'Removed from favorites');
                              } else {
                                dispatch({ type: 'ADD_TO_FAVORITES', payload: selectedItem.id });
                                addNotification('success', 'Added to favorites');
                              }
                            } else {
                              addNotification('error', 'Please login to save favorites');
                            }
                          }}
                          className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                        >
                          <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${state.user?.favorites.includes(selectedItem.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          <span>Favorite</span>
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: selectedItem.name,
                                text: selectedItem.description,
                                url: window.location.href,
                              });
                            } else {
                              navigator.clipboard.writeText(window.location.href);
                              addNotification('success', 'Link copied to clipboard!');
                            }
                          }}
                          className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                        >
                          <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Share</span>
                        </Button>
                      </div>
                    </div>

                    {/* Similar Items */}
                    <div>
                      <h4 className="font-semibold text-black mb-3 sm:mb-4 text-sm sm:text-base">You Might Also Like</h4>
                      <div className="space-y-2 sm:space-y-3">
                        {getSimilarItems(selectedItem).map((similarItem) => (
                          <div
                            key={similarItem.id}
                            onClick={() => {
                              setSelectedItem(similarItem);
                            }}
                            className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <img
                              src={similarItem.image}
                              alt={similarItem.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-black text-xs sm:text-sm truncate">{similarItem.name}</h5>
                              <p className="text-gold-600 font-semibold text-xs sm:text-sm">
                                ₹{similarItem.pricePerKg || similarItem.pricePerPiece || similarItem.pricePerLiter}
                              </p>
                            </div>
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg shadow-lg max-w-sm ${notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
              }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </>
  );
}