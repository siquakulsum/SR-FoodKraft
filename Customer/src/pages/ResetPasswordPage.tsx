import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import Button from '../components/UI/Button';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // const { updatePassword } = useAuth();

    useEffect(() => {
        // Check if we have the required tokens in the URL
        // Check if we have the required tokens in the URL
        const token = searchParams.get('token');
        // const refreshToken = searchParams.get('refresh_token');

        if (!token) {
            setError('Invalid or expired reset link. Please request a new password reset.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = searchParams.get('token');
        if (!token) {
            setError('Missing reset token');
            setLoading(false);
            return;
        }

        try {
            // Validate passwords
            if (!password || password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Update password
            await api.resetPassword(token, password);
            setSuccess(true);
            toast.success('Password reset successful');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
            toast.error(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Password Updated Successfully!
                            </h2>
                            <p className="text-sm text-gray-600 mb-6">
                                Your password has been updated. You will be redirected to the login page shortly.
                            </p>
                            <Button
                                onClick={() => navigate('/login')}
                                className="w-full"
                            >
                                Go to Login
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-6 space-y-3">
                    <div className="relative h-20 w-20 flex items-center justify-center">
                        <img
                            src="/SR logo.png"
                            alt="SR FoodKraft Logo"
                            className="h-20 w-20 object-contain"
                            style={{ transform: 'scale(1.8)' }}
                        />
                    </div>
                    <div className="text-center">
                        <h1 className="font-playfair text-3xl font-bold text-gray-900">
                            SR FoodKraft
                        </h1>
                        <p className="text-sm text-gray-700 font-inter font-medium">Premium Catering</p>
                    </div>
                </div>

                <h2 className="text-center text-2xl font-poppins font-bold text-black-700">
                    Reset Your Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 font-inter">
                    Enter your new password below
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                                    placeholder="Enter your new password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Password must be at least 6 characters long
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                                    placeholder="Confirm your new password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full"
                                loading={loading}
                                disabled={loading || !password || !confirmPassword}
                            >
                                Update Password
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}



