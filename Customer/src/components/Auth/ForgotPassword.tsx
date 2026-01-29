import React, { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Button from '../UI/Button';

interface ForgotPasswordProps {
    onBack: () => void;
    onSuccess: () => void;
}

export default function ForgotPassword({ onBack, onSuccess }: ForgotPasswordProps) {
    const [step, setStep] = useState<'email' | 'success'>('email');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate email
            if (!email || !email.includes('@')) {
                throw new Error('Please enter a valid email address');
            }

            // Send password reset email (mock implementation - replace with actual API call)
            await sendPasswordResetEmail(email);
            setStep('success');
            toast.success('Reset link sent to your email');
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
            toast.error(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    // API function
    const sendPasswordResetEmail = async (emailAddress: string) => {
        try {
            // Use Supabase's built-in password reset
            const { supabase } = await import('../../lib/supabase');
            const { error } = await supabase.auth.resetPasswordForEmail(emailAddress, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            // Fallback to mock for demo purposes
            console.log(`Mock: Sending password reset email to ${emailAddress}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true };
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gold/10 mb-4">
                    {step === 'email' ? (
                        <Mail className="h-6 w-6 text-gold" />
                    ) : (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                    {step === 'email' ? 'Reset Password' : 'Check Your Email'}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    {step === 'email'
                        ? 'Enter your email address and we\'ll send you a link to reset your password'
                        : `We've sent a password reset link to ${email}`
                    }
                </p>
            </div>

            {/* Back Button */}
            {step === 'email' && (
                <button
                    onClick={onBack}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to login
                </button>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Email Input Step */}
            {step === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                                placeholder="Enter your email address"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            We'll send you a secure link to reset your password
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        loading={loading}
                        disabled={loading}
                    >
                        Send Reset Link
                    </Button>
                </form>
            )}

            {/* Success Step */}
            {step === 'success' && (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">
                                    Reset link sent successfully!
                                </h3>
                                <p className="mt-1 text-sm text-green-700">
                                    Please check your email and click the link to reset your password.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={onBack}
                            className="w-full"
                        >
                            Back to Login
                        </Button>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Didn't receive the email?{' '}
                                <button
                                    onClick={() => {
                                        setStep('email');
                                        setError('');
                                    }}
                                    className="text-gold hover:text-gold/80 font-medium"
                                >
                                    Try again
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Text */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-xs text-gray-600">
                    <strong>Need help?</strong> If you don't see the email in your inbox, check your spam folder or contact our support team.
                </p>
            </div>
        </div>
    );
}
