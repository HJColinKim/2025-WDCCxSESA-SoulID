import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// An array of names to be chosen from randomly
const nigerianNames = [
  "Adekunle", 
  "Amadi", 
  "Uzoma", 
  "Babatunde", 
  "Chidi", 
  "Emeka", 
  "Oluwaseun"
];

// Define the props for the component, including the onClose function
type NigerianPrincePopup = {
  onClose: () => void;
  onReply: (princeName: string) => void;
};

const NigerianPrincePopup: React.FC<NigerianPrincePopup> = ({ onClose, onReply }) => {
  // State to hold the random position
  const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
  
  // 1. Add state to hold the randomly selected name for this popup instance
  const [princeName, setPrinceName] = useState(nigerianNames[0]);

  const handleReplyClick = () => {
  // Call the onReply function passed from the parent (AdManager)
  // and send the current prince's name back up.
  console.log()
  onReply(princeName);
};

  // Calculate a random position and name when the component first loads
  useEffect(() => {
    // Get a random position
    const randomTop = Math.floor(Math.random() * 60);
    const randomLeft = Math.floor(Math.random() * 60);

    setPosition({ 
      top: `${randomTop}vh`, 
      left: `${randomLeft}vw`,
      transform: 'none'
    });

    // 2. Select a random name from the array and set it in the state
    const randomName = nigerianNames[Math.floor(Math.random() * nigerianNames.length)];
    setPrinceName(randomName);

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
            <img src="https://placehold.co/16x16/FFFFFF/000000?text=!" alt="Urgent Icon" className="w-4 h-4" />
            <span className="text-sm font-bold">URGENT & CONFIDENTIAL</span>
          </div>
          <button
            onClick={handleReplyClick}
            className="w-4 h-4 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="p-2 flex gap-3">
          {/* Image Area */}
          <div>
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
                {/* 3. Use the random name from the state in the text */}
                I am Prince {princeName} of Nigeria. I have an urgent and confidential business proposition to transfer the sum of $47,500,000 USD. For your help, you will receive 20% of the sum. Please reply with your bank details to proceed.
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-2 mt-2 justify-end">
               <button 
               onClick={handleReplyClick}
               className="bg-green-600 text-white border-2 border-t-white border-l-white border-r-black border-b-black px-4 py-1 text-sm hover:bg-green-700">
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
