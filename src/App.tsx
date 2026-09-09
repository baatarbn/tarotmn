import React, { useState, useEffect } from 'react';
import { UserAccount, TarotService, ReadingResult } from './types';
import { TAROT_SERVICES } from './data/tarotDeck';
import { Navbar } from './components/Navbar';
import { ServicesSection } from './components/ServicesSection';
import { TarotReadingFlow } from './components/TarotReadingFlow';
import { HoroscopeSection } from './components/HoroscopeSection';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { TopUpModal } from './components/TopUpModal';
import { ReadingHistoryModal } from './components/ReadingHistoryModal';
import { soundFx } from './utils/audio';
import { Sparkles, Moon, Shield, Heart, HelpCircle } from 'lucide-react';

const USER_STORAGE_KEY = 'mongol_tarot_user_v1';
const HISTORY_STORAGE_KEY = 'mongol_tarot_history_v1';

export default function App() {
  // Authentication & Profile state
  const [user, setUser] = useState<UserAccount | null>(null);

  // Active view: 'services' | 'horoscope'
  const [activeView, setActiveView] = useState<'services' | 'horoscope'>('services');

  // Currently active tarot reading session
  const [activeService, setActiveService] = useState<TarotService | null>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [topUpTargetService, setTopUpTargetService] = useState<TarotService | null>(null);

  // Reading history
  const [readingHistory, setReadingHistory] = useState<ReadingResult[]>([]);

  // Load user & history from localStorage on startup
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setReadingHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error('Storage error:', e);
    }
  }, []);

  // Sync user state to localStorage
  const handleUpdateUser = (updatedUser: UserAccount | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  // Balance update handler
  const handleBalanceUpdated = (newBalance: number) => {
    if (!user) return;
    const updated = { ...user, balanceMnt: newBalance };
    handleUpdateUser(updated);
  };

  // Logout handler
  const handleLogout = () => {
    soundFx.playChime();
    handleUpdateUser(null);
    setActiveService(null);
  };

  // Select service to start reading
  const handleSelectService = (service: TarotService) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (user.balanceMnt < service.priceMnt) {
      setTopUpTargetService(service);
      setIsTopUpOpen(true);
      return;
    }

    // Do NOT deduct balance yet. The fee is deducted once when the user confirms their reading in TarotReadingFlow.
    setActiveService(service);
  };

  // Safe fee deduction helper
  const handleDeductFee = (amount: number): boolean => {
    if (!user) return false;
    if (user.balanceMnt < amount) return false;
    const newBalance = user.balanceMnt - amount;
    handleBalanceUpdated(newBalance);
    return true;
  };

  // Open top-up with recommended service (requires login)
  const handleOpenTopUp = (target?: TarotService) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setTopUpTargetService(target || null);
    setIsTopUpOpen(true);
  };

  // Save completed reading to history
  const handleSaveReading = (newReading: ReadingResult) => {
    const updated = [newReading, ...readingHistory];
    setReadingHistory(updated);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  };

  // Delete reading from history
  const handleDeleteHistoryItem = (id: string) => {
    const updated = readingHistory.filter((item) => item.id !== id);
    setReadingHistory(updated);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  };

  // Clear all history
  const handleClearAllHistory = () => {
    setReadingHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-[#0e0618] text-[#f7ebdb] selection:bg-amber-400 selection:text-gray-950 flex flex-col font-sans relative overflow-x-hidden">
      {/* Mystical Background Atmospheric Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-amber-500/10 blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-indigo-600/15 blur-[140px]" />
      </div>

      {/* Main Navbar */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenTopUp={() => handleOpenTopUp()}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onLogout={handleLogout}
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          setActiveService(null);
        }}
      />

      {/* Main Body */}
      <main className="flex-1 relative z-10 pb-8">
        {activeService && user ? (
          /* Active Interactive Reading Flow */
          <TarotReadingFlow
            service={activeService}
            user={user}
            onBack={() => setActiveService(null)}
            onSaveReading={handleSaveReading}
            onOpenTopUp={handleOpenTopUp}
            onDeductBalance={handleDeductFee}
          />
        ) : activeView === 'services' ? (
          /* The 3 Core Services Display */
          <ServicesSection
            services={TAROT_SERVICES}
            user={user}
            onSelectService={handleSelectService}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenTopUp={handleOpenTopUp}
          />
        ) : (
          /* Personalized Daily Horoscope Section */
          <HoroscopeSection />
        )}
      </main>

      {/* Wholesome Warm Mongolian Footer */}
      <footer className="relative z-10 border-t border-purple-800/40 bg-[#0c0416] py-10 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-6 text-xs text-purple-300/80">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 border border-amber-300/30">
                <Moon className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-base text-amber-100">
                Tarotmn (Таротмн)
              </span>
            </div>
            <p className="font-serif-reading leading-relaxed">
              Зүрх сэтгэлд тань дулаан итгэл, амар амгалан, гэгээлэг ухаарал бэлэглэх таротын дотно орчин.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-amber-200 uppercase tracking-wider mb-2 text-xs">
              3 Үйлчилгээ
            </h4>
            <ul className="space-y-1.5">
              <li>• 3 Хөзрийн тайлал — 5,000₮</li>
              <li>• Хайр сэтгэлийн толь — 9,000₮</li>
              <li>• Ирээдүйн бүрэн скан — 18,000₮</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-amber-200 uppercase tracking-wider mb-2 text-xs">
              Нэвтрэлт & Төлбөр
            </h4>
            <ul className="space-y-1.5">
              <li>• Зөвхөн Google аккаунтаар хялбар нэвтрэх</li>
              <li>• Төлбөр төлөхөд тун хялбар</li>
            </ul>
            <div className="mt-3 flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <Shield className="w-3.5 h-3.5" />
              <span>Таны асуулт, хувийн мэдээлэл нууцлагдмал</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-4 border-t border-purple-900/40 text-center text-xs text-purple-400/60 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Tarotmn (Таротмн). Бүх эрх хуулиар хамгаалагдсан.</span>
          <span className="flex items-center gap-1 text-purple-300/80">
            Хайраар бүтээв <Heart className="w-3 h-3 text-rose-400 fill-rose-400/50 inline" />
          </span>
        </div>
      </footer>

      {/* Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccessLogin={(newUser) => {
          handleUpdateUser(newUser);
        }}
      />

      {/* Top Up Modal with QPay & Bank Transfer */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => {
          setIsTopUpOpen(false);
          setTopUpTargetService(null);
        }}
        user={user}
        onBalanceUpdated={handleBalanceUpdated}
        recommendedAmount={topUpTargetService ? topUpTargetService.priceMnt : 5000}
        serviceTitleTarget={topUpTargetService ? topUpTargetService.titleMn : undefined}
      />

      {/* Reading History Modal */}
      <ReadingHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={readingHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
      />
    </div>
  );
}
