
import React from 'react';
import { cn } from '@/lib/utils';
import { useThumbnail } from '@/context/ThumbnailContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface VideoInfoFormProps extends React.HTMLAttributes<HTMLFormElement> {}

const VideoInfoForm: React.FC<VideoInfoFormProps> = ({ 
  className, 
  ...props 
}) => {
  const { 
    videoTitle, 
    setVideoTitle, 
    videoDescription, 
    setVideoDescription,
    thumbnailDetails,
    setThumbnailDetails,
    thumbnailText,
    setThumbnailText
  } = useThumbnail();

  return (
    <form 
      className={cn(
        'w-full space-y-6',
        className
      )}
      {...props}
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base">
          Video Title
        </Label>
        <Input
          id="title"
          placeholder="Enter your video title"
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          className="h-12"
        />
        <p className="text-xs text-gray-500 mt-1">
          This will be the main text displayed on your thumbnail
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnailDetails" className="text-base">
          Thumbnail Details
        </Label>
        <Textarea
          id="thumbnailDetails"
          placeholder="Describe what you want in your thumbnail"
          value={thumbnailDetails}
          onChange={(e) => setThumbnailDetails(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Describe the elements, mood, or composition you want for your thumbnail
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnailText" className="text-base">
          TEXT on thumbnail
        </Label>
        <Input
          id="thumbnailText"
          placeholder="Leave blank if you don't want text on your thumbnail"
          value={thumbnailText}
          onChange={(e) => setThumbnailText(e.target.value)}
          className="h-12"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional text to overlay on your thumbnail
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base">
          Video Description or Keywords
        </Label>
        <Textarea
          id="description"
          placeholder="Enter a brief description or key topics of your video"
          value={videoDescription}
          onChange={(e) => setVideoDescription(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          This helps generate a more accurate thumbnail that matches your content
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h3 className="text-sm font-medium text-blue-800">Tips for effective thumbnails</h3>
        <ul className="mt-2 text-xs text-blue-600 space-y-1 list-disc list-inside">
          <li>Keep titles short and impactful</li>
          <li>Use keywords that will appeal to your audience</li>
          <li>Consider emotional triggers that grab attention</li>
          <li>Think about what would make viewers click</li>
        </ul>
      </div>
    </form>
  );
};

export default VideoInfoForm;
