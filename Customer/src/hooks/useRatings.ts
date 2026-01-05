import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { MenuItemRating, MenuItemStats } from '../types';

export function useRatings(menuItemId?: string) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<MenuItemRating[]>([]);
  const [stats, setStats] = useState<MenuItemStats | null>(null);
  const [userRating, setUserRating] = useState<MenuItemRating | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (menuItemId) {
      fetchRatings();
      fetchStats();
      if (user) {
        fetchUserRating();
      }
    }
  }, [menuItemId, user]);

  const fetchRatings = async () => {
    if (!menuItemId) return;

    try {
      const { data, error } = await supabase
        .from('menu_item_ratings')
        .select(`
          *,
          user_profiles (
            name
          )
        `)
        .eq('menu_item_id', menuItemId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRatings(data || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const fetchStats = async () => {
    if (!menuItemId) return;

    try {
      const { data, error } = await supabase
        .from('menu_item_stats')
        .select('*')
        .eq('menu_item_id', menuItemId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUserRating = async () => {
    if (!menuItemId || !user) return;

    try {
      const { data, error } = await supabase
        .from('menu_item_ratings')
        .select('*')
        .eq('menu_item_id', menuItemId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserRating(data);
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  };

  const submitRating = async (rating: number, review: string = '') => {
    if (!menuItemId || !user) return;

    setLoading(true);
    try {
      const ratingData = {
        menu_item_id: menuItemId,
        user_id: user.id,
        rating,
        review: review.trim() || null,
      };

      if (userRating) {
        // Update existing rating
        const { data, error } = await supabase
          .from('menu_item_ratings')
          .update(ratingData)
          .eq('id', userRating.id)
          .select()
          .single();

        if (error) throw error;
        setUserRating(data);
      } else {
        // Create new rating
        const { data, error } = await supabase
          .from('menu_item_ratings')
          .insert(ratingData)
          .select()
          .single();

        if (error) throw error;
        setUserRating(data);
      }

      // Refresh data
      await Promise.all([fetchRatings(), fetchStats()]);
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteRating = async () => {
    if (!userRating || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('menu_item_ratings')
        .delete()
        .eq('id', userRating.id);

      if (error) throw error;
      
      setUserRating(null);
      await Promise.all([fetchRatings(), fetchStats()]);
    } catch (error) {
      console.error('Error deleting rating:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    ratings,
    stats,
    userRating,
    loading,
    submitRating,
    deleteRating,
    refetch: () => {
      fetchRatings();
      fetchStats();
      if (user) fetchUserRating();
    },
  };
}

// Hook for getting all menu items with their ratings
export function useMenuItemsWithRatings() {
  const [menuItemsWithRatings, setMenuItemsWithRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItemsWithRatings();
  }, []);

  const fetchMenuItemsWithRatings = async () => {
    try {
      // For now, we'll use the static menu data and fetch stats separately
      // In a real app, menu items would also be in the database
      const { data: statsData, error } = await supabase
        .from('menu_item_stats')
        .select('*');

      if (error) throw error;

      // Create a map of stats by menu item id
      const statsMap = new Map();
      statsData?.forEach(stat => {
        statsMap.set(stat.menu_item_id, stat);
      });

      // For now, we'll return empty array since menu items are static
      // In production, this would fetch from database
      setMenuItemsWithRatings([]);
    } catch (error) {
      console.error('Error fetching menu items with ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    menuItemsWithRatings,
    loading,
    refetch: fetchMenuItemsWithRatings,
  };
}