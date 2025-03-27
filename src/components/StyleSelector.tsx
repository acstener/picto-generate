
import React from 'react';
import { cn } from '@/lib/utils';
import { useThumbnail } from '@/context/ThumbnailContext';
import { Check } from 'lucide-react';

interface StyleSelectorProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ThumbnailStyleOption {
  id: 'modern' | 'minimal' | 'bold' | 'vibrant' | 'tech';
  name: string;
  description: string;
  imageSrc: string;
}

const thumbnailStyles: ThumbnailStyleOption[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, contemporary style with smooth gradients and elegant typography',
    imageSrc: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, sleek design with ample white space and clear focus',
    imageSrc: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'High contrast, attention-grabbing design with strong elements',
    imageSrc: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901',
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Colorful, energetic style with dynamic compositions',
    imageSrc: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
  },
  {
    id: 'tech',
    name: 'Tech',
    description: 'Futuristic, digital aesthetic with tech-inspired elements',
    imageSrc: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04',
  },
];

const StyleSelector: React.FC<StyleSelectorProps> = ({ 
  className, 
  ...props 
}) => {
  const { selectedStyle, setSelectedStyle } = useThumbnail();

  return (
    <div 
      className={cn(
        'w-full',
        className
      )}
      {...props}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {thumbnailStyles.map((style) => (
          <div
            key={style.id}
            className={cn(
              'relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 hover-scale',
              selectedStyle === style.id 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'border-transparent hover:border-gray-200'
            )}
            onClick={() => setSelectedStyle(style.id)}
          >
            <img 
              src={style.imageSrc} 
              alt={style.name}
              className="w-full aspect-video object-cover"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-medium text-lg">{style.name}</h3>
              <p className="text-white/80 text-xs mt-1 line-clamp-2">{style.description}</p>
            </div>
            
            {selectedStyle === style.id && (
              <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;
