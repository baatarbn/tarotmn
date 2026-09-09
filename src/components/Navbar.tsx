import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Sparkles, Moon, PlusCircle, LogOut, History, Compass, User, Wallet } from 'lucide-react';

interface NavbarProps {
  user: UserAccount | null;
  onOpenAuth: () => void;
  onOpenTopUp: () => void;
  onOpenHistory: () => void;
  onLogout: () => void;
  activeView: 'services' | 'horoscope';
  setActiveView: (view: 'services' | 'horoscope') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onOpenTopUp,
  onOpenHistory,
  onLogout,
  activeView,
  setActiveView,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#120824]/85 border-b border-purple-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Brand */}
        <div
          onClick={() => setActiveView('services')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-purple-600 to-purple-900 p-0.5 shadow-lg shadow-purple-900/50 group-hover:scale-105 transition">
            <div className="w-full h-full rounded-[14px] bg-[#1a0f30] flex items-center justify-center relative overflow-hidden">
              <Moon className="w-5 h-5 text-amber-300 fill-amber-300/30" />
              <Sparkles className="w-3 h-3 text-amber-200 absolute top-1 right-1 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-lg sm:text-xl text-amber-100 tracking-tight">
                Tarotmn
              </span>
              <span className="text-amber-400 text-xs">✦</span>
            </div>
            <p className="text-[11px] text-purple-300/70 -mt-1 font-medium">
              Таротмн
            </p>
          </div>
        </div>

        {/* Center Nav Items */}
        <div className="hidden md:flex items-center gap-1 bg-purple-950/60 p-1.5 rounded-2xl border border-purple-800/40">
          <button
            onClick={() => setActiveView('services')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeView === 'services'
                ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40 shadow-sm'
                : 'text-purple-300/80 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Таротын Үйлчилгээнүүд</span>
          </button>

          <button
            onClick={() => setActiveView('horoscope')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeView === 'horoscope'
                ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40 shadow-sm'
                : 'text-purple-300/80 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-purple-300" />
            <span>Өдрийн Зурхай</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-purple-300/80 hover:text-white hover:bg-purple-900/40 transition"
          >
            <History className="w-3.5 h-3.5 text-teal-300" />
            <span>Мэргэний Түүх</span>
          </button>
        </div>

        {/* Right Section: Balance & Google Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Balance Pill & Top Up Button (Only visible when logged in) */}
          {user && (
            <div className="flex items-center bg-purple-950/80 border border-amber-400/30 rounded-2xl p-1 shadow-md">
              <div
                onClick={onOpenTopUp}
                className="cursor-pointer px-2.5 py-1 flex items-center gap-1.5"
                title="Дансаа цэнэглэх"
              >
                <Wallet className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-xs font-bold text-amber-200 font-mono">
                  {user.balanceMnt.toLocaleString()}₮
                </span>
              </div>
              <button
                onClick={onOpenTopUp}
                className="px-2 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 text-[11px] font-bold flex items-center gap-1 transition active:scale-95"
              >
                <PlusCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Цэнэглэх</span>
              </button>
            </div>
          )}

          {/* User Account / Google Sign-In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-2xl bg-purple-950/70 border border-purple-800/50 hover:border-amber-400/40 transition"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-xl object-cover border border-amber-300/40"
                />
                <span className="hidden lg:inline text-xs font-medium text-amber-100 max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#1e1136] border border-amber-400/30 p-3 shadow-2xl shadow-purple-950 text-xs z-50 animate-fade">
                  <div className="border-b border-purple-800/40 pb-2 mb-2">
                    <div className="font-bold text-amber-100 truncate">{user.name}</div>
                    <div className="text-[11px] text-purple-300/80 truncate">{user.email}</div>
                    <div className="mt-2 flex items-center justify-between p-2 rounded-xl bg-purple-950/80 border border-amber-400/20">
                      <span className="text-purple-300">Дансны үлдэгдэл:</span>
                      <span className="font-bold text-amber-300 font-mono">
                        {user.balanceMnt.toLocaleString()}₮
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenTopUp();
                    }}
                    className="w-full py-2 px-3 rounded-xl hover:bg-purple-900/50 text-left text-amber-200 flex items-center gap-2 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Дансаа цэнэглэх</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenHistory();
                    }}
                    className="w-full py-2 px-3 rounded-xl hover:bg-purple-900/50 text-left text-purple-200 flex items-center gap-2 transition"
                  >
                    <History className="w-3.5 h-3.5 text-teal-400" />
                    <span>Миний уншлагын түүх</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full mt-1 py-2 px-3 rounded-xl hover:bg-rose-950/60 text-left text-rose-300 flex items-center gap-2 transition border-t border-purple-800/40"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Гарах</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs shadow-lg transition active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google-ээр нэвтрэх</span>
            </button>
          )}
        </div>
      </div>

      {/* In-header Mobile Navigation Bar (Clean, no floating overlays or bugs) */}
      <div className="md:hidden flex items-center justify-around border-t border-purple-800/40 px-3 py-2 bg-[#160b2c]">
        <button
          type="button"
          onClick={() => setActiveView('services')}
          className={`py-1.5 px-3 text-center text-xs font-semibold rounded-xl transition cursor-pointer ${
            activeView === 'services'
              ? 'text-amber-200 bg-amber-400/20 border border-amber-400/40 shadow-sm'
              : 'text-purple-200/80 hover:text-white'
          }`}
        >
          🔮 Үйлчилгээнүүд
        </button>

        <button
          type="button"
          onClick={() => setActiveView('horoscope')}
          className={`py-1.5 px-3 text-center text-xs font-semibold rounded-xl transition cursor-pointer ${
            activeView === 'horoscope'
              ? 'text-amber-200 bg-amber-400/20 border border-amber-400/40 shadow-sm'
              : 'text-purple-200/80 hover:text-white'
          }`}
        >
          🌟 Өдрийн Зурхай
        </button>

        <button
          type="button"
          onClick={onOpenHistory}
          className="py-1.5 px-3 text-center text-xs font-semibold text-purple-200/80 hover:text-white rounded-xl transition cursor-pointer"
        >
          📜 Түүх
        </button>
      </div>
    </nav>
  );
};
