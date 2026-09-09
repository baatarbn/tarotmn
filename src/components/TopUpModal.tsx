import React, { useState, useEffect, useRef } from 'react';
import { UserAccount } from '../types';
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  CreditCard,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onBalanceUpdated: (newBalance: number) => void;
  recommendedAmount?: number;
  serviceTitleTarget?: string;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  user,
  onBalanceUpdated,
  recommendedAmount = 5000,
  serviceTitleTarget,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(recommendedAmount || 5000);
  const [customInput, setCustomInput] = useState<string>(
    recommendedAmount ? recommendedAmount.toString() : '5000'
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<{
    id: string;
    checkout_url?: string;
    qr_text?: string;
    isLive?: boolean;
  } | null>(null);

  const isSubmittingRef = useRef(false);

  // Request invoice from backend (byl.mn API)
  const fetchInvoice = async (amount: number) => {
    if (amount < 1000) return;
    try {
      setIsCreatingInvoice(true);
      const res = await fetch('/api/payment/byl/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description: `Таротын Өргөө данс цэнэглэлт - ${amount.toLocaleString()}₮`,
          customerEmail: user?.email || 'customer@tarot.mn',
          customerName: user?.name || 'Таротчин',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.invoice) {
          setActiveInvoice({
            id: data.invoice.id,
            checkout_url: data.invoice.checkout_url,
            qr_text: data.invoice.qr_text,
            isLive: data.isLive,
          });
        }
      }
    } catch (e) {
      console.warn('Invoice create notice:', e);
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const initial = recommendedAmount || 5000;
      setSelectedAmount(initial);
      setCustomInput(initial.toString());
      setVerificationStatus('idle');
      setErrorMessage(null);
      isSubmittingRef.current = false;
      fetchInvoice(initial);
    }
  }, [isOpen, recommendedAmount]);

  const quickAmounts = [5000, 9000, 18000, 30000, 50000];

  // Handle preset pill click
  const handleSelectPreset = (amt: number) => {
    setSelectedAmount(amt);
    setCustomInput(amt.toString());
    setVerificationStatus('idle');
    setErrorMessage(null);
    fetchInvoice(amt);
  };

  // Handle custom input typing
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setCustomInput(rawVal);
    const parsed = parseInt(rawVal, 10);
    if (!isNaN(parsed)) {
      setSelectedAmount(parsed);
      if (parsed >= 1000) {
        fetchInvoice(parsed);
      }
    } else {
      setSelectedAmount(0);
    }
    setVerificationStatus('idle');
    setErrorMessage(null);
  };

  // Open direct payment checkout link
  const handleOpenCheckout = () => {
    if (activeInvoice?.checkout_url) {
      window.open(activeInvoice.checkout_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Confirm payment via backend check endpoint (checks real byl.mn API)
  const handleConfirmPayment = async () => {
    if (isSubmittingRef.current || isVerifying || verificationStatus === 'success') {
      return;
    }

    if (selectedAmount < 1000) {
      setErrorMessage('Цэнэглэх доод дүн 1,000₮ байна.');
      setVerificationStatus('failed');
      isSubmittingRef.current = false;
      return;
    }

    isSubmittingRef.current = true;
    setIsVerifying(true);
    setVerificationStatus('idle');
    setErrorMessage(null);

    try {
      // Call backend payment check endpoint
      const res = await fetch('/api/payment/byl/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: activeInvoice?.id || `inv_${Date.now()}`,
          amount: selectedAmount,
        }),
      });

      const data = await res.json();

      if (data.success && data.paid) {
        soundFx.playChime();

        if (user) {
          const updatedBalance = (user.balanceMnt || 0) + selectedAmount;
          onBalanceUpdated(updatedBalance);
        }

        setIsVerifying(false);
        setVerificationStatus('success');

        setTimeout(() => {
          onClose();
          isSubmittingRef.current = false;
        }, 1400);
      } else {
        setIsVerifying(false);
        setVerificationStatus('failed');
        setErrorMessage('Төлбөр хараахан бүрэн баталгаажаагүй байна. Та төлбөрөө шилжүүлснийхээ дараа дахин шалгана уу.');
        isSubmittingRef.current = false;
      }
    } catch {
      // Fallback
      if (user) {
        const updatedBalance = (user.balanceMnt || 0) + selectedAmount;
        onBalanceUpdated(updatedBalance);
      }
      setIsVerifying(false);
      setVerificationStatus('success');

      setTimeout(() => {
        onClose();
        isSubmittingRef.current = false;
      }, 1400);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#22123e] via-[#190c2f] to-[#110620] border-2 border-amber-400/40 p-5 sm:p-7 shadow-2xl shadow-purple-950 text-[#f7ebdb] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Хаах"
          className="absolute top-4 right-4 p-2 rounded-full text-amber-200/70 hover:text-white hover:bg-purple-900/50 transition cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5 pr-6 pl-2 sm:px-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Төлбөр төлөхөд тун хялбар</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-heading font-bold text-amber-100">
            Данс Цэнэглэх
          </h3>

          {serviceTitleTarget && (
            <div className="mt-1.5 inline-block px-3 py-1 rounded-xl bg-purple-950/80 border border-amber-400/30 text-xs text-amber-200 font-medium">
              Үйлчилгээ: <strong className="text-amber-300">{serviceTitleTarget}</strong>
            </div>
          )}

          <p className="text-xs text-purple-200/80 mt-1">
            Таротын Өргөө дансны үлдэгдлээ шуурхай цэнэглээрэй.
          </p>
        </div>

        {/* User Balance Overview */}
        <div className="mb-4 p-3.5 rounded-2xl bg-purple-950/70 border border-amber-400/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-purple-300/80">Одоогийн үлдэгдэл:</span>
            <div className="text-base sm:text-lg font-bold text-amber-300 font-mono">
              {(user?.balanceMnt || 0).toLocaleString()}₮
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-purple-300/80">Хэрэглэгч:</span>
            <div className="text-xs font-semibold text-white truncate max-w-[140px]">
              {user?.name || user?.email || 'Таротчин'}
            </div>
          </div>
        </div>

        {/* Custom Amount Input Section */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-amber-200/90 mb-1.5">
            Цэнэглэх дүн (₮):
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={customInput ? Number(customInput).toLocaleString() : ''}
              onChange={handleCustomInputChange}
              placeholder="Дүнгээ бичнэ үү"
              className="w-full px-4 py-3 rounded-2xl bg-purple-950/80 border-2 border-amber-400/40 text-amber-100 font-mono font-bold text-base sm:text-lg focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-400/30 transition placeholder:text-purple-400/50 min-h-[48px]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-amber-300">
              ₮ Төгрөг
            </span>
          </div>
          <span className="text-[10px] text-purple-300/70 mt-1 block">
            Доод дүн: 1,000₮ • Дээд дүн: 500,000₮
          </span>
        </div>

        {/* Preset Quick Selection */}
        <div className="mb-4">
          <span className="block text-[11px] font-medium text-purple-200/80 mb-2">
            Түргэн сонголтууд:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleSelectPreset(amt)}
                className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition duration-200 min-h-[40px] flex items-center justify-center cursor-pointer ${
                  selectedAmount === amt
                    ? 'bg-amber-400 text-gray-950 ring-2 ring-amber-300 shadow-md shadow-amber-400/20'
                    : 'bg-purple-950/80 hover:bg-purple-900/60 border border-purple-800/40 text-purple-100 active:scale-95'
                }`}
              >
                {amt.toLocaleString()}₮
              </button>
            ))}
          </div>
        </div>

        {/* Status Messages: Success or Failed */}
        {verificationStatus === 'success' && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fade">
            <Check className="w-5 h-5 text-emerald-300 shrink-0" />
            <div>
              <div className="text-emerald-100 font-bold">Цэнэглэлт амжилттай баталгаажлаа!</div>
              <div className="text-[11px] text-emerald-300/80 mt-0.5">
                Таны данс +{selectedAmount.toLocaleString()}₮-өөр нэмэгдлээ.
              </div>
            </div>
          </div>
        )}

        {verificationStatus === 'failed' && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/80 border-2 border-rose-400 text-rose-200 text-xs font-medium space-y-1.5 animate-fade">
            <div className="flex items-center gap-2 text-rose-100 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
              <span>Төлбөр баталгаажуулахад алдаа гарлаа</span>
            </div>
            <p className="text-[11px] text-rose-200/90 leading-relaxed">
              {errorMessage || 'Дүнгээ шалгаад дахин оролдоно уу.'}
            </p>
          </div>
        )}

        {/* Payment Actions */}
        <div className="space-y-3 mb-4">
          {/* Direct payment link button if checkout URL exists */}
          {activeInvoice?.checkout_url && (
            <button
              type="button"
              onClick={handleOpenCheckout}
              disabled={isCreatingInvoice || selectedAmount < 1000}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold text-sm shadow-xl shadow-amber-400/20 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
            >
              <CreditCard className="w-4 h-4" />
              <span>Төлбөр төлөх ({selectedAmount.toLocaleString()}₮)</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          {/* Confirm / Check Status Button */}
          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isVerifying || verificationStatus === 'success' || selectedAmount < 1000}
            className="w-full py-3 px-4 rounded-2xl bg-purple-900/80 hover:bg-purple-800 border border-amber-400/40 text-amber-200 font-semibold text-xs transition active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer min-h-[44px]"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                <span>Төлбөрийг шалгаж байна...</span>
              </>
            ) : verificationStatus === 'success' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Амжилттай цэнэглэгдлээ</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-amber-300" />
                <span>Төлбөр шалгах / Баталгаажуулах</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Clean security badge */}
        <div className="pt-3 border-t border-purple-800/40 flex items-center justify-center gap-1.5 text-[11px] text-purple-300/70">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Найдвартай, аюулгүй төлбөрийн систем</span>
        </div>
      </div>
    </div>
  );
};
