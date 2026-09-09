import React from 'react';
import { TarotService, UserAccount } from '../types';
import { Sparkles, Heart, Eye, Clock, Check, ArrowRight, Lock } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ServicesSectionProps {
  services: TarotService[];
  user: UserAccount | null;
  onSelectService: (service: TarotService) => void;
  onOpenAuth: () => void;
  onOpenTopUp: (service: TarotService) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  user,
  onSelectService,
  onOpenAuth,
  onOpenTopUp,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-amber-300" />;
      case 'Heart':
        return <Heart className="w-6 h-6 text-pink-300 fill-pink-400/20" />;
      case 'Eye':
        return <Eye className="w-6 h-6 text-teal-300" />;
      default:
        return <Sparkles className="w-6 h-6 text-amber-300" />;
    }
  };

  const handleServiceClick = (service: TarotService) => {
    soundFx.playChime();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (user.balanceMnt < service.priceMnt) {
      onOpenTopUp(service);
      return;
    }
    onSelectService(service);
  };

  return (
    <div className="py-8 sm:py-12">
      {/* Warm and friendly Hero Header */}
      <div className="text-center max-w-2xl mx-auto px-4 mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-200 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Таротмн — Сэтгэлд дулаахан таротын уншлага</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-amber-100 tracking-tight">
          Таны Сэтгэлийн Толь
        </h1>

        <p className="mt-3 text-sm sm:text-base text-purple-200/90 leading-relaxed">
          Эргэлзээ, бодлоо хуваалцаж, таротын мэргэн хөзрүүдээс өөрт хэрэгтэй зөвлөгөө, дулаан ухаарлыг аваарай.
        </p>

        {/* Client Access Notice in Mongolian */}
        {!user ? (
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs">
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span>Үйлчилгээ авахын тулд эхлээд Google-ээр нэвтэрнэ үү.</span>
          </div>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              Үлдэгдэл: <strong className="text-white font-mono">{user.balanceMnt.toLocaleString()}₮</strong>
            </span>
          </div>
        )}
      </div>

      {/* The 3 Tarot Services Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {services.map((service, idx) => {
            const hasEnoughBalance = user && user.balanceMnt >= service.priceMnt;
            const isHighlighted = service.id === 'love' || service.id === 'three-cards';

            return (
              <div
                key={service.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 border-2 ${
                  isHighlighted
                    ? 'bg-gradient-to-b from-[#241442] via-[#1a0e30] to-[#120722] border-amber-400/60 shadow-xl shadow-amber-500/10 hover:border-amber-300'
                    : 'bg-gradient-to-b from-[#1e0f36] via-[#160a2a] to-[#10061e] border-purple-800/60 shadow-lg shadow-purple-950/60 hover:border-purple-600'
                }`}
              >
                {/* Badge */}
                {service.badgeMn && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 text-[11px] font-bold shadow-md tracking-wide">
                    {service.badgeMn}
                  </div>
                )}

                {/* Card Top: Icon & Service Title */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-900/60 border border-amber-400/30 flex items-center justify-center shadow-md">
                      {getIcon(service.iconName)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-purple-300/80 bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-800/40">
                      <Clock className="w-3 h-3 text-amber-300" />
                      <span>{service.estimatedTimeMn}</span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className="text-[11px] text-amber-400/80 font-semibold tracking-wider uppercase">
                      Үйлчилгээ {idx + 1}
                    </span>
                    <h3 className="text-xl font-heading font-bold text-amber-100 mt-0.5">
                      {service.titleMn}
                    </h3>
                    <p className="text-xs text-purple-300 font-medium mt-0.5">
                      {service.subtitleMn}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="my-3.5 p-3 rounded-2xl bg-purple-950/70 border border-purple-800/40 flex items-baseline justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-amber-300 font-mono">
                          {service.priceMnt.toLocaleString()}₮
                        </span>
                        <span className="text-xs text-purple-400/70 line-through">
                          {service.originalPriceMnt.toLocaleString()}₮
                        </span>
                      </div>
                      <span className="text-[10px] text-purple-300/70">
                        {service.cardCount} хөзрийн тайлал
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      ХӨНГӨЛӨЛТТЭЙ
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-purple-200/90 font-serif-reading mb-4 leading-relaxed">
                    {service.shortDescMn}
                  </p>

                  {/* Positions in spread */}
                  <div className="mb-4">
                    <span className="text-[11px] font-semibold text-amber-200/90 block mb-1.5">
                      Татлагад багтах хөзрүүд:
                    </span>
                    <ul className="space-y-1 text-xs text-purple-200/80">
                      {service.positionsMn.map((pos, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 text-xs">✦</span>
                          <span>{pos}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Bottom CTA Button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleServiceClick(service)}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg active:scale-[0.98] ${
                      !user
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 shadow-amber-500/20'
                        : hasEnoughBalance
                        ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-gray-950 shadow-amber-500/30 ring-2 ring-amber-300/40'
                        : 'bg-purple-900/60 hover:bg-purple-800/80 text-amber-200 border border-amber-400/30'
                    }`}
                  >
                    {!user ? (
                      <>
                        <Lock className="w-4 h-4 text-gray-950" />
                        <span>Google-ээр нэвтрэх</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : hasEnoughBalance ? (
                      <>
                        <Sparkles className="w-4 h-4 text-gray-950" />
                        <span>Мэргэлэх ({service.priceMnt.toLocaleString()}₮)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Данс цэнэглэх ({service.priceMnt.toLocaleString()}₮)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="mt-1.5 text-center text-[10px] text-purple-300/60">
                    {!user
                      ? 'Нэвтрээд үйлчилгээгээ шууд авна'
                      : hasEnoughBalance
                      ? 'Таны үлдэгдлээс шууд суутгагдана'
                      : 'Үлдэгдэл хүрэлцэхгүй тул цэнэглэнэ үү'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
