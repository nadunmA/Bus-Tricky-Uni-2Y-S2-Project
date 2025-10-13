import { X } from "lucide-react";
import { useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const getSizeClasses = () => {
    const sizes = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
    };
    return sizes[size] || sizes.md;
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${getSizeClasses()} transform transition-all duration-300 ease-out`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonColor = "blue",
  isLoading = false,
}) => {
  const getConfirmButtonStyles = () => {
    const colors = {
      blue: "bg-blue-600 hover:bg-blue-700 text-white",
      red: "bg-red-600 hover:bg-red-700 text-white",
      green: "bg-green-600 hover:bg-green-700 text-white",
    };
    return colors[confirmButtonColor] || colors.blue;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnBackdropClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>

        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ${getConfirmButtonStyles()}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const AlertModal = ({
  isOpen,
  onClose,
  title = "Alert",
  message,
  type = "info",
  buttonText = "OK",
}) => {
  const getIcon = () => {
    const iconProps = { className: "w-8 h-8 mx-auto mb-4" };

    switch (type) {
      case "success":
        return (
          <CheckCircle
            {...iconProps}
            className="w-8 h-8 mx-auto mb-4 text-green-500"
          />
        );
      case "error":
        return (
          <AlertCircle
            {...iconProps}
            className="w-8 h-8 mx-auto mb-4 text-red-500"
          />
        );
      case "warning":
        return (
          <AlertTriangle
            {...iconProps}
            className="w-8 h-8 mx-auto mb-4 text-amber-500"
          />
        );
      case "info":
      default:
        return (
          <Info {...iconProps} className="w-8 h-8 mx-auto mb-4 text-blue-500" />
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center space-y-4">
        {getIcon()}
        <p className="text-gray-600">{message}</p>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
};

export default Modal;
