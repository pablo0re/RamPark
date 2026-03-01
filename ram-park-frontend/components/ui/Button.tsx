import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
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
        'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2',
        {
          'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500': variant === 'primary',
          'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500': variant === 'secondary',
          'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500': variant === 'danger',
        },
        {
          'px-4 py-2 text-sm': size === 'sm',
          'px-6 py-3 text-base': size === 'md',
          'px-8 py-4 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}