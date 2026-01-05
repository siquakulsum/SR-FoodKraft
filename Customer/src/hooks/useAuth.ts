import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        },
      },
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          name,
          phone: phone || null,
        });

      if (profileError) throw profileError;
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const sendOTP = async (phone: string) => {
    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate the OTP sending
      console.log(`Sending OTP to ${phone}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    } catch (error) {
      throw new Error('Failed to send OTP');
    }
  };

  const verifyOTP = async (phone: string, otp: string) => {
    try {
      // In a real implementation, this would verify OTP with your backend
      // For demo purposes, accept any 6-digit OTP
      if (otp.length !== 6) {
        throw new Error('Invalid OTP');
      }

      console.log(`Verifying OTP ${otp} for ${phone}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock user for OTP login
      const mockUser = {
        id: Date.now().toString(),
        email: `${phone}@srfoodkraft.com`,
        user_metadata: {
          name: 'OTP User',
          phone: phone,
        },
      };

      return { user: mockUser };
    } catch (error) {
      throw new Error('Invalid OTP');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw new Error('Failed to send password reset email');
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw new Error('Failed to update password');
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    sendOTP,
    verifyOTP,
    resetPassword,
    updatePassword,
  };
}