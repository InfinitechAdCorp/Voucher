"use client";

import { useState, useEffect, useCallback } from "react";
import { Notification } from "@/components/notifications/notification-panel";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random notifications
      if (Math.random() > 0.7) {
        const types: Notification['type'][] = ['info', 'success', 'warning'];
        const messages = [
          { title: 'New Voucher Created', message: 'Cash voucher #CV-001 has been created' },
          { title: 'Payment Approved', message: 'Cheque voucher #CH-002 has been approved' },
          { title: 'Low Balance Alert', message: 'Account balance is running low' },
          { title: 'Monthly Report Ready', message: 'Your monthly financial report is ready' },
          { title: 'System Update', message: 'System maintenance scheduled for tonight' }
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const newNotification: Notification = {
          id: Date.now().toString(),
          ...randomMessage,
          type: types[Math.floor(Math.random() * types.length)],
          timestamp: new Date(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev].slice(0, 20));
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Initialize with some sample notifications
  useEffect(() => {
    const initialNotifications: Notification[] = [
      {
        id: '1',
        title: 'Welcome to Dashboard',
        message: 'Your enhanced dashboard is now ready with export and notification features',
        type: 'success',
        timestamp: new Date(Date.now() - 5 * 60000),
        read: false
      },
      {
        id: '2',
        title: 'Data Export Available',
        message: 'You can now export your data in Excel or CSV format',
        type: 'info',
        timestamp: new Date(Date.now() - 10 * 60000),
        read: false
      }
    ];
    
    setNotifications(initialNotifications);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    showNotifications,
    setShowNotifications
  };
}
