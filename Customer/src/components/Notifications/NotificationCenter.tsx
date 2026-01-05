import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Settings, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface Notification {
  id: string;
  type: 'order_update' | 'promotion' | 'system' | 'welcome';
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

interface NotificationPreferences {
  order_updates: boolean;
  promotions: boolean;
  system_alerts: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchPreferences();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        notification_id: notificationId
      });

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      for (const id of unreadIds) {
        await markAsRead(id);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          ...newPreferences,
        })
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_update':
        return '🍽️';
      case 'promotion':
        return '🎉';
      case 'system':
        return '⚙️';
      case 'welcome':
        return '👋';
      default:
        return '📢';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!user) return null;

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-black hover:text-gold transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Notifications"
      >
        <div className="max-h-96 overflow-y-auto">
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSettings(true)}
                className="text-gray-500 hover:text-gold transition-colors"
                title="Notification Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-gold hover:text-yellow-600 font-medium"
                >
                  <CheckCheck className="h-4 w-4 inline mr-1" />
                  Mark all read
                </button>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {unreadCount} unread
            </span>
          </div>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notification.is_read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-poppins font-medium text-black text-sm">
                          {notification.title}
                        </h4>
                        <p className="font-inter text-gray-600 text-sm mt-1">
                          {notification.message}
                        </p>
                        <p className="font-inter text-gray-400 text-xs mt-2">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-inter">No notifications yet</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Notification Settings"
      >
        {preferences && (
          <div className="space-y-6">
            {/* Notification Types */}
            <div>
              <h3 className="font-poppins font-semibold text-black mb-3">
                Notification Types
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="font-inter text-gray-700">Order Updates</span>
                  <input
                    type="checkbox"
                    checked={preferences.order_updates}
                    onChange={(e) =>
                      updatePreferences({ order_updates: e.target.checked })
                    }
                    className="rounded border-gray-300 text-gold focus:ring-gold"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="font-inter text-gray-700">Promotions & Offers</span>
                  <input
                    type="checkbox"
                    checked={preferences.promotions}
                    onChange={(e) =>
                      updatePreferences({ promotions: e.target.checked })
                    }
                    className="rounded border-gray-300 text-gold focus:ring-gold"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="font-inter text-gray-700">System Alerts</span>
                  <input
                    type="checkbox"
                    checked={preferences.system_alerts}
                    onChange={(e) =>
                      updatePreferences({ system_alerts: e.target.checked })
                    }
                    className="rounded border-gray-300 text-gold focus:ring-gold"
                  />
                </label>
              </div>
            </div>

            {/* Delivery Channels */}
            <div>
              <h3 className="font-poppins font-semibold text-black mb-3">
                Delivery Channels
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="font-inter text-gray-700">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={preferences.email_enabled}
                    onChange={(e) =>
                      updatePreferences({ email_enabled: e.target.checked })
                    }
                    className="rounded border-gray-300 text-gold focus:ring-gold"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="font-inter text-gray-700">SMS Notifications</span>
                  <input
                    type="checkbox"
                    checked={preferences.sms_enabled}
                    onChange={(e) =>
                      updatePreferences({ sms_enabled: e.target.checked })
                    }
                    className="rounded border-gray-300 text-gold focus:ring-gold"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="font-inter text-gray-700">Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={preferences.push_enabled}
                    onChange={(e) =>
                      updatePreferences({ push_enabled: e.target.checked })
                    }
                    className="rounded border-gray-300 text-gold focus:ring-gold"
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => setShowSettings(false)}
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}