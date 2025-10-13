import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  }, [toast.id, onRemove]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, handleClose]);

  const getToastStyles = () => {
    const baseStyles =
      "p-4 rounded-lg shadow-lg border max-w-sm w-full mb-3 transform transition-all duration-300 ease-in-out";

    const typeStyles = {
      success: "bg-green-50 border-green-200",
      error: "bg-red-50 border-red-200",
      warning: "bg-amber-50 border-amber-200",
      info: "bg-blue-50 border-blue-200",
    };

    const animationClass = isLeaving
      ? "translate-x-full opacity-0"
      : isVisible
      ? "translate-x-0 opacity-100"
      : "translate-x-full opacity-0";

    return `${baseStyles} ${typeStyles[toast.type]} ${animationClass}`;
  };

  const getIcon = () => {
    const iconProps = { className: "w-5 h-5 mr-3 flex-shrink-0" };

    switch (toast.type) {
      case "success":
        return (
          <CheckCircle
            {...iconProps}
            className="w-5 h-5 mr-3 flex-shrink-0 text-green-500"
          />
        );
      case "error":
        return (
          <AlertCircle
            {...iconProps}
            className="w-5 h-5 mr-3 flex-shrink-0 text-red-500"
          />
        );
      case "warning":
        return (
          <AlertTriangle
            {...iconProps}
            className="w-5 h-5 mr-3 flex-shrink-0 text-amber-500"
          />
        );
      case "info":
      default:
        return (
          <Info
            {...iconProps}
            className="w-5 h-5 mr-3 flex-shrink-0 text-blue-500"
          />
        );
    }
  };

  const getTextColor = () => {
    const colors = {
      success: "text-green-800",
      error: "text-red-800",
      warning: "text-amber-800",
      info: "text-blue-800",
    };
    return colors[toast.type];
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        {getIcon()}
        <div className="flex-1">
          {toast.title && (
            <h4 className={`text-sm font-semibold ${getTextColor()}`}>
              {toast.title}
            </h4>
          )}
          <p
            className={`text-sm ${toast.title ? "mt-1" : ""} ${getTextColor()}`}
          >
            {toast.message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="ml-3 flex-shrink-0 p-1 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {toast.duration > 0 && (
        <div className="mt-3 w-full bg-white bg-opacity-30 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all ease-linear ${
              toast.type === "success"
                ? "bg-green-400"
                : toast.type === "error"
                ? "bg-red-400"
                : toast.type === "warning"
                ? "bg-amber-400"
                : "bg-blue-400"
            }`}
            style={{
              width: "100%",
              animation: `toast-progress ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

const ToastContainer = ({
  toasts = [],
  removeToast,
  position = "top-right",
  maxToasts = 5,
}) => {
  const getContainerStyles = () => {
    const positions = {
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "top-center": "top-4 left-1/2 -translate-x-1/2",
      "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    };

    return `fixed z-50 ${positions[position]}`;
  };

  const visibleToasts = toasts.slice(-maxToasts);

  if (visibleToasts.length === 0) return null;

  return (
    <div className={getContainerStyles()}>
      {visibleToasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export { ToastContainer };
export default Toast;
