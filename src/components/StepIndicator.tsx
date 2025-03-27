
import React from 'react';
import { cn } from '@/lib/utils';
import { useThumbnail } from '@/context/ThumbnailContext';
import { Check } from 'lucide-react';

interface StepIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  steps, 
  className, 
  ...props 
}) => {
  const { step } = useThumbnail();

  return (
    <div 
      className={cn(
        'w-full',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between w-full">
        {steps.map((label, idx) => {
          const stepNumber = idx + 1;
          const isActive = step === stepNumber;
          const isCompleted = step > stepNumber;
          
          return (
            <div key={idx} className="flex flex-col items-center relative">
              <div 
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                  isActive && 'border-primary text-primary scale-110',
                  isCompleted && 'border-primary bg-primary text-white',
                  !isActive && !isCompleted && 'border-gray-300 text-gray-500'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </div>
              
              <span 
                className={cn(
                  'mt-2 text-xs font-medium transition-colors duration-300',
                  isActive && 'text-primary',
                  isCompleted && 'text-primary',
                  !isActive && !isCompleted && 'text-gray-500'
                )}
              >
                {label}
              </span>
              
              {idx < steps.length - 1 && (
                <div 
                  className={cn(
                    'absolute top-5 left-10 w-full h-[2px] -z-10 transition-colors duration-300',
                    isCompleted && 'bg-primary',
                    !isCompleted && 'bg-gray-200'
                  )}
                  style={{ width: 'calc(100% - 20px)' }}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
