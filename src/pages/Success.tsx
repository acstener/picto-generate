
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Section, Card } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Check, Download, Home, RefreshCcw } from 'lucide-react';
import Header from '@/components/Header';
import { useThumbnail } from '@/context/ThumbnailContext';
import { toast } from 'sonner';

const Success = () => {
  const navigate = useNavigate();
  const { generatedThumbnail, resetState } = useThumbnail();

  useEffect(() => {
    if (!generatedThumbnail) {
      navigate('/create');
    }
  }, [generatedThumbnail, navigate]);

  const handleDownload = () => {
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

  const handleCreateNew = () => {
    resetState();
    navigate('/create');
  };

  const handleReturnHome = () => {
    resetState();
    navigate('/');
  };

  if (!generatedThumbnail) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      
      <Container>
        <Section delay={0}>
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Thumbnail Created!</h1>
              <p className="text-gray-500 mt-2">
                Your YouTube thumbnail has been successfully generated
              </p>
            </div>
            
            <Card className="overflow-hidden">
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-gray-900">Your Thumbnail</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Here's your generated thumbnail ready to be downloaded
                </p>
              </div>
              
              <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                <div className="rounded-lg overflow-hidden thumbnail-aspect-ratio w-full">
                  <img 
                    src={generatedThumbnail} 
                    alt="Generated thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  className="gap-2"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  Download Thumbnail
                </Button>
                
                <Button 
                  variant="outline"
                  className="gap-2"
                  onClick={handleCreateNew}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Create Another
                </Button>
                
                <Button 
                  variant="secondary"
                  className="gap-2"
                  onClick={handleReturnHome}
                >
                  <Home className="h-4 w-4" />
                  Return to Dashboard
                </Button>
              </div>
            </Card>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Thank you for using ThumbnailAI. We hope you love your new thumbnail!
              </p>
            </div>
          </div>
        </Section>
      </Container>
    </div>
  );
};

export default Success;
