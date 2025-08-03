import { X, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// Define the props for the component, including the onClose function
type SoulIdPopup = {
  onClose: () => void;
};

const SoulIdPopup: React.FC<SoulIdPopup> = ({ onClose }) => {
  // State to hold the random position
  const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  // Calculate a random position on the screen when the component first loads
  useEffect(() => {
    const randomTop = Math.floor(Math.random() * 60);
    const randomLeft = Math.floor(Math.random() * 60);

    setPosition({ 
      top: `${randomTop}vh`, 
      left: `${randomLeft}vw`,
      transform: 'none'
    });
  }, []);

  return (
    <div 
      className="fixed z-50 font-mono"
      style={{ top: position.top, left: position.left, transform: position.transform }}
    >
      {/* Main window styling for a standard system prompt */}
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-[400px] shadow-2xl">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-bold">Identity Verification</span>
          </div>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="p-4 flex flex-col items-center text-center gap-4 bg-[#c0c0c0] text-black">
          {/* Image Area */}
          <div>
            {}
            <img 
              src="/images/SoulID.png" 
              alt="An ID verification icon"
              className="border-2 border-black w-24 h-24"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/96x96/0000FF/FFFFFF?text=ID'; }}
            />
          </div>

          {/* Text Area */}
          <div>
            <h2 className="text-2xl font-bold">Your Soul ID requires verification.</h2>
            <p className="mt-2 text-lg">For your security, please confirm your identity to continue.</p>
          </div>
          
          {/* Button Area */}
          <button 
            onClick={() => window.open('https://github.com/se-camus/2025-web3-hackathon', '_blank')}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-8 py-2 text-xl font-bold hover:bg-[#d0d0d0]"
          >
            Verify Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoulIdPopup;
