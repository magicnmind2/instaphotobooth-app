import React from 'react';
import { DevicePhoneMobileIcon, RocketIcon, ShieldCheckIcon, WandSparklesIcon } from './icons';

interface SalesPageProps {
  onGetStarted: () => void;
  onActivate: () => void;
}

const features = [
    {
        name: 'Launch in Seconds',
        description: 'Just open a link on any device to start the party. No app installs, no extra hardware, no fuss.',
        icon: RocketIcon,
    },
    {
        name: 'Fun Filters & Modes',
        description: 'Choose from artistic filters and switch between single shots or fun 4-photo grids for creative snaps.',
        icon: WandSparklesIcon,
    },
     {
        name: 'Any Device, Any Camera',
        description: 'Use any laptop, tablet, or smartphone with a web browser. If it has a camera, it can be a photo booth.',
        icon: DevicePhoneMobileIcon,
    },
    {
        name: 'Custom Event Branding',
        description: 'Planning a party or wedding? Add your own logo to every photo for a personalized, professional touch.',
        icon: ShieldCheckIcon,
    },
]

export const SalesPage: React.FC<SalesPageProps> = ({ onGetStarted, onActivate }) => {
  return (
    <div className="bg-gray-900 text-white w-full">
        <div className="container mx-auto px-6 py-12">
            {/* Header */}
            <header className="flex justify-between items-center mb-16">
                <h1 className="text-2xl font-bold">InstaPhotoBooth</h1>
                <button onClick={onActivate} className="text-gray-300 hover:text-white font-semibold transition-colors">
                    Have a code?
                </button>
            </header>

            {/* Hero Section */}
            <section className="text-center py-16">
                <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                    The Ultimate DIY Photo Booth.
                    <span className="block text-purple-400">Right in Your Browser.</span>
                </h2>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-400">
                    Turn any tablet, laptop, or phone into a high-quality, interactive photo booth. Perfect for weddings, parties, and events of any size.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <button onClick={onGetStarted} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-transform transform hover:scale-105">
                        Get Started Now
                    </button>
                </div>
            </section>

            {/* Mockup/Visual Section */}
            <section className="relative my-20">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>
                <div className="relative aspect-video w-full max-w-5xl mx-auto bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-2 sm:p-4">
                     <img src="https://storage.googleapis.com/maker-studio-project-media-prod/1f9b3b55-25ba-4ac7-959c-35071a938883/images/b9d4e51a-4f48-4091-886f-23f21132f831.png" alt="AI generated image of a group of friends using a tablet as a DIY photo booth at a party." className="w-full h-full object-cover rounded-lg" />
                </div>
            </section>
            
            {/* Features Section */}
            <section className="py-20">
                <div className="text-center mb-12">
                     <h3 className="text-4xl font-bold">Everything you need for fun photos.</h3>
                     <p className="mt-4 text-lg text-gray-400">Packed with features to make your moments memorable.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature) => (
                        <div key={feature.name} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                            <feature.icon className="h-10 w-10 text-purple-400 mb-4" />
                            <h4 className="text-xl font-bold">{feature.name}</h4>
                            <p className="mt-2 text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

             {/* How It Works Section */}
            <section className="py-20 bg-gray-800/30 rounded-2xl">
                 <div className="text-center mb-12">
                     <h3 className="text-4xl font-bold">Your 3-Step DIY Photo Booth Setup</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-gray-800 border-2 border-purple-500 rounded-full text-2xl font-bold mb-4">1</div>
                        <h4 className="text-xl font-bold">Get Your Link</h4>
                        <p className="text-gray-400 mt-2 px-2">Choose a pass and get your unique photo booth link instantly after a secure checkout.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-gray-800 border-2 border-purple-500 rounded-full text-2xl font-bold mb-4">2</div>
                        <h4 className="text-xl font-bold">Open Anywhere</h4>
                        <p className="text-gray-400 mt-2 px-2">At your event, just open the link on a tablet, laptop, or phone. Prop it up and you're ready!</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-gray-800 border-2 border-purple-500 rounded-full text-2xl font-bold mb-4">3</div>
                        <h4 className="text-xl font-bold">Start the Fun!</h4>
                        <p className="text-gray-400 mt-2 px-2">Guests tap to start, pose for photos, and get their pictures sent right to their email.</p>
                    </div>
                </div>
            </section>

             {/* Event Branding Section */}
            <section className="py-20 grid md:grid-cols-2 gap-12 items-center">
                <div className="pr-8">
                    <h3 className="text-4xl font-bold">Perfect for Weddings & Corporate Events</h3>
                    <p className="mt-4 text-lg text-gray-400">Elevate your event with custom branding. Add your wedding monogram or company logo directly onto every photo strip. Our self-serve branding upload makes it simple to create a unique and professional experience for your guests.</p>
                     <button onClick={onGetStarted} className="mt-6 bg-purple-600/20 text-purple-300 border border-purple-500/50 hover:bg-purple-600/40 font-bold py-3 px-6 rounded-xl text-lg transition-colors">
                        Explore Event Options
                    </button>
                </div>
                <div className="relative aspect-square w-full h-full">
                     <img src="https://storage.googleapis.com/maker-studio-project-media-prod/1f9b3b55-25ba-4ac7-959c-35071a938883/images/b29d4791-5f05-4c6e-880c-7b64b182064c.png" alt="AI generated image of a tablet on a stand at a wedding, displaying a photo booth with custom wedding branding." className="w-full h-full object-cover rounded-2xl shadow-xl" />
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16 text-center">
                <h3 className="text-4xl font-bold">Ready to Start the Fun?</h3>
                <div className="mt-8">
                     <button onClick={onGetStarted} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-transform transform hover:scale-105">
                        View Passes
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center border-t border-gray-800 pt-8 mt-12">
                <p className="text-gray-500">&copy; {new Date().getFullYear()} InstaPhotoBooth. All rights reserved.</p>
            </footer>
        </div>
    </div>
  );
};