// components/Airdrop.tsx

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

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { iceToken, paidTrophy1, tonWallet } from '@/images';
import { useTonConnectUI } from '@tonconnect/ui-react';
import Angle from '@/icons/Angle';
import Copy from '@/icons/Copy';
import Cross from '@/icons/Cross';
import Wallet from '@/icons/Wallet';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import IceCube from '@/icons/IceCube';
import { Address } from "@ton/core";
import { triggerHapticFeedback } from '@/utils/ui';
import OnchainTaskPopup from '@/components/popups/OnchainTaskPopup';
import WithdrawPopup from '@/components/popups/WithdrawPopup';
import { formatNumber } from '@/utils/ui';

interface OnchainTask {
    id: string;
    smartContractAddress: string;
    price: string;
    collectionMetadata: {
        name: string;
        description: string;
        image: string;
    };
    itemMetadata: any;
    points: number;
    isActive: boolean;
    isCompleted: boolean;
}

export default function Airdrop() {
    const [tonConnectUI] = useTonConnectUI();
    const { tonWalletAddress, setTonWalletAddress, userTelegramInitData, pointsBalance } = useGameStore();
    const [copied, setCopied] = useState(false);
    const [isProcessingWallet, setIsProcessingWallet] = useState(false);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const showToast = useToast();
    const [onchainTasks, setOnchainTasks] = useState<OnchainTask[]>([]);
    const [selectedOnchainTask, setSelectedOnchainTask] = useState<OnchainTask | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
    const [totalDistributed, setTotalDistributed] = useState(0);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [showWithdrawPopup, setShowWithdrawPopup] = useState(false);

    const MINIMUM_WITHDRAW = 250;
    const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

    // Add animation states
    const [isHoveringWithdraw, setIsHoveringWithdraw] = useState(false);
    const [pulseEffect, setPulseEffect] = useState(false);

    // Add ref for transactions section
    const transactionsRef = useRef<HTMLDivElement>(null);

    // Trigger pulse animation periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setPulseEffect(true);
            setTimeout(() => setPulseEffect(false), 1000);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchOnchainTasks();
    }, []);

    // Check if we should scroll to transactions section
    useEffect(() => {
        const shouldScrollToTransactions = localStorage.getItem('scrollToTransactions') === 'true';
        if (shouldScrollToTransactions && transactionsRef.current) {
            // Scroll to transactions section with a slight delay to ensure rendering
            setTimeout(() => {
                transactionsRef.current?.scrollIntoView({ behavior: 'smooth' });
                // Clear the flag
                localStorage.removeItem('scrollToTransactions');
            }, 500);
        }
    }, []);

    const fetchOnchainTasks = async () => {
        try {
            setIsLoadingTasks(true);
            const response = await fetch(`/api/onchain-tasks?initData=${encodeURIComponent(userTelegramInitData)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch onchain tasks');
            }
            const data = await response.json();
            setOnchainTasks(data);
        } catch (error) {
            console.error('Error fetching onchain tasks:', error);
            showToast("Failed to load onchain tasks", "error");
        } finally {
            setIsLoadingTasks(false);
        }
    };

    const handleWalletConnection = useCallback(async (address: string) => {
        setIsProcessingWallet(true);
        try {
            const success = await saveWalletAddress(address);
            if (!success) {
                if (tonConnectUI.account?.address) {
                    await tonConnectUI.disconnect();
                }
                showToast("Failed to save wallet address. Please try connecting again.", "error");
            } else {
                showToast("Wallet connected successfully!", "success");
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            showToast("An error occurred while connecting the wallet.", "error");
        } finally {
            setIsProcessingWallet(false);
            setIsConnecting(false);
        }
    }, [tonConnectUI, showToast]);

    const handleWalletDisconnection = useCallback(async () => {
        setIsProcessingWallet(true);
        try {
            await disconnectWallet();
            setTonWalletAddress(null);
            showToast("Wallet disconnected successfully!", "success");
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            showToast("An error occurred while disconnecting the wallet.", "error");
        } finally {
            setIsProcessingWallet(false);
        }
    }, [setTonWalletAddress, showToast]);

    useEffect(() => {
        const unsubscribe = tonConnectUI.onStatusChange(async (wallet) => {
            if (wallet && isConnecting) {
                await handleWalletConnection(wallet.account.address);
            } else if (!wallet && !isConnecting) {
                await handleWalletDisconnection();
            }
        });

        return () => {
            unsubscribe();
        };
    }, [tonConnectUI, handleWalletConnection, handleWalletDisconnection, isConnecting]);

    const saveWalletAddress = async (address: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/wallet/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    initData: userTelegramInitData,
                    walletAddress: address,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save wallet address');
            }

            const data = await response.json();
            setTonWalletAddress(data.walletAddress);
            return true;
        } catch (error) {
            console.error('Error saving wallet address:', error);
            return false;
        }
    };

    const disconnectWallet = async () => {
        try {
            const response = await fetch('/api/wallet/disconnect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    initData: userTelegramInitData,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to disconnect wallet');
            }
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            throw error;
        }
    };

    const handleWalletAction = async () => {
        triggerHapticFeedback(window);
        if (tonConnectUI.account?.address) {
            await tonConnectUI.disconnect();
        } else {
            setIsConnecting(true);
            await tonConnectUI.openModal();
        }
    };

    const formatAddress = (address: string) => {
        const tempAddress = Address.parse(address).toString();
        return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
    };

    const copyToClipboard = () => {
        if (tonWalletAddress) {
            triggerHapticFeedback(window);
            navigator.clipboard.writeText(tonWalletAddress);
            setCopied(true);
            showToast("Address copied to clipboard!", "success");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleOnchainTaskClick = (task: OnchainTask) => {
        if (!task.isCompleted) {
            triggerHapticFeedback(window);
            setSelectedOnchainTask(task);
        }
    };

    const handleTaskUpdate = useCallback((updatedTask: OnchainTask) => {
        setOnchainTasks(prevTasks =>
            prevTasks.map(t =>
                t.id === updatedTask.id ? updatedTask : t
            )
        );
    }, []);

    // Function to fetch transactions from USDT contract
    const fetchTransactions = async () => {
        try {
            setIsLoadingTransactions(true);
            const endpoint = `https://api.trongrid.io/v1/contracts/${USDT_CONTRACT}/events`;
            const params = {
                event_name: 'Transfer',
                limit: '15',
                order_by: 'block_timestamp,desc'
            };
            
            const response = await fetch(`${endpoint}?${new URLSearchParams(params)}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }
            
            const data = await response.json();
            
            // Process the data
            const processedTransactions = data.data.map((tx: any) => {
                const amount = parseFloat(tx.result?.value || '0') / 1_000_000; // Convert to USDT
                return {
                    txid: tx.transaction_id,
                    timestamp: tx.block_timestamp,
                    amount: amount.toFixed(2),
                    address: tx.result?.to || 'Unknown',
                    type: 'Withdrawal',
                    status: 'Completed'
                };
            }).filter((tx: any) => parseFloat(tx.amount) >= MINIMUM_WITHDRAW);
            
            // Calculate total distributed
            const total = processedTransactions.reduce((sum: number, tx: any) => 
                sum + parseFloat(tx.amount), 0);
            
            setTotalDistributed(total);
            setTransactions(processedTransactions);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            showToast("Failed to fetch transactions", "error");
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    // Handle withdraw action
    const handleWithdraw = async () => {
        if (!tonWalletAddress) {
            showToast("Please connect your wallet first", "error");
            return;
        }
        
        setIsWithdrawing(true);
        triggerHapticFeedback(window);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            showToast("Withdrawal request submitted successfully!", "success");
            
            // Add a new transaction to the list
            const newTx = {
                txid: `${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
                timestamp: Date.now(),
                amount: (Math.random() * 200 + 50).toFixed(2),
                address: tonWalletAddress,
                type: 'Withdrawal',
                status: 'Processing'
            };
            
            setTransactions(prev => [newTx, ...prev.slice(0, 14)]);
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            showToast("Failed to process withdrawal. Please try again.", "error");
        } finally {
            setIsWithdrawing(false);
        }
    };

    // Format timestamp to readable date
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };
    
    // Truncate address for display
    const truncateAddress = (address: string) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
    };
    
    // Truncate transaction ID for display
    const truncateTxId = (txid: string) => {
        return `${txid.substring(0, 8)}...${txid.substring(txid.length - 8)}`;
    };

    const handleWithdrawClick = () => {
        triggerHapticFeedback(window);
        setShowWithdrawPopup(true);
    };

    return (
        <div className="bg-gradient-to-b from-[#2a9d8f] to-[#3eb489] flex justify-center min-h-screen">
            <div className="w-full text-white font-bold flex flex-col max-w-xl">
                <div className="flex-grow mt-4 bg-gradient-to-r from-[#f0b90b] to-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
                    <div className="mt-[2px] bg-gradient-to-b from-[#2a9d8f] to-[#3eb489] rounded-t-[46px] h-full overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-1 pb-24">
                            <div className="relative mt-4">
                                <div className="flex justify-center mb-4">
                                    <div className="relative">
                                        <IceCube className="w-24 h-24 rounded-lg mr-2 text-[#f3ba2f]" />
                                        <div className="absolute inset-0 bg-[#2a9d8f]/20 rounded-lg animate-pulse-slow"></div>
                                    </div>
                                </div>
                                <h1 className="text-2xl text-center mb-4 text-[#f3ba2f] font-extrabold tracking-wide">USDT TRC-20 TASKS</h1>
                                <p className="text-[#FFFBE6] text-center mb-4 font-normal">Complete the tasks below to qualify for the USDT TRC-20 Airdrop.</p>
                                
                                {/* Withdraw button */}
                                <div className="flex justify-center mb-6">
                                    <button
                                        onClick={handleWithdrawClick}
                                        onMouseEnter={() => setIsHoveringWithdraw(true)}
                                        onMouseLeave={() => setIsHoveringWithdraw(false)}
                                        disabled={pointsBalance < MINIMUM_WITHDRAW}
                                        className={`bg-gradient-to-r from-[#2a9d8f] to-[#3eb489] text-white px-8 py-3 rounded-xl font-extrabold shadow-lg 
                                        transition-all duration-300 flex items-center justify-center space-x-3 w-full max-w-md 
                                        border-2 border-[#2a9d8f] relative overflow-hidden
                                        ${isHoveringWithdraw ? 'scale-102' : ''}
                                        ${pulseEffect ? 'animate-pulse' : ''}
                                        ${pointsBalance < MINIMUM_WITHDRAW ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        style={{
                                            boxShadow: isHoveringWithdraw ? '0 0 15px rgba(42, 157, 143, 0.5)' : '0 0 8px rgba(42, 157, 143, 0.2)'
                                        }}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                                            transform -translate-x-full transition-transform duration-1000 
                                            ${isHoveringWithdraw ? 'animate-shimmer' : ''}`} />
                                        <IceCube className={`w-7 h-7 transition-transform duration-300 ${isHoveringWithdraw ? 'scale-110' : ''}`} />
                                        <span className="text-lg">WITHDRAW USDT</span>
                                    </button>
                                </div>

                                {/* Telegram Channel Button */}
                                <div className="flex justify-center mb-6">
                                    <a
                                        href="https://t.me/Live_Payouts_Cocktail"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative w-full max-w-md"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#0088cc] to-[#00a2ff] rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative bg-gradient-to-r from-[#0088cc] to-[#00a2ff] text-white px-8 py-4 rounded-xl font-extrabold shadow-lg 
                                            transition-all duration-300 flex items-center justify-center space-x-3
                                            border-2 border-[#0088cc] hover:scale-105 hover:shadow-xl">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.2-.04-.28-.02-.12.02-1.98 1.26-5.61 3.71-.53.36-1.01.53-1.45.52-.48-.01-1.4-.27-2.08-.5-.84-.28-1.51-.43-1.45-.9.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.63 4.75-1.91 5.42-1.91.12 0 .38.03.55.17.14.12.18.28.2.45-.02.14-.02.3-.04.42z"/>
                                            </svg>
                                            <span className="text-lg">CHECK ONLINE PAYMENTS</span>
                                            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    </a>
                                </div>

                                {/* Instructions Section */}
                                <div className="bg-[#2a9d8f]/20 rounded-lg p-5 mb-6 border border-[#2a9d8f]/20 hover:border-[#2a9d8f]/40 transition-all duration-300 shadow-lg">
                                    <h2 className="text-xl mb-3 text-[#f3ba2f] font-extrabold">How to Earn USDT</h2>
                                    <ul className="space-y-3 text-[#FFFBE6] font-normal">
                                        <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
                                            <span className="text-[#f3ba2f] mr-2">•</span>
                                            <span>Complete all tasks to qualify for withdrawal.</span>
                                        </li>
                                        <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
                                            <span className="text-[#f3ba2f] mr-2">•</span>
                                            <span>Earn at least {MINIMUM_WITHDRAW} USDT through tasks and invites.</span>
                                        </li>
                                        <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
                                            <span className="text-[#f3ba2f] mr-2">•</span>
                                            <span>Invite friends to earn 25 USDT per referral.</span>
                                        </li>
                                        <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
                                            <span className="text-[#f3ba2f] mr-2">•</span>
                                            <span>Withdraw your earnings directly to your wallet.</span>
                                        </li>
                                    </ul>
                                </div>

                                <h2 className="text-base mt-8 mb-4 text-[#f3ba2f] font-extrabold tracking-wide">Your Progress</h2>
                                <div className="bg-[#2a9d8f]/20 rounded-lg p-4 mb-6 border border-[#2a9d8f]/20 hover:border-[#2a9d8f]/40 transition-all duration-300 shadow-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[#FFFBE6]">USDT Balance:</span>
                                        <span className="text-white font-bold">{formatNumber(pointsBalance)} / {MINIMUM_WITHDRAW}</span>
                                    </div>
                                    <div className="w-full bg-[#2a9d8f]/30 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-[#2a9d8f] to-[#3eb489] h-2.5 rounded-full relative"
                                            style={{ 
                                                width: `${Math.min(100, (pointsBalance / MINIMUM_WITHDRAW) * 100)}%`,
                                                transition: 'width 1s ease-in-out'
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {selectedOnchainTask && (
                <OnchainTaskPopup
                    task={selectedOnchainTask}
                    onClose={() => setSelectedOnchainTask(null)}
                    onUpdate={handleTaskUpdate}
                />
            )}
            
            {showWithdrawPopup && (
                <WithdrawPopup
                    onClose={() => setShowWithdrawPopup(false)}
                    balance={pointsBalance}
                    minimumWithdraw={MINIMUM_WITHDRAW}
                />
            )}
            
            {/* Add animation styles */}
            <style jsx global>{`
                @keyframes pulse-subtle {
                    0%, 100% { background-color: #2a9d8f/10; }
                    50% { background-color: #2a9d8f/20; }
                }
                
                .animate-pulse-subtle {
                    animation: pulse-subtle 2s ease-in-out;
                }
                
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.1; }
                    50% { opacity: 0.3; }
                }
                
                .animate-pulse-slow {
                    animation: pulse-slow 3s infinite;
                }
                
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
                
                .scale-102 {
                    transform: scale(1.02);
                }
                
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}

// Helper function to format TON amount
function formatTON(nanoTON: string): string {
    return (parseInt(nanoTON) / 1e9).toFixed(2);
}