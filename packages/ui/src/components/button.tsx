import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

type ButtonElement = HTMLButtonElement;

type ButtonProps = React.ButtonHTMLAttributes<ButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand-500 text-white hover:bg-brand-600 focus-visible:outline-brand-600',
        ghost: 'text-brand-600 hover:bg-brand-50 focus-visible:outline-brand-600',
        subtle: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:outline-brand-600'
      },
      size: {
        md: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-6 text-base'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export const Button = forwardRef<ButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref as never} className={clsx(buttonVariants({ variant, size }), className)} {...props} />
    );
  }
);

Button.displayName = 'Button';
