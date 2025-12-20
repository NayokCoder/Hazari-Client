"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, "success", duration),
    error: (message, duration) => addToast(message, "error", duration),
    warning: (message, duration) => addToast(message, "warning", duration),
    info: (message, duration) => addToast(message, "info", duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 right-4 z-[9999] max-w-md w-full space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast, removeToast }) => {
  const { id, message, type } = toast;

  const config = {
    success: {
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-600",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      iconColor: "text-green-400",
    },
    error: {
      icon: AlertCircle,
      gradient: "from-red-500 to-red-600",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      iconColor: "text-red-400",
    },
    warning: {
      icon: AlertTriangle,
      gradient: "from-yellow-500 to-orange-600",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      iconColor: "text-yellow-400",
    },
    info: {
      icon: Info,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      iconColor: "text-blue-400",
    },
  };

  const currentConfig = config[type] || config.info;
  const Icon = currentConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="pointer-events-auto"
    >
      <div className={`glass-card backdrop-blur-xl rounded-xl shadow-2xl border-2 ${currentConfig.border} overflow-hidden`}>
        <div className={`flex items-start gap-3 p-4`}>
          <div className={`w-10 h-10 rounded-full ${currentConfig.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${currentConfig.iconColor}`} />
          </div>
          <div className="flex-1 pt-1">
            <p className="text-foreground font-medium text-sm leading-relaxed">{message}</p>
          </div>
          <button
            onClick={() => removeToast(id)}
            className="p-1 rounded-full hover:bg-accent/50 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ToastProvider;
