
import React from 'react';
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'default', size = 'default', icon: Icon, iconPosition = 'left', loading, className, ...props }, ref) => {
    return (
      <ShadcnButton
        ref={ref}
        variant={variant === 'glass' ? 'outline' : variant}
        size={size}
        className={cn(
          "font-medium transition-all duration-200 active:scale-[0.98]",
          variant === 'glass' && "backdrop-blur-md bg-white/10 border-white/20 dark:border-white/10 shadow-sm hover:bg-white/20",
          loading && "pointer-events-none",
          className
        )}
        disabled={props.disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            {Icon && iconPosition === 'left' && <Icon className="h-4 w-4" />}
            {children}
            {Icon && iconPosition === 'right' && <Icon className="h-4 w-4" />}
          </div>
        )}
      </ShadcnButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
