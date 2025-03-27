
import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useThumbnail } from '@/context/ThumbnailContext';
import { Check, Loader2, Upload, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';

interface StyleSelectorProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ThumbnailStyleOption {
  id: 'modern' | 'minimal' | 'bold' | 'vibrant' | 'tech' | string;
  name: string;
  description: string;
  imageSrc: string;
  isCustom?: boolean;
}

// Default built-in styles
const defaultThumbnailStyles: ThumbnailStyleOption[] = [
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
  const [thumbnailStyles, setThumbnailStyles] = useState<ThumbnailStyleOption[]>(defaultThumbnailStyles);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCustomStyles = async () => {
      try {
        setLoading(true);
        
        // Get all files from the thumbnail_styles bucket
        const { data, error } = await supabase
          .storage
          .from('thumbnail_styles')
          .list();

        if (error) {
          console.error('Error fetching custom styles:', error);
          return;
        }

        if (data && data.length > 0) {
          // Filter for image files only
          const imageFiles = data.filter(file => 
            file.name.match(/\.(jpeg|jpg|png|gif|webp)$/i)
          );
          
          // Create style options from the custom styles
          const customStyles: ThumbnailStyleOption[] = imageFiles.map(file => {
            // Use filename without extension as the style name
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            const formattedName = nameWithoutExt
              .split(/[-_]/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
              
            return {
              id: `custom-${nameWithoutExt}`,
              name: formattedName,
              description: `Custom style: ${formattedName}`,
              imageSrc: supabase.storage.from('thumbnail_styles').getPublicUrl(file.name).data.publicUrl,
              isCustom: true
            };
          });
          
          // Combine default and custom styles
          setThumbnailStyles([...defaultThumbnailStyles, ...customStyles]);
        }
      } catch (error) {
        console.error('Error in fetchCustomStyles:', error);
        toast.error('Failed to load custom styles');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomStyles();
  }, [uploading]); // Refresh when new file is uploaded

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setUploading(true);
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${file.name.split('.')[0]}-${uuidv4().substring(0, 8)}.${fileExt}`;
      
      // Upload the file to Supabase storage
      const { error } = await supabase
        .storage
        .from('thumbnail_styles')
        .upload(fileName, file);
        
      if (error) {
        throw error;
      }
      
      toast.success('Style template uploaded successfully');
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={cn(
        'w-full',
        className
      )}
      {...props}
    >
      {user && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">Add Custom Style</h3>
              <p className="text-sm text-gray-500">Upload your own style template</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <Button 
              onClick={handleUploadClick}
              disabled={uploading}
              className="gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Style
                </>
              )}
            </Button>
          </div>
          <div className="h-px bg-gray-200 w-full my-6" />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="ml-2 text-gray-500">Loading styles...</span>
        </div>
      ) : (
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
                {style.isCustom && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary/80 text-white rounded-full">
                    Custom
                  </span>
                )}
              </div>
              
              {selectedStyle === style.id && (
                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StyleSelector;
