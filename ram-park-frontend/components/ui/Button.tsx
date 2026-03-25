import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md',
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500': variant === 'primary',
          'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500': variant === 'secondary',
          'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500': variant === 'danger',
          'border-2 border-gray-300 hover:bg-gray-50 text-gray-900 focus:ring-blue-500 hover:border-gray-400': variant === 'outline',
          'hover:bg-gray-100 text-gray-900 focus:ring-blue-500': variant === 'ghost',
        },
        {
          'px-3 py-1.5 text-sm h-9': size === 'sm',
          'px-4 py-2 text-base h-10': size === 'md',
          'px-6 py-3 text-lg h-12': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}