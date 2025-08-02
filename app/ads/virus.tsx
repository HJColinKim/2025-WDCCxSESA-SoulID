import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

type PopupProps = {
  onClose: () => void;
};

const VirusPopup: React.FC<PopupProps> = ({ onClose }) => {
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
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-80 text-black font-mono">
        
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#ff0000] to-[#800000] text-white px-2 py-1 flex items-center justify-between">
          <span className="text-sm font-bold">VIRUS ALERT!</span>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#c0c0c0] border border-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
          >
            <X className="w-2 h-2" />
          </button>
        </div>

        {/* Ad Content */}
        <div className="p-4 text-center">
          <div className="bg-[#d0d0d0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3 mb-3">
            <div className="text-lg font-bold">WARNING! Your PC is Infected.</div>
            <p className="text-sm">Multiple viruses have been detected on your system!</p>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="p-2 border-t-2 border-[#808080] flex justify-center space-x-2">
          <button
            onClick={onClose}
            className="bg-green-500 text-white border-2 border-black px-3 py-1 text-sm font-bold hover:bg-green-600"
          >
            Clean PC Now!
          </button>
          <button
            onClick={onClose}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-sm font-bold hover:bg-[#d0d0d0]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirusPopup;