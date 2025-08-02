import { X, ShieldAlert } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// Define the props for the component, including the onClose function
type ApproachingThreatPopupProps = {
  onClose: () => void;
};

const ApproachingThreatPopup: React.FC<ApproachingThreatPopupProps> = ({ onClose }) => {
  // State to hold the random position
  const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
  // State for the countdown timer, starting at 3 minutes (180 seconds)
  const [countdown, setCountdown] = useState(180);

  // This effect runs once to set the popup's position and start the timer
  useEffect(() => {
    // Get a random position on the screen
    const randomTop = Math.floor(Math.random() * 50);
    const randomLeft = Math.floor(Math.random() * 50);

    setPosition({ 
      top: `${randomTop}vh`, 
      left: `${randomLeft}vw`,
      transform: 'none'
    });

    // Start the countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Clean up the interval when the component is unmounted
    return () => clearInterval(timer);

  }, []);

  // Helper function to format the remaining seconds into MM:SS format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="fixed z-50 font-mono"
      style={{ top: position.top, left: position.left, transform: position.transform }}
    >
      {/* Main window styling for a threatening alert */}
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-[450px] shadow-2xl">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#8B0000] to-[#FF0000] text-white px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-sm font-bold">EXTERNAL THREAT DETECTED</span>
          </div>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="p-4 flex flex-col items-center text-center gap-3">
          {/* Image Area */}
          <div>
            {/* IMPORTANT: Replace this with a creepy, low-res image of a person */}
            <img 
              src="/images/gerald.jpg" 
              className="border-2 border-black"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/250x200/000000/FFFFFF?text=SUBJECT+7'; }}
            />
          </div>

          {/* Text Area */}
          <div className="text-black">
            <h2 className="text-2xl font-bold text-red-700">WARNING!</h2>
            <p className="mt-1 text-lg">This individual is rapidly approaching your location.</p>
            {/* The live countdown timer */}
            <p className="text-3xl font-bold text-red-700 animate-pulse mt-2">{formatTime(countdown)}</p>
          </div>
          
          {/* Button Area */}
          <button 
            onClick={onClose} 
            className="bg-yellow-400 text-black border-2 border-t-yellow-200 border-l-yellow-200 border-r-yellow-600 border-b-yellow-600 px-8 py-3 text-xl font-bold hover:bg-yellow-500"
          >
            INITIATE LOCKDOWN
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproachingThreatPopup;
