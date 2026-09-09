import React, { useState, useEffect } from 'react';
import { TarotService, TarotCard, DrawnCard, ReadingResult, UserAccount } from '../types';
import { TAROT_DECK } from '../data/tarotDeck';
import { ZODIAC_SIGNS } from '../data/zodiac';
import { TarotCardVisual } from './TarotCardVisual';
import { MagicalLoading } from './MagicalLoading';
import { generateMasterTarotReading } from '../utils/tarotEngine';
import { soundFx } from '../utils/audio';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  Share2,
  RefreshCw,
  Star,
  Compass,
  HelpCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface TarotReadingFlowProps {
  service: TarotService;
  user: UserAccount;
  onBack: () => void;
  onSaveReading: (reading: ReadingResult) => void;
  onOpenTopUp: (service?: TarotService) => void;
  onDeductBalance: (amount: number) => boolean;
}

export const TarotReadingFlow: React.FC<TarotReadingFlowProps> = ({
  service,
  user,
  onBack,
  onSaveReading,
  onOpenTopUp,
  onDeductBalance,
}) => {
  // Steps: 'question' -> 'draw' -> 'loading' -> 'result'
  const [step, setStep] = useState<'question' | 'draw' | 'loading' | 'result'>('question');
  const [question, setQuestion] = useState('');
  const [selectedZodiac, setSelectedZodiac] = useState('Хонь');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);
  const [readingResult, setReadingResult] = useState<ReadingResult | null>(null);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  // Shuffle helper function using Fisher-Yates
  const generateShuffledDeck = () => {
    const deck = [...TAROT_DECK];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  // Reshuffle deck when entering 'draw' step
  useEffect(() => {
    if (step === 'draw') {
      setShuffledDeck(generateShuffledDeck());
      setDrawnCards([]);
    }
  }, [step]);

  // Preset question suggestions in Mongolian
  const QUESTION_PRESETS = [
    'Ойрын хугацаанд би юунд хамгийн их анхаарах нь зөв бэ?',
    'Тэр хүний сэтгэлд би ямар орон зайтай вэ, цаашид яах вэ?',
    'Ажил, санхүүгийн зам мөр минь хаашаа чиглэж байна вэ?',
    'Сэтгэлд буй эргэлзээгээ хэрхэн зөв тайлах вэ?',
  ];

  // Draw card handler
  const handleSelectDeckCard = (card: TarotCard) => {
    if (drawnCards.length >= service.cardCount) return;
    if (drawnCards.some((dc) => dc.card.id === card.id)) return;

    soundFx.playCardDraw();
    const isReversed = Math.random() < 0.28; // 28% chance of reversed card
    const positionIndex = drawnCards.length;
    const positionNameMn = service.positionsMn[positionIndex] || `Хөзөр ${positionIndex + 1}`;

    const newDrawn: DrawnCard = {
      card,
      isReversed,
      positionNameMn,
    };

    const updated = [...drawnCards, newDrawn];
    setDrawnCards(updated);

    // If all cards drawn, trigger loading step
    if (updated.length === service.cardCount) {
      setTimeout(() => {
        executeTarotReading(updated);
      }, 600);
    }
  };

  // Quick / Intuitive draw all remaining cards
  const handleAutoDraw = () => {
    if (drawnCards.length >= service.cardCount) return;
    soundFx.playCardFlip();
    const needed = service.cardCount - drawnCards.length;
    const currentIds = new Set(drawnCards.map((dc) => dc.card.id));
    const available = (shuffledDeck.length > 0 ? shuffledDeck : TAROT_DECK).filter(
      (c) => !currentIds.has(c.id)
    );

    const newlyDrawn: DrawnCard[] = [];
    for (let i = 0; i < needed && i < available.length; i++) {
      const card = available[i];
      const isReversed = Math.random() < 0.28;
      const positionIndex = drawnCards.length + i;
      const positionNameMn = service.positionsMn[positionIndex] || `Хөзөр ${positionIndex + 1}`;
      newlyDrawn.push({
        card,
        isReversed,
        positionNameMn,
      });
    }

    const updated = [...drawnCards, ...newlyDrawn];
    setDrawnCards(updated);

    if (updated.length === service.cardCount) {
      setTimeout(() => {
        executeTarotReading(updated);
      }, 600);
    }
  };

  // Reshuffle deck on demand
  const handleReshuffle = () => {
    soundFx.playCardFlip();
    setShuffledDeck(generateShuffledDeck());
    setDrawnCards([]);
  };

  // Call backend API for reading or generate instant master-level reading
  const executeTarotReading = async (cardsToInterpret: DrawnCard[]) => {
    setStep('loading');

    try {
      let readingData: any = null;

      try {
        const controller = new AbortController();
        const timeoutTimer = setTimeout(() => {
          controller.abort();
        }, 25000);

        const response = await fetch('/api/tarot/reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            serviceId: service.id,
            serviceTitleMn: service.titleMn,
            cards: cardsToInterpret,
            userQuestion: question || 'Хувь тавилан, амьдралын зам мөр',
            clientSign: selectedZodiac,
            clientName: user.name,
          }),
        });

        clearTimeout(timeoutTimer);

        if (response.ok) {
          const data = await response.json();
          if (data && data.reading && data.reading.summaryMn) {
            readingData = data.reading;
          }
        }
      } catch (networkErr) {
        console.warn('Backend reading fetch completed with local fallback engine:', networkErr);
      }

      // If backend failed or wasn't available, generate deep authentic reading directly
      if (!readingData || !readingData.summaryMn) {
        readingData = generateMasterTarotReading(
          cardsToInterpret,
          service.id,
          service.titleMn,
          question || 'Хувь тавилан, амьдралын зам мөр',
          user.name,
          selectedZodiac
        );
      }

      const fullResult: ReadingResult = {
        id: `rdg_${Date.now()}`,
        timestamp: new Date().toISOString(),
        serviceId: service.id,
        serviceTitleMn: service.titleMn,
        userQuestion: question || 'Хувь тавилан, амьдралын зам мөр',
        userName: user.name,
        userSignMn: selectedZodiac,
        drawnCards: cardsToInterpret,
        summaryMn: readingData.summaryMn,
        sectionsMn: Array.isArray(readingData.sectionsMn) && readingData.sectionsMn.length > 0
          ? readingData.sectionsMn
          : [
              {
                title: 'Нөхцөл байдал',
                cardName: 'Хувь тавилан',
                content: 'Таны амьдралд таатай боломжууд нээгдэж байна.',
              },
            ],
        overallEnergyMn: readingData.overallEnergyMn,
        keyChallengeMn: readingData.keyChallengeMn,
        keyBlessingMn: readingData.keyBlessingMn,
        adviceMn: readingData.adviceMn || '1. Зөн совингоо сонсож, өөртөө итгэлтэй урагшил.\n2. Өнгөрсөн харамслаа тавьж явуул.\n3. Өнөөдрөөс эхлэн бодит алхам хий.',
        affirmationMn: readingData.affirmationMn || 'Би хувь тавилангийнхаа гэрэлт эзэн нь мөн.',
        luckyElementsMn: {
          color: readingData.luckyColorMn || 'Алтан шаргал',
          number: readingData.luckyNumber || 7,
          time: readingData.luckyTimeMn || 'Үдшийн бүрий (19:00 - 21:00)',
        },
      };

      setReadingResult(fullResult);
      onSaveReading(fullResult);

      // Transition to result
      setTimeout(() => {
        setStep('result');
        cardsToInterpret.forEach((_, idx) => {
          setTimeout(() => {
            setRevealedIndices((prev) => [...prev, idx]);
          }, idx * 120);
        });
      }, 700);
    } catch (err) {
      console.error('Reading execution error:', err);
      // Absolute fallback guarantee
      const masterFallback = generateMasterTarotReading(
        cardsToInterpret,
        service.id,
        service.titleMn,
        question || 'Хувь тавилан, амьдралын зам мөр',
        user.name,
        selectedZodiac
      );

      const fallbackResult: ReadingResult = {
        id: `rdg_${Date.now()}`,
        timestamp: new Date().toISOString(),
        serviceId: service.id,
        serviceTitleMn: service.titleMn,
        userQuestion: question || 'Хувь тавилан, амьдралын зам мөр',
        userName: user.name,
        userSignMn: selectedZodiac,
        drawnCards: cardsToInterpret,
        summaryMn: masterFallback.summaryMn,
        sectionsMn: masterFallback.sectionsMn,
        overallEnergyMn: masterFallback.overallEnergyMn,
        keyChallengeMn: masterFallback.keyChallengeMn,
        keyBlessingMn: masterFallback.keyBlessingMn,
        adviceMn: masterFallback.adviceMn,
        affirmationMn: masterFallback.affirmationMn,
        luckyElementsMn: {
          color: masterFallback.luckyColorMn,
          number: masterFallback.luckyNumber,
          time: masterFallback.luckyTimeMn,
        },
      };

      setReadingResult(fallbackResult);
      onSaveReading(fallbackResult);
      setStep('result');
      cardsToInterpret.forEach((_, idx) => {
        setTimeout(() => {
          setRevealedIndices((prev) => [...prev, idx]);
        }, idx * 120);
      });
    }
  };

  const handleShare = () => {
    if (!readingResult) return;
    const text = `✨ [Таротмн - Жинхэнэ Таротын Тайлал]\nҮйлчилгээ: ${readingResult.serviceTitleMn}\nАсуулт: "${readingResult.userQuestion}"\n\nДүгнэлт:\n${readingResult.summaryMn}\n\nЗөвлөгөө:\n${readingResult.adviceMn}\n\nБатламж үг: "${readingResult.affirmationMn}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-800/50 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Үйлчилгээ рүү буцах</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-purple-950/80 border border-amber-400/30 text-xs text-amber-200 font-medium">
            Үлдэгдэл: <strong className="text-amber-300 font-mono">{user.balanceMnt.toLocaleString()}₮</strong>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold">
            {service.titleMn}
          </span>
        </div>
      </div>

      {/* STEP 1: Question & Zodiac preparation */}
      {step === 'question' && (
        <div className="max-w-xl mx-auto rounded-3xl bg-gradient-to-b from-[#241544] via-[#1a0e33] to-[#120824] border-2 border-amber-400/40 p-6 sm:p-8 shadow-2xl text-[#f7ebdb] animate-fade">
          <div className="text-center mb-6">
            <div className="inline-flex p-2.5 rounded-2xl bg-amber-400/15 text-amber-300 mb-2.5 border border-amber-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-amber-100">
              Сэтгэлээ төвлөрүүлж, асуултаа бичээрэй
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-1.5 leading-relaxed">
              Сэтгэлдээ тээсэн бодит асуултаа бичээрэй. Таротын мэргэжлийн хөзрүүд таны нөхцөл байдлыг тольдон, үнэн чиглүүлэг өгөх болно.
            </p>
          </div>

          {/* Question Input */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-amber-200 mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Таны асуулт:</span>
            </label>
            <textarea
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Жишээ нь: Би ойрын хугацаанд ямар шийдвэр гаргах нь зөв бэ?"
              className="w-full px-4 py-3 rounded-2xl bg-purple-950/60 border border-purple-700/60 focus:border-amber-400 text-sm text-purple-100 placeholder-purple-400/50 outline-none transition resize-none"
            />
          </div>

          {/* Quick presets */}
          <div className="mb-6">
            <div className="text-[11px] font-medium text-purple-300/80 mb-2">
              Түгээмэл асуултуудаас сонгох:
            </div>
            <div className="flex flex-wrap gap-2">
              {QUESTION_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuestion(preset)}
                  className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 text-[11px] text-purple-200 hover:text-amber-200 transition text-left cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Zodiac selection */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-amber-200 mb-1.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Таны орд (Санамсаргүйгээр тааруулах):</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {ZODIAC_SIGNS.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setSelectedZodiac(z.nameMn)}
                  className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-0.5 transition cursor-pointer ${
                    selectedZodiac === z.nameMn
                      ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-bold shadow-sm'
                      : 'bg-purple-950/40 border-purple-800/50 text-purple-300 hover:text-white hover:bg-purple-900/40'
                  }`}
                >
                  <span className="text-base">{z.symbol}</span>
                  <span className="text-[11px]">{z.nameMn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={() => {
              if (user.balanceMnt < service.priceMnt) {
                onOpenTopUp(service);
                return;
              }
              const deducted = onDeductBalance(service.priceMnt);
              if (!deducted) {
                onOpenTopUp(service);
                return;
              }
              setStep('draw');
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-gray-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Хөзрөө дэлгэж сонгох ({service.priceMnt.toLocaleString()}₮)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Draw Cards Interactively */}
      {step === 'draw' && (
        <div className="text-center animate-fade">
          <div className="mb-6">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Сонгосон: {drawnCards.length} / {service.cardCount}
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-amber-100 mt-2">
              Хөзрөө мэдрэмжээрээ сонгоорой
            </h3>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
              Дэлгэгдсэн хөзрүүдээс өөрт хамгийн их татагдаж буй {service.cardCount} хөзрийг товшин сонгоно уу.
            </p>
          </div>

          {/* Drawn Slots Layout */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-8 p-4 rounded-3xl bg-purple-950/40 border border-purple-800/40 min-h-[220px]">
            {Array.from({ length: service.cardCount }).map((_, slotIdx) => {
              const drawn = drawnCards[slotIdx];
              const posName = service.positionsMn[slotIdx] || `Хөзөр ${slotIdx + 1}`;

              return (
                <div key={slotIdx} className="flex flex-col items-center">
                  <span className="text-[11px] font-medium text-amber-300/80 mb-1.5 text-center max-w-[120px] truncate">
                    {posName}
                  </span>
                  {drawn ? (
                    <div className="animate-fade">
                      <TarotCardVisual
                        card={drawn.card}
                        isRevealed={false}
                        size="sm"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-40 rounded-xl border-2 border-dashed border-amber-400/30 bg-purple-950/40 flex flex-col items-center justify-center text-purple-400 text-xs p-2 text-center">
                      <span className="text-amber-400 text-base mb-1">✧</span>
                      <span>Сонгохыг хүлээнэ</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Deck controls & actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              type="button"
              onClick={handleReshuffle}
              className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/60 text-purple-200 text-xs font-medium flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
              <span>Хөзрүүдийг дахин холих</span>
            </button>

            {drawnCards.length < service.cardCount && (
              <button
                type="button"
                onClick={handleAutoDraw}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400/20 to-purple-800/40 hover:from-amber-400/30 hover:to-purple-800/60 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Санамсаргүйгээр автоматаар татах</span>
              </button>
            )}
          </div>

          {/* Fanned Out Deck to Choose from */}
          <div className="relative py-4 px-2 overflow-x-auto">
            <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 min-w-full pb-4">
              {(shuffledDeck.length > 0 ? shuffledDeck : TAROT_DECK).slice(0, 22).map((card, cIdx) => {
                const isAlreadySelected = drawnCards.some((dc) => dc.card.id === card.id);
                return (
                  <button
                    key={card.id}
                    onClick={() => handleSelectDeckCard(card)}
                    disabled={isAlreadySelected || drawnCards.length >= service.cardCount}
                    className={`relative w-14 sm:w-16 h-24 sm:h-28 rounded-lg border border-amber-300/40 bg-gradient-to-br from-[#241744] via-[#1a0e33] to-[#120726] shadow-md transition-all duration-300 select-none ${
                      isAlreadySelected
                        ? 'opacity-30 translate-y-4 pointer-events-none'
                        : 'hover:-translate-y-3 hover:scale-105 hover:border-amber-400 cursor-pointer active:scale-95'
                    }`}
                    style={{
                      transform: isAlreadySelected ? 'translateY(12px)' : `rotate(${(cIdx - 11) * 1.3}deg)`,
                    }}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-between p-1">
                      <div className="w-full text-right text-[8px] text-amber-300/60 font-mono">✦</div>
                      <div className="w-6 h-9 rounded border border-amber-400/30 flex items-center justify-center text-amber-200/50 text-[10px]">
                        ★
                      </div>
                      <div className="w-full text-left text-[8px] text-amber-300/60 font-mono">✦</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Magical Loading */}
      {step === 'loading' && <MagicalLoading serviceTitleMn={service.titleMn} />}

      {/* STEP 4: Authentic Master Tarot Result View */}
      {step === 'result' && readingResult && (
        <div className="space-y-6 sm:space-y-8 animate-fade">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#20103a] via-[#2d1250] to-[#18082e] border-2 border-amber-400/40 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{readingResult.serviceTitleMn}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-amber-100">
                Таротын Жинхэнэ Тайлал
              </h2>
              <div className="mt-2 text-xs sm:text-sm text-purple-200/90 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Үйлчлүүлэгч: <strong className="text-amber-300">{readingResult.userName}</strong></span>
                {readingResult.userSignMn && <span>Орд: <strong className="text-amber-300">{readingResult.userSignMn}</strong></span>}
                <span>Асуулт: <em className="text-amber-100">"{readingResult.userQuestion}"</em></span>
              </div>
            </div>
          </div>

          {/* Cards Visual Row */}
          <div className="p-5 sm:p-7 rounded-3xl bg-[#15092a]/90 border border-purple-800/50 shadow-xl">
            <div className="mb-4 text-center sm:text-left">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                ТАТСАН ХӨЗРҮҮД БА БАЙРЛАЛ
              </h3>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
              {readingResult.drawnCards.map((drawn, idx) => (
                <TarotCardVisual
                  key={idx}
                  card={drawn.card}
                  isReversed={drawn.isReversed}
                  isRevealed={revealedIndices.includes(idx)}
                  positionLabel={drawn.positionNameMn}
                  size="md"
                />
              ))}
            </div>
          </div>

          {/* Grand Synthesis Section (Authentic & Direct) */}
          <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-[#1f103d] to-[#140829] border-2 border-amber-400/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Картуудын Нэгдсэн Холбоо ба Дүгнэлт</span>
            </div>

            <div className="text-sm sm:text-base text-purple-100 leading-relaxed font-serif-reading whitespace-pre-line bg-purple-950/40 p-4 sm:p-5 rounded-2xl border border-purple-800/40">
              {readingResult.summaryMn}
            </div>

            {/* Key Challenge & Key Blessing highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Анхаарах гол сорилт:</span>
                </div>
                <p className="text-xs sm:text-sm text-purple-200">
                  {readingResult.keyChallengeMn || 'Өнгөрсний эргэлзээндээ хүлэгдэхгүй, зоригтой урагшлах.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-1">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Таны талд буй давуу тал:</span>
                </div>
                <p className="text-xs sm:text-sm text-purple-200">
                  {readingResult.keyBlessingMn || 'Өөрийн дотоод зөн совиндоо итгэж, шинэ эхлэлийг бүтээх чадвар.'}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Per-Card Deep Interpretations */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-heading font-bold text-amber-100 flex items-center gap-2">
              <span>Хөзөр тус бүрийн нарийвчилсан тайлал</span>
              <span className="text-xs font-normal text-purple-300/80">({readingResult.sectionsMn.length} хөзөр)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readingResult.sectionsMn.map((sec, sIdx) => {
                const matchedDrawn = readingResult.drawnCards[sIdx];
                const isRev = matchedDrawn?.isReversed;
                const card = matchedDrawn?.card;

                return (
                  <div
                    key={sIdx}
                    className="p-5 rounded-2xl bg-[#190c30] border border-purple-800/60 hover:border-amber-400/40 transition flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      {/* Header and orientation tag */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-purple-800/40">
                        <h4 className="text-sm sm:text-base font-bold text-amber-200 font-heading">
                          {sec.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isRev
                              ? 'bg-rose-950/60 border-rose-400/50 text-rose-300'
                              : 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                          }`}
                        >
                          {isRev ? 'Урвуу байрлал' : 'Босоо байрлал'}
                        </span>
                      </div>

                      {/* Element and Card metadata */}
                      {card && (
                        <div className="text-[11px] text-purple-300/80 mb-2.5 flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-purple-950 border border-purple-800/40">
                            {card.elementMn} махбодь
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-950 border border-purple-800/40">
                            {card.planetaryMn}
                          </span>
                        </div>
                      )}

                      {/* Deep text */}
                      <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed font-serif-reading whitespace-pre-line">
                        {sec.content}
                      </p>
                    </div>

                    {/* Keywords pills */}
                    {card && card.keywordsMn && (
                      <div className="mt-3 pt-2.5 border-t border-purple-900/50 flex flex-wrap gap-1.5">
                        {card.keywordsMn.map((kw, kIdx) => (
                          <span
                            key={kIdx}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/70 border border-purple-800/50 text-purple-300"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advice & Affirmation Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Actionable Advice */}
            <div className="p-5 sm:p-6 rounded-3xl bg-amber-950/20 border-2 border-amber-400/30 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Амьдралд хэрэгжүүлэх 3 алхамт зөвлөгөө:</span>
                </h4>
                <div className="text-xs sm:text-sm text-purple-100 whitespace-pre-line leading-relaxed font-serif-reading">
                  {readingResult.adviceMn}
                </div>
              </div>
            </div>

            {/* Affirmation & Lucky Elements */}
            <div className="p-5 sm:p-6 rounded-3xl bg-purple-950/40 border-2 border-purple-700/40 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-pink-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>Сэтгэл сэргээх батламж үг:</span>
                </h4>
                <blockquote className="text-sm sm:text-base text-amber-100 italic p-3 rounded-2xl bg-purple-900/30 border border-purple-800/30 mb-3">
                  "{readingResult.affirmationMn}"
                </blockquote>
              </div>

              {/* Lucky Elements in Mongolian */}
              {readingResult.luckyElementsMn && (
                <div className="pt-2.5 border-t border-purple-800/40 flex flex-wrap items-center justify-between text-xs text-purple-200 gap-2">
                  <span>Ээлтэй өнгө: <strong className="text-amber-300">{readingResult.luckyElementsMn.color}</strong></span>
                  <span>Азын тоо: <strong className="text-amber-300">{readingResult.luckyElementsMn.number}</strong></span>
                  <span>Ээлтэй цаг: <strong className="text-amber-300">{readingResult.luckyElementsMn.time}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar (Share, Copy, Return, New Reading with Balance Check) */}
          <div className="flex flex-col items-center gap-3 pt-5 border-t border-purple-800/40">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleShare}
                className="px-4 py-2.5 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-amber-400/30 text-amber-200 text-xs font-bold flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-300" />}
                <span>{copied ? 'Уншлага хуулагдлаа!' : 'Тайланг хуулах'}</span>
              </button>

              <button
                onClick={onBack}
                className="px-4 py-2.5 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800/60 text-purple-200 text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Буцах</span>
              </button>

              {/* Option A: Ask new question without charging yet */}
              <button
                onClick={() => {
                  setDrawnCards([]);
                  setRevealedIndices([]);
                  setReadingResult(null);
                  setQuestion('');
                  setStep('question');
                }}
                className="px-4 py-2.5 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-purple-300" />
                <span>Шинэ асуулт тавих</span>
              </button>

              {/* Option B: Immediately draw again with single deduction */}
              {user.balanceMnt >= service.priceMnt ? (
                <button
                  onClick={() => {
                    const deducted = onDeductBalance(service.priceMnt);
                    if (!deducted) {
                      onOpenTopUp(service);
                      return;
                    }
                    soundFx.playCardFlip();
                    setShuffledDeck(generateShuffledDeck());
                    setDrawnCards([]);
                    setRevealedIndices([]);
                    setReadingResult(null);
                    setStep('draw');
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-gray-950 text-xs font-bold flex items-center gap-2 transition active:scale-95 shadow-lg shadow-amber-500/25 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Шууд дахин татах ({service.priceMnt.toLocaleString()}₮)</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenTopUp(service)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 hover:from-purple-700 hover:to-purple-600 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Данс цэнэглээд дахин үзэх</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
