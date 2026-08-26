import { cn } from '../../utils/cn';

/**
 * Reusable Container component to constrain max-width and provide uniform padding
 */
export default function Container({ children, className = '', ...props }) {
  return (
    <div
      className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', className)}
      {...props}
    >
      {children}
    </div>
  );
}
