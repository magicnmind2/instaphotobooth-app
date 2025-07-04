import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PhotoMode, PhotoFilter, ActiveSession, DesignElement } from '../types';
import { GridIcon, PhotoIcon, EditIcon } from './icons';
import { Timer } from './Timer';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText } from 'react-konva';

interface PreviewScreenProps {
  onPhotosTaken: (imageDataUrls: string[]) => void;
  session: ActiveSession;
  onSessionExpired: () => void;
  onEditDesign: () => void;
}

const FILTERS: { name: PhotoFilter; tailwindClass: string; cssFilter: string }[] = [
  { name: PhotoFilter.NORMAL, tailwindClass: '', cssFilter: 'none' },
  { name: PhotoFilter.CLASSIC, tailwindClass: 'grayscale contrast-125', cssFilter: 'grayscale(1) contrast(1.25)' },
  { name: PhotoFilter.VINTAGE, tailwindClass: 'sepia-[.6] contrast-125 brightness-[.9]', cssFilter: 'sepia(0.6) contrast(1.25) brightness(0.9)' },
  { name: PhotoFilter.GOLDEN, tailwindClass: 'sepia-[.25] saturate-150 contrast-105', cssFilter: 'sepia(0.25) saturate(1.5) contrast(1.05)' },
];

const KonvaElement: React.FC<{ element: DesignElement }> = ({ element }) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        if (element.type === 'image') {
            const img = new window.Image();
            img.src = element.src;
            img.onload = () => setImage(img);
            img.crossOrigin = 'Anonymous';
        }
    }, [element]);

    if (element.type === 'text') {
        return <KonvaText {...element} />;
    }

    if (element.type === 'image' && image) {
        return <KonvaImage image={image} {...element} />;
    }

    return null;
};


export const PreviewScreen: React.FC<PreviewScreenProps> = ({ onPhotosTaken, session, onSessionExpired, onEditDesign }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [mode, setMode] = useState<PhotoMode>(PhotoMode.SINGLE);
  const [filter, setFilter] = useState<PhotoFilter>(PhotoFilter.NORMAL);
  const [gridShots, setGridShots] = useState<string[]>([]);
  const [currentPose, setCurrentPose] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);

  const activeFilterClass = FILTERS.find(f => f.name === filter)?.tailwindClass || '';

  const startWebcam = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { aspectRatio: 1, facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setWebcamError("Could not access webcam. Please check permissions.");
    }
  }, []);

  useEffect(() => {
    startWebcam();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return null;

    const size = 1024;
    canvas.width = size;
    canvas.height = size;

    context.filter = FILTERS.find(f => f.name === filter)?.cssFilter || 'none';
    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const videoAspectRatio = videoWidth / videoHeight;
    
    let sx, sy, sWidth, sHeight;
    if (videoAspectRatio > 1) {
        sHeight = videoHeight;
        sWidth = videoHeight;
        sx = (videoWidth - sWidth) / 2;
        sy = 0;
    } else {
        sWidth = videoWidth;
        sHeight = videoWidth;
        sy = (videoHeight - sHeight) / 2;
        sx = 0;
    }

    context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg', 0.9);
  }, [filter]);

  const handleStartCapture = () => {
    if (!isProcessing && !webcamError) {
      setIsProcessing(true);
      setIsReviewing(false);
      if (mode === PhotoMode.GRID) {
          setGridShots([]);
          setCurrentPose(1);
          setCountdown(3);
      } else {
          setCountdown(3);
      }
    }
  };

  useEffect(() => {
    if (!isProcessing || countdown <= 0 || isReviewing) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [isProcessing, countdown, isReviewing]);

  useEffect(() => {
    if (isProcessing && countdown === 0 && !isReviewing) {
      const imageDataUrl = captureFrame();
      if (!imageDataUrl) {
        setWebcamError("Failed to capture photo.");
        setIsProcessing(false);
        return;
      }

      if (mode === PhotoMode.GRID) {
        videoRef.current?.pause();
        setIsReviewing(true);
        setGridShots(prev => [...prev, imageDataUrl]);
      } else {
        onPhotosTaken([imageDataUrl]);
        setIsProcessing(false);
      }
    }
  }, [isProcessing, countdown, isReviewing, mode, captureFrame, onPhotosTaken]);

  useEffect(() => {
    if (!isReviewing) return;

    const timer = setTimeout(() => {
      if (gridShots.length >= 4) {
        onPhotosTaken(gridShots);
        setIsProcessing(false);
        setIsReviewing(false);
      } else {
        videoRef.current?.play();
        setCurrentPose(p => p + 1);
        setCountdown(3);
        setIsReviewing(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isReviewing, gridShots, onPhotosTaken]);

  const renderOverlay = () => {
      if (webcamError) {
        return <div className="bg-red-500/80 p-6 rounded-lg text-xl text-center">{webcamError}</div>
      }
      if (!isProcessing) {
          return (
            <button
              onClick={handleStartCapture}
              className="bg-white/20 backdrop-blur-md font-bold py-6 px-12 rounded-full text-4xl border-2 border-white/50 transition-all duration-300 hover:bg-white/30 hover:scale-105"
            >
              Tap to Start
            </button>
          );
      }
      if (isReviewing && mode === PhotoMode.GRID) {
        return <div className="text-5xl font-bold animate-fade-in">Great!</div>;
      }
      if (countdown > 0) {
          return (
            <div className="text-center">
              {mode === PhotoMode.GRID && <div className="text-5xl font-bold mb-4 animate-fade-in">Pose {currentPose}</div>}
              <div key={countdown} className="font-bold text-9xl animate-pop-in">
                {countdown}
              </div>
            </div>
          );
      }
      if (countdown === 0 && !isReviewing) {
        return (
            <div key="flash" className="font-bold text-9xl animate-ping-once">
              📸
            </div>
          );
      }
      return null;
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black p-4 md:p-8 gap-4">
      <Timer expiresAt={session.expiresAt} onExpire={onSessionExpired} />
       {session.hasDesignStudio && (
          <button onClick={onEditDesign} className="absolute top-4 left-4 flex items-center gap-2 text-white font-bold py-2 px-4 rounded-full bg-black/50 backdrop-blur-sm hover:bg-purple-600/80 transition-colors">
              <EditIcon className="w-5 h-5" />
              <span>Edit Design</span>
          </button>
       )}
      <div className="relative w-full max-w-[80vh] aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gray-800">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover transform scale-x-[-1] ${activeFilterClass} transition-all duration-300`}
        ></video>
        <canvas ref={canvasRef} className="hidden"></canvas>
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center text-white" style={{textShadow: '0 0 20px rgba(0,0,0,0.7)'}}>
          {renderOverlay()}
        </div>
        
        {session.designLayout && (
            <div className="absolute inset-0 pointer-events-none">
                <Stage width={videoRef.current?.clientWidth} height={videoRef.current?.clientHeight}>
                    <Layer>
                        {session.designLayout.elements.map(el => <KonvaElement key={el.id} element={el} />)}
                    </Layer>
                </Stage>
            </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-white w-full max-w-[80vh]">
          <div className="flex-1">
              <label className="block text-center text-gray-400 mb-2 font-bold">Mode</label>
              <div className="grid grid-cols-2 gap-2 bg-gray-800 p-2 rounded-xl">
                  <button onClick={() => setMode(PhotoMode.SINGLE)} className={`flex items-center justify-center gap-2 p-3 rounded-lg font-semibold transition-colors ${mode === PhotoMode.SINGLE ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                      <PhotoIcon className="w-6 h-6"/> {PhotoMode.SINGLE}
                  </button>
                   <button onClick={() => setMode(PhotoMode.GRID)} className={`flex items-center justify-center gap-2 p-3 rounded-lg font-semibold transition-colors ${mode === PhotoMode.GRID ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                      <GridIcon className="w-6 h-6"/> {PhotoMode.GRID}
                  </button>
              </div>
          </div>
           <div className="flex-1">
              <label className="block text-center text-gray-400 mb-2 font-bold">Filter</label>
              <div className="grid grid-cols-4 gap-2 bg-gray-800 p-2 rounded-xl">
                  {FILTERS.map(({ name }) => (
                      <button key={name} onClick={() => setFilter(name)} className={`p-3 rounded-lg font-semibold transition-colors text-sm ${filter === name ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                          {name}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in { animation: pop-in 0.8s ease-out; }
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 1; }
        }
        .animate-ping-once { animation: ping-once 1s ease-in-out forwards; }
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};