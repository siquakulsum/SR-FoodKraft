import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
}

export default function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  showCount = false,
  count = 0
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
      setIsHovering(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center space-x-1">
      <div
        className="flex items-center"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-all duration-200`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            disabled={readonly}
          >
            <Star
              className={`${sizeClasses[size]} ${star <= displayRating
                  ? isHovering
                    ? 'text-yellow-400 fill-current drop-shadow-sm'
                    : 'text-gold fill-current'
                  : 'text-gray-300 hover:text-gray-400'
                } transition-all duration-200`}
            />
          </button>
        ))}
      </div>

      {showCount && count > 0 && (
        <span className={`${textSizeClasses[size]} text-gray-500 font-inter ml-2`}>
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}

      {!showCount && rating > 0 && (
        <span className={`${textSizeClasses[size]} text-gray-600 font-inter ml-1`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}