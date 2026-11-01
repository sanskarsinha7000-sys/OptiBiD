import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "./utils";

const Modal = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full max-w-lg m-4 bg-navy-800 border border-navy-600 rounded-2xl shadow-2xl transform transition-all duration-200 scale-100",
          className,
        )}
        role="document"
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-navy-700">
            <h3 className="text-lg font-semibold text-slate-100" id="modal-title">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

Modal.displayName = "Modal";
export default Modal;