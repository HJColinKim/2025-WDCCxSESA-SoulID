"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Volume2, VolumeX, Minimize2, X, Square, Play, Pause } from "lucide-react"
import { AdProvider, useAdManager } from "./adsManager"

// Mock Pokémon dataset with audio simulation
const pokemonData = [
  {
    id: 25,
    name: "halo",
    image: "/images/halo.png",
    audio: "/audio/haloaudio.mp3",
    crushMultiplier: 1, // Normal crushing
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
  const guessCountRef = useRef(0);
  const gameLogRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isFirstGame, setIsFirstGame] = useState(true);

  const { showAdPopup } = useAdManager();
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

  const pixelateCanvas = (canvas: HTMLCanvasElement, pixelSize: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply pixelation by averaging pixels in blocks
    for (let y = 0; y < canvas.height; y += pixelSize) {
      for (let x = 0; x < canvas.width; x += pixelSize) {
        // Calculate average color for this pixel block
        let r = 0, g = 0, b = 0, a = 0;
        let count = 0;

        for (let dy = 0; dy < pixelSize && y + dy < canvas.height; dy++) {
          for (let dx = 0; dx < pixelSize && x + dx < canvas.width; dx++) {
            const index = ((y + dy) * canvas.width + (x + dx)) * 4;
            r += data[index];
            g += data[index + 1];
            b += data[index + 2];
            a += data[index + 3];
            count++;
          }
        }

        // Average the colors
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        a = Math.floor(a / count);

        // Apply the averaged color to the entire block
        for (let dy = 0; dy < pixelSize && y + dy < canvas.height; dy++) {
          for (let dx = 0; dx < pixelSize && x + dx < canvas.width; dx++) {
            const index = ((y + dy) * canvas.width + (x + dx)) * 4;
            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = a;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const applyPixelationEffect = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 256;
    canvas.height = 256;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the original image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    if (gameState !== 'finished') {
      // Get the pixelation level based on guesses - more dramatic progression
      const pixelSize = Math.max(1, 40 - guesses.length * 10);

      // Apply pixelation effect
      pixelateCanvas(canvas, pixelSize);

      // Apply color filters
      const effectLevel = Math.min(100, 60 + guesses.length * 10) / 100;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = `rgba(${255 * effectLevel}, ${255 * effectLevel}, ${255 * effectLevel}, 1)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  useEffect(() => {
    if (gameState === 'playing' || gameState === 'finished') {
      applyPixelationEffect();
    }
  }, [guesses.length, gameState, currentPokemon]);

  useEffect(() => {
    const audio = audioRef.current;
    const handlePlay = () => setAudioPlaying(true);
    const handlePause = () => setAudioPlaying(false);
    const handleLoadedMetadata = () => {
      if (audio) {
        console.log("Audio loaded, duration:", audio.duration);
        setAudioDuration(audio.duration);
      }
    };
    const handleCanPlayThrough = () => {
      if (audio && audio.duration) {
        console.log("Audio can play through, duration:", audio.duration);
        setAudioDuration(audio.duration);
      }
    };

    if (audio) {
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handlePause);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      
      // Force load if src is already set
      if (audio.src && audio.readyState >= 1) {
        handleLoadedMetadata();
      }
    }

    return () => {
      if (audio) {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handlePause);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      }
    };
  }, []);

  useEffect(() => {
    // Update the ref whenever guessCount changes
    guessCountRef.current = guessCount;

    if (audioRef.current) {
      // Set the src only if it has changed
      const newSrc = new URL(currentPokemon.audio, window.location.href).href;
      if (audioRef.current.src !== newSrc) {
        audioRef.current.src = currentPokemon.audio;
        audioRef.current.load(); // Reload the audio element to apply the new source
        
        // Wait for metadata to load and set duration
        const handleLoadedData = () => {
          if (audioRef.current && audioRef.current.duration) {
            console.log("New audio loaded, duration:", audioRef.current.duration);
            setAudioDuration(audioRef.current.duration);
            // Force volume reset to ensure audio is ready
            audioRef.current.volume = audioEnabled ? getAudioQuality().volume : 0;
          }
          audioRef.current?.removeEventListener('loadeddata', handleLoadedData);
        };
        audioRef.current.addEventListener('loadeddata', handleLoadedData);
        
        // Additional event listener for loadedmetadata
        const handleLoadedMetadata = () => {
          if (audioRef.current && audioRef.current.duration) {
            console.log("Metadata loaded, duration:", audioRef.current.duration);
            setAudioDuration(audioRef.current.duration);
            // Force volume reset to ensure audio is ready
            audioRef.current.volume = audioEnabled ? getAudioQuality().volume : 0;
          }
          audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
        audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      }

      // Update volume - force a volume change to trigger audio initialization
      const targetVolume = audioEnabled ? getAudioQuality().volume : 0;
      if (audioRef.current.volume !== targetVolume) {
        audioRef.current.volume = targetVolume;
      }
    }
  }, [currentPokemon, guessCount, audioEnabled]);

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
    const adTimer = setInterval(() => {
      // You can call this from anywhere now!
      //showAdPopup();   //Disable this line for accessibility mode 
      //playErrorSound(); // Play error sound when a popup is shown
    }, 1000); // Trigger a random ad every 15 seconds

    return () => {
      clearInterval(adTimer);
    };
  }, [showAdPopup]);

  const startGame = () => {
    playClickSound();
    let randomPokemon;
    
    if (isFirstGame) {
      // For the first game, exclude halo from the selection
      const nonHaloPokemon = pokemonData.filter(pokemon => pokemon.name !== "halo");
      randomPokemon = nonHaloPokemon[Math.floor(Math.random() * nonHaloPokemon.length)];
      setIsFirstGame(false);
    } else {
      // For subsequent games, allow any pokemon including halo
      randomPokemon = pokemonData[Math.floor(Math.random() * pokemonData.length)];
    }

    console.log("Selected subject data:")

    setCurrentPokemon(randomPokemon)
    setGameState("playing")
    setGuesses([])
    setGuessCount(0)
    setCurrentGuess("")
    setAudioDuration(0)
    
    // Preload the audio for the selected pokemon
    if (audioRef.current) {
      audioRef.current.src = randomPokemon.audio;
      audioRef.current.load();
    }
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
    setAudioDuration(0)
  }

  const playAgain = () => {
    playClickSound();
    const randomPokemon = pokemonData[Math.floor(Math.random() * pokemonData.length)]

    // Reset audio state first
    setAudioPlaying(false)
    setAudioDuration(0)
    
    // Reset game state
    setCurrentPokemon(randomPokemon)
    setGameState("playing")
    setGuesses([])
    setGuessCount(0)
    guessCountRef.current = 0;
    setCurrentGuess("")
    
    // Preload the audio for the selected pokemon after state reset
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = randomPokemon.audio;
        audioRef.current.load();
        
        // Add event listener for when new audio loads
        const handleNewAudioLoad = () => {
          if (audioRef.current && audioRef.current.duration) {
            console.log("Play again - new audio loaded, duration:", audioRef.current.duration);
            setAudioDuration(audioRef.current.duration);
          }
          audioRef.current?.removeEventListener('loadedmetadata', handleNewAudioLoad);
        };
        audioRef.current.addEventListener('loadedmetadata', handleNewAudioLoad);
      }
    }, 0);
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
    const volumeMultiplier = currentPokemon.volumeMultiplier || 1.0;
    const volume = Math.min(1, 0.8 * volumeMultiplier); // Set to 80% volume always
    
    // Calculate how much of the audio to play based on attempt number (divide into 5 segments)
    const maxDuration = audioDuration || 30; // Fallback to 30 seconds if duration not available
    const segmentDuration = maxDuration / 5; // Divide into 5 segments
    const calculatedDuration = segmentDuration * (guessCount + 1);
    
    // For very short audio files, ensure minimum playback time
    const minPlaybackTime = Math.min(0.5, maxDuration); // At least 1 second or full duration if shorter
    const allowedDuration = Math.max(minPlaybackTime, Math.min(maxDuration, calculatedDuration));
    
    console.log(`Audio Quality Debug - guessCount: ${guessCount}, maxDuration: ${maxDuration}, segmentDuration: ${segmentDuration}, calculatedDuration: ${calculatedDuration}, allowedDuration: ${allowedDuration}`);
    
    return { volume, allowedDuration }
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
    
    if (audioRef.current) {
      // Force volume refresh before playing
      const quality = getAudioQuality();
      audioRef.current.volume = audioEnabled ? quality.volume : 0;
      
      // Ensure audio is loaded before trying to play
      if (audioRef.current.readyState < 2) {
        console.log("Audio not ready, waiting for load...");
        // Audio not ready, wait for it to load
        const waitForLoad = () => {
          return new Promise<void>((resolve) => {
            const checkReady = () => {
              if (audioRef.current && audioRef.current.readyState >= 2) {
                if (audioRef.current.duration && audioDuration === 0) {
                  console.log("Setting audio duration from playAudio:", audioRef.current.duration);
                  setAudioDuration(audioRef.current.duration);
                }
                // Force volume set again after audio is ready
                audioRef.current.volume = audioEnabled ? getAudioQuality().volume : 0;
                resolve();
              } else {
                setTimeout(checkReady, 100);
              }
            };
            checkReady();
          });
        };
        
        await waitForLoad();
      }

      console.log("Playing audio with quality:", quality);

      if (audioRef.current.paused) {
        // Set up event listener to stop audio at the allowed duration
        const handleTimeUpdate = () => {
          if (audioRef.current && audioRef.current.currentTime >= quality.allowedDuration) {
            console.log(`Stopping audio at ${audioRef.current.currentTime}s (limit: ${quality.allowedDuration}s)`);
            audioRef.current.pause();
            audioRef.current.currentTime = 0; // Reset to beginning
            audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          }
        };

        audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.currentTime = 0; // Always start from beginning

        try {
          console.log("Starting audio playback...");
          await audioRef.current.play();
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error("Audio playback failed:", error);
          }
        }
      } else {
        console.log("Pausing audio");
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset to beginning when paused
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

        {/* WinRAR Popup */}
        {showWinRARPopup && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-96">
              <div className="bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between">
                <span className="text-sm font-bold">WinRAR</span>
                <button
                  onClick={() => setShowWinRARPopup(false)}
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
                    onClick={() => setShowWinRARPopup(false)}
                    className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-1 text-sm hover:bg-[#d0d0d0]"
                  >
                    Buy license
                  </button>
                  <button
                    onClick={() => setShowWinRARPopup(false)}
                    className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-1 text-sm hover:bg-[#d0d0d0]"
                  >
                    Close
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
                  <div className="relative" style={{ width: '256px', height: '256px' }}>
                    {/* Hidden image for loading */}
                    <img
                      ref={imageRef}
                      src={currentPokemon.image || "/placeholder.svg"}
                      alt="Mystery Image"
                      style={{ display: 'none' }}
                      onLoad={applyPixelationEffect}
                      crossOrigin="anonymous"
                    />
                    {/* Canvas for pixelated display */}
                    <canvas
                      ref={canvasRef}
                      width={256}
                      height={256}
                      style={{
                        width: '256px',
                        height: '256px',
                        imageRendering: 'pixelated',
                      }}
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
                          <span className="text-xs">(Playing: {getAudioQuality().allowedDuration.toFixed(1)}s of {audioDuration > 0 ? audioDuration.toFixed(1) : "?.?"}s)</span>
                        </div>
                      ) : (
                        <div>Click play to hear audio hint</div>
                      )}
                    </div>
                    <div className="text-green-400 text-xs">Volume: {Math.round(getAudioQuality().volume * 100)}% | Duration: {getAudioQuality().allowedDuration.toFixed(1)}s / {audioDuration > 0 ? audioDuration.toFixed(1) : "?.?"}s</div>
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


                  {/* NEW WINDOWS 95 AD GOES HERE */}
<div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
  <div className="bg-gradient-to-r from-[#008080] to-[#004040] text-white px-2 py-1 mb-2">
    <span className="text-xs font-bold">💾 UPGRADE NOW!</span>
  </div>
  <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 flex gap-2 items-center">
    <img 
      src="/images/windows95.jpg" 
      alt="Windows 95 Box Art"
      className="w-20 h-20"
      onError={(e) => { e.currentTarget.src = 'https://placehold.co/80x80/000000/FFFFFF?text=Win95'; }}
    />
    <div className="text-xs text-black text-left flex-1">
      <div className="font-bold">Windows 95</div>
      <div>Purchase a physical copy of the brand new Windows 95, and experience the future!</div>
      <div className="font-bold mt-1">Only $89.99!</div>
      <button className="bg-blue-600 text-white px-2 py-1 text-xs mt-2 border border-black hover:bg-blue-700">
        ORDER NOW
      </button>
    </div>
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
