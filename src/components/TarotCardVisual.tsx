import React, { useState } from 'react';
import { TarotCard } from '../types';
import { Sparkles, Moon, Sun, Heart, Compass, Star, Eye, Shield, Feather, Key, Crown } from 'lucide-react';

interface TarotCardVisualProps {
  card: TarotCard;
  isReversed?: boolean;
  isRevealed?: boolean;
  positionLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

const ROMAN_NUMERALS: Record<number, string> = {
  0: '0', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
  6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
  11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV',
  16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX',
  21: 'XXI', 22: 'II of Cups', 23: 'Ace of Cups', 24: 'Ace of Pentacles'
};

export const TarotCardVisual: React.FC<TarotCardVisualProps> = ({
  card,
  isReversed = false,
  isRevealed = true,
  positionLabel,
  size = 'md',
  onClick,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-24 h-40 text-xs',
    md: 'w-44 h-72 text-sm',
    lg: 'w-56 h-92 text-base',
  }[size];

  // Fallback celestial icons
  const getCardIcon = (id: string) => {
    switch (id) {
      case 'the-fool': return <Compass className="w-8 h-8 text-amber-300" />;
      case 'the-magician': return <Sparkles className="w-8 h-8 text-indigo-300" />;
      case 'the-high-priestess': return <Moon className="w-8 h-8 text-cyan-300" />;
      case 'the-empress': return <Heart className="w-8 h-8 text-rose-300" />;
      case 'the-emperor': return <Crown className="w-8 h-8 text-red-400" />;
      case 'the-hierophant': return <Key className="w-8 h-8 text-yellow-300" />;
      case 'the-lovers': return <Heart className="w-8 h-8 text-pink-400 fill-pink-400/40" />;
      case 'the-chariot': return <Shield className="w-8 h-8 text-teal-300" />;
      case 'the-star': return <Star className="w-8 h-8 text-emerald-300 fill-emerald-300/40" />;
      case 'the-moon': return <Moon className="w-8 h-8 text-purple-300 fill-purple-300/40" />;
      case 'the-sun': return <Sun className="w-8 h-8 text-yellow-400 fill-yellow-400/50" />;
      case 'the-world': return <Eye className="w-8 h-8 text-teal-300" />;
      default: return <Feather className="w-8 h-8 text-amber-200" />;
    }
  };

  const roman = ROMAN_NUMERALS[card.number] || `${card.number}`;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {positionLabel && (
        <span className="mb-2 text-xs font-medium text-amber-200/95 tracking-wider text-center px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-amber-400/30 shadow-sm">
          {positionLabel}
        </span>
      )}

      <div
        onClick={onClick}
        className={`relative ${sizeClasses} rounded-xl perspective-1000 select-none cursor-pointer transition-transform duration-300 hover:scale-[1.03] group`}
      >
        <div
          className={`w-full h-full duration-700 transform-style-3d transition-transform shadow-2xl rounded-xl ${
            isRevealed ? (isReversed ? 'rotate-y-180 rotate-180' : 'rotate-y-180') : ''
          }`}
        >
          {/* Card Back: Ornate Gold Celestial Tarot Back */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl border-2 border-amber-400/50 bg-gradient-to-br from-[#180d2e] via-[#241344] to-[#120722] p-2 shadow-2xl shadow-purple-950/90 overflow-hidden flex flex-col items-center justify-between">
            {/* Corner Runes */}
            <div className="w-full flex justify-between text-amber-300/60 text-[10px] px-0.5">
              <span>✦</span>
              <span>✧</span>
            </div>

            {/* Inner mystical mandala frame */}
            <div className="relative w-full h-full my-1 rounded-lg border border-amber-400/35 bg-[#140a28]/90 flex flex-col items-center justify-center p-3 shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/15 via-purple-600/10 to-transparent rounded-lg" />
              
              {/* Sacred mandala rings */}
              <div className="relative w-20 h-20 rounded-full border border-amber-400/40 flex items-center justify-center animate-spin-slow">
                <div className="w-14 h-14 rounded-full border border-dashed border-amber-200/50 flex items-center justify-center animate-spin-reverse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400/30 to-purple-400/40 flex items-center justify-center shadow-md">
                    <Moon className="w-4 h-4 text-amber-200 fill-amber-200/50" />
                  </div>
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className="text-[10px] text-amber-300/90 tracking-widest uppercase font-serif font-bold">
                  ТАРОТМН
                </span>
              </div>
            </div>

            <div className="w-full flex justify-between text-amber-300/60 text-[10px] px-0.5">
              <span>✧</span>
              <span>✦</span>
            </div>
          </div>

          {/* Card Front: Authentic Real Tarot Card Artwork & Golden Frame */}
          <div className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden rounded-xl border-2 border-amber-400/70 bg-[#150a26] p-1.5 shadow-2xl shadow-amber-500/25 flex flex-col justify-between overflow-hidden">
            {/* Card Header: Roman Numeral & Element */}
            <div className="flex items-center justify-between px-1.5 py-0.5 border-b border-amber-400/30 text-amber-200 text-[11px] bg-gradient-to-r from-amber-950/40 via-purple-950/60 to-amber-950/40 rounded-t-lg">
              <span className="font-serif font-bold tracking-wider text-amber-300">
                {roman}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 font-medium">
                {card.elementMn}
              </span>
            </div>

            {/* Central Genuine Artwork or Fallback */}
            <div className="relative flex-1 my-1 rounded-md overflow-hidden border border-amber-300/30 bg-[#0e0618] flex items-center justify-center">
              {card.imageUrl && !imgError ? (
                <img
                  src={card.imageUrl}
                  alt={card.nameMn}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center filter contrast-[1.03] saturate-[1.05]"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-b from-[#241544] via-[#1a0e30] to-[#110720]">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center relative mb-1.5 shadow-inner"
                    style={{
                      background: `radial-gradient(circle, ${card.accentColor}33 0%, #170f2b 75%)`,
                      border: `1px solid ${card.accentColor}66`,
                    }}
                  >
                    {getCardIcon(card.id)}
                  </div>
                  <span className="text-[10px] text-amber-200/90 font-serif font-semibold">
                    {card.nameEn}
                  </span>
                </div>
              )}

              {/* Subdued Vignette Glow over Card Art for Authentic Depth */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_12px_rgba(0,0,0,0.5)] border border-amber-200/10 rounded-md" />
            </div>

            {/* Card Footer: Mongolian Name & Position */}
            <div className="px-1.5 py-1 border-t border-amber-400/30 bg-gradient-to-r from-[#1b0d36] via-[#26134b] to-[#1b0d36] rounded-b-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-amber-100 text-[11px] sm:text-xs truncate max-w-[70%]">
                  {card.nameMn.split('(')[0].trim()}
                </h4>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  isReversed
                    ? 'text-rose-200 bg-rose-950/70 border border-rose-700/40'
                    : 'text-emerald-200 bg-emerald-950/70 border border-emerald-700/40'
                }`}>
                  {isReversed ? 'Урвуу' : 'Босоо'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
