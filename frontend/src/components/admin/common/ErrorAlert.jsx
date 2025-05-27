
export const ErrorAlert = ({ message, onDismiss }) => (
    <div className="p-4 text-red-700 border-l-4 border-red-500 rounded-lg bg-red-50">
      {message}
      <button onClick={onDismiss} className="ml-2 text-sm text-red-500 hover:underline">
        Dismiss
      </button>
    </div>
  );