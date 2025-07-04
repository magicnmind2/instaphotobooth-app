import React from 'react';
import { CheckCircleIcon } from './icons';

interface PurchaseSuccessScreenProps {
  error?: string | null;
  onActivate: () => void;
}

export const PurchaseSuccessScreen: React.FC<PurchaseSuccessScreenProps> = ({ error, onActivate }) => {
    
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white p-4">
      <div className="text-center bg-gray-800 p-10 md:p-16 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700">
        
        {error ? (
          <>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-red-400">Verification Failed</h1>
            <p className="text-lg text-gray-400 mb-8">{error}</p>
            <button
                onClick={onActivate}
                className="w-full max-w-xs mx-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-4 rounded-xl text-2xl transition-transform transform hover:scale-105"
            >
                Enter Code Manually
            </button>
          </>
        ) : (
          <>
            <div className="relative w-24 h-24 mx-auto mb-6">
                <CheckCircleIcon className="w-24 h-24 text-green-500" />
                <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-spin-slow border-t-transparent"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Purchase Complete!</h1>
            <p className="text-lg text-gray-400 mb-8">
                Verifying purchase and starting your session...
            </p>
            <p className="text-gray-500">You'll also receive an email with a backup access code.</p>
          </>
        )}
      </div>
       <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  );
};