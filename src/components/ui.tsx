
import React from 'react';
import { cn } from '@/lib/utils';

export const Container: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
}

export const Section: React.FC<SectionProps> = ({
  className,
  children,
  delay = 0,
  ...props
}) => {
  return (
    <section
      className={cn(
        'py-12 animate-slide-up opacity-0',
        className
      )}
      style={{ animationDelay: `${delay * 0.1}s` }}
      {...props}
    >
      {children}
    </section>
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white/90 backdrop-blur-lg rounded-xl shadow-lg border border-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const PageTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h1
      className={cn(
        'text-3xl sm:text-4xl font-bold tracking-tight text-gray-900',
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
};

export const PageSubtitle: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p
      className={cn(
        'text-lg text-gray-500 mt-2',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};
