// components/Loading.tsx

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

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { botUrlQr, mainCharacter } from '@/images';
import IceCube from '@/icons/IceCube';
import { calculateEnergyLimit, calculateLevelIndex, calculatePointsPerClick, calculateProfitPerHour, GameState, InitialGameState, useGameStore } from '@/utils/game-mechanics';
import WebApp from '@twa-dev/sdk';
import UAParser from 'ua-parser-js';
import { ALLOW_ALL_DEVICES } from '@/utils/consts';

interface LoadingProps {
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentView: (view: string) => void;
}

export default function Loading({ setIsInitialized, setCurrentView }: LoadingProps) {
  const initializeState = useGameStore((state: GameState) => state.initializeState);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const openTimestampRef = useRef(Date.now());
  const [isAppropriateDevice, setIsAppropriateDevice] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const sendWelcomeMessage = async (telegramId: string, telegramName: string) => {
    try {
      // Only send message if we're not in development mode
      if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH !== 'true') {
        const response = await fetch('/api/send-welcome', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegramId,
            telegramName
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to send welcome message');
        }
      }
    } catch (error) {
      console.error('Error sending welcome message:', error);
      // We don't show an error to the user as this doesn't affect the main functionality
    }
  };

  const fetchOrCreateUser = useCallback(async () => {
    try {
      let initData, telegramId, username, telegramName, startParam;

      if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        WebApp.bottomBarColor = "#0A2E20";
        WebApp.headerColor = "#051510";
        WebApp.enableVerticalSwipes();
        WebApp.expand();
        initData = WebApp.initData;
        telegramId = WebApp.initDataUnsafe.user?.id.toString();
        username = WebApp.initDataUnsafe.user?.username || 'Unknown User';
        telegramName = WebApp.initDataUnsafe.user?.first_name || 'Unknown User';

        startParam = WebApp.initDataUnsafe.start_param;
      }

      const referrerTelegramId = startParam ? startParam.replace('kentId', '') : null;

      if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true') {
        initData = "temp";
        telegramId = "123456789"; // Temporary ID for testing
        telegramName = "Test User"; // Temporary name for testing
      }
      
      // Simulate loading progress
      const loadingInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 70) {
            clearInterval(loadingInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 300);
      
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramInitData: initData,
          referrerTelegramId,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch or create user');
      }
      const userData = await response.json();

      console.log("user data: ", userData);

      // Check if initData and telegramName are defined
      if (!initData) {
        throw new Error('initData is undefined');
      }
      if (!telegramName) {
        throw new Error('telegramName is undefined');
      }

      // Create the game store with fetched data
      const initialState: InitialGameState = {
        userTelegramInitData: initData,
        userTelegramName: telegramName,
        lastClickTimestamp: userData.lastPointsUpdateTimestamp,
        gameLevelIndex: calculateLevelIndex(userData.points),
        points: userData.points,
        pointsBalance: userData.pointsBalance,
        unsynchronizedPoints: 0,
        multitapLevelIndex: userData.multitapLevelIndex,
        pointsPerClick: calculatePointsPerClick(userData.multitapLevelIndex),
        energy: userData.energy,
        maxEnergy: calculateEnergyLimit(userData.energyLimitLevelIndex),
        energyRefillsLeft: userData.energyRefillsLeft,
        energyLimitLevelIndex: userData.energyLimitLevelIndex,
        lastEnergyRefillTimestamp: userData.lastEnergyRefillsTimestamp,
        mineLevelIndex: userData.mineLevelIndex,
        profitPerHour: calculateProfitPerHour(userData.mineLevelIndex),
        tonWalletAddress: userData?.tonWalletAddress,
      };

      console.log("Initial state: ", initialState);

      initializeState(initialState);

      // Send welcome message if we have the Telegram ID
      if (telegramId) {
        await sendWelcomeMessage(telegramId, telegramName);
      }
      
      // Complete the loading progress
      setLoadingProgress(100);
      
      // Set data as loaded
      setIsDataLoaded(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Handle error (e.g., show error message to user)
    }
  }, [initializeState]);

  useEffect(() => {
    const parser = new UAParser();
    const device = parser.getDevice();
    const isAppropriate = ALLOW_ALL_DEVICES || device.type === 'mobile' || device.type === 'tablet';
    setIsAppropriateDevice(isAppropriate);

    if (isAppropriate) {
      fetchOrCreateUser();
    }
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - openTimestampRef.current;
      const remainingTime = Math.max(3000 - elapsedTime, 0);

      const timer = setTimeout(() => {
        setCurrentView('game');
        setIsInitialized(true);
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [isDataLoaded, setIsInitialized, setCurrentView]);

  if (!isAppropriateDevice) {
    return (
      <div className="bg-[#1d2025] flex justify-center items-center h-screen">
        <div className="w-full max-w-xl text-white flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">Play on your mobile</h1>
          <Image
            className="bg-white p-2 rounded-xl"
            src={botUrlQr}
            alt="QR Code"
            width={200}
            height={200}
          />
          <p className="mt-4">@{process.env.NEXT_PUBLIC_BOT_USERNAME}</p>
          <p className="mt-2">Developed by Nikandr Surkov</p>
        </div>
      </div>
    );
  }

  // Using the same color palette as Game.tsx
  const primaryGreen = "#2a9d8f";
  const secondaryGreen = "#3eb489";
  const darkBlue = "#264653";
  const darkGreen = "#1a7356";
  const binanceYellow = "#f3ba2f";

  return (
    <div className="bg-gradient-to-b from-[#2a9d8f] to-[#3eb489] flex justify-center items-center h-screen overflow-hidden">
      <div className="w-full max-w-xl text-white flex flex-col items-center relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                backgroundColor: i % 3 === 0 ? primaryGreen : i % 3 === 1 ? darkGreen : binanceYellow,
                width: `${Math.random() * 50 + 10}px`,
                height: `${Math.random() * 50 + 10}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
                transform: `scale(${Math.random() * 0.5 + 0.5})`,
              }}
            />
          ))}
        </div>

        <div className="w-64 h-64 rounded-full p-4 mb-8 relative z-10">
          <div 
            className="w-full h-full rounded-full overflow-hidden relative border-4 border-white/20"
            style={{
              boxShadow: `0 0 30px ${binanceYellow}80`,
              animation: "pulse 2s infinite"
            }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-br from-[#3eb489] to-[#2a9d8f] opacity-80"
              style={{
                animation: "rotate 4s linear infinite"
              }}
            />
            <Image
              src={mainCharacter}
              alt="Main Character"
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
                transform: 'scale(1.05) translateY(10%)'
              }}
              className="filter drop-shadow-glow-yellow"
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-center relative z-10">
          <span className="text-white">USDT</span> <span className="text-[#f3ba2f]">ROLL</span> <span className="text-white">DICE</span>
        </h1>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-[#264653]/50 rounded-full mb-6 overflow-hidden relative z-10">
          <div 
            className="h-full bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] rounded-full"
            style={{ 
              width: `${loadingProgress}%`,
              transition: 'width 0.3s ease-out'
            }}
          />
        </div>

        <div className="flex items-center space-x-4 relative z-10">
          {/* USDT Coin */}
          <div className="w-10 h-10 relative">
            <div className="absolute inset-0 flex items-center justify-center animate-coin-flip">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2a9d8f] font-bold text-xs border-2 border-[#f3ba2f]">
                <span className="text-sm">₮</span>
              </div>
            </div>
          </div>
          
          {/* TRC-20 Coin */}
          <div className="w-10 h-10 relative">
            <div className="absolute inset-0 flex items-center justify-center animate-coin-flip-delay-1">
              <div className="w-10 h-10 rounded-full bg-[#f3ba2f] flex items-center justify-center text-[#264653] font-bold text-xs border-2 border-white">
                <span className="text-xs">USDT</span>
              </div>
            </div>
          </div>
          
          {/* USDT Coin */}
          <div className="w-10 h-10 relative">
            <div className="absolute inset-0 flex items-center justify-center animate-coin-flip-delay-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2a9d8f] font-bold text-xs border-2 border-[#f3ba2f]">
                <span className="text-sm">$</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 15px ${binanceYellow}40;
          }
          50% {
            box-shadow: 0 0 30px ${binanceYellow}80;
          }
          100% {
            box-shadow: 0 0 15px ${binanceYellow}40;
          }
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0.2;
          }
        }
        
        @keyframes coin-flip {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(180deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
        
        .animate-coin-flip {
          animation: coin-flip 2s infinite;
        }
        
        .animate-coin-flip-delay-1 {
          animation: coin-flip 2s infinite;
          animation-delay: 0.2s;
        }
        
        .animate-coin-flip-delay-2 {
          animation: coin-flip 2s infinite;
          animation-delay: 0.4s;
        }
        
        .filter.drop-shadow-glow-yellow {
          filter: drop-shadow(0 0 8px rgba(243, 186, 47, 0.3));
        }
      `}</style>
    </div>
  );
}