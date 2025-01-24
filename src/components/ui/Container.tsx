import React, { ElementType, ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ContainerBaseProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  children?: ReactNode;
};

type ContainerProps<C extends ElementType> = ContainerBaseProps & {
  as?: C;
} & Omit<ComponentPropsWithoutRef<C>, keyof ContainerBaseProps | 'as'>;

export function Container<C extends ElementType = 'div'>({
  children,
  className,
  size = 'lg',
  as,
  ...props
}: ContainerProps<C>) {
  const Component = as || 'div';
  const sizes = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full'
  };

  return (
    <Component
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
