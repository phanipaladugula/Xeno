import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
        primary: 'bg-blue-500 text-white hover:bg-blue-600',
        secondary: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        success: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
        warning: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
        error: 'bg-red-50 text-red-600 hover:bg-red-100',
        outline: 'border border-gray-200 text-gray-900 hover:bg-gray-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Badge = ({ className, variant, ...props }) => {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
};

export { Badge, badgeVariants };