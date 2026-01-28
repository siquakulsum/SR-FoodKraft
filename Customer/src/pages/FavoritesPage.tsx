import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { menuData } from '../data/menuData';
import Button from '../components/UI/Button';

export default function FavoritesPage() {
  const { state, dispatch } = useApp();

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  // Debug logging
  console.log('FavoritesPage - User logged in:', state.isLoggedIn);
  console.log('FavoritesPage - User:', state.user);
  console.log('FavoritesPage - User favorites:', state.user?.favorites);

  if (!state.isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-poppins font-semibold text-black mb-4">
            Please login to view favorites
          </h2>
          <p className="text-gray-600 font-inter mb-6">
            You need to be logged in to access your favorite items
          </p>
          <Link to="/login">
            <Button>Login Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  const favoriteItems = menuData.filter(item =>
    state.user?.favorites?.includes(item.id) || false
  );

  console.log('FavoritesPage - Favorite items found:', favoriteItems.length);

  const removeFavorite = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: itemId });
  };

  const addToCart = (item: any) => {
    try {
      const cartItem = {
        id: `${item.id}-${Date.now()}`,
        menuItem: item,
        quantity: item.minQuantity || 1,
        unit: (item.pricePerKg ? 'kg' : item.pricePerPiece ? 'pieces' : 'liters') as 'kg' | 'pieces' | 'liters',
        specialInstructions: '',
      };
      dispatch({ type: 'ADD_TO_CART', payload: cartItem });
      console.log('Added to cart:', item.name);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/menu"
            onClick={scrollToTop}
            className="flex items-center text-gold hover:text-yellow-600 font-inter font-medium mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Menu
          </Link>
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-black mb-4">
            My Favorites
          </h1>
          <p className="text-gray-600 font-inter text-lg">
            Your saved favorite dishes for quick ordering
          </p>
        </div>

        {favoriteItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteItems.map((item) => {
              console.log('Rendering favorite item:', item);
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.isVegetarian
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {item.isVegetarian ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFavorite(item.id)}
                      className="absolute top-2 left-2 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
                    >
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="font-poppins font-semibold text-lg text-black mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 font-inter text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-gold font-poppins font-bold text-lg">
                          ₹{item.pricePerKg || item.pricePerPiece || item.pricePerLiter}
                        </span>
                        <span className="text-gray-500 font-inter text-sm ml-1">
                          {item.pricePerKg ? '/kg' : item.pricePerPiece ? '/piece' : '/liter'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-inter">
                        Min: {item.minQuantity}{item.pricePerKg ? 'kg' : item.pricePerPiece ? ' pieces' : ' liters'}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => addToCart(item)}
                        className="flex-1 flex items-center justify-center"
                        disabled={!item.isAvailable}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {item.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                      <button
                        onClick={() => removeFavorite(item.id)}
                        className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove from favorites"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-poppins font-semibold text-black mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 font-inter mb-6">
              Start adding items to your favorites by clicking the heart icon on menu items
            </p>
            <Link to="/menu" onClick={scrollToTop}>
              <Button>Browse Menu</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}