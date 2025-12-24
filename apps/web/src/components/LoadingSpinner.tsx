interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div
        className={`animate-spin ${sizeClasses[size]} border-2 border-blue-600 border-t-transparent rounded-full`}
      ></div>
      <span className="ml-3 text-gray-600">{message}</span>
    </div>
  );
}
