/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Save, MapPin, Clock, Palette, Info, Settings as SettingsIcon, Image, Youtube, Plus, Trash2, Navigation } from 'lucide-react';
import { MosqueSettings, CalculationMethod } from '../types';

interface AdminProps {
  settings: MosqueSettings;
  onSave: (settings: Partial<MosqueSettings>) => void;
  onClose: () => void;
}

type TabType = 'umum' | 'lokasi' | 'iqomah' | 'media';

export default function Admin({ settings, onSave, onClose }: AdminProps) {
  const [formData, setFormData] = useState(settings);
  const [activeTab, setActiveTab] = useState<TabType>('umum');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof MosqueSettings] as object),
          [child]: type === 'number' ? parseFloat(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) : value
      }));
    }
  };

  const handleAddSlide = () => {
    setFormData(prev => ({
      ...prev,
      slideshowUrls: [...prev.slideshowUrls, '']
    }));
  };

  const handleRemoveSlide = (index: number) => {
    setFormData(prev => ({
      ...prev,
      slideshowUrls: prev.slideshowUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSlideChange = (index: number, value: string) => {
    setFormData(prev => {
      const newUrls = [...prev.slideshowUrls];
      newUrls[index] = value;
      return { ...prev, slideshowUrls: newUrls };
    });
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung deteksi lokasi.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        alert('Lokasi berhasil dideteksi!');
      },
      (error) => {
        alert('Gagal mendeteksi lokasi: ' + error.message);
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-8 z-[100]">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <header className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-800/50">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
              <SettingsIcon size={24} className="text-emerald-500" />
              Pengaturan Masjid
            </h2>
            <p className="text-xs text-zinc-500 ml-9">Konfigurasi tampilan dan jadwal shalat</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <X size={24} />
          </button>
        </header>

        {/* Tabs Navigation */}
        <div className="flex px-6 border-b border-white/10 bg-zinc-800/30">
          {[
            { id: 'umum', label: 'Umum', icon: Info },
            { id: 'lokasi', label: 'Lokasi', icon: MapPin },
            { id: 'iqomah', label: 'Jeda Iqomah', icon: Clock },
            { id: 'media', label: 'Media', icon: Image },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${
                activeTab === tab.id 
                  ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5' 
                  : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
          {activeTab === 'umum' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Nama Masjid</label>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Contoh: Masjid Ar-Rohiim"
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Kota</label>
                  <input 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Contoh: Bantul"
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Provinsi (untuk API equran.id)</label>
                  <input 
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    placeholder="Contoh: banten"
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Kab/Kota (untuk API equran.id)</label>
                  <input 
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Contoh: kab. serang"
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Alamat Lengkap</label>
                <input 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Running Text (Pengumuman)</label>
                <textarea 
                  name="runningText"
                  value={formData.runningText}
                  onChange={handleChange as any}
                  rows={3}
                  className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Metode Perhitungan</label>
                <div className="flex flex-col gap-4">
                  <select 
                    name="calculationMethod"
                    value={formData.calculationMethod}
                    onChange={handleChange}
                    disabled={formData.useOnlineAPI}
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                  >
                    {Object.values(CalculationMethod).map(m => (
                      <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-3 cursor-pointer bg-zinc-800/50 border border-white/5 border-dashed rounded-xl px-4 py-3 hover:bg-zinc-800 transition-colors">
                    <input 
                      type="checkbox"
                      name="useOnlineAPI"
                      checked={formData.useOnlineAPI}
                      onChange={(e) => setFormData(prev => ({ ...prev, useOnlineAPI: e.target.checked }))}
                      className="w-6 h-6 accent-emerald-500 rounded"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Gunakan API Online</span>
                      <span className="text-xs text-zinc-500">Mengambil jadwal shalat dari internet secara otomatis.</span>
                    </div>
                  </label>

                  {formData.useOnlineAPI && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="text-sm font-medium text-zinc-400">Pilih Provider API</label>
                      <select 
                        name="onlineAPIProvider"
                        value={formData.onlineAPIProvider}
                        onChange={handleChange}
                        className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="aladhan">Aladhan (Koordinat GPS)</option>
                        <option value="equran.id">Regional (Nama Kota & Provinsi)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Koreksi Tanggal Hijriah (Hari)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number"
                    name="hijriAdjustment"
                    value={formData.hijriAdjustment}
                    onChange={(e) => setFormData(prev => ({ ...prev, hijriAdjustment: parseInt(e.target.value) || 0 }))}
                    className="w-24 bg-zinc-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-xs text-zinc-500">Gunakan angka negatif (misal: -1) untuk memundurkan, atau positif (misal: 1) untuk memajukan.</span>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'lokasi' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Navigation className="text-emerald-500" size={24} />
                  <div>
                    <h4 className="text-sm font-bold text-white">Deteksi Lokasi Otomatis</h4>
                    <p className="text-xs text-zinc-500">Gunakan GPS perangkat untuk mendapatkan koordinat presisi.</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handleDetectLocation}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
                >
                  Dapatkan Koordinat
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Latitude</label>
                  <input 
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Longitude</label>
                  <input 
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Timezone</label>
                <input 
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </section>
          )}

          {activeTab === 'iqomah' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-6">
                {Object.keys(formData.iqomahDelays).map(p => (
                  <div key={p} className="flex items-center justify-between bg-zinc-800/50 p-4 rounded-2xl border border-white/5">
                    <label className="text-sm font-bold text-white uppercase tracking-wider">{p}</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number"
                        name={`iqomahDelays.${p}`}
                        value={(formData.iqomahDelays as any)[p]}
                        onChange={handleChange}
                        className="w-20 bg-zinc-900 border border-white/10 rounded-lg p-2 text-center text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="text-xs text-zinc-500 font-medium">Menit</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'media' && (
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mediaType: 'slideshow' }))}
                  className={`flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all ${
                    formData.mediaType === 'slideshow'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                      : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800 hover:border-white/10'
                  }`}
                >
                  <div className={`p-4 rounded-full ${formData.mediaType === 'slideshow' ? 'bg-emerald-500 text-white' : 'bg-zinc-700'}`}>
                    <Image size={32} />
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold block">Slide Show Foto</span>
                    <span className="text-xs opacity-60">Menampilkan gambar bergantian</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mediaType: 'youtube' }))}
                  className={`flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all ${
                    formData.mediaType === 'youtube'
                      ? 'bg-red-500/10 border-red-500 text-red-500'
                      : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800 hover:border-white/10'
                  }`}
                >
                  <div className={`p-4 rounded-full ${formData.mediaType === 'youtube' ? 'bg-red-500 text-white' : 'bg-zinc-700'}`}>
                    <Youtube size={32} />
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold block">Playlist YouTube</span>
                    <span className="text-xs opacity-60">Streaming video dari YouTube</span>
                  </div>
                </button>
              </div>

              {formData.mediaType === 'youtube' && (
                <div className="space-y-2 animate-in zoom-in-95 duration-200">
                  <label className="text-sm font-medium text-zinc-400">URL Playlist / Video YouTube</label>
                  <input 
                    name="mediaUrl"
                    value={formData.mediaUrl}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                  <p className="text-[10px] text-zinc-500 italic">Pastikan URL valid dan dapat diakses secara publik.</p>
                </div>
              )}

              {formData.mediaType === 'slideshow' && (
                <div className="space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-400">Daftar Link Foto Slideshow</label>
                    <button 
                      type="button"
                      onClick={handleAddSlide}
                      className="flex items-center gap-2 text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                      <Plus size={14} />
                      Tambah Foto
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {formData.slideshowUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          value={url}
                          onChange={(e) => handleSlideChange(index, e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 bg-zinc-800 border border-white/10 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <button 
                          type="button"
                          onClick={() => handleRemoveSlide(index)}
                          className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {formData.slideshowUrls.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-2xl">
                        <p className="text-zinc-500 text-sm">Belum ada foto. Klik "Tambah Foto" di atas.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}
        </form>

        {/* Footer */}
        <footer className="p-6 border-t border-white/10 flex justify-end gap-4 bg-zinc-800/50">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl hover:bg-white/5 transition-colors text-white"
          >
            Batal
          </button>
          <button 
            onClick={handleSubmit}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold flex items-center gap-2 transition-all text-white"
          >
            <Save size={20} />
            Simpan Perubahan
          </button>
        </footer>
      </div>
    </div>
  );
}

