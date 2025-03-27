
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useThumbnail } from '@/context/ThumbnailContext';
import { Card } from './ui';
import { Button } from '@/components/ui/button';
import { Check, Image, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
    thumbnailDetails,
    setThumbnailDetails,
    thumbnailText,
    setThumbnailText,
    setGeneratedThumbnail,
    setStep
  } = useThumbnail();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [styleImageUrl, setStyleImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the style image URL when selectedStyle changes
    const fetchStyleImage = async () => {
      if (selectedStyle) {
        try {
          // Try different extensions in case the file has a different extension
          const extensions = ['jpg', 'jpeg', 'png', 'webp'];
          
          for (const ext of extensions) {
            const styleFileName = `${selectedStyle}.${ext}`;
            
            // List files to find the matching file regardless of extension
            const { data: listData } = await supabase.storage
              .from('thumbnail_styles')
              .list();
              
            if (listData) {
              // Find the file that starts with the selected style ID
              const matchingFile = listData.find(file => 
                file.name.startsWith(`${selectedStyle}.`) || 
                file.name === styleFileName
              );
              
              if (matchingFile) {
                const { data } = supabase.storage
                  .from('thumbnail_styles')
                  .getPublicUrl(matchingFile.name);
                  
                if (data?.publicUrl) {
                  setStyleImageUrl(data.publicUrl);
                  console.log('Found style image:', data.publicUrl);
                  return; // Exit once we find a matching file
                }
              }
            }
          }
          
          console.log('No matching style image found for:', selectedStyle);
          setStyleImageUrl(null);
        } catch (error) {
          console.error('Error fetching style image:', error);
          setStyleImageUrl(null);
        }
      } else {
        setStyleImageUrl(null);
      }
    };
    
    fetchStyleImage();
  }, [selectedStyle]);

  const handleGenerateThumbnail = async () => {
    if (!faceImage || !videoTitle) {
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
      
      // Proceed to the download page
      setStep(5);
      
      toast.success('Thumbnail generated successfully!');
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      toast.error('Failed to generate thumbnail');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className={cn(
        'w-full',
        className
      )}
      {...props}
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Thumbnail Details</h3>
          <p className="text-gray-500 mb-6">Please confirm all details below before generating your thumbnail.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Face Image Preview */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b">
                <h4 className="font-medium">Selected Face Image</h4>
              </div>
              <div className="p-4">
                {faceImage ? (
                  <div className="rounded-lg overflow-hidden aspect-square w-full">
                    <img 
                      src={faceImage} 
                      alt="Your face"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg bg-gray-100 aspect-square w-full flex items-center justify-center">
                    <div className="flex flex-col items-center text-gray-500">
                      <Image className="h-8 w-8 mb-2" />
                      <p>No face image selected</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Thumbnail Style Preview */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b">
                <h4 className="font-medium">Selected Style</h4>
              </div>
              <div className="p-4">
                {selectedStyle ? (
                  <div className="space-y-4">
                    <div className="font-medium">{selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)}</div>
                    
                    {/* Display the style image */}
                    {styleImageUrl ? (
                      <div className="rounded-lg overflow-hidden w-full aspect-video">
                        <img 
                          src={styleImageUrl} 
                          alt={`${selectedStyle} style`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-lg bg-gray-100 aspect-video w-full flex items-center justify-center">
                        <div className="flex flex-col items-center text-gray-500">
                          <Image className="h-8 w-8 mb-2" />
                          <p>Style image not available</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">No style selected</div>
                )}
              </div>
            </Card>
          </div>
        </div>
        
        {/* Thumbnail Details Text Fields */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b">
            <h4 className="font-medium">Thumbnail Text & Details</h4>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="thumbnailDetailsReview" className="text-sm font-medium text-gray-700">
                Thumbnail Details
              </Label>
              <Textarea
                id="thumbnailDetailsReview"
                value={thumbnailDetails}
                onChange={(e) => setThumbnailDetails(e.target.value)}
                rows={3}
                placeholder="No details provided"
                className="resize-none w-full"
              />
              <p className="text-xs text-gray-500">
                Details about the mood, elements and composition of your thumbnail
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailTextReview" className="text-sm font-medium text-gray-700">
                Text Overlay
              </Label>
              <Input
                id="thumbnailTextReview"
                value={thumbnailText}
                onChange={(e) => setThumbnailText(e.target.value)}
                placeholder="No text overlay"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Text that will appear on your thumbnail
              </p>
            </div>
          </div>
        </Card>
        
        {/* Video Information */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b">
            <h4 className="font-medium">Video Information</h4>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Title</span>
              <p className="text-gray-900">{videoTitle || 'Not provided'}</p>
            </div>
            
            {videoDescription && (
              <div>
                <span className="text-sm font-medium text-gray-500">Description/Keywords</span>
                <p className="text-gray-900">{videoDescription}</p>
              </div>
            )}
          </div>
        </Card>
        
        {/* Generation Button */}
        <div className="flex justify-center pt-4">
          <Button 
            size="lg" 
            className="w-full sm:w-auto gap-2"
            onClick={handleGenerateThumbnail}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Generate Thumbnail
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailPreview;
