import React, { useState, useEffect, useCallback } from 'react';
import { MailIcon, CheckCircleIcon } from './icons';
import { ActiveSession, DesignElement } from '../types';
import { Timer } from './Timer';
import axios from 'axios';
import Konva from 'konva';

interface PhotoScreenProps {
  imageDataUrls: string[];
  onRetake: () => void;
  session: ActiveSession;
  onSessionExpired: () => void;
}

type SendStatus = 'idle' | 'sending' | 'sent' | 'error' | 'limit_reached';

const drawDesignOnCanvas = (ctx: CanvasRenderingContext2D, designLayout: ActiveSession['designLayout']) => {
    if (!designLayout) return;

    ctx.save();
    designLayout.elements.forEach(element => {
        if (element.type === 'text') {
            ctx.save();
            ctx.translate(element.x, element.y);
            ctx.rotate(element.rotation * (Math.PI / 180));
            ctx.scale(element.scaleX, element.scaleY);
            ctx.font = `${element.fontSize}px ${element.fontFamily}`;
            ctx.fillStyle = element.fill;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(element.text, 0, 0);
            ctx.restore();
        } else if (element.type === 'image') {
            const img = new Image();
            img.src = element.src;
            img.crossOrigin = 'Anonymous';
            // This is async, for a perfect render we'd need promises, but for speed we draw sync
            if (img.complete) {
                ctx.save();
                 ctx.translate(element.x, element.y);
                ctx.rotate(element.rotation * (Math.PI / 180));
                ctx.scale(element.scaleX, element.scaleY);
                const w = img.width;
                const h = img.height;
                ctx.drawImage(img, -w/2, -h/2, w, h);
                ctx.restore();
            }
        }
    });
    ctx.restore();
}

const createFinalImage = (baseImage: HTMLImageElement, designLayout: ActiveSession['designLayout']): Promise<string> => {
    return new Promise(async (resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('');

        canvas.width = baseImage.width;
        canvas.height = baseImage.height;
        ctx.drawImage(baseImage, 0, 0);
        
        // This is tricky because images in design need to load first.
        const imagePromises = designLayout?.elements
            .filter(el => el.type === 'image')
            .map(el => new Promise<void>(res => {
                const img = new Image();
                // @ts-ignore
                img.src = el.src;
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    // @ts-ignore
                    el.imageObject = img;
                    res();
                };
                img.onerror = () => res(); // continue even if an image fails
            })) || [];
        
        await Promise.all(imagePromises);

        if (designLayout) {
             designLayout.elements.forEach(element => {
                if (element.type === 'text') {
                    ctx.save();
                    ctx.font = `${element.fontSize}px ${element.fontFamily}`;
                    ctx.fillStyle = element.fill;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.translate(element.x, element.y);
                    ctx.rotate(element.rotation * (Math.PI / 180));
                    ctx.scale(element.scaleX, element.scaleY);
                    ctx.fillText(element.text, 0, 0);
                    ctx.restore();
                } else if (element.type === 'image') {
                    // @ts-ignore
                    const img = element.imageObject as HTMLImageElement;
                    if (img) {
                        ctx.save();
                        ctx.translate(element.x, element.y);
                        ctx.rotate(element.rotation * (Math.PI / 180));
                        ctx.scale(element.scaleX, element.scaleY);
                        const w = img.width;
                        const h = img.height;
                        ctx.drawImage(img, -w/2, -h/2, w, h);
                        ctx.restore();
                    }
                }
            });
        }
        resolve(canvas.toDataURL('image/jpeg', 0.9));
    });
};

export const PhotoScreen: React.FC<PhotoScreenProps> = ({ imageDataUrls, onRetake, session, onSessionExpired }) => {
  const [compositeImage, setCompositeImage] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(true);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');
  const [emailsRemaining, setEmailsRemaining] = useState(session.emailLimit - session.emailsSent);

  const createCompositeImage = useCallback(async (urls: string[], designLayout: ActiveSession['designLayout']): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');

      const imageSize = 1024;
      const gap = 20;
      const isGrid = urls.length > 1;

      canvas.width = isGrid ? imageSize * 2 + gap * 3 : imageSize;
      canvas.height = isGrid ? imageSize * 2 + gap * 3 : imageSize;
      ctx.fillStyle = '#111827'; // bg-gray-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const imagePromises = urls.map(url => {
        return new Promise<HTMLImageElement>(imgResolve => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = url;
          img.onload = () => imgResolve(img);
        });
      });

      Promise.all(imagePromises).then(async (images) => {
        if (isGrid) {
            const positions = [
              { x: gap, y: gap },
              { x: imageSize + gap * 2, y: gap },
              { x: gap, y: imageSize + gap * 2 },
              { x: imageSize + gap * 2, y: imageSize + gap * 2 },
            ];
            images.forEach((img, index) => {
              const { x, y } = positions[index];
              ctx.drawImage(img, x, y, imageSize, imageSize);
            });
        } else {
             ctx.drawImage(images[0], 0, 0, imageSize, imageSize);
        }
        
        const baseImage = new Image();
        baseImage.src = canvas.toDataURL();
        baseImage.onload = async () => {
            const finalImageSrc = await createFinalImage(baseImage, designLayout);
            resolve(finalImageSrc);
        }
      });
    });
  }, []);

  useEffect(() => {
    const processImage = async () => {
        setIsPreparing(true);
        const composite = await createCompositeImage(imageDataUrls, session.designLayout);
        setCompositeImage(composite);
        setIsPreparing(false);
    }
    processImage();
  }, [imageDataUrls, createCompositeImage, session.designLayout]);
  
  useEffect(() => {
    if (emailsRemaining <= 0) {
      setSendStatus('limit_reached');
    }
  }, [emailsRemaining]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendStatus !== 'idle' || isPreparing || !compositeImage) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email.');
      return;
    }
    
    setEmailError('');
    setSendStatus('sending');

    try {
        await axios.post('/api/send-photo', {
            email: email,
            imageDataUrl: compositeImage,
            code: session.code,
        });
        setSendStatus('sent');
        setEmailsRemaining(prev => prev - 1);
        setTimeout(() => {
            setSendStatus('idle');
            setEmail('');
        }, 3000);
    } catch (error: any) {
        if (error.response?.status === 429) {
          setSendStatus('limit_reached');
          setEmailError('Email limit for this pass has been reached.');
        } else {
          console.error("Failed to send email:", error);
          setEmailError('Could not send photo. Please try again.');
          setSendStatus('error');
          setTimeout(() => setSendStatus('idle'), 3000);
        }
    }
  };
  
  const renderPhotos = () => {
    if (compositeImage) {
        return <img src={compositeImage} alt="Captured photo" className="rounded-2xl shadow-2xl max-h-full max-w-full object-contain" />;
    }
    return null;
  }
  
  const isButtonDisabled = isPreparing || sendStatus === 'sending' || sendStatus === 'sent' || sendStatus === 'limit_reached' || !compositeImage || !email;

  const getButtonContent = () => {
    if (isPreparing) return 'Preparing...';
    switch (sendStatus) {
      case 'sending': return 'Sending...';
      case 'sent': return 'Sent!';
      case 'limit_reached': return 'Limit Reached';
      default: return 'Send Photo';
    }
  };
  
  const getButtonIcon = () => {
    if (isPreparing || sendStatus === 'sending') return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>;
    if (sendStatus === 'sent') return <CheckCircleIcon className="h-8 w-8"/>;
    return <MailIcon className="h-8 w-8"/>;
  }

  return (
    <div className="relative h-screen w-screen flex flex-col lg:flex-row items-stretch justify-center bg-gray-900 text-white p-4 md:p-8 gap-8">
      <Timer expiresAt={session.expiresAt} onExpire={onSessionExpired} />
      <div className="w-full lg:w-2/3 flex-shrink-0 flex items-center justify-center">
        <div className="w-full max-w-[90vh] aspect-square flex items-center justify-center">
           {isPreparing ? <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div> : renderPhotos()}
        </div>
      </div>

      <div className="w-full lg:w-1/3 flex-shrink flex flex-col justify-center items-center gap-6 p-4">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-4xl font-bold mb-2">Great Shot!</h2>
          <p className="text-gray-400 mb-8">Enter an email to send the photo. {emailsRemaining > 0 && `(${emailsRemaining} sends left)`}</p>
          
          <form onSubmit={handleSendEmail} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                }}
                disabled={isPreparing || sendStatus !== 'idle'}
                className={`w-full bg-gray-800 border-2 ${emailError ? 'border-red-500' : 'border-gray-700'} focus:border-purple-500 focus:ring-purple-500 rounded-xl text-xl py-5 px-6 transition-colors disabled:opacity-50`}
              />
            </div>
            {emailError && <p className="text-red-500 text-left text-sm -mt-2 ml-2">{emailError}</p>}
            
            <button
                type="submit"
                disabled={isButtonDisabled}
                className={`w-full text-white font-bold py-5 px-4 rounded-xl text-2xl transition-all duration-300 flex items-center justify-center gap-4 ${sendStatus === 'sent' ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'} disabled:bg-gray-600 disabled:cursor-not-allowed`}
            >
                {getButtonIcon()}
                {getButtonContent()}
            </button>
          </form>

          <div className="my-4 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-700"></div>
            <div className="px-2 text-gray-500">or</div>
            <div className="w-full border-t border-gray-700"></div>
          </div>

          <button
              onClick={onRetake}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-5 px-4 rounded-xl text-2xl transition-transform transform hover:scale-105"
          >
              Take Another
          </button>
        </div>
      </div>
    </div>
  );
};