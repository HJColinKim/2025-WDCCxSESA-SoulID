import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// Define the props for the component, including the onClose function
type NigerianPrincePopupProps = {
  onClose: () => void;
};

const NigerianPrincePopup: React.FC<NigerianPrincePopupProps> = ({ onClose }) => {
  // State to hold the random position, same as your template
  const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  // Calculate a random position on the screen when the component first loads
  useEffect(() => {
    // Get a random position, ensuring the popup stays mostly on screen
    const randomTop = Math.floor(Math.random() * 60); // 0% to 60% from the top
    const randomLeft = Math.floor(Math.random() * 60); // 0% to 60% from the left

    setPosition({ 
      top: `${randomTop}vh`, 
      left: `${randomLeft}vw`,
      transform: 'none' // No longer need to center it
    });
  }, []); // Empty array ensures this runs only once on mount

  return (
    // The main container uses the random position from the state
    <div 
      className="fixed z-50 font-mono"
      style={{ top: position.top, left: position.left, transform: position.transform }}
    >
      {/* Main window styling */}
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-96 shadow-lg">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Generic email icon */}
            <img src="https://placehold.co/16x16/FFFFFF/000000?text=!" alt="Urgent Icon" className="w-4 h-4" />
            <span className="text-sm font-bold">URGENT & CONFIDENTIAL</span>
          </div>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="p-2 flex gap-3">
          {/* Image Area */}
          <div>
            {/* A generic warning/money icon */}
            <img 
              src="https://placehold.co/128x128/FFFF00/000000?text=%24" 
              alt="A money symbol"
              className="w-32 h-32 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/128x128/FFFF00/000000?text=%24'; }}
            />
          </div>

          {/* Text and Buttons */}
          <div className="flex-1 flex flex-col">
            {/* Main text area */}
            <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 flex-grow text-black text-sm">
              <p className="font-bold">Greetings Friend,</p>
              <p className="mt-2">
                I am Prince Adekunle of Nigeria. I have an urgent and confidential business proposition to transfer the sum of $47,500,000 USD. For your help, you will receive 20% of the sum. Please reply with your bank details to proceed.
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-2 mt-2 justify-end">
               <button className="bg-green-600 text-white border-2 border-t-white border-l-white border-r-black border-b-black px-4 py-1 text-sm hover:bg-green-700">
                Reply Now!
              </button>
              <button onClick={onClose} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-1 text-sm hover:bg-[#d0d0d0]">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NigerianPrincePopup;
