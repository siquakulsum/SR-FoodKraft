import { useState } from 'react';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Edit, Save, Plus, Trash2, Star, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import StarRating from '../components/UI/StarRating';
import { Address } from '../types';
import { lookupPincode, validatePincode } from '../utils/pincodeLookup';
import { api } from '../services/api';

export default function ProfilePage() {
  const { state, dispatch } = useApp();
  // const { updatePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    name: state.user?.name || '',
    email: state.user?.email || '',
    phone: state.user?.phone || '',
  });
  const [addressData, setAddressData] = useState({
    type: 'home' as 'home' | 'office' | 'other',
    doorNo: '',
    street: '',
    area: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [pincodeLoading, setPincodeLoading] = useState(false);

  if (!state.isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-poppins font-semibold text-black mb-4">
            Please login to view your profile
          </h2>
          <p className="text-gray-600 font-inter">
            You need to be logged in to access this page
          </p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const updatedUser = await api.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });

      dispatch({ type: 'LOGIN', payload: updatedUser });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: state.user?.name || '',
      email: state.user?.email || '',
      phone: state.user?.phone || '',
    });
    setIsEditing(false);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressData({
      type: 'home',
      doorNo: '',
      street: '',
      area: '',
      city: '',
      state: '',
      zipCode: '',
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressData({
      type: address.type,
      doorNo: address.doorNo || '',
      street: address.street || '',
      area: address.area || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
    });
    setShowAddressModal(true);
  };

  const handlePincodeChange = async (pincode: string) => {
    setAddressData({ ...addressData, zipCode: pincode });

    if (validatePincode(pincode)) {
      setPincodeLoading(true);
      try {
        const result = await lookupPincode(pincode);
        if (result) {
          setAddressData(prev => ({
            ...prev,
            city: result.city,
            state: result.state,
            area: result.area || prev.area,
          }));
        }
      } catch (error) {
        console.error('Error looking up pincode:', error);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleSaveAddress = () => {
    if (!addressData.street || !addressData.city || !addressData.state || !addressData.zipCode) {
      toast.warning('Please fill in all address fields');
      return;
    }

    const address: Address = {
      id: editingAddress?.id || Date.now().toString(),
      name: state.user?.name || 'Home',
      address: `${addressData.doorNo}, ${addressData.street}, ${addressData.area}, ${addressData.city}, ${addressData.state}`,
      phone: state.user?.phone || '',
      ...addressData,
    };

    if (editingAddress) {
      dispatch({ type: 'UPDATE_ADDRESS', payload: address });
    } else {
      dispatch({ type: 'ADD_ADDRESS', payload: address });
    }

    toast.success(editingAddress ? 'Address updated' : 'Address added');
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      dispatch({ type: 'DELETE_ADDRESS', payload: addressId });
      toast.success('Address deleted');
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.warning('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.warning('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters long');
      return;
    }

    try {
      await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password updated successfully');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-black mb-4">
            My Profile
          </h1>
          <p className="text-gray-600 font-inter text-lg">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-poppins font-semibold text-xl text-black">
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-gold hover:text-yellow-600 font-inter font-medium"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      className="text-gray-600 hover:text-gray-800 font-inter font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center text-gold hover:text-yellow-600 font-inter font-medium"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="font-inter text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {state.user?.name || 'Please update your name'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  ) : (
                    <p className="font-inter text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {state.user?.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  ) : (
                    <p className="font-inter text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {state.user?.phone || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* My Reviews Section - Moved to main content area */}
            <div id="my-reviews-section" className="bg-white rounded-lg shadow-md p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-poppins font-semibold text-lg text-black">
                  My Reviews
                </h3>
                <span className="text-sm text-gray-500 font-inter">
                  {state.ratings.filter(r => r.userId === state.user?.id).length} reviews
                </span>
              </div>

              {state.ratings.filter(r => r.userId === state.user?.id).length > 0 ? (
                <div className="space-y-4">
                  {state.ratings
                    .filter(r => r.userId === state.user?.id)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((rating) => {
                      // Find the menu item name from orders
                      const menuItemName = state.orders
                        .flatMap(order => order.items)
                        .find(item => item.id === rating.menuItemId)?.menuItem.name || 'Menu Item';

                      return (
                        <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Star className="h-6 w-6 text-gold" />
                              </div>
                              <div>
                                <h4 className="font-inter font-medium text-black">
                                  {menuItemName}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <StarRating
                                    rating={rating.rating}
                                    readonly={true}
                                    size="sm"
                                  />
                                  <span className="text-xs text-gray-500 font-inter">
                                    {new Date(rating.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {rating.review && (
                            <div className="mt-3">
                              <p className="font-inter text-gray-700 text-sm leading-relaxed">
                                "{rating.review}"
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-inter text-sm font-medium">No reviews yet</p>
                  <p className="font-inter text-xs mt-1">Rate your delivered orders to see them here</p>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-poppins font-semibold text-lg text-black mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <a href="/orders">
                  <Button variant="outline" className="w-full justify-start">
                    My Orders
                  </Button>
                </a>
                <a href="/favorites">
                  <Button variant="outline" className="w-full justify-start">
                    My Favorites ({state.user?.favorites?.length || 0})
                  </Button>
                </a>
                <button
                  onClick={() => {
                    const reviewsSection = document.getElementById('my-reviews-section');
                    if (reviewsSection) {
                      reviewsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full flex items-center justify-start px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-inter font-medium text-gray-700"
                >
                  <Star className="h-4 w-4 mr-2" />
                  My Reviews ({state.ratings.filter(r => r.userId === state.user?.id).length})
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center justify-start px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-inter font-medium text-gray-700"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </button>
                <Button variant="outline" className="w-full justify-start">
                  Support
                </Button>
              </div>
            </div>

            {/* My Addresses Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-poppins font-semibold text-lg text-black">
                  My Addresses
                </h3>
                <button
                  onClick={handleAddAddress}
                  className="flex items-center text-gold hover:text-yellow-600 font-inter font-medium text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>

              {state.user?.addresses && state.user.addresses.length > 0 ? (
                <div className="space-y-3">
                  {state.user.addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                          <div>
                            <p className="font-inter font-medium text-black capitalize text-sm">
                              {address.type}
                            </p>
                            <p className="font-inter text-gray-600 text-xs mt-1">
                              {address.doorNo && `${address.doorNo}, `}
                              {address.street}<br />
                              {address.area && `${address.area}, `}
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="text-gold hover:text-yellow-600 font-inter text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-800 font-inter text-xs font-medium"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="font-inter text-sm">No addresses saved</p>
                  <p className="font-inter text-xs">Add an address for faster checkout</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Type
            </label>
            <select
              value={addressData.type}
              onChange={(e) => setAddressData({ ...addressData, type: e.target.value as any })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="home">Home</option>
              <option value="office">Office</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Door Number
            </label>
            <input
              type="text"
              value={addressData.doorNo}
              onChange={(e) => setAddressData({ ...addressData, doorNo: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Door/Flat number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              value={addressData.street}
              onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Enter street address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area/Locality
            </label>
            <input
              type="text"
              value={addressData.area}
              onChange={(e) => setAddressData({ ...addressData, area: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Area or locality"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={addressData.zipCode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="600001"
                  maxLength={6}
                  required
                />
                {pincodeLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold"></div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={addressData.city}
                onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="City"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                value={addressData.state}
                onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="State"
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button onClick={handleSaveAddress} className="flex-1">
              {editingAddress ? 'Update Address' : 'Save Address'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAddressModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button onClick={handlePasswordChange} className="flex-1">
              Change Password
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}