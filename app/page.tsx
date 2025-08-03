"use client"

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { 
  Volume2, 
  VolumeX, 
  Minimize2, 
  X, 
  Square, 
  Play, 
  Pause, 
  Settings, 
  Minus 
} from "lucide-react";
import { AdProvider, useAdManager } from "./adsManager";

// Mock Pokémon dataset with audio simulation
const pokemonData = [
  {
    id: 25,
    name: "mortal kombat",
    image: "/images/MK1SubScorp.jpg",
    audio: "/audio/MkAudio.mp3",
    crushMultiplier: 0.7, // Normal crushing
  },
  {
    id: 6,
    name: "pacman",
    image: "/images/pacman.jpg",
    audio: "/audio/PacMan.mp3",
    crushMultiplier: 1.3, // Less crushing (audio plays better on first round)
    volumeMultiplier: 1, // Normal volume used to 0.1
  },
  {
    id: 9,
    name: "crash bandicoot",
    image: "/images/Crash.png",

    audio: "/audio/crash.mp3",
    crushMultiplier: 0.7, // More crushing
  },
  {
    id: 3,
    name: "mario",
    image: "/images/Mario.jpg",

    audio: "/audio/mario.mp3",
    crushMultiplier: 0.85, // Less crushing
  },
  {
    id: 150,
    name: "sonic",
    image: "/images/Sonic8bit.jpg",

    audio: "/audio/sonicaudio.mp3",
    crushMultiplier: 0.65, // Normal crushing
  },
  {
    id: 144,
    name: "wii sports",
    image: "/images/Wiisportstennis.jpg",

    audio: "/audio/wiiaudio.mp3",
    crushMultiplier: 0.45, // Much less crushing (if audio is very quiet)
    volumeMultiplier: 1.4, // Normal volume
  },
]

function PokemonCoopGame() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "finished">("menu")
  const [currentPokemon, setCurrentPokemon] = useState(pokemonData[0])
  const [guesses, setGuesses] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState("")
  const [guessCount, setGuessCount] = useState(0)
  const [showWinRARPopup, setShowWinRARPopup] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const bitCrusherRef = useRef<AudioWorkletNode | null>(null);
  const guessCountRef = useRef(0);
  const gameLogRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState("")
  const [showSettings, setShowSettings] = useState(false)

  const { showAdPopup } = useAdManager();
  const { closeAllAds, togglePopupGeneration, popupsEnabled } = useAdManager();

  const clickAudioRef = useRef<HTMLAudioElement>(null);
  const errorAudioRef = useRef<HTMLAudioElement>(null);

  const maxGuesses = 5
  const qualityLevels = [16, 32, 64, 96, 128]

  // Play click sound
  const playClickSound = () => {
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(() => {
        // Ignore audio play errors
      });
    }
  };

  const handleButtonClick = () => {
    closeAllAds();          // First, close all existing ads
    togglePopupGeneration(); // Then, toggle the setting
  };

  // Play error sound
  const playErrorSound = () => {
    if (errorAudioRef.current) {
      const errorSounds = ['error1.mp3', 'error2.mp3', 'error3.mp3'];
      const randomError = errorSounds[Math.floor(Math.random() * errorSounds.length)];
      errorAudioRef.current.src = `/audio/${randomError}`;
      errorAudioRef.current.currentTime = 0;
      errorAudioRef.current.play().catch(() => {
        // Ignore audio play errors
      });
    }
  };

  useEffect(() => {
    // Update the ref whenever guessCount changes
    guessCountRef.current = guessCount;

    if (audioRef.current) {
      // Set the src only if it has changed
      const newSrc = new URL(currentPokemon.audio, window.location.href).href;
      if (audioRef.current.src !== newSrc) {
        audioRef.current.src = currentPokemon.audio;
        audioRef.current.load(); // Reload the audio element to apply the new source
      }

      // Update volume and other audio parameters
      audioRef.current.volume = audioEnabled ? getAudioQuality().volume : 0;
      const quality = getAudioQuality();
      if (filterRef.current) {
        filterRef.current.frequency.value = quality.filterFrequency;
      }
      if (bitCrusherRef.current) {
        const bitDepthParam = bitCrusherRef.current.parameters.get('bitDepth');
        const sampleRateReductionParam = bitCrusherRef.current.parameters.get('sampleRateReduction');
        if (bitDepthParam) bitDepthParam.value = quality.bitDepth;
        if (sampleRateReductionParam) sampleRateReductionParam.value = quality.sampleRateReduction;
      }
    }
  }, [currentPokemon, guessCount, audioEnabled]);

  useEffect(() => {
    const audio = audioRef.current;
    const handlePlay = () => setAudioPlaying(true);
    const handlePause = () => setAudioPlaying(false);

    if (audio) {
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handlePause);
    }

    return () => {
      if (audio) {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handlePause);
      }
    };
  }, []);

  useEffect(() => {
    // Global click handler for all clicks
    const handleGlobalClick = () => {
      playClickSound();
    };

    // Add event listener to document
    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
      })
      setCurrentTime(timeString)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const adTimer = setInterval(() => {
      // You can call this from anywhere now!
      showAdPopup();   //Disable this line for accessibility mode 
      //playErrorSound(); // Play error sound when a popup is shown
    }, 1000); // Trigger a random ad every 15 seconds

    return () => {
      clearInterval(adTimer);
    };
  }, [showAdPopup]);

  const startGame = () => {
    playClickSound();
    const randomPokemon = pokemonData[Math.floor(Math.random() * pokemonData.length)]

    console.log("Selected subject data:")

    // Disconnect nodes but don't close context
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    filterRef.current = null;
    bitCrusherRef.current = null;

    //Simple random algorithm for choosing which 'subject' to choose. Should be kept random but could utilize elo system to make popular ones pop up first 
    setCurrentPokemon(randomPokemon)
    setGameState("playing")
    setGuesses([])
    setGuessCount(0)
    setCurrentGuess("")
  }

  const makeGuess = () => {
    if (!currentGuess.trim()) return

    playClickSound();
    const newGuesses = [...guesses, currentGuess]
    setGuesses(newGuesses)
    setGuessCount(guessCount + 1)

    if (currentGuess.toLowerCase() === currentPokemon.name.toLowerCase()) {
      setGameState("finished")
    } else {
      // Play error sound for wrong guess
      playErrorSound();
      if (guessCount + 1 >= maxGuesses) {
        setGameState("finished")
      }
    }

    setCurrentGuess("")

    // Auto-scroll game log to bottom after state updates
    setTimeout(() => {
      if (gameLogRef.current) {
        gameLogRef.current.scrollTop = gameLogRef.current.scrollHeight;
      }
    }, 0);
  }

  const resetGame = () => {
    playClickSound();
    setGameState("menu")
    setGuesses([])
    setGuessCount(0)
    guessCountRef.current = 0;
    setCurrentGuess("")
    setAudioPlaying(false)

    // Disconnect nodes but don't close context
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    filterRef.current = null;
    bitCrusherRef.current = null;
  }

  const playAgain = () => {
    playClickSound();
    const randomPokemon = pokemonData[Math.floor(Math.random() * pokemonData.length)]

    // Disconnect nodes but don't close context
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    filterRef.current = null;
    bitCrusherRef.current = null;

    // Start new game directly
    setCurrentPokemon(randomPokemon)
    setGameState("playing")
    setGuesses([])
    setGuessCount(0)
    guessCountRef.current = 0;
    setCurrentGuess("")
    setAudioPlaying(false)
  }

  const getCurrentImageQuality = () => {
    // If the game is finished, show the image at its largest size.
    if (gameState === 'finished') {
      return 256;
    }

    // This now controls the resolution of the pixelated image.
    const qualityLevels = [32, 64, 96, 128, 256]; // Start at a higher resolution
    const level = Math.min(guesses.length, qualityLevels.length - 1);
    return qualityLevels[level];
  };

  const getImageFilter = () => {
    // If the game is finished, show the image with no filters.
    if (gameState === 'finished') {
      return 'none';
    }

    // Start at 60% quality and increase by 10% each time.
    const effectLevel = Math.min(100, 60 + guesses.length * 10);

    // The blur is removed to favor a pixelated reveal.
    return `contrast(${effectLevel}%) brightness(${effectLevel}%) saturate(${effectLevel}%)`;
  };

  const getAudioQuality = () => {
    // Apply crush multiplier from current pokemon data
    const crushMultiplier = currentPokemon.crushMultiplier || 1.0;
    const volumeMultiplier = currentPokemon.volumeMultiplier || 1.0;

    // Slower improvement progression to make rounds more challenging
    const volume = Math.min(1, 0.18 + guessCount * 0.07 * volumeMultiplier) // Slower volume increase
    const clarity = guessCount + 1
    const filterFrequency = Math.min(22050, 1200 + guessCount * 2200); // Smaller frequency jumps
    const bitDepth = Math.min(16, (3.5 + guessCount * 1.8) / crushMultiplier); // Apply multiplier to bit depth
    const sampleRateReduction = Math.max(1, (11 - guessCount * 1.4) * crushMultiplier); // Apply multiplier to sample reduction
    return { volume, clarity, filterFrequency, bitDepth, sampleRateReduction }
  }

  const toggleMute = () => {
    playClickSound();
    const newAudioEnabled = !audioEnabled;
    setAudioEnabled(newAudioEnabled);

    if (audioRef.current) {
      audioRef.current.volume = newAudioEnabled ? getAudioQuality().volume : 0;
    }
  }

  const playAudio = async () => {
    playClickSound();
    let audioContext = audioContextRef.current;

    // Initialize AudioContext and source node once
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      sourceRef.current = audioContext.createMediaElementSource(audioRef.current!);
      await audioContext.audioWorklet.addModule('/bit-crusher-processor.js');
    }

    // Recreate and connect nodes if they don't exist for the current playback
    if (!bitCrusherRef.current) {
      const quality = getAudioQuality();

      // Create low-pass filter
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = quality.filterFrequency;
      filterRef.current = filter;

      // Create AudioWorkletNode
      const bitCrusher = new AudioWorkletNode(audioContext, 'bit-crusher-processor');
      const bitDepthParam = bitCrusher.parameters.get('bitDepth');
      const sampleRateReductionParam = bitCrusher.parameters.get('sampleRateReduction');
      if (bitDepthParam) bitDepthParam.value = quality.bitDepth;
      if (sampleRateReductionParam) sampleRateReductionParam.value = quality.sampleRateReduction;
      bitCrusherRef.current = bitCrusher;

      // Connect the audio chain
      sourceRef.current!.connect(filter);
      filter.connect(bitCrusher);
      bitCrusher.connect(audioContext.destination);
    }

    // Update parameters for current playback
    const quality = getAudioQuality();
    if (filterRef.current) {
      filterRef.current.frequency.value = quality.filterFrequency;
    }
    if (bitCrusherRef.current) {
      const bitDepthParam = bitCrusherRef.current.parameters.get('bitDepth');
      const sampleRateReductionParam = bitCrusherRef.current.parameters.get('sampleRateReduction');
      if (bitDepthParam) bitDepthParam.value = quality.bitDepth;
      if (sampleRateReductionParam) sampleRateReductionParam.value = quality.sampleRateReduction;
    }

    if (audioRef.current) {
      // Resume audio context if it's suspended (required by browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      if (audioRef.current.paused) {
        try {
          await audioRef.current.play();
        } catch (error) {
          // Ignore AbortError which is expected on rapid play/pause clicks
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error("Audio playback failed:", error);
          }
        }
      } else {
        audioRef.current.pause();
      }
    }
  }

  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-[#c0c0c0] p-4 font-mono relative win95-cursor">
        {/* Add audio elements so they are available in the menu state */}
        <audio ref={audioRef} />
        <audio ref={clickAudioRef} src="/audio/click.mp3" preload="auto" />
        <audio ref={errorAudioRef} preload="auto" />

        {/* Custom cursor styles */}
        <style jsx global>{`
          .win95-cursor {
            cursor: default;
          }
          .win95-cursor button:hover {
            cursor: pointer;
          }
          .win95-cursor input:hover {
            cursor: text;
          }
        `}</style>

        {/* Desktop Background Pattern */}
        <div className="fixed inset-0 opacity-10 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.1) 10px, rgba(0,0,0,.1) 20px)`,
            }}
          />
        </div>

        <div className="mx-auto max-w-4xl relative z-10">
          {/* Title Bar */}
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] mb-4">
            <div className="bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between">
              <span className="text-sm font-bold">🕹️ Nostalgia Co-op Guesser v2.1 - SHAREWARE</span>
              <div className="flex gap-1">
                <button className="w-4 h-4 bg-[#c0c0c0] border border-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]">
                  <Minimize2 className="w-2 h-2" />
                </button>
                <button className="w-4 h-4 bg-[#c0c0c0] border border-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]">
                  <Square className="w-2 h-2" />
                </button>
                <button className="w-4 h-4 bg-[#c0c0c0] border border-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]">
                  <X className="w-2 h-2" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Game Window */}
            <div className="lg:col-span-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-6">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold mb-2">🎮 NOSTALGIA CO-OP GUESSER</h1>
                <div className="text-sm text-gray-600 mb-4">Authentic Windows 95 Gaming Experience™</div>
              </div>

              <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-4 mb-6">
                <h2 className="font-bold mb-3 flex items-center">📋 HOW TO PLAY:</h2>
                <ul className="text-sm space-y-2">
                  <li>• Player 1 sees a retro image clue</li>
                  <li>• Player 2 hears a low-quality Nostalgia sound clue</li>
                  <li>• Work together to guess the Retro game or character!!!</li>
                  <li>• Each wrong guess improves image and audio quality</li>
                  <li>• Try to guess in as few attempts as possible!</li>
                  <li>• Communicate with your partner for best results!</li>
                </ul>
              </div>

              <div className="text-center">
                <button
                  onClick={startGame}
                  className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-8 py-4 text-xl font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white transform active:translate-x-0.5 active:translate-y-0.5"
                >
                  🎯 PLAY GAME
                </button>
                <div className="text-xs text-gray-600 mt-2">Click to start your journey into the past!</div>
              </div>

              {/* System Info */}
              <div className="mt-6 bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-3">
                <div className="text-xs font-mono">
                  <div>System: Windows 95 Compatible</div>
                  <div>Memory: 640KB Available</div>
                  <div>Sound: SoundBlaster 16 Compatible</div>
                  <div>Graphics: SVGA Required</div>
                  <div>Nostalgia Database: {pokemonData.length} entries loaded</div>
                </div>
              </div>
            </div>

            {/* Sidebar with Ads */}
            <div className="space-y-4">
              {/* Ad Banner 1 */}
              <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
                <div className="bg-gradient-to-r from-[#ff0000] to-[#800000] text-white px-2 py-1 mb-2">
                  <span className="text-xs font-bold">🔥 HOT DEALS!</span>
                </div>
                <div className="bg-yellow-300 border-2 border-black p-2 text-center">
                  <div className="text-xs font-bold">DIAL-UP INTERNET</div>
                  <div className="text-xs">Only $19.95/month!</div>
                  <div className="text-xs">56k Speed Guaranteed*</div>
                  <button className="bg-red-500 text-white px-2 py-1 text-xs mt-1 border border-black">
                    SIGN UP NOW!
                  </button>
                </div>
              </div>

              {/* Ad Banner 2 */}
              <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
                <div className="bg-gradient-to-r from-[#00ff00] to-[#008000] text-black px-2 py-1 mb-2">
                  <span className="text-xs font-bold">💿 SOFTWARE</span>
                </div>
                <div className="bg-blue-200 border-2 border-black p-2 text-center">
                  <div className="text-xs font-bold">ENCARTA 95</div>
                  <div className="text-xs">Complete Encyclopedia</div>
                  <div className="text-xs">On 4 CD-ROMs!</div>
                  <button className="bg-blue-600 text-white px-2 py-1 text-xs mt-1 border border-black">
                    ORDER TODAY
                  </button>
                </div>
              </div>

              {/* Stats Window */}
              <div className="bg-[#c0c0c0] border-2 border-t-white border-l-[#808080] border-r-[#808080] border-b-[#808080] p-3">
                <div className="bg-gradient-to-r from-[#008080] to-[#004040] text-white px-2 py-1 mb-2">
                  <span className="text-xs font-bold">📊 GAME STATS</span>
                </div>
                <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2">
                  <div className="text-xs font-mono">
                    <div>Games Played: 0</div>
                    <div>Best Score: ---</div>
                    <div>Success Rate: ---%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#c0c0c0] border-t-2 border-white border-l-2 border-r border-b border-gray-600 border-r-gray-600 flex items-center px-1">
        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="h-8 px-4 bg-[#c0c0c0] border-2 border-white border-t-white border-l-white border-r-gray-600 border-b-gray-600 hover:border-gray-600 hover:border-t-gray-600 hover:border-l-gray-600 hover:border-r-white hover:border-b-white active:border-gray-400 active:border-t-gray-400 active:border-l-gray-400 active:border-r-gray-200 active:border-b-gray-200 flex items-center gap-1 text-sm font-bold"
        >
          <Settings size={14} />
          Settings
        </button>

        {/* Taskbar Center Area */}
        <div className="flex-1 mx-2">{/* Empty space for running applications */}</div>

        {/* System Tray and Clock */}
        <div className="flex items-center">
          <div className="h-6 px-2 bg-[#c0c0c0] border border-gray-600 border-t-gray-600 border-l-gray-600 border-r-white border-b-white flex items-center">
            <span className="text-xs font-mono">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-[#c0c0c0] border-2 border-white border-t-white border-l-white border-r-gray-600 border-b-gray-600 w-96 shadow-lg">
            {/* Title Bar */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-2 py-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={16} />
                <span className="text-sm font-bold">Settings</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-4 h-4 bg-[#c0c0c0] border border-gray-600 border-t-white border-l-white border-r-gray-600 border-b-gray-600 flex items-center justify-center hover:bg-gray-200"
                >
                  <Minus size={8} />
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-4 h-4 bg-[#c0c0c0] border border-gray-600 border-t-white border-l-white border-r-gray-600 border-b-gray-600 flex items-center justify-center hover:bg-gray-200"
                >
                  <X size={8} />
                </button>
              </div>
            </div>

            {/* Dialog Content */}
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-bold mb-2">Display Settings</h3>
                <div className="border border-gray-600 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-3 bg-white">
                  <p className="text-xs mb-3">Choose your preferred display mode:</p>

                  {/* This button does NOT close the popup */}
                  <button className="w-full h-8 px-3 bg-[#c0c0c0] border-2 border-white border-t-white border-l-white border-r-gray-600 border-b-gray-600 hover:border-gray-600 hover:border-t-gray-600 hover:border-l-gray-600 hover:border-r-white hover:border-b-white active:border-gray-400 active:border-t-gray-400 active:border-l-gray-400 active:border-r-gray-200 active:border-b-gray-200 text-xs font-bold" onClick={handleButtonClick}>
                    {/* 3. Use the state to display the correct text */}
                    {popupsEnabled ? 'Disable Popup Generation' : 'Enable Popup Generation'}
                  </button>
                </div>
              </div>

              {/* Dialog Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-1 bg-[#c0c0c0] border-2 border-white border-t-white border-l-white border-r-gray-600 border-b-gray-600 hover:border-gray-600 hover:border-t-gray-600 hover:border-l-gray-600 hover:border-r-white hover:border-b-white active:border-gray-400 active:border-t-gray-400 active:border-l-gray-400 active:border-r-gray-200 active:border-b-gray-200 text-xs font-bold"
                >
                  OK
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-1 bg-[#c0c0c0] border-2 border-white border-t-white border-l-white border-r-gray-600 border-b-gray-600 hover:border-gray-600 hover:border-t-gray-600 hover:border-l-gray-600 hover:border-r-white hover:border-b-white active:border-gray-400 active:border-t-gray-400 active:border-l-gray-400 active:border-r-gray-200 active:border-b-gray-200 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#c0c0c0] p-4 font-mono win95-cursor">
      {/* Custom cursor styles */}
      <style jsx global>{`
        .win95-cursor {
          cursor: default;
        }
        .win95-cursor button:hover {
          cursor: pointer;
        }
        .win95-cursor input:hover {
          cursor: text;
        }
      `}</style>

      <audio ref={audioRef} />
      <audio ref={clickAudioRef} src="/audio/click.mp3" preload="auto" />
      <audio ref={errorAudioRef} preload="auto" />
      <div className="mx-auto max-w-6xl">
        {/* Title Bar */}
        <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] mb-4">
          <div className="bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between">
            <span className="text-sm font-bold">🕹️ Nostalgia Co-op Guesser - GAME IN PROGRESS</span>
            <div className="flex gap-1">
              <button className="w-4 h-4 bg-[#c0c0c0] border border-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]">
                <Minimize2 className="w-2 h-2" />
              </button>
              <button className="w-4 h-4 bg-[#c0c0c0] border border-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]">
                <Square className="w-2 h-2" />
              </button>
              <button
                onClick={resetGame}
                className="w-4 h-4 bg-[#c0c0c0] border border-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
              >
                <X className="w-2 h-2" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Image and Audio Display */}
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-[#808080] border-r-[#808080] border-b-[#808080] p-4">
              <div className="bg-gradient-to-r from-[#008080] to-[#004040] text-white px-2 py-1 mb-4">
                <span className="text-sm font-bold">🎯 MYSTERY NOSTALGIA TOPIC</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Display */}
                <div className="bg-black border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-4 flex items-center justify-center">
                  <div
                    className="relative overflow-hidden"
                    style={{ width: '256px', height: '256px' }}
                  >
                    <img
                      src={currentPokemon.image || "/placeholder.svg"}
                      alt="Mystery Pokémon"
                      className="pixelated"
                      style={{
                        imageRendering: "pixelated",
                        filter: getImageFilter(),
                        width: `${getCurrentImageQuality()}px`,
                        height: `${getCurrentImageQuality()}px`,
                        // Scale the low-res image to fill the container
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) scale(var(--scale-factor, 1))',
                        '--scale-factor': 256 / getCurrentImageQuality(),
                      } as React.CSSProperties}
                    />
                  </div>
                </div>

                {/* Audio Display */}
                <div className="bg-black border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-4 text-center">
                  <div className="text-green-400 text-xs mb-2">🔊 AUDIO PLAYER</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={playAudio}
                        className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2 hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
                      >
                        {audioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2 hover:bg-[#d0d0d0]"
                      >
                        {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-green-400 text-sm">
                      {audioPlaying ? (
                        <div className="animate-pulse">
                          <br />
                          <span className="text-xs">(Bit Depth: {getAudioQuality().bitDepth.toFixed(1)}-bit | Crush: {getAudioQuality().sampleRateReduction.toFixed(1)}x)</span>
                        </div>
                      ) : (
                        <div>Click play to hear audio hint</div>
                      )}
                    </div>
                    <div className="text-green-400 text-xs">Bit Crusher: {getAudioQuality().bitDepth.toFixed(1)}-bit | Sample Reduction: {getAudioQuality().sampleRateReduction.toFixed(1)}x</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guess Input */}
            {gameState === "playing" && (
              <div className="bg-[#c0c0c0] border-2 border-t-white border-l-[#808080] border-r-[#808080] border-b-[#808080] p-4">
                <div className="bg-gradient-to-r from-[#800080] to-[#400040] text-white px-2 py-1 mb-4">
                  <span className="text-sm font-bold">💭 MAKE YOUR GUESS</span>
                </div>
                <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-3">
                  <div className="flex gap-2">
                    <Input
                      value={currentGuess}
                      onChange={(e) => setCurrentGuess(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && makeGuess()}
                      placeholder="Enter your guess..."
                      className="flex-1 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono"
                    />
                    <button
                      onClick={makeGuess}
                      className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-6 py-2 hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white font-bold"
                    >
                      GUESS!
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Game Status */}
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-[#808080] border-r-[#808080] border-b-[#808080] p-4">
              <div className="bg-gradient-to-r from-[#008000] to-[#004000] text-white px-2 py-1 mb-4">
                <span className="text-sm font-bold">📊 GAME STATUS</span>
              </div>
              <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-3 text-center">
                {gameState === "playing" && (
                  <div className="font-mono">
                    <div className="text-lg font-bold mb-2">
                      Attempts: {guessCount}/{maxGuesses}
                    </div>
                    {guessCount > 0 && (
                      <div className="text-sm text-gray-600">Last guess: "{guesses[guesses.length - 1]}"</div>
                    )}

                  </div>
                )}
                {gameState === "finished" && (
                  <div className="font-mono">
                    {guesses[guesses.length - 1]?.toLowerCase() === currentPokemon.name.toLowerCase() ? (
                      <div className="text-green-600 font-bold">
                        🎉 CONGRATULATIONS! 🎉
                        <br />
                        It was {currentPokemon.name}!
                        <br />
                        You guessed it in {guessCount} attempts!
                      </div>
                    ) : (
                      <div className="text-red-600 font-bold">
                        😔 GAME OVER! 😔
                        <br />
                        It was {currentPokemon.name}
                        <br />
                        Better luck next time!
                      </div>
                    )}
                    <button
                      onClick={playAgain}
                      className="mt-4 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-6 py-2 hover:bg-[#d0d0d0] font-bold"
                    >
                      PLAY AGAIN
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Terminal Log */}
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4">
              <div className="bg-gradient-to-r from-[#008080] to-[#004040] text-white px-2 py-1 mb-4">
                <span className="text-sm font-bold">💻 GAME LOG</span>
              </div>
              <div
                ref={gameLogRef}
                className="bg-black border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-3 h-48 overflow-y-auto"
              >
                <div className="text-green-400 font-mono text-xs">
                  <div>C:\NOSTALGIA\GUESSER&gt; start_game.exe</div>
                  <div>Loading Nostalgia database...</div>

                  <div>Initializing graphics...</div>
                  <div>Initializing audio...</div>
                  <div>{"=".repeat(30)}</div>
                  {guesses.map((guess, index) => (
                    <div key={index} className="mt-1">
                      <span className="text-yellow-400">#{index + 1}:</span> {guess}
                      <br />
                      <span
                        className={
                          guess.toLowerCase() === currentPokemon.name.toLowerCase() ? "text-green-400" : "text-red-400"
                        }
                      >
                        {guess.toLowerCase() === currentPokemon.name.toLowerCase() ? "✓ CORRECT!" : "✗ INCORRECT"}
                      </span>
                      {guess.toLowerCase() !== currentPokemon.name.toLowerCase() && index < maxGuesses - 1 && (
                        <span className="text-cyan-400"> - Enhancing clues...</span>
                      )}
                    </div>
                  ))}
                  {gameState === "playing" && (
                    <div className="mt-2 text-cyan-400 animate-pulse">&gt; Waiting for input...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Ad Space */}
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
              <div className="bg-gradient-to-r from-[#ff0000] to-[#800000] text-white px-2 py-1 mb-2">
                <span className="text-xs font-bold">💰 SPONSORED</span>
              </div>
              <div className="bg-yellow-200 border-2 border-black p-2 text-center">
                <div className="text-xs font-bold">POKÉMON CARDS</div>
                <div className="text-xs">Booster Packs $3.99</div>
                <div className="text-xs">Rare Holographics!</div>
                <button className="bg-red-500 text-white px-2 py-1 text-xs mt-1 border border-black hover:bg-red-600">
                  BUY NOW!
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WrappedGame() {
  return (
    <AdProvider>
      <PokemonCoopGame />
    </AdProvider>
  )
}
