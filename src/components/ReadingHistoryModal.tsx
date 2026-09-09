import React, { useState } from 'react';
import { ReadingResult } from '../types';
import { X, History, Trash2, Calendar, Sparkles, ChevronRight, BookOpen, Share2, Check } from 'lucide-react';
import { TarotCardVisual } from './TarotCardVisual';
import { soundFx } from '../utils/audio';

interface ReadingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ReadingResult[];
  onDeleteHistoryItem: (id: string) => void;
  onClearAll: () => void;
}

export const ReadingHistoryModal: React.FC<ReadingHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onDeleteHistoryItem,
  onClearAll,
}) => {
  const [selectedReading, setSelectedReading] = useState<ReadingResult | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = (reading: ReadingResult) => {
    const text = `✨ [Таротмн - Таротын Тайлал]\nҮйлчилгээ: ${reading.serviceTitleMn}\nАсуулт: "${reading.userQuestion}"\n\nДүгнэлт:\n${reading.summaryMn}\n\nЗөвлөгөө:\n${reading.adviceMn}\n\nБатламж үг: "${reading.affirmationMn}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundFx.playChime();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-gradient-to-b from-[#241542] via-[#190d30] to-[#100720] border-2 border-amber-400/40 p-5 sm:p-8 shadow-2xl shadow-purple-950 flex flex-col text-[#f7ebdb] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-800/40 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-900/60 border border-amber-400/30 flex items-center justify-center text-teal-300 shadow-md">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-amber-100">
                Миний Мэргэний Түүх
              </h3>
              <p className="text-xs text-purple-300/80">
                Таны хийлгэсэн таротын уншлагууд энд хадгалагдана.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && !selectedReading && (
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-rose-950/60 border border-purple-800/50 hover:border-rose-700/50 text-purple-300 hover:text-rose-300 text-xs flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Бүгдийг арилгах</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-amber-200/70 hover:text-white hover:bg-purple-900/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1">
          {selectedReading ? (
            /* Detailed view of a single historical reading */
            <div className="space-y-6 animate-fade">
              <button
                onClick={() => setSelectedReading(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700/40 text-xs text-amber-300 transition"
              >
                ← Буцах (Жагсаалт руу)
              </button>

              <div className="p-4 sm:p-6 rounded-2xl bg-purple-950/60 border border-amber-400/30">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-800/40 pb-3 mb-4">
                  <div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-semibold">
                      {selectedReading.serviceTitleMn}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-amber-100 mt-1">
                      "{selectedReading.userQuestion}"
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-300/80 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(selectedReading.timestamp).toLocaleDateString('mn-MN')}
                    </span>
                    <button
                      onClick={() => handleShare(selectedReading)}
                      className="px-3 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs flex items-center gap-1 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Хуулагдлаа' : 'Хуулах'}</span>
                    </button>
                  </div>
                </div>

                {/* Drawn cards miniature row */}
                <div className="flex flex-wrap items-center justify-center gap-4 my-6">
                  {selectedReading.drawnCards.map((drawn, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <TarotCardVisual
                        card={drawn.card}
                        isReversed={drawn.isReversed}
                        positionLabel={drawn.positionNameMn}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mb-6 p-4 rounded-xl bg-[#160b29] border border-purple-800/40 text-sm text-purple-100/90 leading-relaxed font-serif-reading">
                  <h5 className="font-heading font-bold text-amber-300 text-xs uppercase tracking-wider mb-2">
                    ✦ Сэтгэлд дулаахан дүгнэлт
                  </h5>
                  <p>{selectedReading.summaryMn}</p>
                </div>

                {/* Sections */}
                <div className="space-y-4 mb-6">
                  {selectedReading.sectionsMn.map((sec, sIdx) => (
                    <div key={sIdx} className="p-4 rounded-xl bg-purple-900/30 border border-purple-800/30">
                      <h6 className="font-bold text-amber-200 text-sm mb-1 font-heading">{sec.title}</h6>
                      <p className="text-xs sm:text-sm text-purple-200/90 font-serif-reading leading-relaxed">
                        {sec.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Advice & Affirmation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-400/30">
                    <h6 className="font-bold text-amber-300 text-xs uppercase tracking-wider mb-2">
                      🌟 Сэтгэлийн Зөвлөгөө
                    </h6>
                    <p className="text-xs sm:text-sm text-purple-200 whitespace-pre-line font-serif-reading">
                      {selectedReading.adviceMn}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-900/30 border border-purple-700/40 flex flex-col justify-center">
                    <h6 className="font-bold text-pink-300 text-xs uppercase tracking-wider mb-2">
                      ✨ Батламж Үг
                    </h6>
                    <blockquote className="text-xs sm:text-sm text-amber-100 italic">
                      "{selectedReading.affirmationMn}"
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          ) : history.length === 0 ? (
            /* Empty state in Mongolian */
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-950/80 border border-purple-800 flex items-center justify-center mx-auto mb-4 text-purple-400">
                <BookOpen className="w-8 h-8 text-amber-300/70" />
              </div>
              <h4 className="text-base font-bold text-amber-100">
                Одоогоор уншлагын түүх байхгүй байна
              </h4>
              <p className="text-xs text-purple-300/80 mt-1 max-w-sm mx-auto">
                Та дээрх 3 таротын үйлчилгээнээс сонгон мэргэлснээр таны түүх энд автоматаар хадгалагдах болно.
              </p>
            </div>
          ) : (
            /* List of past readings */
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-purple-950/60 hover:bg-purple-900/40 border border-purple-800/40 hover:border-amber-400/40 transition flex items-center justify-between gap-3 cursor-pointer group"
                  onClick={() => setSelectedReading(item)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30 text-amber-300">
                        {item.serviceTitleMn}
                      </span>
                      <span className="text-[11px] text-purple-300/70 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleDateString('mn-MN')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-amber-100 truncate group-hover:text-amber-200 transition">
                      "{item.userQuestion}"
                    </h4>

                    <p className="text-xs text-purple-200/70 line-clamp-1 font-serif-reading mt-0.5">
                      {item.summaryMn}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-purple-400">
                        {item.drawnCards.length} хөзөр:
                      </span>
                      <div className="flex items-center gap-1">
                        {item.drawnCards.map((c, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-200 truncate max-w-[90px]"
                          >
                            {c.card.nameMn.split(' (')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistoryItem(item.id);
                      }}
                      className="p-2 rounded-xl text-purple-400 hover:text-rose-300 hover:bg-rose-950/50 transition"
                      title="Устгах"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-2 rounded-xl bg-amber-400/10 text-amber-300 group-hover:translate-x-1 transition">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
