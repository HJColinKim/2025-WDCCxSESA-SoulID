// AdManager.tsx
import { useState, createContext, useContext, FC, ReactNode } from 'react';
import WinRARPopup from './ads/winrar';
import NormalAdPopup from './ads/cd';
import ExplodeAdPopup from './ads/explode';
import NigerianPrincePopup from './ads/crazy'; 
import SocialCreditsPopupProps from './ads/socialcredits'; 
import BouncingDVDLogo from './ads/dvd';
import DownloadGpuPopupProps from './ads/gpu';
import ApproachingThreatPopupProps from './ads/approach'; 
import SoulIdPopup from './ads/soulid'; 
import SkypeCallPopupProps from './ads/skype'; 
import { AdType } from './types';

// Define a type for each ad instance, giving it a unique ID
type AdInstance = {
  id: number;
  type: AdType;
};

// --- 1. Add new state and toggle function to the context type ---
type AdManagerContextType = {
  showAdPopup: () => void;
  closeAllAds: () => void;
  togglePopupGeneration: () => void;
  popupsEnabled: boolean;
};

const AdManagerContext = createContext<AdManagerContextType | undefined>(undefined);

export const AdProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [activeAds, setActiveAds] = useState<AdInstance[]>([]);

  const [skypeCall, setSkypeCall] = useState<{ active: boolean; callerName: string }>({ active: false, callerName: '' });

  const adOptions: AdType[] = ['winrar', 'normal', 'explode', 'crazy', 'socialcredits', 'dvd', 'gpu', 'approach', 'soulid'];
  // --- 2. Add state to track if popups are enabled ---
  const [popupsEnabled, setPopupsEnabled] = useState(true); // Enabled by default

  const showAdPopup = () => {
    // --- 3. Prevent new popups if the setting is disabled ---
    if (!popupsEnabled) return;

    const newAd: AdInstance = {
      id: Date.now(), // Use a timestamp for a simple unique ID
      type: adOptions[Math.floor(Math.random() * adOptions.length)],
    };
    setActiveAds((currentAds) => [...currentAds, newAd]);
  };

  const closeAdPopup = (id: number) => {
    setActiveAds((currentAds) => currentAds.filter((ad) => ad.id !== id));
  };
  
  const closeAllAds = () => {
    setActiveAds([]);
  };

  // --- 4. Create the function to toggle the setting ---
  const togglePopupGeneration = () => {
    setPopupsEnabled((currentValue) => !currentValue);
  };

  const handlePrinceReply = (id: number, princeName: string) => {
    closeAdPopup(id); // Close the Nigerian Prince ad
    setSkypeCall({ active: true, callerName: princeName }); // Show the Skype ad with the correct name
  };

  return (
    // --- 5. Provide the new function and state through the context ---
    <AdManagerContext.Provider value={{ showAdPopup, closeAllAds, togglePopupGeneration, popupsEnabled }}>
      {children}

      {activeAds.map((ad) => {
        if (ad.type === 'winrar') {
          return <WinRARPopup key={ad.id} onClose={() => closeAdPopup(ad.id)} />;
        }
        if (ad.type === 'normal') {
          return <NormalAdPopup key={ad.id} onClose={() => closeAdPopup(ad.id)} />;
        }
        if (ad.type === 'explode') {
          return <ExplodeAdPopup key={ad.id} onClose={() => closeAdPopup(ad.id)} />;
        }
        if (ad.type == 'crazy') {
          return <NigerianPrincePopup key={ad.id} onClose={() => closeAdPopup(ad.id)} onReply={(princeName) => handlePrinceReply(ad.id, princeName)}/>;
        } 
        if (ad.type == 'socialcredits'){
          return <SocialCreditsPopupProps key={ad.id} onClose={() => closeAdPopup(ad.id)} />;
        }
        if (ad.type === 'dvd') {
          return <BouncingDVDLogo key={ad.id} />;
        }
        if (ad.type === 'gpu'){
          return < DownloadGpuPopupProps key={ad.id} onClose={() => closeAdPopup(ad.id)} />;
        }

        if (ad.type === 'approach'){
          return < ApproachingThreatPopupProps key={ad.id} onClose={() => closeAdPopup(ad.id)} />;
        }

        if (ad.type === 'soulid'){
          return < SoulIdPopup key={ad.id} onClose={() => closeAdPopup(ad.id)} />;
        }

        return null;
      })}
    {/* 5. Conditionally render the Skype popup when its state is active */}
      {skypeCall.active && (
        <SkypeCallPopupProps 
          callerName={skypeCall.callerName} 
          onDecline={() => setSkypeCall({ active: false, callerName: '' })} 
        />
      )}
    </AdManagerContext.Provider>
  );
};

export const useAdManager = (): AdManagerContextType => {
  const context = useContext(AdManagerContext);
  if (context === undefined) {
    throw new Error('useAdManager must be used within an AdProvider');
  }
  return context;
};