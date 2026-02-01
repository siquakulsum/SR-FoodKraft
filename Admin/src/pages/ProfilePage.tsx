import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, Trash2, Camera } from 'lucide-react';
import { VerifyOtpModal } from '@/components/VerifyOtpModal';

const ProfilePage = () => {
    const { admin, initialize, updateProfile: updateStoreProfile } = useAuthStore();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    console.log('ProfilePage Debug - Admin State:', admin);

    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    // OTP Modal State
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otpContactValue, setOtpContactValue] = useState('');
    const [pendingUpdateData, setPendingUpdateData] = useState<any>(null);

    // Profile Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Initial Fetch
    useEffect(() => {
        const fetchProfile = async () => {
            if (!admin) {
                await initialize();
            }
        };
        fetchProfile();
    }, [initialize, admin]);

    // Sync state with admin data
    useEffect(() => {
        if (admin) {
            setFormData({
                name: admin.name || '',
                email: admin.email || '',
                phone: admin.phone || '',
            });
        }
    }, [admin]);

    // Handlers
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Basic Validation
        const phoneRegex = /^[0-9]{10,15}$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            toast({
                title: "Invalid Phone Number",
                description: "Phone number must be between 10 and 15 digits.",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        try {
            const result: any = await api.updateProfile(formData);

            if (result.otp_required) {
                setOtpContactValue(result.contact_value);
                setPendingUpdateData(formData);
                setOtpModalOpen(true);
                toast({
                    title: "Verification Required",
                    description: result.message,
                });
            } else {
                await updateStoreProfile(result);
                toast({
                    title: "Profile Updated",
                    description: "Your profile details have been successfully updated.",
                });
            }
        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.message || "Could not update profile.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (otp: string) => {
        if (!pendingUpdateData) return;

        try {
            const result = await api.verifyOtp(otp, otpContactValue, pendingUpdateData);
            await updateStoreProfile(result);

            toast({
                title: "Profile Verified & Updated",
                description: "Your contact details have been securely updated.",
            });

            setPendingUpdateData(null);
            setOtpModalOpen(false); // Close modal on success
        } catch (error: any) {
            throw error;
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Frontend Validation
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            toast({ title: "Invalid File Type", description: "Please upload a JPG or PNG image.", variant: "destructive" });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File Too Large", description: "Image size must be less than 5MB.", variant: "destructive" });
            return;
        }

        try {
            setAvatarLoading(true);
            const result = await api.uploadAvatar(file);
            // Result is { avatar_url: string }
            // Update store
            await updateStoreProfile({ avatar_url: result.avatar_url });

            toast({ title: "Avatar Updated", description: "Your profile picture has been updated." });
        } catch (error: any) {
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        } finally {
            setAvatarLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            setAvatarLoading(true);
            const result = await api.removeAvatar();
            await updateStoreProfile({ avatar_url: result.avatar_url });
            toast({ title: "Avatar Removed", description: "Profile picture reset to default." });
        } catch (error: any) {
            toast({ title: "Action Failed", description: error.message, variant: "destructive" });
        } finally {
            setAvatarLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({ title: "Password Mismatch", description: "New passwords do not match.", variant: "destructive" });
            return;
        }
        // Strict Frontend Validation matching Backend
        // Min 8 chars, Uppercase, Lowercase, Number, Special Char
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!strongPasswordRegex.test(passwordData.newPassword)) {
            toast({
                title: "Weak Password",
                description: "Password must be at least 8 characters and include uppercase, lowercase, number, and a special character.",
                variant: "destructive"
            });
            return;
        }

        try {
            setPasswordLoading(true);
            await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
            toast({ title: "Password Changed", description: "Your password has been updated successfully." });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast({ title: "Change Failed", description: error.message, variant: "destructive" });
        } finally {
            setPasswordLoading(false);
        }
    };

    if (!admin) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6 pb-16">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="flex flex-col items-center space-y-4 mb-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={admin.avatar_url || ''} />
                                    <AvatarFallback className="text-xl">{admin.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={avatarLoading}
                                    >
                                        {avatarLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                                        Change Photo
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive/90"
                                        onClick={handleRemoveAvatar}
                                        disabled={avatarLoading}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/jpeg, image/png"
                                    onChange={handleAvatarUpload}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Manage your password and security settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="submit" variant="secondary" disabled={passwordLoading} className="w-full">
                                {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Change Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* OTP Verification Modal */}
            <VerifyOtpModal
                isOpen={otpModalOpen}
                onClose={() => setOtpModalOpen(false)}
                onVerify={handleVerifyOtp}
                contactValue={otpContactValue}
            />
        </div>
    );
};

export default ProfilePage;
