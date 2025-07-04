import React from 'react';
import { PURCHASE_OPTIONS } from '../constants';
import { PurchaseOption } from '../types';
import { CheckCircleIcon } from './icons';

interface LandingScreenProps {
  onPurchaseSelect: (option: PurchaseOption) => void;
  onActivate: () => void;
  onBack: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onPurchaseSelect, onActivate, onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="relative text-center w-full max-w-7xl py-12">
        <button onClick={onBack} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors">&larr; Back to Home</button>
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Choose Your Package</h1>
        <p className="text-lg md:text-xl text-gray-400 mb-12">Select a package to start your photo booth experience.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PURCHASE_OPTIONS.map(option => (
            <div
              key={option.id}
              className={`bg-gray-800 border rounded-xl p-8 text-left flex flex-col group transition-all duration-300 ${option.isMostPopular ? 'border-purple-500 scale-105' : 'border-gray-700'}`}
            >
              {option.isMostPopular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-600 text-white text-sm font-bold px-4 py-1 rounded-full">MOST POPULAR</span>
                </div>
              )}
              <h2 className="text-3xl font-bold mb-2">{option.name}</h2>
              <p className="text-gray-400 mb-6">Perfect for {option.name === 'Starter' ? 'quick fun' : option.name === 'Pro' ? 'parties & events' : 'all-day celebrations'}.</p>
              
              <div className="mb-8">
                  <span className="text-5xl font-extrabold">${option.price}</span>
                  <span className="text-gray-400">/ pass</span>
              </div>
              
              <ul className="space-y-4 mb-10 flex-grow">
                {option.features.map(feature => (
                    <li key={feature} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                        <span>{feature}</span>
                    </li>
                ))}
              </ul>
              
              <button
                onClick={() => onPurchaseSelect(option)}
                className={`w-full font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 ${option.isMostPopular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Choose {option.name}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-16 mb-10">
           <button
            onClick={onActivate}
            className="text-gray-300 hover:text-white hover:underline"
          >
            Already have a code? Enter it here.
          </button>
        </div>
      </div>
    </div>
  );
};