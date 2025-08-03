import { Phone, PhoneOff } from 'lucide-react';
import React, {useEffect, useRef} from 'react';

// Define the props for the component
type SkypeCallPopupProps = {
  callerName: string; // The name of the person calling (e.g., the Prince's name)
  onDecline: () => void; // Function to handle closing the popup
};

const SkypeCallPopup: React.FC<SkypeCallPopupProps> = ({ callerName, onDecline }) => {

  const audioRef = useRef<HTMLAudioElement>(null);

useEffect(() => {
  audioRef.current?.play().catch(error => {
    console.log("Audio autoplay was blocked by the browser.", error);
  });
}, []);

  return (
    // This popup is fixed to the bottom-right of the screen
    <div 
      className="fixed bottom-5 right-5 z-50 font-sans animate-in fade-in-5 slide-in-from-bottom-5 duration-500"
      style={{ fontFamily: 'Courier-New, Monospace' }} // <-- THIS IS THE ONLY CHANGE
    >

      <audio ref={audioRef} src="/audio/skype.mp3" />
      <div className="bg-white rounded-lg shadow- 2xl w-80 border border-gray-300 overflow-hidden">
        {/* Header section with Skype's classic blue */}
        <div className="bg-[#00aff0] p-3 flex items-center gap-3">
          <img
            src="https://placehold.co/48x48/FFFFFF/00aff0?text=P"
            alt="Caller Icon"
            className="w-12 h-12 rounded-full border-2 border-white"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/48x48/FFFFFF/00aff0?text=P'; }}
          />
          <div>
            <p className="text-white font-bold text-lg">{callerName}</p>
            <p className="text-white text-sm">Incoming call...</p>
          </div>
        </div>
        {/* Footer with action buttons */}
        <div className="p-3 flex justify-around bg-gray-100">
          <button onClick={onDecline} className="flex flex-col items-center text-red-600 hover:text-red-800 transition-colors">
            <div className="bg-red-600 rounded-full p-3 hover:bg-red-700 transition-colors">
              <PhoneOff className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs mt-1 font-semibold">Decline</span>
          </button>
          <button className="flex flex-col items-center text-green-600 hover:text-green-800 transition-colors">
            <div className="bg-green-600 rounded-full p-3 hover:bg-green-700 transition-colors">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs mt-1 font-semibold">Answer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkypeCallPopup;