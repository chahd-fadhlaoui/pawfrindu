import { Check, AlertCircle, Bell } from "lucide-react";

export default function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center p-4 rounded-lg shadow-lg animate-slide-in-right ${
            toast.type === "success"
              ? "bg-green-100 text-green-700 border-l-4 border-green-500"
              : toast.type === "error"
              ? "bg-red-100 text-red-700 border-l-4 border-red-500"
              : toast.type === "warning"
              ? "bg-orange-100 text-orange-700 border-l-4 border-orange-500"
              : "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
          }`}
          role="alert"
          aria-live="assertive"
        >
          {toast.type === "success" && <Check className="w-5 h-5 mr-2" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 mr-2" />}
          {toast.type === "warning" && <AlertCircle className="w-5 h-5 mr-2" />}
          {toast.type === "info" && <Bell className="w-5 h-5 mr-2" />}
          <span className="text-sm">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}