import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useThumbnail } from '@/context/ThumbnailContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from './ui';
import { Button } from '@/components/ui/button';
import { Download, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ThumbnailPreviewProps extends React.HTMLAttributes<HTMLDivElement> {}

const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({ 
  className, 
  ...props 
}) => {
  const { 
    videoTitle, 
    videoDescription, 
    faceImage, 
    selectedStyle,
    generatedThumbnail,
    setGeneratedThumbnail
  } = useThumbnail();
  
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [thumbnailId, setThumbnailId] = useState<string | null>(null);

  const generateThumbnail = async () => {
    if (!faceImage || !videoTitle || !selectedStyle) {
      toast.error('Missing required information. Please complete all steps.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate thumbnail generation (in a real app, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would be an API call to generate the thumbnail
      // For now, we'll just use the face image as the generated thumbnail
      setGeneratedThumbnail(faceImage);
      
      // Save the thumbnail data to the database if user is authenticated
      if (user) {
        await saveThumbnailToDatabase();
      }
      
      toast.success('Thumbnail generated successfully!');
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      toast.error('Failed to generate thumbnail');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveThumbnailToDatabase = async () => {
    if (!user || !faceImage || !videoTitle) return;

    try {
      // If we have an existing thumbnailId, update it
      if (thumbnailId) {
        const { error } = await supabase
          .from('thumbnails')
          .update({
            face_image_url: faceImage,
            title: videoTitle,
            description: videoDescription,
            style: selectedStyle,
            thumbnail_url: generatedThumbnail || faceImage,
            updated_at: new Date().toISOString()
          })
          .eq('id', thumbnailId);

        if (error) throw error;
      } else {
        // Otherwise create a new record
        const { data, error } = await supabase
          .from('thumbnails')
          .insert({
            user_id: user.id,
            face_image_url: faceImage,
            title: videoTitle,
            description: videoDescription,
            style: selectedStyle,
            thumbnail_url: generatedThumbnail || faceImage
          })
          .select('id')
          .single();

        if (error) throw error;
        if (data) setThumbnailId(data.id);
      }
    } catch (error: any) {
      console.error('Error saving thumbnail to database:', error);
      toast.error(`Error saving thumbnail: ${error.message}`);
    }
  };

  const handleDownload = () => {
    // In a real implementation, this would download the actual generated thumbnail
    if (generatedThumbnail) {
      const link = document.createElement('a');
      link.href = generatedThumbnail;
      link.download = `thumbnail-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Thumbnail downloaded!');
    }
  };

  useEffect(() => {
    if (faceImage && videoTitle && selectedStyle) {
      generateThumbnail();
    }
  }, []); // Empty dependency array to run only once when component mounts

  return (
    <div 
      className={cn(
        'w-full',
        className
      )}
      {...props}
    >
      <Card className="overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900">Your Thumbnail Preview</h3>
          <p className="text-sm text-gray-500 mt-1">Here's a preview of your generated thumbnail</p>
        </div>
        
        <div className="px-6 pb-6">
          {generatedThumbnail ? (
            <div className="rounded-lg overflow-hidden thumbnail-aspect-ratio w-full animate-scale-in">
              <img 
                src={generatedThumbnail} 
                alt="Generated thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="rounded-lg bg-gray-100 thumbnail-aspect-ratio w-full flex items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center">
                  <div className="animate-pulse-soft">
                    <RefreshCcw className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                  <p className="text-gray-500 mt-4">Generating your thumbnail...</p>
                </div>
              ) : (
                <p className="text-gray-500">Complete all steps to generate a thumbnail</p>
              )}
            </div>
          )}
        </div>
        
        <div className="px-6 pb-6 flex space-x-3">
          <Button 
            className="w-full gap-2"
            disabled={!generatedThumbnail || isGenerating}
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          
          <Button 
            variant="outline"
            className="gap-2"
            disabled={isGenerating}
            onClick={generateThumbnail}
          >
            <RefreshCcw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </Card>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">Thumbnail Details</h3>
        <div className="mt-2 space-y-2">
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-xs font-medium text-gray-500">Title</span>
            <p className="text-sm text-gray-900 mt-1">{videoTitle || 'Not provided'}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-xs font-medium text-gray-500">Style</span>
            <p className="text-sm text-gray-900 mt-1">{selectedStyle ? selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1) : 'Not selected'}</p>
          </div>
          
          {videoDescription && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-xs font-medium text-gray-500">Description/Keywords</span>
              <p className="text-sm text-gray-900 mt-1">{videoDescription}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThumbnailPreview;
