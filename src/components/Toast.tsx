import { toast, ToastOptions } from "react-toastify";

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

export const showSuccess = (msg: string, options?: ToastOptions) => {
  toast.success(msg, { ...defaultOptions, ...options });
};

export const showError = (msg: string, options?: ToastOptions) => {
  toast.error(msg, { ...defaultOptions, ...options });
};

export const showInfo = (msg: string, options?: ToastOptions) => {
  toast.info(msg, { ...defaultOptions, ...options });
};

export const showWarning = (msg: string, options?: ToastOptions) => {
  toast.warn(msg, { ...defaultOptions, ...options });
};
