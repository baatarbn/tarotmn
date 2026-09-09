import React, { useEffect, useState } from 'react';
import { Sparkles, Moon } from 'lucide-react';

interface MagicalLoadingProps {
  serviceTitleMn: string;
}

const LOADING_MESSAGES_MN = [
  'Хөзрүүд дэлгэгдэж, таны асуултын хариу бууж байна...',
  'Таны асуултын учир холбогдол тольдогдож байна...',
  'Сонгосон хөзрүүдийн утга учир тайлагдаж байна...',
  'Тайлал болон сэтгэлийн дулаан зөвлөгөө бэлэн болж байна...'
];

export const MagicalLoading: React.FC<MagicalLoadingProps> = ({ serviceTitleMn }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES_MN.length);
    }, 2400);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="relative min-h-[460px] flex flex-col items-center justify-center p-8 overflow-hidden rounded-3xl bg-gradient-to-b from-[#1b1035] via-[#120824] to-[#0d051c] border border-amber-400/30 shadow-2xl">
      {/* Background stardust particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-amber-300 animate-twinkle" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-purple-300 animate-twinkle" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-pink-300 animate-twinkle" style={{ animationDelay: '1.8s' }} />
        <div className="absolute top-1/6 right-1/6 w-2.5 h-2.5 rounded-full bg-amber-200 animate-twinkle" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 right-1/5 w-1 h-1 rounded-full bg-cyan-300 animate-twinkle" style={{ animationDelay: '2.2s' }} />
      </div>

      {/* Floating Astrological & Tarot Rings around Crystal Ball */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Outer rotating runic ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/25 animate-spin-slow flex items-center justify-center">
          <span className="absolute -top-3 text-amber-300/60 text-xs">♈</span>
          <span className="absolute -bottom-3 text-amber-300/60 text-xs">♎</span>
          <span className="absolute -left-3 text-amber-300/60 text-xs">♋</span>
          <span className="absolute -right-3 text-amber-300/60 text-xs">♑</span>
        </div>

        {/* Counter-rotating celestial ring */}
        <div className="absolute inset-4 rounded-full border border-purple-400/30 animate-spin-reverse flex items-center justify-center">
          <span className="absolute top-2 right-4 text-purple-300/70 text-xs">✧</span>
          <span className="absolute bottom-2 left-4 text-purple-300/70 text-xs">✦</span>
          <span className="absolute top-2 left-4 text-pink-300/70 text-xs">✦</span>
          <span className="absolute bottom-2 right-4 text-pink-300/70 text-xs">✧</span>
        </div>

        {/* Floating Mini Tarot Cards in orbit */}
        <div className="absolute w-full h-full animate-spin-slow">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-7 h-11 rounded-md bg-gradient-to-b from-amber-400/80 to-purple-800 border border-amber-300/60 shadow-lg shadow-amber-500/20 rotate-12 flex items-center justify-center">
            <span className="text-[8px] text-amber-100">✧</span>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-7 h-11 rounded-md bg-gradient-to-b from-purple-800 to-indigo-900 border border-purple-300/60 shadow-lg shadow-purple-500/20 -rotate-12 flex items-center justify-center">
            <span className="text-[8px] text-purple-100">☽</span>
          </div>
        </div>

        {/* Center Glowing Crystal Ball */}
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-purple-900 via-[#6b21a8] to-amber-300/40 p-1 shadow-[0_0_50px_rgba(217,119,6,0.35)] flex items-center justify-center">
          {/* Inner crystal glass glow */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#2e1065] to-[#170530] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Glowing fog effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-fuchsia-500/30 to-purple-800/40 animate-pulse" />

            <Moon className="w-10 h-10 text-amber-200 animate-bounce fill-amber-200/30 relative z-10 duration-1000" />

            <div className="absolute bottom-2 text-[10px] text-amber-200/80 font-serif flex items-center gap-1 z-10">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Зөн Билэг</span>
            </div>
          </div>
        </div>
      </div>

      {/* Title & Service */}
      <div className="mt-8 text-center max-w-md relative z-10">
        <span className="text-xs uppercase tracking-widest text-amber-300/80 font-semibold px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30">
          {serviceTitleMn}
        </span>

        <h3 className="text-lg sm:text-xl font-heading font-bold text-amber-100 mt-3 flex items-center justify-center gap-2">
          <span>Хөзрийн дулаан тайлал бичигдэж байна</span>
          <span className="animate-pulse">✨</span>
        </h3>

        {/* Dynamic progressive message */}
        <div className="h-12 flex items-center justify-center mt-2 px-4">
          <p className="text-sm text-purple-200/90 italic transition-all duration-500 text-center animate-fade">
            "{LOADING_MESSAGES_MN[msgIndex]}"
          </p>
        </div>

        {/* Wholesome reassurance in Mongolian */}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-amber-300/70">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Түр хүлээнэ үү, удахгүй нээгдэнэ...</span>
        </div>
      </div>
    </div>
  );
};
