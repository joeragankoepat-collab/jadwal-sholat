/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalculationMethod, MosqueSettings } from './types';

export const DEFAULT_SETTINGS: MosqueSettings = {
  name: 'MASJID AR ROHIIM',
  city: 'Bantul',
  address: 'Kanoman, Tegal Pasar, Banguntapan, Bantul, DIY',
  runningText: 'Semua orang punya masa-masa kelam dan hanya orang bodoh yang tidak mau belajar dari kesalahannya.',
  latitude: -7.8189, // Bantul area
  longitude: 110.4042,
  timezone: 'Asia/Jakarta',
  calculationMethod: CalculationMethod.KEMENAG,
  useOnlineAPI: false,
  mediaType: 'slideshow',
  mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  iqomahDelays: {
    fajr: 10,
    dhuhr: 8,
    asr: 8,
    maghrib: 5,
    isha: 10,
  },
  shalatDurations: {
    fajr: 15,
    dhuhr: 15,
    asr: 15,
    maghrib: 15,
    isha: 15,
  },
  theme: 'green',
};

export const PRAYER_LABELS: Record<string, string> = {
  imsak: 'IMSAK',
  fajr: 'SHUBUH',
  sunrise: 'SYURUQ',
  dhuha: 'DHUHA',
  dhuhr: 'DZUHUR',
  asr: 'ASHAR',
  maghrib: 'MAGHRIB',
  isha: 'ISYA\'',
};
