import { X, Trophy } from 'lucide-react';
import React, { useState, useEffect } from 'react';

type PopupProps = {
  onClose: () => void;
};

const WinPopup: React.FC<PopupProps> = ({ onClose }) => {
  const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  // Random position logic
  useEffect(() => {
    const randomTop = Math.floor(Math.random() * 70);
    const randomLeft = Math.floor(Math.random() * 70);

    setPosition({
      top: `${randomTop}vh`,
      left: `${randomLeft}vw`,
      transform: 'none'
    });
  }, []);

  return (
    <div
      className="fixed z-50"
      style={{ top: position.top, left: position.left, transform: position.transform }}
    >
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-80 text-black font-sans">
        
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#ffc107] to-[#ff9800] text-black px-2 py-1 flex items-center justify-between">
          <span className="text-sm font-bold">🎉 CONGRATULATIONS!</span>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#c0c0c0] border border-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
          >
            <X className="w-2 h-2" />
          </button>
        </div>

        {/* Ad Content */}
        <div className="p-4 text-center">
          <div className="bg-white border-2 border-black p-3 mb-3 flex items-center justify-center gap-4">
            <Trophy size={48} className="text-[#ffc107]" />
            <div>
              <div className="text-lg font-bold">You are our 1,000,000th visitor!</div>
              <p className="text-sm">Click 'Claim' to get your FREE gift!</p>
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="p-2 border-t-2 border-[#808080] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-1 text-sm font-bold hover:bg-[#d0d0d0]"
          >
            Claim Your Prize!
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinPopup;