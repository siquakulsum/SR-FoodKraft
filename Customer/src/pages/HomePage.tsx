import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ChefHat, Heart, ChevronLeft, ChevronRight, Search, X, Award, Users, Clock, Minus, Plus, Loader2, CheckCircle, AlertCircle, Share2, Bookmark, Eye } from 'lucide-react';
import Button from '../components/UI/Button';
import { useApp } from '../context/AppContext';
import { menuData } from '../data/menuData';

export default function HomePage() {
  const { state, dispatch } = useApp();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedDietaryType, setSelectedDietaryType] = React.useState('All');
  const [selectedMenuCategory, setSelectedMenuCategory] = React.useState('All');
  const [visibleMenuItems] = React.useState(6);
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = React.useState<Array<{ id: string, type: 'success' | 'error', message: string }>>([]);
  const [isMenuLoading, setIsMenuLoading] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [wishlist, setWishlist] = React.useState<string[]>([]);
  const [currentTestimonialSlide, setCurrentTestimonialSlide] = React.useState(0);
  const [isTestimonialAutoPlaying, setIsTestimonialAutoPlaying] = React.useState(true);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  const [screenSize, setScreenSize] = React.useState('desktop');

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setScreenSize('mobile');
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getTotalSlides = () => {
    const items = menuData.slice(0, 8).length;
    if (screenSize === 'mobile') return Math.max(0, items - 1);
    if (screenSize === 'tablet') return Math.max(0, items - 2);
    return Math.max(0, items - 3);
  };

  const totalSlides = getTotalSlides();

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

  const handleFavoriteClick = (item: any) => {
    if (!state.user) {
      addNotification('error', 'Please login to save favorites');
      return;
    }

    if (state.user.favorites.includes(item.id)) {
      dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: item.id });
      addNotification('success', `${item.name} removed from favorites`);
    } else {
      dispatch({ type: 'ADD_TO_FAVORITES', payload: item.id });
      addNotification('success', `${item.name} added to favorites`);
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    // Restore body scroll when modal is closed
    document.body.style.overflow = 'unset';
  };

  const handleWishlistToggle = (item: any) => {
    if (!state.user) {
      addNotification('error', 'Please login to save to wishlist');
      return;
    }

    if (wishlist.includes(item.id)) {
      setWishlist(prev => prev.filter(id => id !== item.id));
      addNotification('success', `${item.name} removed from wishlist`);
    } else {
      setWishlist(prev => [...prev, item.id]);
      addNotification('success', `${item.name} added to wishlist`);
    }
  };

  const handleShareItem = async (item: any) => {
    const shareData = {
      title: item.name,
      text: `Check out this delicious ${item.name} from SR FoodKraft!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        addNotification('success', 'Item shared successfully!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        addNotification('success', 'Link copied to clipboard!');
      }
    } catch (error) {
      addNotification('error', 'Failed to share item');
    }
  };

  const getSimilarItems = (item: any) => {
    return menuData
      .filter(menuItem =>
        menuItem.id !== item.id &&
        (menuItem.category === item.category ||
          menuItem.isVegetarian === item.isVegetarian)
      )
      .slice(0, 3);
  };

  // Filter menu items for the explore section
  const exploreMenuItems = menuData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDietary = selectedDietaryType === 'All' ||
      (selectedDietaryType === 'Veg' && item.isVegetarian) ||
      (selectedDietaryType === 'Non-Veg' && !item.isVegetarian);
    const matchesCategory = selectedMenuCategory === 'All' || item.category === selectedMenuCategory;

    return matchesSearch && matchesDietary && matchesCategory;
  });

  const displayedMenuItems = exploreMenuItems.slice(0, visibleMenuItems);
  const hasMoreItems = exploreMenuItems.length > visibleMenuItems;

  // Auto-play carousel
  React.useEffect(() => {
    if (!isAutoPlaying) return;
    if (menuData.slice(0, 8).length <= 4) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);

    return () => clearInterval(interval);
  }, [totalSlides, isAutoPlaying]);

  // Auto-play testimonials carousel
  React.useEffect(() => {
    if (!isTestimonialAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentTestimonialSlide((prev) => (prev + 1) % 4);
    }, 5000); // 5 seconds interval

    return () => clearInterval(interval);
  }, [isTestimonialAutoPlaying]);

  // Cleanup effect to restore body scroll
  React.useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Keyboard support for modal
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


  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
    setIsAutoPlaying(false);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
    setIsAutoPlaying(false);
  };

  const getUnit = (item: any) => (item.pricePerKg ? 'kg' : item.pricePerPiece ? 'pieces' : 'liters') as 'kg' | 'pieces' | 'liters';
  const getQuantityFor = (item: any) => (quantities[item.id] ?? item.minQuantity);

  const incrementQuantity = (item: any) => {
    setQuantities(prev => {
      const current = prev[item.id] ?? item.minQuantity;
      const next = current + 1;
      return { ...prev, [item.id]: next };
    });
  };

  const decrementQuantity = (item: any) => {
    setQuantities(prev => {
      const current = prev[item.id] ?? item.minQuantity;
      const next = Math.max(item.minQuantity, current - 1);
      return { ...prev, [item.id]: next };
    });
  };

  // Testimonials carousel functions
  const nextTestimonialSlide = () => {
    setCurrentTestimonialSlide((prev) => (prev + 1) % 4); // 4 slides total (6 testimonials, showing 3 at a time, with 1 overlap)
    setIsTestimonialAutoPlaying(false); // Pause auto-play when user interacts
  };

  const prevTestimonialSlide = () => {
    setCurrentTestimonialSlide((prev) => (prev - 1 + 4) % 4);
    setIsTestimonialAutoPlaying(false); // Pause auto-play when user interacts
  };

  const goToTestimonialSlide = (slideIndex: number) => {
    setCurrentTestimonialSlide(slideIndex);
    setIsTestimonialAutoPlaying(false); // Pause auto-play when user interacts
  };

  const testimonials = [
    {
      name: 'Priya Sharma',
      event: 'Wedding Reception',
      rating: 5,
      comment: 'Outstanding catering service! The food was delicious and the presentation was perfect.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Rajesh Kumar',
      event: 'Corporate Event',
      rating: 5,
      comment: 'Professional service and amazing taste. Our guests were thoroughly impressed.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Anita Patel',
      event: 'Birthday Party',
      rating: 5,
      comment: 'Exceptional quality and timely delivery. Will definitely book again!',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Suresh Reddy',
      event: 'Anniversary Celebration',
      rating: 5,
      comment: 'The team went above and beyond to make our special day memorable. Highly recommended!',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Meera Singh',
      event: 'Graduation Party',
      rating: 5,
      comment: 'Fresh ingredients, authentic flavors, and excellent service. Our family loved every dish!',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Vikram Joshi',
      event: 'Festival Celebration',
      rating: 5,
      comment: 'Perfect blend of traditional and modern cuisine. The presentation was absolutely stunning!',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
    },
  ];

  const events = [
    {
      title: 'Wedding Catering',
      description: 'Make your special day unforgettable with our premium wedding catering services.',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg',
      features: ['Custom Menu Planning', 'Professional Setup', 'Live Cooking Stations', 'Wedding Specialists'],
    },
    {
      title: 'Corporate Events',
      description: 'Impress your clients and colleagues with our professional corporate catering.',
      image: 'https://images.pexels.com/photos/1181391/pexels-photo-1181391.jpeg',
      features: ['Business Lunch Packages', 'Conference Catering', 'Team Building Events', 'Executive Dining'],
    },
    {
      title: 'Private Parties',
      description: 'Celebrate life\'s moments with our personalized private party catering.',
      image: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg',
      features: ['Birthday Celebrations', 'Anniversary Parties', 'Family Gatherings', 'Custom Menus'],
    },
  ];

  const handleAddToCart = async (item: any, quantity: number, unit: string) => {
    const itemKey = `${item.id}-${unit}`;

    // Set loading state
    setLoadingStates(prev => ({ ...prev, [itemKey]: true }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const cartItem = {
        id: itemKey,
        menuItem: item,
        quantity,
        unit: unit as 'kg' | 'pieces' | 'liters',
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
    } catch (error) {
      addNotification('error', 'Failed to add item to cart. Please try again.');
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [itemKey]: false }));
    }
  };

  // Skeleton loader component
  const MenuItemSkeleton = () => (
    <div className="group bg-white rounded-2xl shadow-soft border border-gray-100 animate-pulse">
      <div className="relative overflow-hidden">
        <div className="w-full h-48 bg-gray-200 rounded-t-2xl" />
        <div className="absolute top-4 right-4">
          <div className="p-2 bg-white/90 rounded-full">
            <div className="w-4 h-4 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded-full w-12" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <div key={star} className="w-4 h-4 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            <div className="w-8 h-4 bg-gray-200 rounded" />
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );

  // Item Details Modal Component - Exact copy from MenuPage
  const ItemDetailsModal = () => {
    if (!selectedItem) return null;

    return (
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
                              setNotifications(prev => [...prev, { id: Date.now().toString(), type: 'success', message: 'Removed from favorites' }]);
                            } else {
                              dispatch({ type: 'ADD_TO_FAVORITES', payload: selectedItem.id });
                              setNotifications(prev => [...prev, { id: Date.now().toString(), type: 'success', message: 'Added to favorites' }]);
                            }
                          } else {
                            setNotifications(prev => [...prev, { id: Date.now().toString(), type: 'error', message: 'Please login to save favorites' }]);
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
                            setNotifications(prev => [...prev, { id: Date.now().toString(), type: 'success', message: 'Link copied to clipboard!' }]);
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
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gold-50">
      {/* Item Details Modal */}
      {isModalOpen && <ItemDetailsModal />}

      {/* Notification Container - Below Top Bar */}
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
      {/* Premium Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with Parallax Effect */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{
              backgroundImage: 'url(https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black-900/80 via-black-900/60 to-black-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black-900/50 via-transparent to-transparent" />
        </div>

        {/* Floating Elements - Responsive */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-gold-400/20 rounded-full animate-float" />
          <div className="absolute top-20 sm:top-40 right-4 sm:right-20 w-10 h-10 sm:w-16 sm:h-16 bg-gold-300/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 sm:bottom-40 left-4 sm:left-20 w-8 h-8 sm:w-12 sm:h-12 bg-gold-500/25 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="animate-fade-in">

            {/* Main Heading - Responsive */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-playfair font-bold text-white mb-4 sm:mb-6 leading-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Welcome to{' '}
              <span className="bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 bg-clip-text text-transparent">
                SR FoodKraft
              </span>
            </h1>

            {/* Subtitle - Responsive */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-inter text-gray-200 mb-8 sm:mb-12 max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto leading-relaxed animate-slide-up px-4" style={{ animationDelay: '0.4s' }}>
              Crafting exceptional culinary experiences for your most precious moments.
              <span className="text-gold-300 font-semibold block sm:inline"> Fresh, authentic, and unforgettable.</span>
            </p>

            {/* Premium Features - Responsive */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 animate-slide-up px-4" style={{ animationDelay: '0.6s' }}>
              {[
                { icon: Clock, text: 'Prepared fresh after order', color: 'from-green-500 to-emerald-600' },
                { icon: Award, text: 'Premium quality guaranteed', color: 'from-purple-500 to-violet-600' },
              ].map((feature, index) => (
                <div key={index} className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 group hover:bg-black/60 transition-all duration-300 w-full sm:w-auto">
                  <div className={`p-1.5 sm:p-2 rounded-full bg-gradient-to-r ${feature.color}`}>
                    <feature.icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="font-inter font-medium text-white group-hover:text-gold-300 transition-colors duration-300 text-sm sm:text-base">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons - Responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-slide-up mb-16 sm:mb-20 px-4" style={{ animationDelay: '0.8s' }}>
              <Button
                size="lg"
                className="group shadow-premium hover:shadow-gold-lg w-full sm:w-auto"
                icon={<ChefHat className="h-5 w-5 sm:h-6 sm:w-6" />}
              >
                <Link to="/menu" onClick={scrollToTop} className="flex items-center justify-center">
                  <span className="text-sm sm:text-base">Explore Our Menu</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              {/* <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white hover:text-neutral-900 shadow-soft w-full sm:w-auto"
              >
                <Link to="/contact" onClick={scrollToTop} className="text-sm sm:text-base">Get Custom Quote</Link>
              </Button> */}

              <Button
                variant="outline"
                size="lg"
                className="group border-white/30 text-white hover:bg-white shadow-soft w-full sm:w-auto"
              >
                <Link
                  to="/contact"
                  onClick={scrollToTop}
                  className="text-sm sm:text-base text-white group-hover:text-neutral-900"
                >
                  Get Custom Quote
                </Link>
              </Button>

            </div>
          </div>
        </div>

        {/* Scroll Indicator - Responsive */}
        <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 animate-bounce-gentle z-10">
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-gold-400 rounded-full flex justify-center">
            <div className="w-1 h-2 sm:h-3 bg-gold-400 rounded-full mt-1.5 sm:mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="pt-12 sm:pt-16 pb-8 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-50/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center sm:text-left mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-gold-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gold-600" />
              <span className="font-inter font-semibold text-gold-700 text-xs sm:text-sm">Featured</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-black-900 mb-4 sm:mb-6">
              Featured Menu
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full mx-auto sm:mx-0" />
          </div>

          {/* Carousel */}
          <div className="relative">
            {/* Carousel Controls - Responsive */}
            {totalSlides > 0 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 sm:-translate-x-8 lg:-translate-x-12 p-2 sm:p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-large hover:bg-white hover:shadow-premium transition-all duration-300 z-20"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-black-700" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 sm:translate-x-8 lg:translate-x-12 p-2 sm:p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-large hover:bg-white hover:shadow-premium transition-all duration-300 z-20"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-black-700" />
                </button>
              </>
            )}

            <div className="overflow-hidden rounded-2xl sm:rounded-3xl">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${currentSlide * (screenSize === 'mobile' ? 100 : screenSize === 'tablet' ? 50 : 25)}%)`
                }}
              >
                {menuData.slice(0, 8).map((item) => (
                  <div key={item.id} className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 px-2 sm:px-3">
                    <div
                      onClick={() => handleItemClick(item)}
                      className="group bg-white rounded-xl sm:rounded-2xl shadow-soft hover:shadow-large transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gold-200 transform hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteClick(item);
                            }}
                            className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-gold-500 hover:text-white transition-all duration-300"
                          >
                            <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${state.user?.favorites?.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <h3
                            className="font-poppins font-semibold text-base sm:text-lg text-black-900 group-hover:text-gold-600 transition-colors duration-300 flex-1 mr-2 truncate cursor-help"
                            title={item.name}
                          >
                            {item.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${item.isVegetarian
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {item.isVegetarian ? 'Veg' : 'Non-Veg'}
                          </span>
                        </div>

                        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
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

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div>
                            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gold-600">
                              ₹{item.pricePerKg || item.pricePerPiece || item.pricePerLiter}
                            </span>
                            <span className="text-gray-500 text-xs sm:text-sm ml-1">
                              /{getUnit(item)}
                            </span>
                          </div>

                        </div>

                        <Button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsModalOpen(true);
                          }}
                          className="w-full group text-xs sm:text-sm"
                          disabled={!item.isAvailable}
                        >
                          {item.isAvailable ? (
                            'Add to Cart'
                          ) : (
                            'Out of Stock'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Dots/Indicators - Responsive */}
            {totalSlides > 0 && (
              <div className="flex justify-center mt-6 sm:mt-8">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all duration-300 ${index === currentSlide
                        ? 'w-6 sm:w-8 h-2 sm:h-3 bg-gold-500 rounded-full'
                        : 'w-2 sm:w-3 h-2 sm:h-3 bg-gray-300 rounded-full hover:bg-gold-300'
                        }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Explore Our Menu Section */}
      <section className="pt-8 sm:pt-12 pb-12 sm:pb-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-50/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center sm:text-left mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-gold-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
              <Search className="h-3 w-3 sm:h-4 sm:w-4 text-gold-600" />
              <span className="font-inter font-semibold text-gold-700 text-xs sm:text-sm">Explore Menu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-black-900 mb-4 sm:mb-6">
              Explore Our Menu
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full mx-auto sm:mx-0" />
          </div>

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
                    onChange={async (e) => {
                      setSearchTerm(e.target.value);
                      if (e.target.value.length > 2) {
                        setIsMenuLoading(true);
                        // Simulate search delay
                        await new Promise(resolve => setTimeout(resolve, 500));
                        setIsMenuLoading(false);
                      }
                    }}
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

              {/* Dietary Type */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-2 sm:mb-3">Dietary Type</label>
                <select
                  value={selectedDietaryType}
                  onChange={(e) => setSelectedDietaryType(e.target.value)}
                  className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter appearance-none bg-no-repeat bg-right bg-[length:16px] sm:bg-[length:20px] pr-8 sm:pr-10 text-sm sm:text-base"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")' }}
                >
                  <option value="All">All Types</option>
                  <option value="Veg">Vegetarian</option>
                  <option value="Non-Veg">Non-Vegetarian</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-black-700 mb-2 sm:mb-3">Category</label>
                <select
                  value={selectedMenuCategory}
                  onChange={(e) => setSelectedMenuCategory(e.target.value)}
                  className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 font-inter appearance-none bg-no-repeat bg-right bg-[length:16px] sm:bg-[length:20px] pr-8 sm:pr-10 text-sm sm:text-base"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")' }}
                >
                  <option value="All">All Categories</option>
                  <option value="Starters">Starters</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Rice & Biryani">Rice & Biryani</option>
                  <option value="Breads">Breads</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDietaryType('All');
                    setSelectedMenuCategory('All');
                  }}
                  className="w-full text-xs sm:text-sm"
                  disabled={searchTerm === '' && selectedDietaryType === 'All' && selectedMenuCategory === 'All'}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Menu Items Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {isMenuLoading ? (
              // Show skeleton loaders while loading
              Array.from({ length: 6 }).map((_, index) => (
                <MenuItemSkeleton key={`skeleton-${index}`} />
              ))
            ) : (
              displayedMenuItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="group bg-white rounded-xl sm:rounded-2xl shadow-soft hover:shadow-large transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gold-200 transform hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer"
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
                          handleFavoriteClick(item);
                        }}
                        className="p-1.5 sm:p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-gold-500 hover:text-white transition-all duration-300"
                      >
                        <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${state.user?.favorites?.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
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
                      <h3
                        className="font-poppins font-semibold text-base sm:text-lg lg:text-xl text-black-900 group-hover:text-gold-600 transition-colors duration-300 flex-1 mr-2 truncate cursor-help"
                        title={item.name}
                      >
                        {item.name}
                      </h3>
                      <div className="text-right flex-shrink-0">
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gold-600">
                          ₹{item.pricePerKg || item.pricePerPiece || item.pricePerLiter}
                        </span>
                        <span className="text-gray-500 text-xs sm:text-sm ml-1">/{getUnit(item)}</span>
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


                    {/* Action Buttons */}
                    <div className="flex space-x-2 sm:space-x-3">
                      <Button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsModalOpen(true);
                        }}
                        className="flex-1 group text-xs sm:text-sm"
                        disabled={!item.isAvailable}
                      >
                        {item.isAvailable ? (
                          'Add to Cart'
                        ) : (
                          'Out of Stock'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* View More Button - Responsive */}
          {hasMoreItems && (
            <div className="text-center mt-8 sm:mt-12">
              <Link to="/menu" onClick={scrollToTop}>
                <Button size="lg" className="shadow-gold text-sm sm:text-base">
                  <span className="flex items-center">
                    View Full Menu
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  </span>
                </Button>
              </Link>
            </div>
          )}

          {/* No Results - Responsive */}
          {displayedMenuItems.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Search className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-poppins font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Try adjusting your search or filter criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDietaryType('All');
                  setSelectedMenuCategory('All');
                }}
                className="text-xs sm:text-sm"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Events We Cater Section - Responsive */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-black-900 via-black-800 to-black-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-transparent" />
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F59E0B' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-gold-500/20 backdrop-blur-sm border border-gold-400/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gold-400" />
              <span className="font-inter font-semibold text-gold-100 text-sm sm:text-base">Premium Events</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-white mb-4 sm:mb-6">
              Events We Cater
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto px-4">
              From intimate gatherings to grand celebrations, we bring culinary excellence to every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {events.map((event, index) => (
              <div key={index} className="group relative">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-gold-400/50 transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-premium">
                  <div className="relative mb-4 sm:mb-6 overflow-hidden rounded-xl sm:rounded-2xl">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-poppins font-bold text-white mb-3 sm:mb-4 group-hover:text-gold-300 transition-colors duration-300">
                    {event.title}
                  </h3>

                  <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                    {event.description}
                  </p>

                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {event.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gold-400 rounded-full flex-shrink-0" />
                        <span className="text-gray-300 font-inter text-xs sm:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/contact" onClick={scrollToTop}>
                    {/* <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white hover:text-black-900 text-xs sm:text-sm">
                      Contact Us
                    </Button> */}
                    <Button
                      variant="outline"
                      className="group w-full border-white/30 text-white hover:bg-white text-xs sm:text-sm"
                    >
                      <span className="group-hover:text-black transition-colors duration-200">
                        Contact Us
                      </span>
                    </Button>

                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Responsive */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-gold-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-100/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-gold-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gold-600" />
              <span className="font-inter font-semibold text-gold-700 text-xs sm:text-sm">Customer Stories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-black-900 mb-4 sm:mb-6">
              What Our Clients Say
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-gold-500 to-gold-600 mx-auto rounded-full" />
          </div>

          {/* Testimonials Horizontal Carousel */}
          <div
            className="relative"
            onMouseEnter={() => setIsTestimonialAutoPlaying(false)}
            onMouseLeave={() => setIsTestimonialAutoPlaying(true)}
          >
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonialSlide * (100 / 3)}%)` }}
              >
                {/* All testimonials in a single row */}
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-1/3 flex-shrink-0 px-3">
                    <div className="group bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-soft hover:shadow-large transition-all duration-500 border border-gray-100 hover:border-gold-200 transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full">
                      <div className="flex items-center mb-4 sm:mb-6">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-poppins font-semibold text-black-900 text-sm sm:text-base truncate">{testimonial.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{testimonial.event}</p>
                        </div>
                      </div>

                      <div className="flex items-center mb-3 sm:mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 sm:h-5 sm:w-5 fill-gold-400 text-gold-400" />
                        ))}
                      </div>

                      <p className="text-gray-600 leading-relaxed italic text-sm sm:text-base">
                        "{testimonial.comment}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonialSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 z-10"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
            <button
              onClick={nextTestimonialSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 z-10"
              aria-label="Next testimonials"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonialSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${currentTestimonialSlide === index
                    ? 'bg-gold-500 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Responsive */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-gold-500 via-gold-600 to-gold-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }} />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-white mb-4 sm:mb-6">
            Ready to Create Magic?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gold-100 mb-8 sm:mb-12 max-w-xs sm:max-w-2xl mx-auto px-4">
            Let us transform your event into an unforgettable culinary experience.
            <span className="block sm:inline"> Book your consultation today.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Button
              size="lg"
              variant="secondary"
              className="shadow-premium w-full sm:w-auto text-sm sm:text-base"
              icon={<ChefHat className="h-5 w-5 sm:h-6 sm:w-6" />}
            >
              <Link to="/contact" onClick={scrollToTop}>Start Planning</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white hover:!text-gold-600 w-full sm:w-auto text-sm sm:text-base"
            >
              <Link to="/menu" onClick={scrollToTop}>View Full Menu</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
