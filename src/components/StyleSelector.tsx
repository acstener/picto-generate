
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
  id: string;
  name: string;
  description: string;
  imageSrc: string;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ 
  className, 
  ...props 
}) => {
  const { selectedStyle, setSelectedStyle } = useThumbnail();
  const [thumbnailStyles, setThumbnailStyles] = useState<ThumbnailStyleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        setLoading(true);
        
        // Get all files from the thumbnail_styles bucket
        const { data, error } = await supabase
          .storage
          .from('thumbnail_styles')
          .list();

        if (error) {
          console.error('Error fetching styles:', error);
          toast.error('Failed to load styles');
          return;
        }

        if (!data || data.length === 0) {
          setThumbnailStyles([]);
          return;
        }

        // Filter for image files only
        const imageFiles = data.filter(file => 
          file.name.match(/\.(jpeg|jpg|png|gif|webp)$/i)
        );
        
        // Create style options from the storage files
        const styles: ThumbnailStyleOption[] = imageFiles.map(file => {
          // Use filename without extension as the style name
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
          const formattedName = nameWithoutExt
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          return {
            id: `${nameWithoutExt}`,
            name: formattedName,
            description: `Style: ${formattedName}`,
            imageSrc: supabase.storage.from('thumbnail_styles').getPublicUrl(file.name).data.publicUrl
          };
        });
        
        setThumbnailStyles(styles);
        
        // If the selected style no longer exists or is null, select the first style if available
        if (styles.length > 0 && (!selectedStyle || !styles.some(style => style.id === selectedStyle))) {
          setSelectedStyle(styles[0].id);
        }
      } catch (error) {
        console.error('Error in fetchStyles:', error);
        toast.error('Failed to load styles');
      } finally {
        setLoading(false);
      }
    };

    fetchStyles();
  }, [uploading, selectedStyle, setSelectedStyle]); // Refresh when new file is uploaded or selected style changes

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
      ) : thumbnailStyles.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 p-3 rounded-full mb-4">
              <Plus className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No styles available</h3>
            <p className="text-gray-500 mb-4 max-w-md">
              {user ? 
                "Upload your first style template using the button above." : 
                "Please log in to upload custom style templates."}
            </p>
            {!user && (
              <Button onClick={() => window.location.href = '/auth'}>
                Login to Upload Styles
              </Button>
            )}
          </div>
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
