import { useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  X,
} from "lucide-react";
import React from "react";

type ConfirmType = "warning" | "success" | "info" | "error";

interface ConfirmModalProps {
  open: boolean;
  type?: ConfirmType;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm?: () => void;
  disableCloseOnOutsideClick?: boolean;
}

const iconMap = {
  warning: <AlertTriangle className="text-yellow-500" size={44} />,
  success: <CheckCircle2 className="text-green-500" size={44} />,
  info: <Info className="text-blue-500" size={44} />,
  error: <XCircle className="text-red-500" size={44} />,
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  type = "info",
  title = "Xác nhận hành động",
  message = "Bạn có chắc chắn muốn thực hiện hành động này không?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onClose,
  onConfirm,
  disableCloseOnOutsideClick = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn"
      onClick={() => !disableCloseOnOutsideClick && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-11/12 sm:w-[450px] p-6 relative animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:bg-gray-100 p-1.5 rounded-full cursor-pointer transition"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-3">
          {iconMap[type]}
        </div>

        {/* Tiêu đề */}
        <h2 className="text-lg font-semibold text-gray-800 text-center my-4">
          {title}
        </h2>

        {/* Nội dung */}
        <p className="text-gray-600 text-sm text-center mb-6 leading-relaxed m-4">
          {message}
        </p>

        {/* Nút hành động */}
        <div className="flex justify-center gap-3 my-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-sm rounded-lg font-medium text-white cursor-pointer transition ${
              type === "error"
                ? "bg-red-600 hover:bg-red-700"
                : type === "warning"
                ? "bg-yellow-500 hover:bg-yellow-600"
                : type === "success"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
