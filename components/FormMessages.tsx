'use client';

type MessageProps = {
  message?: string | null;
  className?: string;
};

const baseClasses = 'rounded-md px-4 py-3 text-sm border';

export function FormError({ message, className }: MessageProps) {
  if (!message) return null;
  const classes = [
    baseClasses,
    'bg-red-50 border-red-200 text-red-700',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{message}</div>;
}

export function FormSuccess({ message, className }: MessageProps) {
  if (!message) return null;
  const classes = [
    baseClasses,
    'bg-green-50 border-green-200 text-green-700',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{message}</div>;
}
