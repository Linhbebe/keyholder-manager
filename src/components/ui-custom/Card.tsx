
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'outline';
  className?: string;
  animate?: boolean;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className,
  animate = false,
  hover = false,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl p-5 transition-all duration-300',
        variant === 'default' && 'bg-card text-card-foreground shadow-sm',
        variant === 'glass' && 'glass-card',
        variant === 'outline' && 'border border-border bg-transparent',
        animate && 'animate-scale-in',
        hover && 'hover:shadow-md hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <div className={cn('mb-4', className)}>{children}</div>;
};

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <h3 className={cn('text-lg font-semibold', className)}>{children}</h3>;
};

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>;
};

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <div className={cn('', className)}>{children}</div>;
};

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <div className={cn('mt-4 flex items-center', className)}>{children}</div>;
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
