    import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// Define the props for the component, including the onClose function
type SocialCreditsPopupProps = {
  onClose: () => void;
};

const SocialCreditsPopup: React.FC<SocialCreditsPopupProps> = ({ onClose }) => {
  // State to hold the random position
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
      {/* Main window styling for a classic warning popup */}
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-96 shadow-lg">
        {/* Title Bar with new red and yellow gradient */}
        <div className="bg-gradient-to-r from-[#de2910] to-[#ffc72c] text-white px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Chinese flag placeholder icon */}
            <img 
              src="https://placehold.co/16x16/de2910/ffc72c?text=★" 
              alt="Flag icon" 
              className="w-4 h-4 border border-yellow-300"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/16x16/de2910/ffc72c?text=★'; }}
            />
            <span className="text-sm font-bold text-black">系统警告</span>
          </div>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="p-4 flex gap-4 items-center">
          {/* Image Area with an Exclamation Mark */}
          <div>
            <img 
              src="https://placehold.co/64x64/FFFF00/000000?text=!" 
              alt="Exclamation mark icon"
              className="w-16 h-16"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/64x64/FFFF00/000000?text=!'; }}
            />
          </div>

          {/* Text Area - now only in Chinese */}
          <div className="flex-1 text-black text-sm">
            <p>检测到未经授权的访问。您的网络活动已被标记。请立即验证您的身份，否则您的访问权限将被暂停。</p>
          </div>
        </div>

        {/* Buttons Area */}
        <div className="flex gap-2 p-3 justify-center bg-[#c0c0c0]">
          <button onClick={onClose} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-6 py-1 text-sm hover:bg-[#d0d0d0]">
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialCreditsPopup;
