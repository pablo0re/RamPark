import { cn } from '@/lib/utils';

export function Card({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pb-3', className)} {...props} />;
}

export function CardTitle({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return <h3 className={cn('text-2xl font-bold', className)} {...props} />;
}

export function CardContent({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}