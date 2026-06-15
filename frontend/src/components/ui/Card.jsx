import { cn } from '@/lib/utils';

const Card = ({ className, ...props }) => (
  <div
    className={cn(
      'rounded-xl border border-gray-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
      className
    )}
    {...props}
  />
);

const CardHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight text-gray-900', className)} {...props} />
);

const CardDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-gray-600', className)} {...props} />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);

const CardFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };