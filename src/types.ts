/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum CalculationMethod {
  KEMENAG = 'KEMENAG',
  MUSLIM_WORLD_LEAGUE = 'MUSLIM_WORLD_LEAGUE',
  EGYPTIAN = 'EGYPTIAN',
  KARACHI = 'KARACHI',
  UMM_AL_QURA = 'UMM_AL_QURA',
  DUBAI = 'DUBAI',
  MOONSIGHTING_COMMITTEE = 'MOONSIGHTING_COMMITTEE',
  NORTH_AMERICA = 'NORTH_AMERICA',
  KUWAIT = 'KUWAIT',
  QATAR = 'QATAR',
  SINGAPORE = 'SINGAPORE',
  TURKEY = 'TURKEY',
  TEHRAN = 'TEHRAN',
}

export interface MosqueSettings {
  name: string;
  city: string;
  address: string;
  runningText: string;
  latitude: number;
  longitude: number;
  timezone: string;
  calculationMethod: CalculationMethod;
  useOnlineAPI: boolean;
  mediaType: 'slideshow' | 'youtube';
  mediaUrl?: string;
  iqomahDelays: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  shalatDurations: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  theme: 'dark' | 'light' | 'green';
}

export type PrayerName = 'imsak' | 'fajr' | 'sunrise' | 'dhuha' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimeData {
  name: PrayerName;
  label: string;
  time: Date;
  isNext: boolean;
}

export type AppState = 'NORMAL' | 'ADHAN' | 'IQOMAH' | 'SHALAT';
