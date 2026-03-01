import { useState, useEffect } from 'react';
import { MosqueSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

export function useSettings() {
  const [settings, setSettings] = useState<MosqueSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const saved = localStorage.getItem('mosque_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings: Partial<MosqueSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('mosque_settings', JSON.stringify(updated));
  };

  return { settings, updateSettings };
}
