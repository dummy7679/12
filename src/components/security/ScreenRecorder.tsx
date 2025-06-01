import React, { useEffect, useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Video, AlertCircle } from 'lucide-react';

interface ScreenRecorderProps {
  onViolation: () => void;
}

export function ScreenRecorder({ onViolation }: ScreenRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  
  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({
    screen: true,
    onStop: (blobUrl) => {
      // Handle recording stop - could upload to server or store locally
      console.log('Recording stopped:', blobUrl);
    },
    onError: (error) => {
      console.error('Recording error:', error);
      onViolation();
    }
  });

  useEffect(() => {
    startRecording();
    setIsRecording(true);
    
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, []);

  if (status === 'idle' || status === 'acquiring_media') {
    return (
      <div className="fixed bottom-4 right-4 bg-amber-50 p-4 rounded-lg shadow-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
          <span className="text-amber-700">Initializing security monitoring...</span>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 p-4 rounded-lg shadow-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">Failed to start security monitoring</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-indigo-50 p-4 rounded-lg shadow-lg">
      <div className="flex items-center">
        <Video className="h-5 w-5 text-indigo-600 mr-2" />
        <span className="text-indigo-700">Security monitoring active</span>
      </div>
    </div>
  );
}