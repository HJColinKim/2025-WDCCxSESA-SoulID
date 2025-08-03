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

    audio: "/audio/crash3.mp3",
    crushMultiplier: 0.7, // More crushing
  },
  {
    id: 3,
    name: "mario",
    image: "/images/Mario.jpg",

    audio: "/audio/mario2.mp3",
    crushMultiplier: 0.85, // Less crushing
  },
  {
    id: 150,
    name: "sonic",
    image: "/images/Sonic_black.png",

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
  // Add new state for controlling click and error sounds
  const [clickSoundsEnabled, setClickSoundsEnabled] = useState(true)
  const [errorSoundsEnabled, setErrorSoundsEnabled] = useState(true)
  // Add difficulty state
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "disabled">("medium")
  // Add chat-related state
  const [showChatPopup, setShowChatPopup] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ text: string, sender: 'user' | 'character' }>>([])
  const [chatInput, setChatInput] = useState("")
  const audioRef = useRef<HTMLAudioElement>(null)
  const guessCountRef = useRef(0);
  const gameLogRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isFirstGame, setIsFirstGame] = useState(true);
  const [usedPokemonIds, setUsedPokemonIds] = useState<number[]>([]);

  // Add game statistics state
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [gamesWon, setGamesWon] = useState(0);

  const { showAdPopup } = useAdManager();
  const { closeAllAds, togglePopupGeneration, popupsEnabled } = useAdManager();

  const clickAudioRef = useRef<HTMLAudioElement>(null);
  const errorAudioRef = useRef<HTMLAudioElement>(null);

  const maxGuesses = 5
  const qualityLevels = [16, 32, 64, 96, 128]

  // Play click sound
  const playClickSound = () => {
    if (clickAudioRef.current && clickSoundsEnabled) {
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
    if (errorAudioRef.current && errorSoundsEnabled) {
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
  }, [clickSoundsEnabled]); // Add clickSoundsEnabled to dependencies so the handler updates when the setting changes

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
    // Only set up the timer if popups are not disabled
    if (difficulty === "disabled" || !popupsEnabled) {
      return; // Don't create any timer
    }

    // Get popup interval based on difficulty
    const getPopupInterval = () => {
      switch (difficulty) {
        case "easy": return 10000; // 10 seconds
        case "medium": return 5000; // 5 seconds  
        case "hard": return 1000; // 1 second
        default: return 5000;
      }
    };

    const adTimer = setInterval(() => {
      // You can call this from anywhere now!
      showAdPopup();   //Disable this line for accessibility mode 
      if (errorSoundsEnabled) {
        playErrorSound(); // Play error sound when a popup is shown only if enabled
      }
    }, getPopupInterval()); // Use difficulty-based interval

    return () => {
      clearInterval(adTimer);
    };
  }, [showAdPopup, difficulty, errorSoundsEnabled, popupsEnabled]); // Add popupsEnabled to dependencies

  const startGame = () => {
    playClickSound();
    let availablePokemon = pokemonData;

    // Filter out used pokemon if we haven't used all of them yet
    if (usedPokemonIds.length < pokemonData.length) {
      availablePokemon = pokemonData.filter(pokemon => !usedPokemonIds.includes(pokemon.id));
    } else {
      // Reset the used list if all have been used
      setUsedPokemonIds([]);
    }

    // If it's the first game, exclude halo from available options
    if (isFirstGame) {
      availablePokemon = availablePokemon.filter(pokemon => pokemon.name !== "halo");
      setIsFirstGame(false);
    }

    const randomPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];

    // Add the selected pokemon to the used list
    setUsedPokemonIds(prev => [...prev, randomPokemon.id]);

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
      // Update statistics for a win
      const finalGuessCount = guessCount + 1;
      setGamesPlayed(prev => prev + 1);
      setGamesWon(prev => prev + 1);
      // Update best score (lower is better)
      setBestScore(prev => prev === null ? finalGuessCount : Math.min(prev, finalGuessCount));
    } else {
      // Play error sound for wrong guess
      playErrorSound();
      if (guessCount + 1 >= maxGuesses) {
        setGameState("finished")
        // Update statistics for a loss
        setGamesPlayed(prev => prev + 1);
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
    let availablePokemon = pokemonData;

    // Filter out used pokemon if we haven't used all of them yet
    if (usedPokemonIds.length < pokemonData.length) {
      availablePokemon = pokemonData.filter(pokemon => !usedPokemonIds.includes(pokemon.id));
    } else {
      // Reset the used list if all have been used
      setUsedPokemonIds([]);
    }

    const randomPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];

    // Add the selected pokemon to the used list
    setUsedPokemonIds(prev => [...prev, randomPokemon.id]);

    // Reset audio state first
    setAudioPlaying(false)
    setAudioDuration(0)
    // Reset chat state
    setShowChatPopup(false)
    setChatMessages([])
    setChatInput("")

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

    // Start at 60% quality and increase with each guess.
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
    const minPlaybackTime = Math.min(0.2, maxDuration); // At least 1 second or full duration if shorter
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

  // Add character responses
  const getCharacterResponses = (characterName: string) => {
    const responses: { [key: string]: string[] } = {
      "mortal kombat": [
        "GET OVER HERE!",
        "Finish him!",
        "Fatality!",
        "Welcome to the tournament, warrior.",
        "Your soul is mine!",
        "Test your might!"
      ],
      "pacman": [
        "Waka waka waka!",
        "Those ghosts never give up!",
        "Power pellets are my favorite snack!",
        "I've been eating dots since 1980!",
        "Blinky, Pinky, Inky, and Sue are such troublemakers!",
        "Want to help me clear the maze?"
      ],
      "crash bandicoot": [
        "Woah!",
        "Somebody say fruit?",
        "Spin to win, baby!",
        "Dr. Cortex is up to no good again!",
        "Aku Aku protects me on my adventures!",
        "Time to crash the party!"
      ],
      "mario": [
        "It's-a me, Mario!",
        "Let's-a go!",
        "Mamma mia!",
        "Princess Peach is in another castle!",
        "Yahoo! Here we go!",
        "Thank you so much for playing my game!"
      ],
      "sonic": [
        "Gotta go fast!",
        "You're too slow!",
        "Juice and jam time!",
        "Way past cool!",
        "I'm the fastest thing alive!",
        "Time to juice and jam!"
      ],
      "wii sports": [
        "Nice swing!",
        "Strike!",
        "Home run!",
        "Let's play some sports!",
        "Motion controls are the future!",
        "Want to bowl a perfect game?"
      ]
    }
    return responses[characterName.toLowerCase()] || ["Hello there!", "Nice to meet you!", "Thanks for playing!"]
  }

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return

    playClickSound()
    const newMessages = [...chatMessages, { text: chatInput, sender: 'user' as const }]

    // Get a random response from the character
    const characterResponses = getCharacterResponses(currentPokemon.name)
    const randomResponse = characterResponses[Math.floor(Math.random() * characterResponses.length)]

    // Add character response after a short delay
    setTimeout(() => {
      setChatMessages(prev => [...prev, { text: randomResponse, sender: 'character' as const }])
    }, 1000)

    setChatMessages(newMessages)
    setChatInput("")
  }

  const openChat = () => {
    playClickSound()
    setShowChatPopup(true)
    // Add initial greeting
    const characterResponses = getCharacterResponses(currentPokemon.name)
    const greeting = characterResponses[0]
    setChatMessages([{ text: greeting, sender: 'character' }])
  }

  const closeChat = () => {
    playClickSound()
    setShowChatPopup(false)
    setChatMessages([])
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
                  className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-8 py-4 text-xl font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
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
                    <div>Games Played: {gamesPlayed}</div>
                    <div>Best Score: {bestScore !== null ? `${bestScore} guesses` : '---'}</div>
                    <div>Success Rate: {gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0}%</div>
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
                {/* Audio Settings */}
                <div className="mb-4">
                  <h3 className="text-sm font-bold mb-2">Audio Settings</h3>
                  <div className="border border-gray-600 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-3 bg-white">
                    <p className="text-xs mb-3">Control sound effects:</p>

                    <div className="space-y-2">
                      <button
                        className="w-full h-8 px-3 bg-[#c0c0c0] border-2 border-white border-t-white border-l-white border-r-gray-600 border-b-gray-600 hover:border-gray-600 hover:border-t-gray-600 hover:border-l-gray-600 hover:border-r-white hover:border-b-white active:border-gray-400 active:border-t-gray-400 active:border-l-gray-400 active:border-r-gray-200 active:border-b-gray-200 text-xs font-bold"
                        onClick={() => setClickSoundsEnabled(!clickSoundsEnabled)}
                      >
                        {clickSoundsEnabled ? 'Disable Click Sounds' : 'Enable Click Sounds'}
                      </button>

                      <button
                        className="w-full h-8 px-3 bg-[#c0c0c0] border-2 border-white border-t-white border-l-white border-r-gray-600 border-b-gray-600 hover:border-gray-600 hover:border-t-gray-600 hover:border-l-gray-600 hover:border-r-white hover:border-b-white active:border-gray-400 active:border-t-gray-400 active:border-l-gray-400 active:border-r-gray-200 active:border-b-gray-200 text-xs font-bold"
                        onClick={() => setErrorSoundsEnabled(!errorSoundsEnabled)}
                      >
                        {errorSoundsEnabled ? 'Disable Error Sounds' : 'Enable Error Sounds'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Difficulty Settings */}
                <div className="mb-4">
                  <h3 className="text-sm font-bold mb-2">Difficulty Settings</h3>
                  <div className="border border-gray-600 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-3 bg-white">
                    <p className="text-xs mb-3">Choose popup frequency:</p>

                    <div className="space-y-2">
                      <button
                        className={`w-full h-8 px-3 border-2 border-white border-t-white border-l-white border-r-gray-600 border-b-gray-600 hover:border-gray-600 hover:border-t-gray-600 hover:border-l-gray-600 hover:border-r-white hover:border-b-white active:border-gray-400 active:border-t-gray-400 active:border-l-gray-400 active:border-r-gray-200 active:border-b-gray-200 text-xs font-bold ${difficulty === 'easy' ? 'bg-gray-400' : 'bg-[#c0c0c0]'}`}
                        onClick={() => setDifficulty('easy')}
                      >
                        Easy (10s intervals)
                      </button>

                      <button
                        className={`w-full h-8 px-3 border-2 border-white border-t-white border-l-white border-r-gray-600 border-b-gray-600 hover:border-gray-600 hover:border-t-gray-600 hover:border-l-gray-600 hover:border-r-white hover:border-b-white active:border-gray-400 active:border-t-gray-400 active:border-l-gray-400 active:border-r-gray-200 active:border-b-gray-200 text-xs font-bold ${difficulty === 'medium' ? 'bg-gray-400' : 'bg-[#c0c0c0]'}`}
                        onClick={() => setDifficulty('medium')}
                      >
                        Medium (5s intervals)
                      </button>

                      <button
                        className={`w-full h-8 px-3 border-2 border-white border-t-white border-l-white border-r-gray-600 border-b-gray-600 hover:border-gray-600 hover:border-t-gray-600 hover:border-l-gray-600 hover:border-r-white hover:border-b-white active:border-gray-400 active:border-t-gray-400 active:border-l-gray-400 active:border-r-gray-200 active:border-b-gray-200 text-xs font-bold ${difficulty === 'hard' ? 'bg-gray-400' : 'bg-[#c0c0c0]'}`}
                        onClick={() => setDifficulty('hard')}
                      >
                        Hard (1s intervals)
                      </button>

                      <button
                        className={`w-full h-8 px-3 border-2 border-white border-t-white border-l-white border-r-gray-600 border-b-gray-600 hover:border-gray-600 hover:border-t-gray-600 hover:border-l-gray-600 hover:border-r-white hover:border-b-white active:border-gray-400 active:border-t-gray-400 active:border-l-gray-400 active:border-r-gray-200 active:border-b-gray-200 text-xs font-bold ${difficulty === 'disabled' ? 'bg-gray-400' : 'bg-[#c0c0c0]'}`}
                        onClick={() => {
                          setDifficulty('disabled');
                          closeAllAds(); // Close all existing popups when disabled is selected
                        }}
                      >
                        Disabled (No popups)
                      </button>
                    </div>
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
                <div className="bg-black border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-4 flex items-center justify-center">
                  <div className="text-center">
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
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={playAgain}
                        className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-6 py-2 hover:bg-[#d0d0d0] font-bold mr-2"
                      >
                        PLAY AGAIN
                      </button>
                      <button
                        onClick={openChat}
                        className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-6 py-2 hover:bg-[#d0d0d0] font-bold"
                      >
                        💬 AOL CHAT ROOM WITH {currentPokemon.name.toUpperCase()}
                      </button>
                    </div>
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
                <button className="bg-red-500 text-white px-2 py-1 text-xs mt-1 border border-black hover:bg-red-600" onClick={() => window.open('https://www.ebay.com/itm/145273576132?itmmeta=01K1N04S0CAH7TY3Q8JGAT7B14&hash=item21d2fadac4:g:VvAAAOSwaZNkfk2q&itmprp=enc%3AAQAKAAAA4MHg7L1Zz0LA5DYYmRTS30k5RHVYkZpzu2Uif4ROI0D44sSm8ARIUsCvRO1E5cZuZG1brFD1t6%2B8urjzybqnNO6n0ERi3Wp9v2s2oTGHGbcSS%2BU2c5XZhSL39xGJB0JpVMK4wvuPks%2FRrMvRQEY5kbLQ6Roofam9CY2kDzRuEIyAYFwkbjtRoGo9QQSsVShFQzG%2FWEhheAeiBp%2BVi%2FKCDAL9ZKSrwHlZioLYO3VBbeCmdHun%2Bqsmooc9%2BLMFNwsGUehT%2FJ4dJaEJgFQ8QLdnT8iqZsQUUE0sHiWjuXsYHo0L%7Ctkp%3ABk9SR7iQk6CNZg&var=444460969126', '_blank')}>
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
        {/* Chat Popup */}
        {showChatPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-96 h-[480px] pointer-events-auto flex flex-col">
              <div className="bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between">
                <span className="text-sm font-bold">💬 AOL CHAT ROOM WITH {currentPokemon.name.toUpperCase()}</span>
                <button
                  onClick={closeChat}
                  className="w-4 h-4 bg-[#c0c0c0] border border-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
                >
                  <X className="w-2 h-2" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col overflow-hidden">
                {/* Character Avatar */}
                <div className="flex items-center gap-3 mb-4 bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2">
                  <img
                    src={currentPokemon.image}
                    alt={currentPokemon.name}
                    className="w-12 h-12 object-cover border border-black"
                  />
                  <div>
                    <div className="font-bold text-sm">{currentPokemon.name.toUpperCase()}</div>
                    <div className="text-xs text-gray-600">Status: Online</div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 bg-black border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-3 overflow-y-auto mb-4">
                  <div className="text-green-400 font-mono text-xs space-y-2">
                    <div className="text-cyan-400">*** CHAT SESSION INITIATED ***</div>
                    {chatMessages.map((message, index) => (
                      <div key={index} className={message.sender === 'user' ? 'text-yellow-400' : 'text-green-400'}>
                        <span className="text-white">
                          {message.sender === 'user' ? 'YOU' : currentPokemon.name.toUpperCase()}:
                        </span>{' '}
                        {message.text}
                      </div>
                    ))}
                    <div className="text-cyan-400 animate-pulse">&gt; Type your message...</div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
                      placeholder="Type your message..."
                      className="flex-1 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono text-xs"
                    />
                    <button
                      onClick={handleChatSubmit}
                      className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-xs hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white font-bold"
                    >
                      SEND
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
