import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-black text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-center sm:justify-start mb-4 space-x-3 sm:space-x-4">
              {/* Logo Image */}
              <div className="relative h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center">
                <img
                  src="/SR logo.png"
                  alt="SR FoodKraft Logo"
                  className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
                  style={{ transform: 'scale(1.2)' }}
                />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-playfair font-bold text-gold-400">
                  SR FoodKraft
                </h2>
                <p className="text-xs sm:text-sm text-gold-300 font-inter font-medium">Premium Catering</p>
              </div>
            </div>
            <p className="text-gray-300 font-inter text-center sm:text-left text-sm sm:text-base mb-4 sm:mb-6" itemProp="description">
              Premium catering services for weddings, corporate events, and private parties.
              Delivering exceptional culinary experiences with authentic flavors.
            </p>
            <div className="flex justify-center sm:justify-start space-x-3 sm:space-x-4">
              <Facebook className="h-5 w-5 sm:h-6 sm:w-6 text-gold hover:text-white cursor-pointer transition-colors" aria-label="Facebook" />
              <Instagram className="h-5 w-5 sm:h-6 sm:w-6 text-gold hover:text-white cursor-pointer transition-colors" aria-label="Instagram" />
              <Twitter className="h-5 w-5 sm:h-6 sm:w-6 text-gold hover:text-white cursor-pointer transition-colors" aria-label="Twitter" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-poppins font-semibold text-gold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" onClick={scrollToTop} className="text-gray-300 hover:text-gold transition-colors font-inter text-sm sm:text-base">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" onClick={scrollToTop} className="text-gray-300 hover:text-gold transition-colors font-inter text-sm sm:text-base">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={scrollToTop} className="text-gray-300 hover:text-gold transition-colors font-inter text-sm sm:text-base">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={scrollToTop} className="text-gray-300 hover:text-gold transition-colors font-inter text-sm sm:text-base">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-poppins font-semibold text-gold mb-3 sm:mb-4">Contact Us</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-center sm:justify-start">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gold mr-2 sm:mr-3 flex-shrink-0" />
                <span className="text-gray-300 font-inter text-sm sm:text-base">+91 98765 43210</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gold mr-2 sm:mr-3 flex-shrink-0" />
                <span className="text-gray-300 font-inter text-sm sm:text-base break-all">info@srfoodkraft.com</span>
              </div>
              <div className="flex items-start justify-center sm:justify-start">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gold mr-2 sm:mr-3 mt-0.5 sm:mt-1 flex-shrink-0" />
                <span className="text-gray-300 font-inter text-sm sm:text-base">
                  123 Catering Street<br />
                  Food District, City 560001
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 font-inter text-xs sm:text-sm">
            © 2025 SR FoodKraft. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}