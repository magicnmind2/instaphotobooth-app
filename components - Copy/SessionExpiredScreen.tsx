import React from 'react';
import { ClockIcon } from './icons';

interface SessionExpiredScreenProps {
  onPurchaseMore: () => void;
  onExit: () => void;
}

export const SessionExpiredScreen: React.FC<SessionExpiredScreenProps> = ({ onPurchaseMore, onExit }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white p-4">
      <div className="text-center bg-gray-800 p-10 md:p-16 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-700">
        <ClockIcon className="w-24 h-24 text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Time's Up!</h1>
        <p className="text-lg text-gray-400 mb-8">
          Your photo booth session has ended. We hope you had a great time!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
                onClick={onPurchaseMore}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-transform transform hover:scale-105"
            >
                Purchase More Time
            </button>
            <button
                onClick={onExit}
                className="w-full sm:w-auto bg-gray-600 hover:bg-gray-500 text-white font-bold py-4 px-8 rounded-xl text-xl transition-transform transform hover:scale-105"
            >
                Exit
            </button>
        </div>
      </div>
    </div>
  );
};
