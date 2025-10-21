// components/Friends.tsx

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

import React, { useState, useCallback, useEffect } from 'react';
import Image, { StaticImageData } from 'next/image';
import IceCubes from '@/icons/IceCubes';
import { useGameStore } from '@/utils/game-mechanics';
import { baseGift, bigGift } from '@/images';
import IceCube from '@/icons/IceCube';
import { formatNumber, triggerHapticFeedback } from '@/utils/ui';
import { REFERRAL_BONUS_BASE, REFERRAL_BONUS_PREMIUM, LEVELS } from '@/utils/consts';
import { getUserTelegramId } from '@/utils/user';
import Copy from '@/icons/Copy';
import { useToast } from '@/contexts/ToastContext';
import { initUtils } from '@telegram-apps/sdk';

interface Referral {
  id: string;
  telegramId: string;
  name: string | null;
  points: number;
  referralPointsEarned: number;
  levelName: string;
  levelImage: StaticImageData;
}

export default function Friends() {
  const showToast = useToast();

  const { userTelegramInitData } = useGameStore();
  const [copyButtonText, setCopyButtonText] = useState("Copy");
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState("Invite a friend");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);
  const [showBonusesList, setShowBonusesList] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShowBonusesList = useCallback(() => {
    triggerHapticFeedback(window);
    setShowBonusesList(prevState => !prevState);
  }, []);

  const fetchReferrals = useCallback(async () => {
    setIsLoadingReferrals(true);
    try {
      const response = await fetch(`/api/user/referrals?initData=${encodeURIComponent(userTelegramInitData)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }
      const data = await response.json();
      setReferrals(data.referrals);
      setReferralCount(data.referralCount);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      showToast('Failed to fetch referrals. Please try again later.', 'error');
    } finally {
      setIsLoadingReferrals(false);
    }
  }, [userTelegramInitData, showToast]);

  const handleFetchReferrals = useCallback(() => {
    triggerHapticFeedback(window);
    fetchReferrals();
  }, [fetchReferrals]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleCopyInviteLink = useCallback(() => {
    triggerHapticFeedback(window);
    navigator.clipboard
      .writeText(process.env.NEXT_PUBLIC_BOT_USERNAME ? `https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}/${process.env.NEXT_PUBLIC_APP_URL_SHORT_NAME}?startapp=kentId${getUserTelegramId(userTelegramInitData) || ""}` : "https://t.me/clicker_game_news")
      .then(() => {
        setCopyButtonText("Copied!");
        showToast("Invite link copied to clipboard!", 'success');

        setTimeout(() => {
          setCopyButtonText("Copy");
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        showToast("Failed to copy link. Please try again.", 'error');
      });
  }, [userTelegramInitData, showToast]);

  const handleInviteFriend = useCallback(() => {
    triggerHapticFeedback(window);
    setShowShareModal(true);
  }, []);

  // Links de compartir
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME;
  const userTelegramId = getUserTelegramId(userTelegramInitData);
  const inviteLink = botUsername
    ? `https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}/${process.env.NEXT_PUBLIC_APP_URL_SHORT_NAME}?startapp=kentId${userTelegramId || ""}`
    : "https://t.me/clicker_game_news";
  const shareText = `Join me in ROLL DICE USDT: Tap, Earn, and Win! \n Let's play and earn together!`;

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + inviteLink)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(inviteLink)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="bg-gradient-to-b from-[#2a9d8f] to-[#3eb489] flex justify-center min-h-screen">
      <div className="w-full text-white font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="mt-[2px] bg-gradient-to-b from-[#2a9d8f] to-[#3eb489] rounded-t-[46px] h-full overflow-y-auto no-scrollbar">
            <div className="px-4 pt-1 pb-36">
              <div className="relative">
                <h1 className="text-2xl text-center mt-4 mb-2">Invite Friends!</h1>
                <p className="text-center text-gray-300 mb-8">You and your friend will receive bonuses</p>

                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center">
                      <Image src={baseGift} alt="Gift" width={40} height={40} />
                      <div className="flex flex-col ml-2">
                        <span className="font-medium">Invite a friend</span>
                        <div className="flex items-center">
                          <IceCube className="w-6 h-6" />
                          <span className="ml-1 text-white"><span className="text-[#f3ba2f]">+{formatNumber(REFERRAL_BONUS_BASE)}</span> for you and your friend</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center">
                      <Image src={bigGift} alt="Premium Gift" width={40} height={40} />
                      <div className="flex flex-col ml-2">
                        <span className="font-medium">Invite a friend with Telegram Premium</span>
                        <div className="flex items-center">
                          <IceCube className="w-6 h-6" />
                          <span className="ml-1 text-white"><span className="text-[#f3ba2f]">+{formatNumber(REFERRAL_BONUS_PREMIUM)}</span> for you and your friend</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleShowBonusesList}
                  className="block w-full mt-4 text-center text-[#f3ba2f]"
                >
                  {showBonusesList ? "Hide" : "More bonuses"}
                </button>

                {showBonusesList && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-2xl text-white text-left font-bold mb-4">Bonus for leveling up</h3>
                    <div className="flex justify-between text-gray-300 px-4 mb-2">
                      <div className="flex items-center flex-1">
                        <span>Level</span>
                      </div>
                      <div className="flex items-center justify-between flex-1">
                        <span>For friend</span>
                        <span>Premium</span>
                      </div>
                    </div>
                    {LEVELS.slice(1).map((level, index) => (
                      <div key={index} className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center flex-1">
                          <Image src={level.smallImage} alt={level.name} width={40} height={40} className="rounded-lg mr-2" />
                          <span className="font-medium text-white">{level.name}</span>
                        </div>
                        <div className="flex items-center justify-between flex-1">
                          <div className="flex items-center mr-4">
                            <IceCube className="w-4 h-4 mr-1" />
                            <span className="text-[#f3ba2f]">+{formatNumber(level.friendBonus)}</span>
                          </div>
                          <div className="flex items-center">
                            <IceCube className="w-4 h-4 mr-1" />
                            <span className="text-[#f3ba2f]">+{formatNumber(level.friendBonusPremium)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg">List of your friends ({referralCount})</h2>
                    <svg
                      className="w-6 h-6 text-gray-300 cursor-pointer"
                      onClick={handleFetchReferrals}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div className="mt-4 space-y-2">
                    {isLoadingReferrals ? (
                      // Skeleton loading animation
                      <div className="space-y-2 animate-pulse">
                        {[...Array(3)].map((_, index) => (
                          <div key={index} className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-700 rounded w-24"></div>
                                <div className="h-3 bg-gray-700 rounded w-20"></div>
                              </div>
                            </div>
                            <div className="h-4 bg-gray-700 rounded w-16"></div>
                          </div>
                        ))}
                      </div>
                    ) : referrals.length > 0 ? (
                      <ul className="space-y-2">
                        {referrals.map((referral: Referral) => (
                          <li key={referral.id} className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <Image src={referral.levelImage} alt={referral.levelName} width={48} height={48} className="rounded-full" />
                              <div>
                                <span className="font-medium">{referral.name || `User ${referral.telegramId}`}</span>
                                <p className="text-sm text-gray-300">{referral.levelName} • {formatNumber(referral.points)} USDT</p>
                              </div>
                            </div>
                            <span className="text-[#f3ba2f]">+{formatNumber(referral.referralPointsEarned)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center text-gray-300 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        You haven&apos;t invited anyone yet
                      </div>
                    )}
                  </div>
                </div>

                <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-xl z-40 flex gap-4 px-4">
                  <button
                    className="flex-grow py-3 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] text-[#0a1f17] rounded-lg font-bold pulse-animation"
                    onClick={handleInviteFriend}
                  >
                    Invite friend
                  </button>
                  <button
                    className="w-12 h-12 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] text-[#0a1f17] rounded-lg font-bold flex items-center justify-center"
                    onClick={handleCopyInviteLink}
                  >
                    {copyButtonText === "Copied!" ? "✓" : <Copy />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE COMPARTIR */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-xl p-6 max-w-xs w-full text-center">
            <h2 className="text-lg font-bold mb-4 text-black">Share with friends</h2>
            <div className="flex justify-center gap-4 mb-4">
              <a
                href={facebookShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1877f2] hover:bg-[#145db2] text-white rounded-full p-3 transition"
                title="Share on Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
              </a>
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1da851] text-white rounded-full p-3 transition"
                title="Share on WhatsApp"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.363.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M20.52 3.48A11.934 11.934 0 0 0 12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.164 1.6 5.96L0 24l6.26-1.6A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12 0-3.193-1.247-6.197-3.48-8.52zM12 22.08c-1.885 0-3.73-.497-5.34-1.44l-.383-.225-3.72.95.99-3.62-.25-.372C2.42 15.81 1.92 13.94 1.92 12c0-5.56 4.52-10.08 10.08-10.08 2.7 0 5.23 1.05 7.13 2.95 1.9 1.9 2.95 4.43 2.95 7.13 0 5.56-4.52 10.08-10.08 10.08z"/></svg>
              </a>
              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-gray-800 text-white rounded-full p-3 transition"
                title="Share on X"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.162 0H1.838C.822 0 0 .822 0 1.838v20.324C0 23.178.822 24 1.838 24h20.324C23.178 24 24 23.178 24 22.162V1.838C24 .822 23.178 0 22.162 0zM19.538 8.462l-4.615 5.846 4.615 5.846h-2.308l-3.692-4.692-3.692 4.692H6.23l4.615-5.846-4.615-5.846h2.308l3.692 4.692 3.692-4.692h2.308z"/></svg>
              </a>
              <a
                href={telegramShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#229ED9] hover:bg-[#176B96] text-white rounded-full p-3 transition"
                title="Share on Telegram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.993 15.447l-.39 4.13c.56 0 .803-.24 1.093-.527l2.62-2.497 5.437 3.97c.996.55 1.71.26 1.96-.92l3.555-16.66c.323-1.497-.547-2.08-1.515-1.73L1.36 9.36c-1.46.57-1.44 1.38-.25 1.75l4.37 1.37 10.16-6.41c.48-.31.92-.14.56.2"/>
                </svg>
              </a>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="mt-2 px-4 py-2 bg-gray-200 rounded-lg text-black font-semibold hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}