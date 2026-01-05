import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    CreditCard,
    Building2,
    Calendar,
    Wallet,
    Clock,
    Shield,
    CheckCircle,
    Smartphone,
    QrCode,
    Star,
    Gift,
    Zap,
    Info,
    Circle,
    Square
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/UI/Button';

export default function PaymentOptionsPage() {
    const { state } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    const checkoutData = location.state;
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        upi: true,
        cards: false,
        netbanking: false,
        emi: false,
        wallet: false,
    });
    const [showOffers, setShowOffers] = useState(true);
    const [showOrderDetails, setShowOrderDetails] = useState(false);

    if (!checkoutData) {
        navigate('/cart');
        return null;
    }

    const { totalAmount } = checkoutData;

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handlePaymentMethodSelect = (method: string) => {
        setSelectedPaymentMethod(method);
    };

    const handleContinue = () => {
        if (!selectedPaymentMethod) return;

        // Set the payment method based on selection
        let paymentMethod = '';
        let paymentDetails = {};

        switch (selectedPaymentMethod) {
            case 'googlepay':
            case 'phonepe':
            case 'paytm':
                paymentMethod = 'upi';
                paymentDetails = { upiId: '', qrCode: false };
                break;
            case 'upi-qr':
                paymentMethod = 'upi';
                paymentDetails = { upiId: '', qrCode: true };
                break;
            case 'visa':
            case 'mastercard':
            case 'rupay':
                paymentMethod = 'card';
                paymentDetails = { number: '', expiry: '', cvv: '', name: '' };
                break;
            case 'sbi':
            case 'icici':
            case 'hdfc':
            case 'axis':
                paymentMethod = 'netbanking';
                paymentDetails = { bank: selectedPaymentMethod.toUpperCase(), accountNumber: '' };
                break;
            case 'amex-emi':
            case 'bajaj-emi':
                paymentMethod = 'emi';
                paymentDetails = { provider: selectedPaymentMethod };
                break;
            case 'phonepe-wallet':
            case 'mobikwik':
            case 'airtel':
                paymentMethod = 'wallet';
                paymentDetails = { provider: selectedPaymentMethod };
                break;
            default:
                paymentMethod = 'cod';
                paymentDetails = {};
        }

        // Navigate back to checkout with selected payment method
        navigate('/checkout', {
            state: {
                ...checkoutData,
                selectedPaymentMethod: paymentMethod,
                paymentDetails,
                paymentProvider: selectedPaymentMethod
            }
        });
    };

    const paymentOptions = {
        upi: {
            title: 'UPI',
            icon: Smartphone,
            logos: ['Google Pay', 'PhonePe', 'Paytm'],
            options: [
                { id: 'googlepay', name: 'Google Pay', logo: <Circle className="h-6 w-6 text-green-500" />, color: 'bg-green-50 border-green-200 text-green-700' },
                { id: 'phonepe', name: 'PhonePe', logo: <Circle className="h-6 w-6 text-purple-500" />, color: 'bg-purple-50 border-purple-200 text-purple-700' },
                { id: 'paytm', name: 'PayTM', logo: <Circle className="h-6 w-6 text-blue-500" />, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { id: 'upi-qr', name: 'UPI QR Code', logo: <QrCode className="h-6 w-6 text-gray-600" />, color: 'bg-gray-50 border-gray-200 text-gray-700' }
            ]
        },
        cards: {
            title: 'Cards',
            icon: CreditCard,
            logos: ['VISA', 'Mastercard', 'RuPay'],
            options: [
                { id: 'visa', name: 'VISA', logo: <CreditCard className="h-6 w-6 text-blue-600" />, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { id: 'mastercard', name: 'Mastercard', logo: <CreditCard className="h-6 w-6 text-red-600" />, color: 'bg-red-50 border-red-200 text-red-700' },
                { id: 'rupay', name: 'RuPay', logo: <CreditCard className="h-6 w-6 text-orange-600" />, color: 'bg-orange-50 border-orange-200 text-orange-700' }
            ]
        },
        netbanking: {
            title: 'Netbanking',
            icon: Building2,
            logos: ['SBI', 'ICICI', 'HDFC'],
            options: [
                { id: 'sbi', name: 'State Bank of India', logo: <Building2 className="h-6 w-6 text-blue-600" />, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { id: 'icici', name: 'ICICI Bank', logo: <Building2 className="h-6 w-6 text-orange-600" />, color: 'bg-orange-50 border-orange-200 text-orange-700' },
                { id: 'hdfc', name: 'HDFC Bank', logo: <Building2 className="h-6 w-6 text-red-600" />, color: 'bg-red-50 border-red-200 text-red-700' },
                { id: 'axis', name: 'Axis Bank', logo: <Building2 className="h-6 w-6 text-blue-600" />, color: 'bg-blue-50 border-blue-200 text-blue-700' }
            ]
        },
        emi: {
            title: 'EMI',
            icon: Calendar,
            logos: ['AMEX', 'Bajaj'],
            options: [
                { id: 'amex-emi', name: 'American Express EMI', logo: <CreditCard className="h-6 w-6 text-green-600" />, color: 'bg-green-50 border-green-200 text-green-700' },
                { id: 'bajaj-emi', name: 'Bajaj Finserv EMI', logo: <CreditCard className="h-6 w-6 text-blue-600" />, color: 'bg-blue-50 border-blue-200 text-blue-700' }
            ]
        },
        wallet: {
            title: 'Wallet',
            icon: Wallet,
            logos: ['PhonePe', 'Mobikwik', 'Airtel'],
            options: [
                { id: 'phonepe-wallet', name: 'PhonePe Wallet', logo: <Wallet className="h-6 w-6 text-purple-600" />, color: 'bg-purple-50 border-purple-200 text-purple-700' },
                { id: 'mobikwik', name: 'Mobikwik', logo: <Wallet className="h-6 w-6 text-orange-600" />, color: 'bg-orange-50 border-orange-200 text-orange-700' },
                { id: 'airtel', name: 'Airtel Payments Bank', logo: <Wallet className="h-6 w-6 text-red-600" />, color: 'bg-red-50 border-red-200 text-red-700' }
            ]
        },
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate('/checkout')}
                        className="p-1 hover:bg-blue-700 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg">SR Food Kraft</h1>
                        <div className="flex items-center space-x-1 text-xs">
                            <Shield className="h-3 w-3" />
                            <span>Secure Payment Gateway</span>
                        </div>
                    </div>
                </div>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white min-h-screen pb-24">
                <div className="p-4">
                    <h2 className="text-gray-600 text-sm font-medium mb-4">All Payment Options</h2>

                    {/* Payment Sections */}
                    {Object.entries(paymentOptions).map(([key, section]) => {
                        const IconComponent = section.icon;
                        const isExpanded = expandedSections[key];

                        return (
                            <div key={key} className="mb-4">
                                {/* Section Header */}
                                <button
                                    onClick={() => toggleSection(key)}
                                    className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <IconComponent className="h-5 w-5 text-gray-600" />
                                        <span className="font-medium text-gray-900">{section.title}</span>
                                        <div className="flex space-x-1">
                                            {section.logos.map((logo, index) => (
                                                <div key={index} className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                                                    {logo.charAt(0)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>

                                {/* Section Options */}
                                {isExpanded && (
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        {section.options.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => handlePaymentMethodSelect(option.id)}
                                                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${selectedPaymentMethod === option.id
                                                    ? 'border-gold-500 bg-gold-50'
                                                    : option.color
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-lg">{option.logo}</span>
                                                    <div>
                                                        <div className="font-medium text-sm">{option.name}</div>
                                                    </div>
                                                    {selectedPaymentMethod === option.id && (
                                                        <CheckCircle className="h-4 w-4 text-gold-600 ml-auto" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Payment Offers */}
                    {showOffers && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <Gift className="h-5 w-5 text-green-600" />
                                    <span className="font-semibold text-green-800">Payment Offers</span>
                                </div>
                                <button
                                    onClick={() => setShowOffers(false)}
                                    className="text-green-600 hover:text-green-800"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <Zap className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-gray-900">UPI Cashback</div>
                                            <div className="text-xs text-gray-600">Get ₹50 cashback on UPI payments</div>
                                        </div>
                                    </div>
                                    <div className="text-green-600 font-semibold text-sm">₹50 OFF</div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <CreditCard className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-gray-900">Card Discount</div>
                                            <div className="text-xs text-gray-600">5% off on credit card payments</div>
                                        </div>
                                    </div>
                                    <div className="text-blue-600 font-semibold text-sm">5% OFF</div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <Wallet className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-gray-900">Wallet Bonus</div>
                                            <div className="text-xs text-gray-600">Extra ₹25 on wallet payments</div>
                                        </div>
                                    </div>
                                    <div className="text-purple-600 font-semibold text-sm">₹25 OFF</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Tips */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start space-x-3">
                            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="font-semibold text-blue-800 text-sm mb-2">Payment Tips</div>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• UPI payments are instant and secure</li>
                                    <li>• Credit cards offer better fraud protection</li>
                                    <li>• EMI options available for orders above ₹2,000</li>
                                    <li>• COD available for orders below ₹5,000</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Security Logos */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center space-x-4 mb-3">
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <Shield className="h-4 w-4" />
                                <span>PCI DSS</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <Shield className="h-4 w-4" />
                                <span>RBI</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <Shield className="h-4 w-4" />
                                <span>VERIFIED</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <Smartphone className="h-4 w-4" />
                                <span>UPI</span>
                            </div>
                        </div>
                        <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                            Account & Terms
                        </button>
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xl font-bold">₹{totalAmount.toFixed(2)}</div>
                        <button
                            onClick={() => setShowOrderDetails(!showOrderDetails)}
                            className="text-xs text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                        >
                            <span>View Details</span>
                            {showOrderDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                    </div>
                    <Button
                        onClick={handleContinue}
                        disabled={!selectedPaymentMethod}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Continue
                    </Button>
                </div>

                {/* Order Details Dropdown */}
                {showOrderDetails && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-300">Subtotal</span>
                                <span>₹{(totalAmount * 0.85).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">GST (18%)</span>
                                <span>₹{(totalAmount * 0.15).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">Delivery</span>
                                <span>₹50.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">Discount</span>
                                <span className="text-green-400">-₹25.00</span>
                            </div>
                            <div className="border-t border-gray-600 pt-2 flex justify-between font-semibold">
                                <span>Total</span>
                                <span>₹{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
