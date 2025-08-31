import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NotificationContext = createContext(undefined);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ message: "", type: null });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });

    // auto close after 3s
    setTimeout(() => {
      setNotification({ message: "", type: null });
    }, 3000);
  }, []);

  const closeNotification = useCallback(() => {
    setNotification({ message: "", type: null });
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, closeNotification }}>
      {children}
      <AnimatePresence>
        {notification.message && (
          <motion.div
            key={notification.message}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          >
            <div
              className={`p-5 rounded-xl shadow-xl flex items-center space-x-4 ${
                notification.type === "success"
                  ? "bg-green-700 border border-green-500"
                  : "bg-red-700 border border-red-500"
              }`}
            >
              <div className="text-xl">
                {notification.type === "success" ? "✅" : "❌"}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-white">
                  {notification.type === "success" ? "Success" : "Error"}
                </p>
                <p className="text-sm text-gray-300">{notification.message}</p>
              </div>
              <button
                onClick={closeNotification}
                className={`ml-4 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  notification.type === "success"
                    ? "hover:bg-green-600 focus:ring-green-400"
                    : "hover:bg-red-600 focus:ring-red-400"
                }`}
                aria-label="Close notification"
              >
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a <NotificationProvider>"
    );
  }
  return context;
};
