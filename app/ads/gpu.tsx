import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// Define the props for the component, including the onClose function
type DownloadGpuPopupProps = {
  onClose: () => void;
};

const DownloadGpuPopup: React.FC<DownloadGpuPopupProps> = ({ onClose }) => {
  // State to hold the random position
  const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
  // State to manage the fake download progress
  const [progress, setProgress] = useState(0);

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

  // Effect to simulate the download progress bar filling up
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prevProgress + Math.floor(Math.random() * 5) + 1;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="fixed z-50 font-mono"
      style={{ top: position.top, left: position.left, transform: position.transform }}
    >
      {/* Main window styling for a classic download prompt */}
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-96 shadow-lg">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-1 flex items-center justify-between">
          <span className="text-sm font-bold">Downloading New Hardware...</span>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="p-4">
          <div className="flex gap-4 items-center mb-4">
            {/* Download Icon */}
            <img 
              src="https://placehold.co/48x48/0000FF/FFFFFF?text=💾" 
              alt="Download icon"
              className="w-12 h-12"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/48x48/0000FF/FFFFFF?text=💾'; }}
            />
            <div className="text-black text-sm">
              <p>Downloading <span className="font-bold">NVIDIA GeForce RTX 4080 Ti</span> to your PC.</p>
              <p>Please do not turn off your computer.</p>
            </div>
          </div>

          {/* Fake Progress Bar */}
          <div className="w-full bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1">
            <div 
              className="bg-[#000080] h-5" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs mt-1 text-black">{progress}% complete</p>
        </div>

        {/* Buttons Area */}
        <div className="flex p-3 justify-center bg-[#c0c0c0] border-t-2 border-t-white">
          <button onClick={onClose} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-6 py-1 text-sm hover:bg-[#d0d0d0]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadGpuPopup;
