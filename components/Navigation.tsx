// components/Navigation.tsx

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

import Image, { StaticImageData } from 'next/image';
import Mine from '@/icons/Mine';
import Friends from '@/icons/Friends';
import Coins from '@/icons/Coins';
import { iceToken } from '@/images';
import IceCube from '@/icons/IceCube';
import Rocket from '@/icons/Rocket';
import { FC } from 'react';
import { IconProps } from '@/utils/types';
import { triggerHapticFeedback } from '@/utils/ui';

type NavItem = {
    name: string;
    icon?: FC<IconProps> | null;
    image?: StaticImageData | null;
    view: string;
};

const navItems: NavItem[] = [
    { name: 'Earn', icon: IceCube, view: 'game' },
    { name: 'Invest', icon: Mine, view: 'mine' },
    { name: 'Referrals', icon: Friends, view: 'friends' },
    { name: 'Get More', icon: Coins, view: 'earn' },
    { name: 'Withdrawal', image: iceToken, view: 'airdrop' },
];

interface NavigationProps {
    currentView: string;
    setCurrentView: (view: string) => void;
}

export default function Navigation({ currentView, setCurrentView }: NavigationProps) {
    console.log('Navigation props:', {
        currentView,
        setCurrentView,
        isSetCurrentViewFunction: typeof setCurrentView === 'function'
    });

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

    if (typeof setCurrentView !== 'function') {
        console.error('setCurrentView is not a function. Navigation cannot be rendered properly.');
        return null; // or return some fallback UI
    }

    return (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-xl bg-[#1a7356] flex justify-around items-center z-40 text-xs border-t border-[#2a9d8f] max-h-24">
            {navItems.map((item) => (
                <button
                    key={item.name}
                    onClick={() => handleViewChange(item.view)}
                    className="flex-1"
                >
                    <div className={`flex flex-col items-center justify-center ${
                        currentView === item.view 
                            ? 'text-white bg-[#0a1f17]' 
                            : 'text-[#a8d5cd]'
                        } h-16 m-1 p-2 rounded-2xl`}>
                        <div className="w-8 h-8 relative">
                            {item.image && (
                                <div className="w-full h-full relative">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={32}
                                        height={32}
                                    />
                                </div>
                            )}
                            {item.icon && <item.icon className={`w-full h-full ${
                                currentView === item.view 
                                    ? 'text-[#f3ba2f]' 
                                    : 'text-[#a8d5cd]'
                                }`} />}
                        </div>
                        <p className="mt-1">{item.name}</p>
                    </div>
                </button>
            ))}
        </div>
    );
}