
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ThumbnailStyle = 'modern' | 'minimal' | 'bold' | 'vibrant' | 'tech';

interface ThumbnailContextType {
  step: number;
  setStep: (step: number) => void;
  faceImage: string | null;
  setFaceImage: (url: string | null) => void;
  videoTitle: string;
  setVideoTitle: (title: string) => void;
  videoDescription: string;
  setVideoDescription: (description: string) => void;
  selectedStyle: ThumbnailStyle | null;
  setSelectedStyle: (style: ThumbnailStyle | null) => void;
  generatedThumbnail: string | null;
  setGeneratedThumbnail: (url: string | null) => void;
  resetState: () => void;
}

const ThumbnailContext = createContext<ThumbnailContextType | undefined>(undefined);

export const ThumbnailProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [step, setStep] = useState(1);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ThumbnailStyle | null>(null);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);

  const resetState = () => {
    setStep(1);
    setFaceImage(null);
    setVideoTitle('');
    setVideoDescription('');
    setSelectedStyle(null);
    setGeneratedThumbnail(null);
  };

  return (
    <ThumbnailContext.Provider
      value={{
        step,
        setStep,
        faceImage,
        setFaceImage,
        videoTitle,
        setVideoTitle,
        videoDescription,
        setVideoDescription,
        selectedStyle,
        setSelectedStyle,
        generatedThumbnail,
        setGeneratedThumbnail,
        resetState,
      }}
    >
      {children}
    </ThumbnailContext.Provider>
  );
};

export const useThumbnail = (): ThumbnailContextType => {
  const context = useContext(ThumbnailContext);
  if (context === undefined) {
    throw new Error('useThumbnail must be used within a ThumbnailProvider');
  }
  return context;
};
