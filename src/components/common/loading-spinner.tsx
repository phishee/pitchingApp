interface LoadingSpinnerProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
  }
  
  export function LoadingSpinner({ message = 'Loading...', size = 'md' }: LoadingSpinnerProps) {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8', 
      lg: 'h-12 w-12'
    };
  
    return (
      <div className='h-full w-full flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    );
  }