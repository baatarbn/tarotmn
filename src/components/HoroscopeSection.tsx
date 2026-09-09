import React, { useState } from 'react';
import { ZODIAC_SIGNS } from '../data/zodiac';
import { ZodiacSign } from '../types';
import { Heart, Briefcase, RefreshCw, Star, Compass, Gift } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const HoroscopeSection: React.FC = () => {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign>(ZODIAC_SIGNS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [liveHoroscope, setLiveHoroscope] = useState<any>(null);

  const handleSelectSign = (sign: ZodiacSign) => {
    setSelectedSign(sign);
    setLiveHoroscope(null);
    soundFx.playChime();
  };

  const handleRefreshAI = async () => {
    setIsGenerating(true);
    soundFx.playChime();
    try {
      const res = await fetch('/api/horoscope/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signId: selectedSign.id, signNameMn: selectedSign.nameMn }),
      });
      const data = await res.json();
      if (data.success && data.horoscope) {
        setLiveHoroscope(data.horoscope);
        soundFx.playReveal();
      }
    } catch {
      // Keep fallback
    } finally {
      setIsGenerating(false);
    }
  };

  const currentFortune = liveHoroscope || selectedSign.dailyFortuneMn;

  return (
    <div className="py-6 sm:py-10 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Minimal Header */}
      <div className="text-center max-w-xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-400/30 text-emerald-300 text-xs font-medium mb-3">
          <Gift className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Үнэ төлбөргүй • Өдөр бүр шинэчлэгдэнэ</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-amber-100">
          Өдрийн Зурхай
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-purple-200/80 leading-relaxed">
          Та өөрийн төрсөн ордоо сонгон өнөөдрийн гэгээлэг зөвлөгөөгөө үнэ төлбөргүй уншаарай.
        </p>
      </div>

      {/* 12 Zodiac Minimal Compact Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-6">
        {ZODIAC_SIGNS.map((sign) => {
          const isSelected = selectedSign.id === sign.id;
          return (
            <button
              key={sign.id}
              onClick={() => handleSelectSign(sign)}
              className={`py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-gray-950 border-amber-300 shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'bg-purple-950/50 hover:bg-purple-900/60 border-purple-800/40 text-purple-200 hover:text-white'
              }`}
            >
              <span className="text-xl sm:text-2xl mb-0.5">{sign.symbol}</span>
              <span className={`text-xs font-bold ${isSelected ? 'text-gray-950' : 'text-amber-100'}`}>
                {sign.nameMn}
              </span>
              <span className={`text-[10px] ${isSelected ? 'text-gray-900/80 font-medium' : 'text-purple-300/70'}`}>
                {sign.datesMn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Minimal & Serene Selected Sign Reading Card */}
      <div className="rounded-3xl bg-gradient-to-b from-[#1c0f33] to-[#120722] border border-amber-400/30 p-5 sm:p-7 shadow-xl shadow-purple-950">
        {/* Sign Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-purple-800/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-2xl text-amber-300">
              {selectedSign.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-heading font-bold text-amber-100">
                  {selectedSign.nameMn} орд
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-700/40 text-amber-200">
                  {selectedSign.datesMn}
                </span>
              </div>
              <p className="text-xs text-purple-300/80 mt-0.5">
                Махбод: <strong className="text-amber-200">{selectedSign.elementMn}</strong> • Ивээл гараг: <strong className="text-amber-200">{selectedSign.planetMn}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshAI}
            disabled={isGenerating}
            className="px-3.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Шинэчилж байна...' : 'Шинэчлэх'}</span>
          </button>
        </div>

        {/* General Guidance */}
        <div className="mb-4 p-4 rounded-2xl bg-[#160a29] border border-purple-800/30">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Өнөөдрийн уур амьсгал:</span>
          </div>
          <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-serif-reading">
            {currentFortune.general}
          </p>
        </div>

        {/* Love & Career Cards (Clean 2 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/25">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Хайр сэтгэл</span>
              </div>
              <span className="text-[11px] font-bold text-rose-300">
                {currentFortune.loveScore}%
              </span>
            </div>
            <p className="text-xs text-purple-100/90 leading-relaxed font-serif-reading">
              {currentFortune.love}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-950/20 border border-teal-500/25">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                <Briefcase className="w-3.5 h-3.5 text-teal-400" />
                <span>Ажил үйлс & Боломж</span>
              </div>
              <span className="text-[11px] font-bold text-teal-300">
                {currentFortune.luckScore}%
              </span>
            </div>
            <p className="text-xs text-purple-100/90 leading-relaxed font-serif-reading">
              {currentFortune.career}
            </p>
          </div>
        </div>

        {/* Minimal Lucky Elements Footer */}
        <div className="pt-3 border-t border-purple-800/40 flex items-center justify-between text-xs text-purple-200/80">
          <span>Азын өнгө: <strong className="text-amber-300">{selectedSign.luckyColor}</strong></span>
          <span>Ивээл тоо: <strong className="text-amber-300 font-mono font-bold">{selectedSign.luckyNumber}</strong></span>
        </div>
      </div>
    </div>
  );
};
