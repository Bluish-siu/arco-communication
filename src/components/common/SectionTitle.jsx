import { cn } from '../../utils/cn';

/**
 * Reusable SectionTitle component for standard section headers
 */
export default function SectionTitle({
  badge,
  title,
  description,
  align = 'center',
  className = '',
}) {
  const alignStyles = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  };

  return (
    <div className={cn('flex flex-col max-w-3xl mb-12 sm:mb-16', alignStyles[align], className)}>
      {badge && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-3.5 shadow-2xs">
          {badge}
        </span>
      )}
      {title && (
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
          {title}
        </h2>
      )}
      {description && (
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
