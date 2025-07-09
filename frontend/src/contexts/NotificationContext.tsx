import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationData } from '../types';
import { requestsAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationData;
  refreshNotifications: () => Promise<void>;
  markAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData>({
    new_approvals: 0,
    new_requests: 0,
    total_notifications: 0,
  });

  const refreshNotifications = async () => {
    if (!user) return;
    
    try {
      const data = await requestsAPI.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async () => {
    try {
      await requestsAPI.markNotificationsRead();
      setNotifications({
        new_approvals: 0,
        new_requests: 0,
        total_notifications: 0,
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      refreshNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(refreshNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const value = {
    notifications,
    refreshNotifications,
    markAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};