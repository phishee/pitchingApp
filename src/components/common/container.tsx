'use client';

import { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const containerVariants = cva('w-full mx-auto px-4 lg:px-6', {
  variants: {
    width: {
      fixed: 'max-w-[1320px]',
      fluid: '',
    },
  },
  defaultVariants: {
    width: 'fixed',
  },
});

export interface ContainerProps extends VariantProps<typeof containerVariants> {
  children?: ReactNode;
  width?: 'fixed' | 'fluid';
  className?: string;
}

export function Container({ children, width = 'fixed', className = '' }: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn(containerVariants({ width }), className)}
    >
      {children}
    </div>
  );
}
