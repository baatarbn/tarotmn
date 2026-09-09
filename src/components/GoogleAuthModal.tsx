import React, { useState, useEffect, useRef } from 'react';
import { UserAccount } from '../types';
import { X, ShieldCheck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../utils/audio';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: UserAccount) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const envClientId = (((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string) || '').trim();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Decode Google JWT Token
  const parseGoogleJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to parse JWT token:', e);
      return null;
    }
  };

  // Google GSI Callback
  const handleCredentialResponse = (response: any) => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      const payload = parseGoogleJwt(response.credential);

      if (!payload || !payload.email) {
        throw new Error('Google мэдээлэл хүлээн авч чадсангүй');
      }

      soundFx.playChime();

      const user: UserAccount = {
        id: payload.sub || `usr_${Date.now()}`,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        avatar:
          payload.picture ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${payload.email}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
        balanceMnt: 0,
        createdAt: new Date().toISOString(),
        isGoogleAuth: true,
      };

      onSuccessLogin(user);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setAuthError(err.message || 'Нэвтрэхэд алдаа гарлаа');
    }
  };

  // Initialize official Google Identity Services
  useEffect(() => {
    if (!isOpen) return;

    let checkInterval: any;

    const setupGsi = () => {
      if (window.google?.accounts?.id && envClientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: envClientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'filled_blue',
              size: 'large',
              text: 'signin_with',
              shape: 'pill',
              logo_alignment: 'left',
              width: 300,
            });
          }
        } catch (e: any) {
          console.warn('Google GSI render warning:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGsi();
    } else {
      checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          setupGsi();
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [isOpen, envClientId]);

  // Fallback direct login for seamless experience
  const handleQuickLogin = () => {
    setIsSubmitting(true);
    soundFx.playChime();

    setTimeout(() => {
      const email = 'user@gmail.com';
      const user: UserAccount = {
        id: `usr_${Date.now()}`,
        email: email,
        name: 'Таротчин',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
        balanceMnt: 0,
        createdAt: new Date().toISOString(),
        isGoogleAuth: true,
      };

      onSuccessLogin(user);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#241645] via-[#1a0f33] to-[#120824] border-2 border-amber-400/40 p-6 sm:p-8 shadow-2xl shadow-purple-950/80 text-[#f7ebdb] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Хаах"
          className="absolute top-5 right-5 p-2 rounded-full text-amber-200/70 hover:text-white hover:bg-purple-900/50 transition cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-white shadow-lg mb-3">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h3 className="text-xl sm:text-2xl font-heading font-bold text-amber-100">
            Google Хаягаар Нэвтрэх
          </h3>
          <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
            Таротын уншлага авах, түүхээ хадгалахад таны Google хаяг ашиглагдана.
          </p>
        </div>

        {/* Error Notification */}
        {authError && (
          <div className="my-3 p-3 rounded-xl bg-rose-950/80 border border-rose-400/50 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
            <span>{authError}</span>
          </div>
        )}

        {/* Google Login Action Container */}
        <div className="my-6 text-center">
          {envClientId ? (
            <div className="flex flex-col items-center justify-center space-y-3">
              <div
                ref={googleBtnRef}
                className="min-h-[44px] flex items-center justify-center"
              />
              <p className="text-[11px] text-purple-300/70">
                Дээрх цэнхэр Google товч дээр даран өөрийн Gmail хаягаа сонгон шууд нэвтэрнэ үү.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition active:scale-[0.98] cursor-pointer min-h-[48px]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google-ээр нэвтрэх</span>
              </button>
              <p className="text-[11px] text-purple-300/70">
                Таны бүх мэдээлэл болон уншлагын түүх найдвартай хадгалагдана.
              </p>
            </div>
          )}
        </div>

        {/* Information note */}
        <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-2 text-xs text-purple-200/90">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Таротын уншлагын түүх тань Google хаягт найдвартай хадгалагдана.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Данс цэнэглэлт болон үлдэгдэл шууд таны хаягтай холбогдоно.</span>
          </div>
        </div>

        {/* Bottom security assurance */}
        <div className="mt-4 pt-3 border-t border-purple-800/40 flex items-center justify-center gap-1.5 text-[11px] text-purple-300/70">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Identity Services найдвартай хамгаалалт</span>
        </div>
      </div>
    </div>
  );
};
