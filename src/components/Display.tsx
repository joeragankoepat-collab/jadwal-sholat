/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, MapPin, Calendar, Settings as SettingsIcon, Volume2, PhoneOff } from 'lucide-react';
import { format, differenceInSeconds, addMinutes, isAfter, isBefore } from 'date-fns';
import { id } from 'date-fns/locale';
import { MosqueSettings, PrayerTimeData, AppState } from '../types';
import { getPrayerTimes, getOnlinePrayerTimes, formatHijriDate } from '../utils/prayerTimes';

interface DisplayProps {
  settings: MosqueSettings;
  onOpenAdmin: () => void;
}

export default function Display({ settings, onOpenAdmin }: DisplayProps) {
  const [now, setNow] = useState(new Date());
  const [appState, setAppState] = useState<AppState>('NORMAL');
  const [activePrayer, setActivePrayer] = useState<PrayerTimeData | null>(null);
  const [iqomahCountdown, setIqomahCountdown] = useState(0);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = settings.slideshowUrls || [];

  // Slideshow timer
  useEffect(() => {
    if (settings.mediaType === 'slideshow' && slides.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [settings.mediaType, slides.length]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch prayer times (online or offline)
  useEffect(() => {
    const fetchTimes = async () => {
      if (settings.useOnlineAPI) {
        const times = await getOnlinePrayerTimes(now, settings);
        setPrayerTimes(times);
      } else {
        setPrayerTimes(getPrayerTimes(now, settings));
      }
    };
    fetchTimes();
  }, [settings, now.toDateString()]);

  const nextPrayer = useMemo(() => {
    if (prayerTimes.length === 0) return null;
    return prayerTimes.find(p => p.isNext) || prayerTimes[0];
  }, [prayerTimes]);

  const timeUntilNext = useMemo(() => {
    if (!nextPrayer) return 0;
    let diff = differenceInSeconds(nextPrayer.time, now);
    if (diff < 0) {
      // If next prayer is tomorrow (e.g. after Isya)
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowPrayers = getPrayerTimes(tomorrow, settings);
      diff = differenceInSeconds(tomorrowPrayers[0].time, now);
    }
    return diff;
  }, [nextPrayer, now, settings]);

  // State Machine Logic
  useEffect(() => {
    if (prayerTimes.length === 0) return;

    const currentPrayer = prayerTimes.find(p => {
      const diff = Math.abs(differenceInSeconds(p.time, now));
      return diff < 2; // Within 2 seconds of adhan
    });

    if (currentPrayer && currentPrayer.name !== 'sunrise' && appState === 'NORMAL') {
      setAppState('ADHAN');
      setActivePrayer(currentPrayer);
      
      // Adhan duration (e.g. 3 minutes) then start Iqomah countdown
      setTimeout(() => {
        setAppState('IQOMAH');
        const delay = settings.iqomahDelays[currentPrayer.name as keyof typeof settings.iqomahDelays] || 10;
        setIqomahCountdown(delay * 60);
      }, 3 * 60 * 1000);
    }

    if (appState === 'IQOMAH') {
      if (iqomahCountdown > 0) {
        const timer = setTimeout(() => setIqomahCountdown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setAppState('SHALAT');
        const duration = settings.shalatDurations[activePrayer?.name as keyof typeof settings.shalatDurations] || 15;
        setTimeout(() => {
          setAppState('NORMAL');
          setActivePrayer(null);
        }, duration * 60 * 1000);
      }
    }
  }, [now, prayerTimes, appState, iqomahCountdown, settings, activePrayer]);

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (appState === 'SHALAT') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <PhoneOff size={120} className="mx-auto text-red-500 animate-pulse" />
          <h1 className="text-7xl font-bold tracking-tighter uppercase">Shalat Sedang Berlangsung</h1>
          <p className="text-4xl text-gray-400">Mohon menonaktifkan atau mensunyikan handphone Anda</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#e9eff5] font-sans overflow-hidden flex flex-col p-4 gap-4">
      {/* Header - Fixed Height */}
      <header className="flex justify-between items-start px-2 h-[12%] shrink-0">
        {/* Left: Date */}
        <div className="flex flex-col pt-2">
          <div className="text-3xl font-bold text-[#008a2e] tracking-tight">
            {format(now, 'd MMMM yyyy', { locale: id })} <span className="mx-1">/</span> {formatHijriDate(now, settings.hijriAdjustment)}
          </div>
          <div className="h-[3px] bg-[#008a2e] w-full mt-1"></div>
        </div>

        {/* Center: Logo & Name */}
        <div className="flex items-center gap-4">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <img 
              src="https://picsum.photos/seed/mosque-logo/120/120" 
              alt="Logo" 
              className="w-12 h-12 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-slate-900 leading-none tracking-tight">{settings.name}</h1>
            <p className="text-lg text-slate-700 font-semibold mt-1">
              {settings.city && <span className="text-[#008a2e]">{settings.city}</span>}
              {settings.city && settings.address && <span className="mx-2 text-slate-300">|</span>}
              {settings.address}
            </p>
          </div>
        </div>

        {/* Right: Admin Button (Hidden/Subtle) */}
        <button 
          onClick={onOpenAdmin}
          className="p-2 opacity-5 hover:opacity-100 transition-opacity"
        >
          <SettingsIcon size={20} />
        </button>
      </header>

      {/* Main Content Area - Flexible Height */}
      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Left Column: Info & Schedule */}
        <div className="col-span-3 flex flex-col gap-3 overflow-hidden">
          {/* Clock Card */}
          <div className="bg-white rounded-2xl shadow-md p-3 flex items-center justify-center border border-slate-200 h-[18%] shrink-0">
            <div className="text-[5rem] font-bold text-[#008a2e] leading-none tabular-nums tracking-tighter">
              {format(now, 'HH:mm')}
            </div>
          </div>

          {/* Countdown Pill */}
          <div className={`rounded-xl py-2 px-4 shadow-lg text-white text-center shrink-0 transition-colors duration-500 ${
            appState === 'IQOMAH' ? 'bg-amber-600' : 
            appState === 'ADHAN' ? 'bg-red-600 animate-pulse' : 
            'bg-[#008a2e]'
          }`}>
            <div className="text-xl font-black uppercase tracking-tight">
              {appState === 'IQOMAH' ? (
                <span>IQOMAH - {formatCountdown(iqomahCountdown)}</span>
              ) : appState === 'ADHAN' ? (
                <span>ADZAN - {activePrayer?.label}</span>
              ) : nextPrayer ? (
                <span>{nextPrayer.label} - {formatCountdown(timeUntilNext)}</span>
              ) : (
                <span>Loading...</span>
              )}
            </div>
          </div>

          {/* Vertical Prayer Times */}
          <div className="flex-1 grid grid-rows-8 gap-1 min-h-0 overflow-hidden">
            {prayerTimes.length === 0 ? (
              <div className="row-span-8 flex items-center justify-center text-slate-400 font-bold uppercase text-xs text-center px-4">
                Memuat Jadwal...
              </div>
            ) : (
              prayerTimes.map((prayer) => (
                <div 
                  key={prayer.name}
                  className={`flex items-center justify-between px-4 rounded-xl shadow-sm border transition-all duration-300 ${
                    prayer.isNext 
                      ? 'bg-[#004d40] border-[#008a2e] ring-2 ring-[#008a2e]/30' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <span className={`text-sm font-bold uppercase tracking-wider ${prayer.isNext ? 'text-white' : 'text-slate-600'}`}>
                    {prayer.label}
                  </span>
                  <span className={`text-lg font-black tabular-nums tracking-tighter ${prayer.isNext ? 'text-white' : 'text-[#004d40]'}`}>
                    {format(prayer.time, 'HH:mm')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Media Display */}
        <div className="col-span-9 relative rounded-[2.5rem] overflow-hidden shadow-xl border-[6px] border-[#b0c4de] bg-black">
          {settings.mediaType === 'youtube' && settings.mediaUrl ? (
            <iframe
              className="w-full h-full"
              src={settings.mediaUrl.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1&mute=1&loop=1&playlist=' + (settings.mediaUrl.split('v=')[1]?.split('&')[0] || '')}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          ) : (
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentSlide}
                src={slides[currentSlide]} 
                alt="Mosque" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Footer Marquee - Fixed Height */}
      <footer className="h-12 bg-white rounded-xl flex items-center overflow-hidden shadow-sm border border-slate-200 shrink-0">
        <div className="whitespace-nowrap animate-marquee flex items-center gap-12 text-2xl font-bold text-[#004d40]">
          <span>{settings.runningText}</span>
          <span className="w-3 h-3 bg-[#008a2e] rounded-full"></span>
          <span>{settings.name} - {settings.address}</span>
          <span className="w-3 h-3 bg-[#008a2e] rounded-full"></span>
          <span>{settings.runningText}</span>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 45s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 138, 46, 0.2);
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}
