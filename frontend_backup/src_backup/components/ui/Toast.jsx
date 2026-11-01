import { useState, useCallback, useEffect, useRef } from "react";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "./utils";

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    const handleToast = (event) => {
      addToast(event.detail);
    };
    window.addEventListener("show-toast", handleToast);
    return () => window.removeEventListener("show-toast", handleToast);
  }, [addToast]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium shadow-xl animate-in fade-in slide-in-from-right-4 duration-200",
            toast.type === "success"
              ? "bg-emerald-900/90 border-emerald-500/50 text-emerald-100"
              : toast.type === "error"
              ? "bg-red-900/90 border-red-500/50 text-red-100"
              : "bg-navy-800/90 border-cyan-500/50 text-cyan-100",
          )}
        >
          {icons[toast.type] || icons.info}
          <p>{toast.message}</p>
          <button
            onClick={() => dismiss(toast.id)}
            className="ml-auto opacity-50 hover:opacity-100"
            aria-label="Dismiss"
          >
            <span className="w-4 h-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </button>
        </div>
      ))}
    </div>
  );
};

export const showToast = (message, type = "info") => {
  window.dispatchEvent(
    new CustomEvent("show-toast", { detail: { message, type } }),
  );
};

ToastContainer.displayName = "ToastContainer";
export default ToastContainer;