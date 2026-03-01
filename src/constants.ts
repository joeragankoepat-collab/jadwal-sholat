/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalculationMethod, MosqueSettings } from './types';

export const DEFAULT_SETTINGS: MosqueSettings = {
  name: 'MUSHOLAH ARRAHMAH',
  city: 'Serang',
  province: 'Banten',
  district: 'Serang',
  address: 'Komplek BCP 2 Ranjeng Ciruas',
  runningText: 'Semua orang punya masa-masa kelam dan hanya orang bodoh yang tidak mau belajar dari kesalahannya.',
  latitude: -6.114196248039071, // Bantul area
  longitude: 106.2276108127061,
  timezone: 'Asia/Jakarta',
  calculationMethod: CalculationMethod.KEMENAG,
  useOnlineAPI: false,
  onlineAPIProvider: 'aladhan',
  mediaType: 'slideshow',
  mediaUrl: 'https://www.youtube.com/watch?v=Y-Y_U1XTgik',
  slideshowUrls: [
    "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=2070&auto=format&fit=crop"
  ],
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
  hijriAdjustment: 0,
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
