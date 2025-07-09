import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Plus,
  Wrench,
  Send,
  Inbox,
  LogOut,
  Settings,
  Bell,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { notifications, markAsRead } = useNotifications();

  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const renderBadge = (count: number | undefined) => {
    return count && count > 0 ? (
      <span className="absolute right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {count}
      </span>
    ) : null;
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Dashboard',
    },
    {
      path: '/add-tool',
      icon: Plus,
      label: 'Add Tool',
    },
    {
      path: '/my-tools',
      icon: Wrench,
      label: 'My Tools',
    },
    {
      path: '/my-requests',
      icon: Send,
      label: 'My Requests',
      badge: notifications.new_approvals,
      clearNotification: () => {
        if (notifications.new_approvals > 0) markAsRead();
      },
    },
    {
      path: '/incoming-requests',
      icon: Inbox,
      label: 'Incoming Requests',
      badge: notifications.new_requests,
      clearNotification: () => {
        if (notifications.new_requests > 0) markAsRead();
      },
    },
    {
      path: '/my-borrowed-tools',
      icon: Send,
      label: 'My Borrowed Tools',
    },
    {
      path: '/lent-tools',
      icon: Inbox,
      label: 'Lent Tools',
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <div className="flex flex-col w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16 bg-primary-600">
          <Settings className="h-8 w-8 text-white" />
          <span className="ml-2 text-xl font-bold text-white">ToolShare</span>
        </div>

        {/* Notification Bell */}
        <div className="px-4 py-2 border-b border-gray-200">
          <button
            onClick={() => notifications.total_notifications > 0 && markAsRead()}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 relative"
          >
            <Bell className="h-5 w-5 mr-3" />
            Notifications
            {renderBadge(notifications.total_notifications)}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.map(({ path, icon: Icon, label, badge, clearNotification }) => {
            const isActive = location.pathname === path;

            const handleClick = () => {
              if (clearNotification) clearNotification();
            };

            return (
              <Link
                to={path}
                key={path}
                onClick={handleClick}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors relative ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {label}
                {renderBadge(badge)}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowConfirmLogout(true)}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirmLogout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
            <button
              onClick={() => setShowConfirmLogout(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
