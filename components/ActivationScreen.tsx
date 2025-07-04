import React, { useState, useEffect } from 'react';
import { BackspaceIcon } from './icons';

interface ActivationScreenProps {
  onActivate: (code: string) => Promise<boolean>;
  onBack: () => void;
  error: string;
}

export const ActivationScreen: React.FC<ActivationScreenProps> = ({ onActivate, onBack, error: apiError }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (apiError) {
      setShake(true);
      setIsLoading(false);
      setTimeout(() => {
        setCode('');
        setShake(false);
      }, 800);
    }
  }, [apiError]);

  useEffect(() => {
    const attemptActivation = async () => {
      if (code.length === 4) {
        setIsLoading(true);
        await onActivate(code);
        // isLoading will be set to false in the apiError effect if it fails
      }
    };
    attemptActivation();
  }, [code, onActivate]);

  const handlePinClick = (digit: string) => {
    if (code.length < 4 && !isLoading) {
      setCode(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    if (!isLoading) {
      setCode(prev => prev.slice(0, -1));
    }
  };
  
  const pinDots = Array(4).fill(0).map((_, i) => (
    <div key={i} className={`w-6 h-6 rounded-full border-2 border-gray-500 transition-colors ${code.length > i ? 'bg-purple-500 border-purple-500' : ''}`}></div>
  ));

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white p-4">
      <div className="relative text-center bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-700">
        <button onClick={onBack} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors">&larr; Back to Home</button>
        <h1 className="text-4xl font-bold mb-2">Photo Booth</h1>
        <p className="text-gray-400 mb-2">Enter your 4-digit access code.</p>
        <div className="h-6 mb-6 text-red-400 font-semibold">
          {apiError && <p>{apiError}</p>}
        </div>
        
        <div className={`flex justify-center gap-4 mb-8 ${shake ? 'animate-shake' : ''}`}>
            {pinDots}
        </div>

        {isLoading ? (
          <div className="h-[304px] flex items-center justify-center">
             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 h-[304px]">
            {[ '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
              <button
                key={digit}
                onClick={() => handlePinClick(digit)}
                className="h-20 bg-gray-700 rounded-full text-4xl font-light active:bg-purple-600 transition-colors duration-200"
              >
                {digit}
              </button>
            ))}
            <button
                onClick={handleDelete}
                className="h-20 flex items-center justify-center bg-gray-700 rounded-full text-4xl font-light active:bg-gray-600 transition-colors duration-200"
              >
                <BackspaceIcon className="w-10 h-10"/>
              </button>
              <button
                onClick={() => handlePinClick('0')}
                className="h-20 bg-gray-700 rounded-full text-4xl font-light active:bg-purple-600 transition-colors duration-200"
              >
                0
              </button>
              <div className="h-20"></div>
          </div>
        )}
      </div>
       <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake {
          animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};
