import { cn } from '@/lib/utils';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-background-secondary', className)}
      {...props}
    />
  );
};

export { Skeleton };