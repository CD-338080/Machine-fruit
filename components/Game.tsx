// components/Game.tsx

/**
 * This project was developed by Nikandr Surkov.
 * You may not use this code if you purchased it from any source other than the official website https://nikandr.com.
 * If you purchased it from the official website, you may use it for your own projects,
 * but you may not resell it or publish it publicly.
 * 
 * Website: https://nikandr.com
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * Telegram: https://t.me/nikandr_s
 * Telegram channel for news/updates: https://t.me/clicker_game_news
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { binanceLogo, dailyCipher, dailyCombo, dailyReward, dollarCoin, lightning } from '@/images';
import IceCube from '@/icons/IceCube';
import IceCubes from '@/icons/IceCubes';
import Rocket from '@/icons/Rocket';
import Energy from '@/icons/Energy';
import Link from 'next/link';
import { useGameStore } from '@/utils/game-mechanics';
import Snowflake from '@/icons/Snowflake';
import TopInfoSection from '@/components/TopInfoSection';
import { LEVELS } from '@/utils/consts';
import { triggerHapticFeedback } from '@/utils/ui';

interface GameProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function Game({ currentView, setCurrentView }: GameProps) {
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedFruit, setSelectedFruit] = useState<number>(0);
  const [showReward, setShowReward] = useState(false);
  const [lastWin, setLastWin] = useState<{fruit: string, points: number, isLoser?: boolean} | null>(null);

  // --- Audio: WebAudio for ticks and win/lose cues ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTickAtRef = useRef<number>(0);
  const gainRef = useRef<GainNode | null>(null);

  const ensureAudio = async () => {
    if (typeof window === 'undefined') return;
    // @ts-ignore - webkit prefix for older mobile browsers
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return;
    if (!audioCtxRef.current) {
      const ctx = new Ctor();
      const gain = ctx.createGain();
      gain.gain.value = 0.06; // master volume
      gain.connect(ctx.destination);
      audioCtxRef.current = ctx;
      gainRef.current = gain;
    } else if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
  };

  const playBeep = (freq: number, durationMs: number, volume = 1) => {
    const ctx = audioCtxRef.current;
    const gainMaster = gainRef.current;
    if (!ctx || !gainMaster) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.0001; // start silent to avoid click
    osc.connect(gain);
    gain.connect(gainMaster);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18 * volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.01);
  };

  const playTick = () => {
    const now = performance.now();
    // Throttle ticks so they don't overlap too much
    if (now - lastTickAtRef.current < 45) return;
    lastTickAtRef.current = now;
    // Slight randomization for ear comfort
    const base = 900;
    const jitter = Math.random() * 60 - 30;
    playBeep(base + jitter, 40, 1);
  };

  const playWin = () => {
    // Simple ascending arpeggio
    const seq = [880, 1175, 1568];
    seq.forEach((f, i) => setTimeout(() => playBeep(f, 120, 1.2), i * 110));
  };

  const playLose = () => {
    // Falling tone
    playBeep(240, 160, 1);
    setTimeout(() => playBeep(180, 140, 1), 120);
  };

  const {
    points,
    pointsBalance,
    pointsPerClick,
    energy,
    maxEnergy,
    gameLevelIndex,
    clickTriggered,
    updateLastClickTimestamp,
  } = useGameStore();

  // Fruit data with specific point values
  const fruits = [
    { emoji: '🍒', name: 'Cherry', points: 1 },
    { emoji: '🍋', name: 'Lemon', points: 2 },
    { emoji: '🍇', name: 'Grape', points: 3 },
    { emoji: '🍎', name: 'Apple', points: 5 },
    { emoji: '🍓', name: 'Strawberry', points: 8 },
    { emoji: '🍑', name: 'Peach', points: 12 },
    { emoji: '🍉', name: 'Watermelon', points: 15 },
    { emoji: '🍍', name: 'Pineapple', points: 20 },
    { emoji: '💎', name: 'Diamond', points: 50 },
    { emoji: '💀', name: 'You Lost', points: 0, isLoser: true }
  ];

  // Weighted pick helper: make high-point fruits much rarer
  // Weights tuned so: 0 pts and 1-3 pts are common; >3 increasingly rare
  function pickTargetFruitIndexWeighted(): number {
    const weights = fruits.map((f) => {
      if (f.isLoser) return 22;           // You Lost: fairly common
      if (f.points <= 1) return 18;       // 1 pt common
      if (f.points === 2) return 14;      // 2 pts common
      if (f.points === 3) return 10;      // 3 pts common-ish
      if (f.points === 5) return 6;       // 5 pts rarer
      if (f.points === 8) return 4;       // 8 pts rare
      if (f.points === 12) return 3;      // 12 pts rarer
      if (f.points === 15) return 2;      // 15 pts very rare
      if (f.points === 20) return 1.2;    // 20 pts ultra rare
      if (f.points === 50) return 0.6;    // 50 pts jackpot rarest
      return 1;
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return i;
    }
    return fruits.length - 1;
  }

  const spinFruits = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    await ensureAudio();
    triggerHapticFeedback(window);

    // Target to land on (weighted so >3 points are rarer)
    const targetFruit = pickTargetFruitIndexWeighted();

    // Timed spin: ensure at least 5 seconds before revealing result
    const minDurationMs = 5000;
    const startTime = Date.now();

    let currentPosition = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      // Advance highlight
      currentPosition = (currentPosition + 1) % fruits.length;
      setSelectedFruit(currentPosition);
      playTick();

      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / minDurationMs);

      // Phase speed based on elapsed progress for dramatic easing
      let delay: number;
      if (progress < 0.6) {
        delay = 35;     // very fast
      } else if (progress < 0.85) {
        delay = 90;     // medium
      } else if (progress < 0.95) {
        delay = 160;    // slow
      } else {
        delay = 320;    // very slow near stop
      }

      // Only allow stopping after minimum duration and when on target (and in the slow phase)
      const canStop = elapsed >= minDurationMs && delay >= 160;
      if (canStop && currentPosition === targetFruit) {
        setIsSpinning(false);
        setSelectedFruit(targetFruit);

        const wonFruit = fruits[targetFruit];
        setLastWin({
          fruit: wonFruit.name,
          points: wonFruit.points,
          isLoser: wonFruit.isLoser,
        });

        // Reward animation
        setShowReward(true);
        setTimeout(() => setShowReward(false), 3000);

        // Add points locally via existing sync pipeline
        if (!wonFruit.isLoser) {
          playWin();
          for (let i = 0; i < wonFruit.points; i++) {
            clickTriggered();
          }
          updateLastClickTimestamp();
          console.log(`Added ${wonFruit.points} points to local state, will be synced automatically`);
        } else {
          playLose();
        }
        return; // stop ticking
      }

      // Continue spinning
      timeoutId = setTimeout(tick, delay);
    };

    // Kick off the timed loop
    timeoutId = setTimeout(tick, 0);
  };

  return (
    <div className="bg-gradient-to-b from-[#2a9d8f] to-[#3eb489] flex justify-center min-h-screen">
      <div className="w-full text-white h-screen font-bold flex flex-col max-w-xl">
        <TopInfoSection isGamePage={true} setCurrentView={setCurrentView} />

        <div className="flex-grow mt-4 bg-gradient-to-r from-[#264653] to-[#2a9d8f] rounded-t-[48px] relative top-glow z-0 shadow-lg">
          <div className="mt-[2px] bg-gradient-to-b from-[#2a9d8f] to-[#3eb489] rounded-t-[46px] h-full overflow-y-auto no-scrollbar">
            <div className="px-4 pt-1 pb-24">

              {/* Points Display */}
              <div className="px-4 mt-4 flex justify-center">
                <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl flex items-center space-x-3 shadow-inner">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-[#2a9d8f] text-2xl font-black">₮</span>
                  </div>
                  <p className="text-4xl text-white font-extrabold" suppressHydrationWarning>
                    {Math.floor(pointsBalance).toLocaleString()} USDT
                  </p>
                </div>
              </div>

              {/* Level Display */}
              <div className="flex justify-center gap-2 mt-3 bg-white/10 py-2 rounded-full px-4">
                <p className="text-white">{LEVELS[gameLevelIndex].name}</p>
                <p className="text-white/60">&#8226;</p>
                <p>{gameLevelIndex + 1} <span className="text-white/60">/ {LEVELS.length}</span></p>
              </div>

              {/* Fruit Spinner Section */}
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] bg-clip-text text-transparent">
                  🎰 Fruit Spinner
                </h2>
                
                {/* Fruit Grid */}
                <div className="grid grid-cols-5 gap-2 mb-6 p-4 bg-white/5 rounded-xl">
                  {fruits.map((fruit, index) => (
                    <div 
                      key={index}
                      className={`relative w-14 h-14 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center text-2xl transition-all duration-200 ${
                        selectedFruit === index 
                          ? 'ring-4 ring-[#f0b90b] ring-opacity-80 shadow-[#f0b90b]/50 shadow-lg scale-110 animate-pulse' 
                          : 'hover:scale-105'
                      } ${fruit.isLoser ? 'bg-red-100' : ''}`}
                    >
                      <div className="text-lg">{fruit.emoji}</div>
                      <div className={`text-xs font-bold ${fruit.isLoser ? 'text-red-600' : 'text-gray-600'}`}>
                        {fruit.points}
                      </div>
                      {selectedFruit === index && (
                        <div className={`absolute inset-0 rounded-xl ${
                          fruit.isLoser 
                            ? 'bg-gradient-to-r from-red-400/30 to-red-600/30' 
                            : 'bg-gradient-to-r from-[#f0b90b]/20 to-[#f3ba2f]/20'
                        } animate-pulse`}></div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={spinFruits}
                  disabled={isSpinning}
                  className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 flex items-center justify-center ${
                    isSpinning 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] hover:from-[#f3ba2f] hover:to-[#f0b90b] text-[#0a1f17]'
                  }`}
                >
                  {isSpinning ? '🎰 Spinning...' : '🎰 Play'}
                </button>

                {lastWin && (
                  <div className="mt-4 text-center">
                    <p className="text-lg">
                      Landed on {fruits[selectedFruit].emoji} {lastWin.fruit}! 
                    </p>
                    {lastWin.isLoser ? (
                      <p className="text-red-500 font-bold mt-2">
                        You Lost! No Points 😢
                      </p>
                    ) : (
                      <p className="text-[#f0b90b] font-bold mt-2">
                        +{lastWin.points} Points Won! 🎉
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Game Instructions */}
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] bg-clip-text text-transparent">
                  How to Play
                </h2>
                <div className="space-y-3 text-white/90">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#f0b90b] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-black text-sm font-bold">1</span>
                    </div>
                    <p>Press "🎰 Play" to spin the fruit wheel</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#f0b90b] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-black text-sm font-bold">2</span>
                    </div>
                    <p>The wheel will stop on a random fruit</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#f0b90b] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-black text-sm font-bold">3</span>
                    </div>
                    <p>Each fruit gives different points! 💎 = 50pts, 🍍 = 20pts, 💀 = You Lost!</p>
                  </div>
                </div>
              </div>

              {/* Live Payouts button - Replacing Energy Display */}
              <div className="px-4 mt-6">
                <button
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setCurrentView('airdrop');
                    localStorage.setItem('scrollToTransactions', 'true');
                  }}
                  className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#f3ba2f] rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold">Live Payouts</p>
                        <p className="text-white/60 text-sm">Check your recent transactions</p>
                      </div>
                    </div>
                    <div className="text-[#f3ba2f]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Reward Animation */}
      {showReward && lastWin && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          {lastWin.isLoser ? (
            <>
              <div className="animate-bounce text-6xl">💀</div>
              <div className="absolute text-4xl font-bold text-red-500 animate-float">
                You Lost!
              </div>
              <div className="absolute text-2xl animate-float mt-8 text-red-400">
                No Points This Time
              </div>
            </>
          ) : (
            <>
              <div className="animate-bounce text-6xl">🎉</div>
              <div className="absolute text-4xl font-bold text-[#f0b90b] animate-float">
                +{lastWin.points} Points!
              </div>
              <div className="absolute text-2xl animate-float mt-8">
                {fruits[selectedFruit].emoji} {lastWin.fruit}
              </div>
            </>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px);
            opacity: 0;
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 2s ease-out forwards;
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        .filter.drop-shadow-glow-yellow {
          filter: drop-shadow(0 0 8px rgba(243, 186, 47, 0.3));
        }
        .top-glow {
          box-shadow: 0 -10px 30px -5px rgba(243, 186, 47, 0.3);
        }
      `}</style>
    </div>
  );
}
