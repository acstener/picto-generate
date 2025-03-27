
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Section, Card } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Header from '@/components/Header';
import StepIndicator from '@/components/StepIndicator';
import ImageUploader from '@/components/ImageUploader';
import VideoInfoForm from '@/components/VideoInfoForm';
import StyleSelector from '@/components/StyleSelector';
import ThumbnailPreview from '@/components/ThumbnailPreview';
import { useThumbnail } from '@/context/ThumbnailContext';

const steps = [
  'Upload Face',
  'Video Info',
  'Select Style',
  'Review',
  'Complete'
];

const CreateThumbnail = () => {
  const navigate = useNavigate();
  const {
    step,
    setStep,
    faceImage,
    videoTitle,
    videoDescription,
    selectedStyle,
    generatedThumbnail
  } = useThumbnail();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleNext = () => {
    if (step === 1 && !faceImage) {
      toast.error('Please upload a face image before proceeding');
      return;
    }

    if (step === 2 && !videoTitle) {
      toast.error('Please enter a video title before proceeding');
      return;
    }

    if (step === 3) {
      // Only check for style selection if we're on the style selection step
      // Allow to proceed even if no style is selected, this will be handled in the preview
      if (!selectedStyle) {
        toast.warning('No style selected. Your thumbnail will use default styling.');
      }
    }

    if (step < steps.length) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    toast.success('Thumbnail created successfully!');
    navigate('/success');
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <ImageUploader />;
      case 2:
        return <VideoInfoForm />;
      case 3:
        return <StyleSelector />;
      case 4:
        return <ThumbnailPreview />;
      case 5:
        if (generatedThumbnail) {
          navigate('/success');
          return null;
        }
        return <ThumbnailPreview />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      
      <Container>
        <Section delay={0}>
          <div className="flex items-center mb-8">
            <button 
              onClick={() => navigate('/')}
              className="mr-4 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Create New Thumbnail</h1>
          </div>
          
          <StepIndicator steps={steps} className="mb-10" />
          
          <Card className="p-6 sm:p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900">
                {step === 1 && 'Upload Your Face'}
                {step === 2 && 'Enter Video Information'}
                {step === 3 && 'Select Thumbnail Style'}
                {step === 4 && 'Review and Confirm'}
                {step === 5 && 'Generating Thumbnail'}
              </h2>
              <p className="text-gray-500 mt-1">
                {step === 1 && 'Upload a photo of your face or select one of our example images'}
                {step === 2 && 'Provide details about your video to create a relevant thumbnail'}
                {step === 3 && 'Choose a style that matches your content and brand'}
                {step === 4 && 'Review your selections and generate your thumbnail'}
                {step === 5 && 'Your thumbnail is being generated'}
              </p>
            </div>
            
            <div className="min-h-[300px]">
              {renderStepContent()}
            </div>
            
            {step !== 5 && step < 5 && (
              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                >
                  Back
                </Button>
                
                {step < 4 ? (
                  <Button onClick={handleNext}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : step === 4 ? (
                  null // ThumbnailPreview now has its own Generate button
                ) : (
                  <Button onClick={handleFinish} className="gap-2">
                    <Check className="h-4 w-4" />
                    Finish
                  </Button>
                )}
              </div>
            )}
          </Card>
        </Section>
      </Container>
    </div>
  );
};

export default CreateThumbnail;
