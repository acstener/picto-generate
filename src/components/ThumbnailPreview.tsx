
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useThumbnail } from '@/context/ThumbnailContext';
import { Card } from './ui';
import { Button } from '@/components/ui/button';
import { Check, Image, RefreshCcw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

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
  
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [styleImageUrl, setStyleImageUrl] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStyleImage = async () => {
      if (selectedStyle) {
        try {
          const extensions = ['jpg', 'jpeg', 'png', 'webp'];
          
          for (const ext of extensions) {
            const styleFileName = `${selectedStyle}.${ext}`;
            
            const { data: listData } = await supabase.storage
              .from('thumbnail_styles')
              .list();
              
            if (listData) {
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
                  return;
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
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-thumbnail', {
        body: {
          faceImage,
          videoTitle,
          videoDescription,
          thumbnailDetails,
          thumbnailText,
          style: selectedStyle
        }
      });
      
      if (error) throw error;
      
      if (data.thumbnailUrl) {
        setGeneratedThumbnail(data.thumbnailUrl);
        setAiDescription(data.description || '');
        
        if (user) {
          const { error: saveError } = await supabase
            .from('thumbnails')
            .insert({
              user_id: user.id,
              title: videoTitle,
              description: videoDescription || thumbnailDetails,
              thumbnail_url: data.thumbnailUrl,
              style: selectedStyle,
              face_image_url: faceImage // Add the required face_image_url field
            });
            
          if (saveError) {
            console.error('Error saving thumbnail:', saveError);
            toast.warning('Thumbnail generated but not saved to your account');
          }
        }
        
        setStep(5);
        
        toast.success('Thumbnail generated successfully!');
      } else {
        throw new Error('No thumbnail URL returned from the API');
      }
    } catch (error: any) {
      console.error('Error generating thumbnail:', error);
      setError(error.message || 'Failed to generate thumbnail');
      toast.error(`Failed to generate thumbnail: ${error.message}`);
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
            
            <Card className="overflow-hidden">
              <div className="p-4 border-b">
                <h4 className="font-medium">Selected Style</h4>
              </div>
              <div className="p-4">
                {selectedStyle ? (
                  <div className="space-y-4">
                    <div className="font-medium">{selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)}</div>
                    
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
        
        <div className="flex flex-col items-center pt-4 space-y-4">
          {error && (
            <div className="w-full p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 mb-4">
              <p className="font-medium">Error generating thumbnail:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <Button 
            size="lg" 
            className="w-full sm:w-auto gap-2"
            onClick={handleGenerateThumbnail}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate AI Thumbnail
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center max-w-md">
            Click to generate a professional thumbnail using OpenAI technology.
            This might take a few seconds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailPreview;
