
import React, { useState, useRef } from 'react';
import { Upload, X, User, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThumbnail } from '@/context/ThumbnailContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useQuery } from '@tanstack/react-query';

interface ImageUploaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const ImageUploader: React.FC<ImageUploaderProps> = ({ className, ...props }) => {
  const { faceImage, setFaceImage } = useThumbnail();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Fetch user's previous uploaded images
  const { data: userImages, isLoading: loadingImages } = useQuery({
    queryKey: ['userImages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('thumbnails')
        .select('id, face_image_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user images:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);

    try {
      // First get dataURL for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFaceImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      if (user) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('face_images')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('face_images')
          .getPublicUrl(filePath);

        console.log('Image uploaded to:', publicUrl);
        
        // Store the image URL in the user's faceImage state
        setFaceImage(publicUrl);
        
        toast.success('Image uploaded successfully');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Error uploading image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setFaceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectUserImage = (imageUrl: string) => {
    setFaceImage(imageUrl);
  };

  return (
    <div 
      className={cn(
        'w-full',
        className
      )}
      {...props}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {!faceImage ? (
        <div
          className={cn(
            'w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300',
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
          )}
          onClick={handleUploadClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <User className="h-8 w-8" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-gray-700">Upload a face image</p>
              <p className="text-xs text-gray-500">Drag and drop or click to browse</p>
            </div>
            <Button 
              type="button"
              className="mt-2 gap-2"
              size="sm"
              disabled={uploading}
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Select image'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative animate-scale-in">
          <div className="w-full aspect-square rounded-xl overflow-hidden border border-gray-200">
            <img 
              src={faceImage} 
              alt="Uploaded face"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Display user's previously uploaded images if any */}
      {user && userImages && userImages.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Your Images</h3>
          <p className="text-sm text-gray-500 mt-1">Your previously uploaded images</p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {userImages.map((img, idx) => (
              <div 
                key={img.id}
                className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleSelectUserImage(img.face_image_url)}
              >
                <img 
                  src={img.face_image_url} 
                  alt={`Your image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">Example faces</h3>
        <p className="text-sm text-gray-500 mt-1">Click to use one of these example images</p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {['https://images.unsplash.com/photo-1618160702438-9b02ab6515c9', 
            'https://images.unsplash.com/photo-1721322800607-8c38375eef04', 
            'https://images.unsplash.com/photo-1582562124811-c09040d0a901'].map((url, idx) => (
            <div 
              key={idx}
              className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover-scale"
              onClick={() => setFaceImage(url)}
            >
              <img 
                src={url} 
                alt={`Example ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
