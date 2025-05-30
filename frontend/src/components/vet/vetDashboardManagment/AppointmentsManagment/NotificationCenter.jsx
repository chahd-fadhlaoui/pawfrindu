import { useState } from "react";
import { Bell, Check, AlertCircle, Bell as InfoIcon } from "lucide-react";

export default function NotificationCenter({ notifications }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-300 relative shadow-sm"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-10 border border-gray-100 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50 rounded-t-xl">
            <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No notifications available
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start p-4 hover:bg-gray-50 transition-colors"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {notification.type === "success" && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    {notification.type === "warning" && (
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    )}
                    {notification.type === "info" && (
                      <InfoIcon className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}