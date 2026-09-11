import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
