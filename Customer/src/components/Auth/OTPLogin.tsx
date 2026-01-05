import React, { useState, useEffect } from 'react';
import { ArrowLeft, Smartphone, Shield } from 'lucide-react';
import Button from '../UI/Button';

interface OTPLoginProps {
    onBack: () => void;
    onSuccess: (user: any) => void;
}

export default function OTPLogin({ onBack, onSuccess }: OTPLoginProps) {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate phone number
            if (!phone || phone.length < 10) {
                throw new Error('Please enter a valid phone number');
            }

            // Send OTP (mock implementation - replace with actual API call)
            await sendOTP(phone);
            setStep('otp');
            setCountdown(60); // 60 seconds countdown
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate OTP
            if (!otp || otp.length !== 6) {
                throw new Error('Please enter a valid 6-digit OTP');
            }

            // Verify OTP (mock implementation - replace with actual API call)
            const user = await verifyOTP(phone, otp);
            onSuccess(user);
        } catch (err: any) {
            setError(err.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (countdown > 0) return;

        setLoading(true);
        setError('');

        try {
            await sendOTP(phone);
            setCountdown(60);
        } catch (err: any) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    // API functions
    const sendOTP = async (phoneNumber: string) => {
        try {
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone: phoneNumber }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            return data;
        } catch (error) {
            // Fallback to mock for demo purposes
            console.log(`Mock: Sending OTP to ${phoneNumber}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true };
        }
    };

    const verifyOTP = async (phoneNumber: string, otpCode: string) => {
        try {
            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone: phoneNumber, otp: otpCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid OTP');
            }

            return data.user;
        } catch (error) {
            // Fallback to mock for demo purposes
            console.log(`Mock: Verifying OTP ${otpCode} for ${phoneNumber}`);
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (otpCode.length === 6) {
                return {
                    id: Date.now().toString(),
                    name: 'OTP User',
                    email: `${phoneNumber}@srfoodkraft.com`,
                    phone: phoneNumber,
                    addresses: [],
                    favorites: []
                };
            } else {
                throw new Error('Invalid OTP');
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gold/10 mb-4">
                    {step === 'phone' ? (
                        <Smartphone className="h-6 w-6 text-gold" />
                    ) : (
                        <Shield className="h-6 w-6 text-gold" />
                    )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                    {step === 'phone' ? 'Login with Phone' : 'Verify OTP'}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    {step === 'phone'
                        ? 'Enter your phone number to receive an OTP'
                        : `We've sent a 6-digit code to ${phone}`
                    }
                </p>
            </div>

            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login options
            </button>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Phone Number Step */}
            {step === 'phone' && (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone Number
                        </label>
                        <div className="mt-1">
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            We'll send you a verification code via SMS
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        loading={loading}
                        disabled={loading}
                    >
                        Send OTP
                    </Button>
                </form>
            )}

            {/* OTP Verification Step */}
            {step === 'otp' && (
                <form onSubmit={handleOTPSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                            Enter OTP
                        </label>
                        <div className="mt-1">
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm text-center text-lg tracking-widest"
                                placeholder="000000"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Enter the 6-digit code sent to your phone
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        loading={loading}
                        disabled={loading || otp.length !== 6}
                    >
                        Verify OTP
                    </Button>

                    {/* Resend OTP */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Didn't receive the code?{' '}
                            {countdown > 0 ? (
                                <span className="text-gray-400">
                                    Resend in {countdown}s
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    className="text-gold hover:text-gold/80 font-medium"
                                    disabled={loading}
                                >
                                    Resend OTP
                                </button>
                            )}
                        </p>
                    </div>
                </form>
            )}

            {/* Demo Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-xs text-blue-600">
                    <strong>Demo Mode:</strong> Any 6-digit number will work for OTP verification.
                </p>
            </div>
        </div>
    );
}
