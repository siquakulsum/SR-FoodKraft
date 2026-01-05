import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import StarRating from './StarRating';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItemName: string;
  menuItemImage: string;
  existingRating?: number;
  existingReview?: string;
  onSubmit: (rating: number, review: string) => void;
  loading?: boolean;
}

export default function RatingModal({
  isOpen,
  onClose,
  menuItemName,
  menuItemImage,
  existingRating = 0,
  existingReview = '',
  onSubmit,
  loading = false
}: RatingModalProps) {
  const [rating, setRating] = useState(existingRating);
  const [review, setReview] = useState(existingReview);

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    onSubmit(rating, review);
  };

  const handleClose = () => {
    setRating(existingRating);
    setReview(existingReview);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={existingRating > 0 ? 'Update Your Rating' : 'Rate This Dish'}
    >
      <div className="space-y-6">
        {/* Menu Item Info */}
        <div className="flex items-center space-x-4">
          <img
            src={menuItemImage}
            alt={menuItemName}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-poppins font-semibold text-lg text-black">
              {menuItemName}
            </h3>
            <p className="text-gray-500 font-inter text-sm">
              How was your experience with this dish?
            </p>
          </div>
        </div>

        {/* Rating Selection */}
        <div className="text-center">
          <p className="font-inter text-gray-700 mb-4">
            {rating === 0 ? 'How was your experience?' : 'Your rating:'}
          </p>
          <div className="flex justify-center mb-4">
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size="lg"
            />
          </div>
          <div className="mt-2 min-h-[24px]">
            {rating > 0 && (
              <p className="text-sm font-medium text-gray-700 font-inter">
                {rating === 1 && '😞 Poor - Not satisfied'}
                {rating === 2 && '😐 Fair - Could be better'}
                {rating === 3 && '😊 Good - Met expectations'}
                {rating === 4 && '😍 Very Good - Exceeded expectations'}
                {rating === 5 && '🤩 Excellent - Outstanding!'}
              </p>
            )}
            {rating === 0 && (
              <p className="text-sm text-gray-500 font-inter">
                Hover over stars to see rating options
              </p>
            )}
          </div>
        </div>

        {/* Review Text */}
        <div className={`transition-all duration-300 ${rating > 0 ? 'opacity-100' : 'opacity-50'}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {rating > 0 ? 'Share your experience (optional)' : 'Write a review (optional)'}
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder={rating > 0 ? "Tell others about your experience with this dish..." : "Share your thoughts about this dish..."}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent resize-none transition-all duration-200 ${
              rating > 0 
                ? 'border-gray-300 bg-white' 
                : 'border-gray-200 bg-gray-50'
            }`}
            rows={4}
            maxLength={500}
            disabled={rating === 0}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              {review.length}/500 characters
            </p>
            {rating > 0 && (
              <p className="text-xs text-green-600 font-medium">
                ✓ Rating selected
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
            className={`flex-1 flex items-center justify-center transition-all duration-200 ${
              rating > 0 
                ? 'bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-500 hover:to-gold shadow-lg' 
                : ''
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {existingRating > 0 ? 'Update Rating' : 'Submit Rating'}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}