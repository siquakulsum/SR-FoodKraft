import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Plus, Minus, Heart, Star, X, Sparkles, Award, CheckCircle, AlertCircle, Share2, Eye } from 'lucide-react';
import { menuData } from '../data/menuData';
import { MenuItem, CartItem } from '../types';
import { useApp } from '../context/AppContext';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import RatingModal from '../components/UI/RatingModal';

export default function MenuPage() {
  const { state, dispatch } = useApp();
  const location = useLocation();

  // Get search term from URL params
  const urlParams = new URLSearchParams(location.search);
  const initialSearchTerm = urlParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(0.5);
  const [unit, setUnit] = useState<'kg' | 'pieces'>('kg');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 3 rows × 4 items per row

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  // Modal and notification states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: string, type: 'success' | 'error', message: string }>>([]);

  // Set initial search term from URL
  React.useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

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

  // Modal functions
  const handleItemClick = (item: MenuItem) => {
    setModalItem(item);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalItem(null);
    setQuantity(0.5);
    setSpecialInstructions('');
    document.body.style.overflow = 'unset';
  };


  // Share function
  const handleShareItem = async (item: MenuItem) => {
    const shareData = {
      title: item.name,
      text: `Check out this delicious ${item.name} from SR FoodKraft!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        addNotification('success', 'Item shared successfully!');
      } else {
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        addNotification('success', 'Link copied to clipboard!');
      }
    } catch (error) {
      addNotification('error', 'Failed to share item');
    }
  };

  // Get similar items
  const getSimilarItems = (item: MenuItem) => {
    return menuData.filter(menuItem =>
      menuItem.id !== item.id &&
      (menuItem.category === item.category || menuItem.isVegetarian === item.isVegetarian)
    ).slice(0, 3);
  };

  // Cleanup effect
  React.useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Modal keyboard support
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const categories = ['All', ...Array.from(new Set(menuData.map(item => item.category)))];

  const filteredMenu = menuData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' ||
      item.category === selectedCategory ||
      (selectedCategory === 'Favorites' && state.user?.favorites.includes(item.id));
    const matchesSubcategory = selectedSubcategory === 'All' || item.subcategory === selectedSubcategory;
    const matchesType = selectedType === 'All' ||
      (selectedType === 'Veg' && item.isVegetarian) ||
      (selectedType === 'Non Veg' && !item.isVegetarian);

    return matchesSearch && matchesCategory && matchesSubcategory && matchesType;
  });

  // Pagination logic
  const totalItems = filteredMenu.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredMenu.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedSubcategory, selectedType]);

  // Set quantity to item's minQuantity when item is selected
  React.useEffect(() => {
    if (selectedItem) {
      setQuantity(selectedItem.minQuantity);
    }
  }, [selectedItem]);

  React.useEffect(() => {
    if (modalItem) {
      setQuantity(modalItem.minQuantity);
    }
  }, [modalItem]);


  const MenuItemCard = ({ item }: { item: MenuItem }) => {
    const itemUnit = item.pricePerKg ? 'kg' : item.pricePerPiece ? 'pieces' : 'liters';

    const handleAddToCart = () => {
      const cartItem: CartItem = {
        id: `${item.id}-${itemUnit}`,
        menuItem: item,
        quantity: item.minQuantity,
        unit: itemUnit as 'kg' | 'pieces' | 'liters',
        specialInstructions: specialInstructions,
      };
      dispatch({ type: 'ADD_TO_CART', payload: cartItem });

      // Check for cart errors after dispatch
      setTimeout(() => {
        if (state.cartError) {
          addNotification('error', state.cartError.message);
          dispatch({ type: 'CLEAR_CART_ERROR' });
        } else {
          addNotification('success', `${item.name} added to cart successfully!`);
        }
      }, 100);

      setSelectedItem(null);
      setSpecialInstructions('');
    };

    return (
      <div
        className="group bg-white rounded-xl sm:rounded-2xl shadow-soft hover:shadow-large transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gold-200 transform hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer"
        onClick={() => handleItemClick(item)}
      >
        <div className="relative overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Favorite Button */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (state.user) {
                  if (state.user.favorites.includes(item.id)) {
                    dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: item.id });
                  } else {
                    dispatch({ type: 'ADD_TO_FAVORITES', payload: item.id });
                  }
                } else {
                  addNotification('error', 'Please login to save favorites');
                }
              }}
              className="p-1.5 sm:p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-gold-500 hover:text-white transition-all duration-300"
            >
              <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${state.user?.favorites.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* Vegetarian Badge */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
            <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${item.isVegetarian
              ? 'bg-green-500/90 text-white'
              : 'bg-red-500/90 text-white'
              }`}>
              {item.isVegetarian ? 'Veg' : 'Non-Veg'}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <h3 className="font-poppins font-semibold text-base sm:text-lg lg:text-xl text-black-900 group-hover:text-gold-600 transition-colors duration-300 flex-1 mr-2">
              {item.name}
            </h3>
            <div className="text-right flex-shrink-0">
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gold-600">
                ₹{item.pricePerKg || item.pricePerPiece || item.pricePerLiter}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm ml-1">/{itemUnit}</span>
            </div>
          </div>

          <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed text-xs sm:text-sm">
            {item.description}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-1 sm:space-x-2 mb-3 sm:mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-3 w-3 sm:h-4 sm:w-4 fill-gold-400 text-gold-400" />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-gray-500">(4.8 • 127)</span>
          </div>


          {/* Add to Cart Button */}
          <Button
            onClick={() => handleAddToCart()}
            className="w-full group text-xs sm:text-sm"
            disabled={!item.isAvailable}
          >
            {item.isAvailable ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    );
  };

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
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-gold-400" />
              <span className="font-inter font-semibold text-gold-100 text-sm sm:text-base">Premium Menu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-playfair font-bold text-white mb-4 sm:mb-6">
              Our Menu
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto px-4">
              Discover our carefully crafted selection of authentic dishes, prepared fresh for your special occasions
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Filter Section - Responsive */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gold-100 shadow-soft p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-2 sm:mb-3">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter text-sm sm:text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-2 sm:mb-3">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('All');
                }}
                className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter appearance-none bg-no-repeat bg-right bg-[length:16px] sm:bg-[length:20px] pr-8 sm:pr-10 text-sm sm:text-base"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")' }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Dietary Type */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-2 sm:mb-3">Dietary Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter appearance-none bg-no-repeat bg-right bg-[length:16px] sm:bg-[length:20px] pr-8 sm:pr-10 text-sm sm:text-base"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")' }}
              >
                <option value="All">All Types</option>
                <option value="Veg">Vegetarian</option>
                <option value="Non Veg">Non-Vegetarian</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedSubcategory('All');
                  setSelectedType('All');
                }}
                className="w-full text-xs sm:text-sm"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div>
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-2 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-poppins font-semibold text-black-900">
                {totalItems} {totalItems === 1 ? 'Item' : 'Items'} Found
              </h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {searchTerm && `Search results for "${searchTerm}"`}
                {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
              <Award className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Premium Quality</span>
            </div>
          </div>

          {/* Menu Grid - 3 rows of 4 items each */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {currentItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 mb-8 sm:mb-12">
              {/* Page Info */}
              <div className="text-sm sm:text-base text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} items
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    scrollToTop();
                  }}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1"
                >
                  <span>Previous</span>
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "primary" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCurrentPage(pageNum);
                          scrollToTop();
                        }}
                        className={`w-8 h-8 sm:w-10 sm:h-10 p-0 ${currentPage === pageNum
                          ? 'bg-gold-500 text-white border-gold-500'
                          : 'hover:bg-gold-50 hover:text-gold-700'
                          }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    scrollToTop();
                  }}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1"
                >
                  <span>Next</span>
                </Button>
              </div>
            </div>
          )}

          {/* No Results */}
          {totalItems === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Search className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-poppins font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Try adjusting your search or filter criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedSubcategory('All');
                  setSelectedType('All');
                }}
                className="text-sm sm:text-base"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add to Cart Modal - Responsive */}
      <Modal title="Add to Cart" isOpen={selectedItem !== null} onClose={() => {
        setSelectedItem(null);
        setQuantity(0.5);
        setSpecialInstructions('');
      }}>
        {selectedItem && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-poppins font-semibold text-black-900">Add to Cart</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-poppins font-semibold text-base sm:text-lg text-black-900 truncate">{selectedItem.name}</h4>
                  <p className="text-gold-600 font-semibold text-sm sm:text-base">
                    ₹{selectedItem.pricePerKg || selectedItem.pricePerPiece || selectedItem.pricePerLiter} / {unit}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-medium mb-1">Category</span>
                      <span className="text-gray-600 text-xs sm:text-sm">{selectedItem.category}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-medium mb-1">Type</span>
                      {selectedItem.subcategory ? (
                        <span className="px-1.5 py-0.5 bg-gold-100 text-gold-800 rounded-full text-xs font-medium w-fit">
                          {selectedItem.subcategory}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs sm:text-sm">-</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-medium mb-1">Availability</span>
                      <span className={`text-xs sm:text-sm font-medium ${selectedItem.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedItem.isAvailable ? 'Available' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-medium mb-1">Servings</span>
                      {selectedItem.servings ? (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium w-fit">
                          {selectedItem.servings} servings
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs sm:text-sm">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-2 sm:mb-3">
                  Quantity
                  <span className="text-gray-500 font-normal ml-2">
                    (Min: {selectedItem?.minQuantity || 0.5}, Max: {selectedItem?.maxQuantity || 10})
                  </span>
                </label>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <button
                    onClick={() => {
                      const minQty = selectedItem?.minQuantity || 0.5;
                      setQuantity(Math.max(minQty, quantity - 0.5));
                    }}
                    disabled={quantity <= (selectedItem?.minQuantity || 0.5)}
                    className="p-1.5 sm:p-2 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:bg-gold-50 hover:border-gold-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  </button>
                  <span className="font-inter font-semibold text-base sm:text-lg w-10 sm:w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => {
                      const maxQty = selectedItem?.maxQuantity || 10;
                      setQuantity(Math.min(maxQty, quantity + 0.5));
                    }}
                    disabled={quantity >= (selectedItem?.maxQuantity || 10)}
                    className="p-1.5 sm:p-2 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:bg-gold-50 hover:border-gold-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-2 sm:mb-3">Unit</label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {['kg', 'pieces'].map(u => (
                    <button
                      key={u}
                      onClick={() => setUnit(u as 'kg' | 'pieces')}
                      className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-inter font-medium transition-all duration-300 text-sm sm:text-base ${unit === u
                        ? 'bg-gold-500 text-white shadow-gold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gold-50 hover:text-gold-700'
                        }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-2 sm:mb-3">Special Instructions</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests or dietary requirements..."
                  className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter resize-none text-sm sm:text-base"
                  rows={3}
                />
              </div>

              <Button
                onClick={() => {
                  const cartItem: CartItem = {
                    id: `${selectedItem.id}-${unit}`,
                    menuItem: selectedItem,
                    quantity,
                    unit: unit as 'kg' | 'pieces' | 'liters',
                    specialInstructions,
                  };
                  dispatch({ type: 'ADD_TO_CART', payload: cartItem });

                  // Check for cart errors after dispatch
                  setTimeout(() => {
                    if (state.cartError) {
                      addNotification('error', state.cartError.message);
                      dispatch({ type: 'CLEAR_CART_ERROR' });
                    } else {
                      addNotification('success', `${selectedItem.name} added to cart successfully!`);
                      setSelectedItem(null);
                      setSpecialInstructions('');
                    }
                  }, 100);
                }}
                className="w-full text-sm sm:text-base"
                disabled={!selectedItem.isAvailable || quantity < (selectedItem.minQuantity || 0.5) || quantity > (selectedItem.maxQuantity || 10)}
              >
                Add to Cart - ₹{((selectedItem?.pricePerKg || selectedItem?.pricePerPiece || selectedItem?.pricePerLiter || 0) * quantity).toFixed(2)}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rating Modal */}
      {selectedItem && (
        <RatingModal
          isOpen={selectedItem !== null}
          menuItemName={selectedItem.name}
          menuItemImage={selectedItem.image}
          onSubmit={() => {
            setSelectedItem(null);
            setQuantity(0.5);
            setSpecialInstructions('');
          }}
          onClose={() => {
            setSelectedItem(null);
            setQuantity(0.5);
            setSpecialInstructions('');
          }}
        />
      )}

      {/* Item Details Modal - Responsive */}
      {isModalOpen && modalItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div
            className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-poppins font-bold text-black">
                  {modalItem.name}
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
                      src={modalItem.image}
                      alt={modalItem.name}
                      className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg sm:rounded-xl"
                    />
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold ${modalItem.isVegetarian
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}>
                        {modalItem.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gold-600 mb-1 sm:mb-2">
                        ₹{modalItem.pricePerKg || modalItem.pricePerPiece || modalItem.pricePerLiter}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Per {modalItem.pricePerKg ? 'kg' : modalItem.pricePerPiece ? 'piece' : 'liter'}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-black mb-1 sm:mb-2 text-sm sm:text-base">Description</h4>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                        {modalItem.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h4 className="font-semibold text-black mb-2 sm:mb-3 text-sm sm:text-base">Category</h4>
                        <span className="text-gray-600 text-sm sm:text-base">{modalItem.category}</span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-black mb-2 sm:mb-3 text-sm sm:text-base">Type</h4>
                        {modalItem.subcategory ? (
                          <span className="px-2 py-1 bg-gold-100 text-gold-800 rounded-full text-xs font-medium w-fit">
                            {modalItem.subcategory}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm sm:text-base">-</span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold text-black mb-2 sm:mb-3 text-sm sm:text-base">Availability</h4>
                        <span className={`font-semibold text-sm sm:text-base ${modalItem.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                          {modalItem.isAvailable ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-black mb-2 sm:mb-3 text-sm sm:text-base">Servings</h4>
                        {modalItem.servings ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium w-fit">
                            {modalItem.servings} servings
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
                          (Min: {modalItem?.minQuantity || 0.5}, Max: {modalItem?.maxQuantity || 10})
                        </span>
                      </h4>
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <button
                          onClick={() => {
                            const minQty = modalItem?.minQuantity || 0.5;
                            setQuantity(Math.max(minQty, quantity - 0.5));
                          }}
                          disabled={quantity <= (modalItem?.minQuantity || 0.5)}
                          className="p-1.5 sm:p-2 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:bg-gold-50 hover:border-gold-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </button>
                        <span className="font-semibold text-base sm:text-lg w-10 sm:w-12 text-center">{quantity}</span>
                        <button
                          onClick={() => {
                            const maxQty = modalItem?.maxQuantity || 10;
                            setQuantity(Math.min(maxQty, quantity + 0.5));
                          }}
                          disabled={quantity >= (modalItem?.maxQuantity || 10)}
                          className="p-1.5 sm:p-2 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:bg-gold-50 hover:border-gold-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 sm:space-y-3">
                      <Button
                        onClick={() => {
                          const cartItem: CartItem = {
                            id: `${modalItem.id}-${modalItem.pricePerKg ? 'kg' : 'piece'}`,
                            menuItem: modalItem,
                            quantity,
                            unit: modalItem.pricePerKg ? 'kg' : 'pieces',
                            specialInstructions: '',
                          };
                          dispatch({ type: 'ADD_TO_CART', payload: cartItem });

                          // Check for cart errors after dispatch
                          setTimeout(() => {
                            if (state.cartError) {
                              addNotification('error', state.cartError.message);
                              dispatch({ type: 'CLEAR_CART_ERROR' });
                            } else {
                              addNotification('success', 'Added to cart successfully!');
                              closeModal();
                            }
                          }, 100);
                        }}
                        className="w-full text-sm sm:text-base"
                        disabled={!modalItem.isAvailable || quantity < (modalItem.minQuantity || 0.5) || quantity > (modalItem.maxQuantity || 10)}
                      >
                        Add to Cart - ₹{((modalItem?.pricePerKg || modalItem?.pricePerPiece || modalItem?.pricePerLiter || 0) * quantity).toFixed(2)}
                      </Button>

                      <div className="flex space-x-2 sm:space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (state.user) {
                              if (state.user.favorites.includes(modalItem.id)) {
                                dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: modalItem.id });
                                addNotification('success', 'Removed from favorites');
                              } else {
                                dispatch({ type: 'ADD_TO_FAVORITES', payload: modalItem.id });
                                addNotification('success', 'Added to favorites');
                              }
                            } else {
                              addNotification('error', 'Please login to save favorites');
                            }
                          }}
                          className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                        >
                          <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${state.user?.favorites.includes(modalItem.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          <span>Favorite</span>
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleShareItem(modalItem)}
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
                        {getSimilarItems(modalItem).map((similarItem) => (
                          <div
                            key={similarItem.id}
                            onClick={() => {
                              setModalItem(similarItem);
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
    </div>
  );
}