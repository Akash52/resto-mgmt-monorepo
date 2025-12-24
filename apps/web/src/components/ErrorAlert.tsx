interface ErrorAlertProps {
  message: string | null;
  onClose?: () => void;
  className?: string;
}

export default function ErrorAlert({ message, onClose, className = '' }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className={`border border-red-200 bg-red-50 p-4 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-red-400 mr-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-red-700 text-sm">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
