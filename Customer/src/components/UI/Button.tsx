import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
}: ButtonProps) {
  const baseClasses = 'relative inline-flex items-center justify-center font-inter font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 focus:ring-gold-500 shadow-gold hover:shadow-gold-lg transform hover:-translate-y-0.5',
    secondary: 'bg-white text-black-900 border-2 border-gold-200 hover:bg-gold-50 hover:border-gold-300 focus:ring-gold-500 shadow-soft hover:shadow-medium',
    outline: 'border-2 border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-white focus:ring-gold-500 shadow-soft hover:shadow-medium',
    ghost: 'text-gold-600 hover:bg-gold-50 hover:text-gold-700 focus:ring-gold-500',
    danger: 'bg-gradient-to-r from-accent-red to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-soft hover:shadow-medium transform hover:-translate-y-0.5',
    success: 'bg-gradient-to-r from-accent-green to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-500 shadow-soft hover:shadow-medium transform hover:-translate-y-0.5',
  };

  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs rounded-lg',
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
    xl: 'px-10 py-5 text-xl rounded-2xl',
  };

  const iconSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}

      {!loading && icon && iconPosition === 'left' && (
        <span className={`mr-2 ${iconSizeClasses[size]}`}>
          {icon}
        </span>
      )}

      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>

      {!loading && icon && iconPosition === 'right' && (
        <span className={`ml-2 ${iconSizeClasses[size]}`}>
          {icon}
        </span>
      )}
    </button>
  );
}