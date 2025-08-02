"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Volume2, VolumeX, Minimize2, X, Square, Play, Pause } from "lucide-react"

// Mock Pokémon dataset with audio simulation
const pokemonData = [
  {
    id: 25,
    name: "Pikachu",
    image: "/placeholder.svg?height=128&width=128&text=Pikachu",
    cry: "Pika pika chu!",
    generation: 1,
    type: "Electric",
  },
  {
    id: 6,
    name: "Charizard",
    image: "/placeholder.svg?height=128&width=128&text=Charizard",
    cry: "Char char izard!",
    generation: 1,
    type: "Fire/Flying",
  },
  {
    id: 9,
    name: "Blastoise",
    image: "/placeholder.svg?height=128&width=128&text=Blastoise",
    cry: "Blas blas toise!",
    generation: 1,
    type: "Water",
  },
  {
    id: 3,
    name: "Venusaur",
    image: "/placeholder.svg?height=128&width=128&text=Venusaur",
    cry: "Venus venus aur!",
    generation: 1,
    type: "Grass/Poison",
  },
  {
    id: 150,
    name: "Mewtwo",
    image: "/placeholder.svg?height=128&width=128&text=Mewtwo",
    cry: "Mew mew two!",
    generation: 1,
    type: "Psychic",
  },
  {
    id: 144,
    name: "Articuno",
    image: "/placeholder.svg?height=128&width=128&text=Articuno",
    cry: "Arti arti cuno!",
    generation: 1,
    type: "Ice/Flying",
  },
]

export default function PokemonCoopGame() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "finished">("menu")
  const [currentPokemon, setCurrentPokemon] = useState(pokemonData[0])
  const [guesses, setGuesses] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState("")
  const [guessCount, setGuessCount] = useState(0)
  const [showWinRARPopup, setShowWinRARPopup] = useState(false)
  const [showAdPopup, setShowAdPopup] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  const maxGuesses = 5
  const qualityLevels = [16, 32, 64, 96, 128]

  useEffect(() => {
    // Show WinRAR popup after 5 seconds
    const winrarTimer = setTimeout(() => {
      setShowWinRARPopup(true)
    }, 5000)

    // Show ad popup after 15 seconds
    const adTimer = setTimeout(() => {
      setShowAdPopup(true)
    }, 15000)

    return () => {
      clearTimeout(winrarTimer)
      clearTimeout(adTimer)
    }
  }, [])

  const startGame = () => {
    const randomPokemon = pokemonData[Math.floor(Math.random() * pokemonData.length)]
    setCurrentPokemon(randomPokemon)
    setGameState("playing")
    setGuesses([])
    setGuessCount(0)
    setCurrentGuess("")
  }

  const makeGuess = () => {
    if (!currentGuess.trim()) return

    const newGuesses = [...guesses, currentGuess]
    setGuesses(newGuesses)
    setGuessCount(guessCount + 1)

    if (currentGuess.toLowerCase() === currentPokemon.name.toLowerCase()) {
      setGameState("finished")
    } else if (guessCount + 1 >= maxGuesses) {
      setGameState("finished")
    }

    setCurrentGuess("")
  }

  const resetGame = () => {
    setGameState("menu")
    setGuesses([])
    setGuessCount(0)
    setCurrentGuess("")
    setAudioPlaying(false)
  }

  const getCurrentImageQuality = () => {
    const level = Math.min(guessCount, qualityLevels.length - 1)
    return qualityLevels[level]
  }

  const getImageFilter = () => {
    const pixelSize = Math.max(1, 6 - guessCount)
    const blur = Math.max(0, 10 - guessCount * 2)
    const contrast = Math.min(100, 30 + guessCount * 15)
    const brightness = Math.min(100, 40 + guessCount * 12)
    return `blur(${blur}px) contrast(${contrast}%) brightness(${brightness}%) saturate(${50 + guessCount * 10}%)`
  }

  const getAudioQuality = () => {
    // Simulate audio quality improvement
    const volume = Math.min(1, 0.3 + guessCount * 0.15)
    const clarity = guessCount + 1
    return { volume, clarity }
  }

  const playAudio = () => {
    setAudioPlaying(!audioPlaying)
    // In a real implementation, this would play actual audio files
    // For demo purposes, we'll just show the cry text with effects
  }

  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-[#c0c0c0] p-4 font-mono relative">
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
              <span className="text-sm font-bold">🕹️ Pokémon Co-op Guesser v2.1 - SHAREWARE</span>
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
                <h1 className="text-3xl font-bold mb-2">🎮 POKÉMON CO-OP GUESSER</h1>
                <div className="text-sm text-gray-600 mb-4">Authentic Windows 95 Gaming Experience™</div>
              </div>

              <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-4 mb-6">
                <h2 className="font-bold mb-3 flex items-center">📋 HOW TO PLAY:</h2>
                <ul className="text-sm space-y-2">
                  <li>• Both players see the same pixelated Pokémon image</li>
                  <li>• Both players hear the same low-quality Pokémon cry</li>
                  <li>• Work together to guess the Pokémon name!</li>
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
                <div className="text-xs text-gray-600 mt-2">Click to start your Pokémon adventure!</div>
              </div>

              {/* System Info */}
              <div className="mt-6 bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-3">
                <div className="text-xs font-mono">
                  <div>System: Windows 95 Compatible</div>
                  <div>Memory: 640KB Available</div>
                  <div>Sound: SoundBlaster 16 Compatible</div>
                  <div>Graphics: SVGA Required</div>
                  <div>Pokémon Database: {pokemonData.length} entries loaded</div>
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
              <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
                <div className="bg-gradient-to-r from-[#008080] to-[#004040] text-white px-2 py-1 mb-2">
                  <span className="text-xs font-bold">📊 GAME STATS</span>
                </div>
                <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2">
                  <div className="text-xs font-mono">
                    <div>Games Played: 0</div>
                    <div>Best Score: ---</div>
                    <div>Success Rate: ---%</div>
                    <div>Favorite Gen: ---</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WinRAR Popup */}
        {showWinRARPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

        {/* Ad Popup */}
        {showAdPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-80">
              <div className="bg-gradient-to-r from-[#ff0000] to-[#800000] text-white px-2 py-1 flex items-center justify-between">
                <span className="text-sm font-bold">🎯 SPECIAL OFFER!</span>
                <button
                  onClick={() => setShowAdPopup(false)}
                  className="w-4 h-4 bg-[#c0c0c0] border border-black text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
                >
                  <X className="w-2 h-2" />
                </button>
              </div>
              <div className="p-4 text-center">
                <div className="bg-yellow-300 border-2 border-black p-3 mb-3">
                  <div className="text-lg font-bold">FREE CD-ROM!</div>
                  <div className="text-sm">1000+ Games Collection</div>
                  <div className="text-xs">Just pay $4.99 shipping</div>
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setShowAdPopup(false)}
                    className="bg-green-500 text-white border-2 border-black px-3 py-1 text-sm hover:bg-green-600"
                  >
                    YES! Send me CD
                  </button>
                  <button
                    onClick={() => setShowAdPopup(false)}
                    className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-sm hover:bg-[#d0d0d0]"
                  >
                    No thanks
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
    <div className="min-h-screen bg-[#c0c0c0] p-4 font-mono">
      <div className="mx-auto max-w-6xl">
        {/* Title Bar */}
        <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] mb-4">
          <div className="bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between">
            <span className="text-sm font-bold">🕹️ Pokémon Co-op Guesser - GAME IN PROGRESS</span>
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
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4">
              <div className="bg-gradient-to-r from-[#008080] to-[#004040] text-white px-2 py-1 mb-4">
                <span className="text-sm font-bold">🎯 MYSTERY POKÉMON</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Display */}
                <div className="bg-black border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-4 text-center">
                  <div className="text-green-400 text-xs mb-2">📺 IMAGE DISPLAY</div>
                  <div className="relative inline-block">
                    <img
                      src={currentPokemon.image || "/placeholder.svg"}
                      alt="Mystery Pokémon"
                      className="pixelated mx-auto"
                      style={{
                        width: `${getCurrentImageQuality()}px`,
                        height: `${getCurrentImageQuality()}px`,
                        filter: getImageFilter(),
                        imageRendering: "pixelated",
                      }}
                    />
                  </div>
                  <div className="text-green-400 text-xs mt-2">
                    Resolution: {getCurrentImageQuality()}x{getCurrentImageQuality()}px
                  </div>
                  <div className="text-green-400 text-xs">Quality: {Math.round((guessCount + 1) * 20)}%</div>
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
                        onClick={() => setAudioEnabled(!audioEnabled)}
                        className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2 hover:bg-[#d0d0d0]"
                      >
                        {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-green-400 text-sm">
                      {audioPlaying ? (
                        <div className="animate-pulse">
                          🎵 "{currentPokemon.cry}"
                          <br />
                          <span className="text-xs">(Quality: {getAudioQuality().clarity}/5)</span>
                        </div>
                      ) : (
                        <div>Click play to hear cry</div>
                      )}
                    </div>
                    <div className="text-green-400 text-xs">Bitrate: {8 + guessCount * 16}kbps</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guess Input */}
            {gameState === "playing" && (
              <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4">
                <div className="bg-gradient-to-r from-[#800080] to-[#400040] text-white px-2 py-1 mb-4">
                  <span className="text-sm font-bold">💭 MAKE YOUR GUESS</span>
                </div>
                <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-3">
                  <div className="flex gap-2">
                    <Input
                      value={currentGuess}
                      onChange={(e) => setCurrentGuess(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && makeGuess()}
                      placeholder="Enter Pokémon name..."
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
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4">
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
                    <div className="text-xs text-gray-500 mt-2">
                      Generation: {currentPokemon.generation} | Type: {currentPokemon.type}
                    </div>
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
                      onClick={resetGame}
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
              <div className="bg-black border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-3 h-48 overflow-y-auto">
                <div className="text-green-400 font-mono text-xs">
                  <div>C:\POKEMON\GUESSER&gt; start_game.exe</div>
                  <div>Loading Pokémon database...</div>
                  <div>
                    Selected: #{currentPokemon.id} (Gen {currentPokemon.generation})
                  </div>
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
