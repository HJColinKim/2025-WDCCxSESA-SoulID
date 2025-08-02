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
import { AdType } from './types';


// Define a type for each ad instance, giving it a unique ID
type AdInstance = {
  id: number;
  type: AdType;
};

type AdManagerContextType = {
  showAdPopup: () => void;
};

const AdManagerContext = createContext<AdManagerContextType | undefined>(undefined);

export const AdProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // 1. State is now an array of ad instances, not a single ad
  const [activeAds, setActiveAds] = useState<AdInstance[]>([]);
  const adOptions: AdType[] = ['winrar', 'normal', 'explode', 'crazy', 'socialcredits', 'dvd', 'gpu', 'approach'];

  const showAdPopup = () => {
    const newAd: AdInstance = {
      id: Date.now(), // Use a timestamp for a simple unique ID
      type: adOptions[Math.floor(Math.random() * adOptions.length)],
    };
    // 2. Add the new ad to the array instead of replacing it
    setActiveAds((currentAds) => [...currentAds, newAd]);
  };

  // 3. The close function now needs the ID of the ad to close
  const closeAdPopup = (id: number) => {
    setActiveAds((currentAds) => currentAds.filter((ad) => ad.id !== id));
  };

  return (
    <AdManagerContext.Provider value={{ showAdPopup }}>
      {children}

      {/* 4. Map over the array to render all active ads */}
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
          return <NigerianPrincePopup key={ad.id} onClose={() => closeAdPopup(ad.id)} />;
        } 

        if (ad.type == 'socialcredits'){
          return < SocialCreditsPopupProps key={ad.id} onClose={() => closeAdPopup(ad.id)} />;
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

        return null;
      })}
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