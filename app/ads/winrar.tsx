import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

type PopupProps = {
  onClose: () => void;
};

const WinRARPopup: React.FC<PopupProps> = ({ onClose }) => {
  // 1. Add state for the random position
  const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  // 2. Calculate the position when the component mounts
  useEffect(() => {
    const randomTop = Math.floor(Math.random() * 60); // 0% to 60% from the top
    const randomLeft = Math.floor(Math.random() * 60); // 0% to 60% from the left

    setPosition({
      top: `${randomTop}vh`,
      left: `${randomLeft}vw`,
      transform: 'none'
    });
  }, []); // Empty array ensures this runs only once

  return (
    // 3. Apply the random position using inline styles
    <div
      className="fixed z-50"
      style={{ top: position.top, left: position.left, transform: position.transform }}
    >
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-96">
        <div className="bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between">
          <span className="text-sm font-bold">WinRAR</span>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#c0c0c0] border border-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
          >
            <X className="w-2 h-2" />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-yellow-400 border border-black flex items-center justify-center text-black font-bold">
              !
            </div>
            <div>
              <p className="text-sm font-bold">Your free trial has expired!</p>
              <p className="text-xs text-gray-600">Please purchase WinRAR license.</p>
              <p className="text-xs text-gray-600">Thank you for using WinRAR.</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-1 text-sm hover:bg-[#d0d0d0]"
            >
              Buy license
            </button>
            <button
              onClick={onClose}
              className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-1 text-sm hover:bg-[#d0d0d0]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinRARPopup;