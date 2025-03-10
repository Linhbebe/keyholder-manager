
import { CSSProperties } from 'react';

type AnimationVariant = 
  | 'fadeIn' 
  | 'fadeInUp' 
  | 'fadeInDown' 
  | 'scaleIn' 
  | 'slideInLeft' 
  | 'slideInRight';

interface AnimationProps {
  variant: AnimationVariant;
  duration?: number;
  delay?: number;
}

export const getAnimationStyles = ({
  variant,
  duration = 400,
  delay = 0
}: AnimationProps): CSSProperties => {
  const baseStyles: CSSProperties = {
    animationDuration: `${duration}ms`,
    animationFillMode: 'both',
    animationDelay: `${delay}ms`,
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  };

  switch (variant) {
    case 'fadeIn':
      return {
        ...baseStyles,
        animationName: 'fade-in',
      };
    case 'fadeInUp':
      return {
        ...baseStyles,
        animationName: 'slide-up',
      };
    case 'fadeInDown':
      return {
        ...baseStyles,
        animationName: 'slide-down',
      };
    case 'scaleIn':
      return {
        ...baseStyles,
        animationName: 'scale-in',
      };
    case 'slideInLeft':
      return {
        ...baseStyles,
        animationName: 'slide-in-left',
      };
    case 'slideInRight':
      return {
        ...baseStyles,
        animationName: 'slide-in-right',
      };
    default:
      return baseStyles;
  }
};

export const createStaggeredAnimation = (
  children: number,
  baseDelay: number = 50,
  startDelay: number = 0
): number[] => {
  return Array.from({ length: children }, (_, i) => startDelay + i * baseDelay);
};
