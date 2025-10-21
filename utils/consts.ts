// utils/consts.ts

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

import { crystal1, crystal2, crystal3, crystal4, crystal5, crystal6, crystal7, crystal8, crystal9, mainCharacter } from "@/images";
import { StaticImageData } from "next/image";

export const ALLOW_ALL_DEVICES = true;

export const WALLET_MANIFEST_URL = "https://violet-traditional-rabbit-103.mypinata.cloud/ipfs/QmcFgnfXoiNtp8dvy25xA9hMEjz5AzugTuPQNTHQMTw9Tf";

export interface LevelData {
  name: string;
  minPoints: number;
  bigImage: StaticImageData;
  smallImage: StaticImageData;
  color: string;
  friendBonus: number;
  friendBonusPremium: number;
}

export const LEVELS: LevelData[] = [
  {
    name: "USDT Novice",
    minPoints: 0,
    bigImage: mainCharacter,
    smallImage: crystal1,
    color: "#2adaf8",
    friendBonus: 5,
    friendBonusPremium: 5,
  },
  {
    name: "USDT Trader",
    minPoints: 50,
    bigImage: mainCharacter,
    smallImage: crystal2,
    color: "#d64767",
    friendBonus: 5,
    friendBonusPremium: 5,
  },
  {
    name: "USDT Analyst",
    minPoints: 250,
    bigImage: mainCharacter,
    smallImage: crystal3,
    color: "#e9c970",
    friendBonus: 5,
    friendBonusPremium: 5,
  },
  {
    name: "USDT Strategist",
    minPoints: 500,
    bigImage: mainCharacter,
    smallImage: crystal4,
    color: "#73e94b",
    friendBonus: 5,
    friendBonusPremium: 5,
  },
  {
    name: "USDT Portfolio Manager",
    minPoints: 1000,
    bigImage: mainCharacter,
    smallImage: crystal5,
    color: "#4ef0ba",
    friendBonus: 5,
    friendBonusPremium: 5,
  },
  {
    name: "USDT Investment Director",
    minPoints: 2000,
    bigImage: mainCharacter,
    smallImage: crystal6,
    color: "#1a3ae8",
    friendBonus: 5,
    friendBonusPremium: 5,
  },
  {
    name: "USDT Wealth Manager",
    minPoints: 5000,
    bigImage: mainCharacter,
    smallImage: crystal7,
    color: "#902bc9",
    friendBonus: 5,
    friendBonusPremium: 5,
  },
  {
    name: "USDT Financial Expert",
    minPoints: 6000,
    bigImage: mainCharacter,
    smallImage: crystal8,
    color: "#fb8bee",
    friendBonus: 5,
    friendBonusPremium: 5,
  },
  {
    name: "USDT Master Trader",
    minPoints: 7000,
    bigImage: mainCharacter,
    smallImage: crystal9,
    color: "#e04e92",
    friendBonus: 5,
    friendBonusPremium: 5,
  }
];

export const DAILY_REWARDS = [
  500,
  1000,
  2500,
  5000,
  15000,
  25000,
  100000,
  500000,
  1000000,
  5000000
];

export const MAXIMUM_INACTIVE_TIME_FOR_MINE = 3*60*60*1000; // 3 hours in milliseconds

export const MAX_ENERGY_REFILLS_PER_DAY = 6;
export const ENERGY_REFILL_COOLDOWN = 60 * 60 * 1000; // 1 hour in milliseconds
export const TASK_WAIT_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

export const REFERRAL_BONUS_BASE = 25;
export const REFERRAL_BONUS_PREMIUM = 25;


// Multitap
export const multitapUpgradeBasePrice = 100;
export const multitapUpgradeCostCoefficient = 2;

export const multitapUpgradeBaseBenefit = 1;
export const multitapUpgradeBenefitCoefficient = 1;

// Energy
export const energyUpgradeBasePrice = 100;
export const energyUpgradeCostCoefficient = 2;

export const energyUpgradeBaseBenefit = 50;
export const energyUpgradeBenefitCoefficient = 1;

// Mine (profit per hour)
export const mineUpgradeBasePrice = 1;
export const mineUpgradeCostCoefficient = 1.5;

export const mineUpgradeBaseBenefit = 10;
export const mineUpgradeBenefitCoefficient = 1.2;