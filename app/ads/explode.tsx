import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

type PopupProps = {
  onClose: () => void;
};

const NormalAdPopup: React.FC<PopupProps> = ({ onClose }) => {
  // 1. Add state to hold the random position
  const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  // 2. Calculate a random position when the component mounts
  useEffect(() => {
    // We get a random position from the top/left, ensuring the popup stays on screen.
    // The 'vw' (viewport width) and 'vh' (viewport height) units are used.
    const randomTop = Math.floor(Math.random() * 70); // 0% to 70% from the top
    const randomLeft = Math.floor(Math.random() * 70); // 0% to 70% from the left

    setPosition({ 
      top: `${randomTop}vh`, 
      left: `${randomLeft}vw`,
      transform: 'none' // We no longer need to center it with translate
    });
  }, []); // The empty dependency array [] ensures this runs only once

  return (
    // 3. Remove centering classes and apply the random position via style
    <div 
      className="fixed z-50"
      style={{ top: position.top, left: position.left, transform: position.transform }}
    >
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-80">
        <div className="bg-gradient-to-r from-[#ff0000] to-[#800000] text-white px-2 py-1 flex items-center justify-between">
          <span className="text-sm font-bold">🎯 ACT NOW!</span>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#c0c0c0] border border-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
          >
            <X className="w-2 h-2" />
          </button>
        </div>
        <div className="p-4 text-center">
          <div className="bg-yellow-300 border-2 border-black p-3 mb-3">
            <div className="text-lg font-bold">ALERT!</div>
            <div className="text-sm">Due to an infection, your computer will self destruct</div>
            <div className="text-xs">and explode in 10 seconds!</div>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onClose}
              className="bg-green-500 text-white border-2 border-black px-3 py-1 text-sm hover:bg-green-600"
            >
              Cure Now!
            </button>
            <button
              onClick={onClose}
              className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-sm hover:bg-[#d0d0d0]"
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NormalAdPopup;