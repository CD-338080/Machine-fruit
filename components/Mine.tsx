// components/Mine.tsx

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

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { calculateMineUpgradeCost, useGameStore } from '@/utils/game-mechanics';
import { formatNumber, triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';
import MineIcon from '@/icons/Mine';

interface MineProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function Mine({ currentView, setCurrentView }: MineProps) {
  const showToast = useToast();

  const handleViewChange = (view: string) => {
    console.log('Attempting to change view to:', view);
    if (typeof setCurrentView === 'function') {
      try {
        triggerHapticFeedback(window);
        setCurrentView(view);
        console.log('View change successful');
      } catch (error) {
        console.error('Error occurred while changing view:', error);
      }
    } else {
      console.error('setCurrentView is not a function:', setCurrentView);
    }
  };

  const {
    userTelegramInitData,
    pointsBalance,
    mineLevelIndex,
    profitPerHour,
    upgradeMineLevelIndex
  } = useGameStore();

  const [isMineUpgradeAffordable, setIsMineUpgradeAffordable] = useState(false);
  const [isLoadingMineUpgrade, setIsLoadingMineUpgrade] = useState(false);
  const [mineProfit, setMineProfit] = useState(0);
  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null);
  const [availableProfit, setAvailableProfit] = useState(0);
  const [isLoadingClaim, setIsLoadingClaim] = useState(false);

  const handleMineUpgrade = async () => {
    if (isMineUpgradeAffordable && !isLoadingMineUpgrade) {
      setIsLoadingMineUpgrade(true);
      try {
        triggerHapticFeedback(window);
        const response = await fetch('/api/upgrade/mine', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: userTelegramInitData,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to upgrade mine');
        }

        const result = await response.json();

        console.log("Result from server:", result);

        // Update local state with the new values
        upgradeMineLevelIndex();

        showToast('Mine Upgrade Successful!', 'success');
      } catch (error) {
        console.error('Error upgrading mine:', error);
        showToast('Failed to upgrade mine. Please try again.', 'error');
      } finally {
        setIsLoadingMineUpgrade(false);
      }
    }
  };

  const handleClaimMineProfit = async () => {
    if (availableProfit > 0 && !isLoadingClaim) {
      setIsLoadingClaim(true);
      try {
        triggerHapticFeedback(window);
        const response = await fetch('/api/claim-mine-profit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: userTelegramInitData,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to claim mine profit');
        }

        const result = await response.json();

        console.log("Result from server:", result);

        // Update local state with the new values
        setLastClaimTime(Date.now());
        setAvailableProfit(0);

        showToast(`Claimed ${formatNumber(availableProfit)} USDT!`, 'success');
      } catch (error) {
        console.error('Error claiming mine profit:', error);
        showToast('Failed to claim mine profit. Please try again.', 'error');
      } finally {
        setIsLoadingClaim(false);
      }
    }
  };

  const fetchMineData = useCallback(async () => {
    try {
      const response = await fetch('/api/mine-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: userTelegramInitData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch mine data');
      }

      const result = await response.json();

      console.log("Mine data from server:", result);

      if (result.lastClaimTime) {
        setLastClaimTime(result.lastClaimTime);
      }

      if (result.availableProfit !== undefined) {
        setAvailableProfit(result.availableProfit);
      }

    } catch (error) {
      console.error('Error fetching mine data:', error);
    }
  }, [userTelegramInitData]);

  useEffect(() => {
    if (userTelegramInitData) {
      fetchMineData();
    }
  }, [userTelegramInitData, fetchMineData]);

  useEffect(() => {
    const isAffordable = calculateMineUpgradeCost(mineLevelIndex) <= pointsBalance;
    setIsMineUpgradeAffordable(isAffordable);
  }, [pointsBalance, mineLevelIndex]);

  useEffect(() => {
    setMineProfit(profitPerHour);
  }, [profitPerHour]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastClaimTime && mineProfit > 0) {
        const now = Date.now();
        const elapsedHours = (now - lastClaimTime) / 3600000; // Convert ms to hours
        const newProfit = Math.min(mineProfit * elapsedHours, mineProfit * 24); // Cap at 24 hours
        setAvailableProfit(newProfit);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastClaimTime, mineProfit]);

  return (
    <div className="bg-gradient-to-b from-[#2a9d8f] to-[#3eb489] flex justify-center min-h-screen">
      <div className="w-full text-white font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="mt-[2px] bg-gradient-to-b from-[#2a9d8f] to-[#3eb489] rounded-t-[46px] h-full overflow-y-auto no-scrollbar">
            <div className="px-4 pt-1 pb-24">
              <div className="px-4 mt-4 flex justify-center">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl flex items-center space-x-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-[#2a9d8f] text-2xl font-black">₮</span>
                  </div>
                  <p className="text-4xl text-white" suppressHydrationWarning>{Math.floor(pointsBalance).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center justify-center mb-4">
                  <MineIcon size={48} className="text-[#f3ba2f]" />
                </div>
                <h2 className="text-2xl text-center mb-4">USDT Mine</h2>
                <p className="text-center text-gray-300 mb-6">Earn USDT even when you&apos;re offline!</p>

                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span>Mine Level:</span>
                    <span>{mineLevelIndex + 1}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Hourly Profit:</span>
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-1">
                        <span className="text-[#2a9d8f] text-xs font-black">₮</span>
                      </div>
                      <span>{formatNumber(mineProfit)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Daily Profit:</span>
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-1">
                        <span className="text-[#2a9d8f] text-xs font-black">₮</span>
                      </div>
                      <span>{formatNumber(mineProfit * 24)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span>Available to claim:</span>
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-1">
                        <span className="text-[#2a9d8f] text-xs font-black">₮</span>
                      </div>
                      <span>{formatNumber(availableProfit)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleClaimMineProfit}
                    disabled={availableProfit <= 0 || isLoadingClaim}
                    className={`w-full py-3 mt-2 rounded-lg font-bold ${
                      availableProfit > 0
                        ? 'bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] text-[#0a1f17] hover:from-[#f3ba2f] hover:to-[#f0b90b]'
                        : 'bg-gray-600 text-gray-400'
                    } transition-all duration-300`}
                  >
                    {isLoadingClaim ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0a1f17] mx-auto"></div>
                    ) : (
                      'Claim Profit'
                    )}
                  </button>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>Upgrade Cost:</span>
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-1">
                        <span className="text-[#2a9d8f] text-xs font-black">₮</span>
                      </div>
                      <span>{formatNumber(calculateMineUpgradeCost(mineLevelIndex))}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span>New Hourly Profit:</span>
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-1">
                        <span className="text-[#2a9d8f] text-xs font-black">₮</span>
                      </div>
                      <span>{formatNumber(mineProfit * 1.5)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleMineUpgrade}
                    disabled={!isMineUpgradeAffordable || isLoadingMineUpgrade}
                    className={`w-full py-3 rounded-lg font-bold ${
                      isMineUpgradeAffordable
                        ? 'bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] text-[#0a1f17] hover:from-[#f3ba2f] hover:to-[#f0b90b]'
                        : 'bg-gray-600 text-gray-400'
                    } transition-all duration-300`}
                  >
                    {isLoadingMineUpgrade ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0a1f17] mx-auto"></div>
                    ) : (
                      'Upgrade Mine'
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => handleViewChange('game')}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full flex items-center space-x-2 hover:bg-white/20 transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  <span>Back to Game</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}