import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, Smartphone, CheckCircle, Wifi, WifiOff, X, Copy, Check, ExternalLink } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isOnline, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    return typeof window !== 'undefined' ? window.location.href : '';
  };

  const handleCopy = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    const url = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Train Tracks - Tory Kolejowe',
          text: 'Zagraj w grę logiczną Tory Kolejowe – działa offline na telefonie i komputerze!',
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Offline indicator badge */}
        {!isOnline && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            title="Aplikacja działa w pełni offline - grasz bez internetu!"
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>Tryb Offline</span>
          </div>
        )}

        {/* Install / Share button */}
        <button
          onClick={() => {
            if (isInstallable) {
              install();
            } else {
              setShowModal(true);
            }
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95 cursor-pointer"
          title="Pobierz i zainstaluj grę na telefonie (Android lub iOS) i graj bez internetu"
        >
          <Download className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          <span className="hidden sm:inline">Pobierz grę</span>
          <span className="sm:hidden">Pobierz</span>
        </button>

        {isInstalled && (
          <div
            className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/60 rounded-md border border-emerald-700/50"
            title="Aplikacja zainstalowana i gotowa do gry offline"
          >
            <CheckCircle className="w-3 h-3" />
            <span>Zainstalowano</span>
          </div>
        )}
      </div>

      {/* Guide Modal for iOS & Android Installation and Offline Playing */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Zamknij"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Jak pobrać i zainstalować grę?</h3>
                <p className="text-xs text-slate-400">Instalacja PWA bez sklepu Google Play / App Store</p>
              </div>
            </div>

            {/* Quick Share / Link Box */}
            <div className="mb-4 p-3 bg-slate-800/90 rounded-xl border border-slate-700">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                Link do gry (wyślij na telefon lub znajomym):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition active:scale-95 shrink-0 cursor-pointer"
                  title="Skopiuj link do schowka"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Skopiowano!' : 'Kopiuj'}</span>
                </button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition shrink-0 cursor-pointer"
                    title="Udostępnij"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3.5 text-sm">
              {/* Android instructions */}
              <div className="p-3.5 bg-slate-800/70 rounded-xl border border-emerald-500/30">
                <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1.5">
                  <Download className="w-4 h-4" />
                  <span>1. Android (Chrome, Samsung Internet, Edge):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300 leading-relaxed">
                  <li>Otwórz powyższy link w przeglądarce <strong>Chrome</strong> na telefonie.</li>
                  <li>Dotknij menu z <strong>trzema kropkami (⋮)</strong> w prawym górnym rogu.</li>
                  <li>Wybierz <strong>«Zainstaluj aplikację»</strong> lub <strong>«Dodaj do ekranu głównego»</strong>.</li>
                  <li>Gra pojawi się na pulpicie telefonu i uruchamia się jak zwykła aplikacja ze sklepu!</li>
                </ol>
              </div>

              {/* iOS instructions */}
              <div className="p-3.5 bg-slate-800/70 rounded-xl border border-amber-500/30">
                <div className="flex items-center gap-2 font-bold text-amber-400 mb-1.5">
                  <Share2 className="w-4 h-4" />
                  <span>2. iPhone / iPad (Apple iOS Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300 leading-relaxed">
                  <li>Otwórz link w przeglądarce <strong>Safari</strong> na iPhonie.</li>
                  <li>Dotknij przycisku <strong>Udostępnij</strong> (ikona kwadratu ze strzałką w górę na dole ekranu).</li>
                  <li>Przewiń listę opcji w dół i wybierz <strong>«Do ekranu początkowego»</strong> (Add to Home Screen).</li>
                  <li>Kliknij <strong>Dodaj</strong> w prawym górnym rogu.</li>
                </ol>
              </div>

              {/* PC / Mac instructions */}
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700 text-xs text-slate-300">
                <strong className="text-sky-400 block mb-1">3. Komputer (Windows, Mac, Linux):</strong>
                W Chrome lub Edge kliknij małą ikonę instalacji w pasku adresu (po prawej stronie, obok gwiazdki zakładek) lub w menu przeglądarki wybierz «Zainstaluj Tory Kolejowe».
              </div>

              {/* 100% Offline gameplay banner */}
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200">
                <Wifi className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-300 mb-0.5">Działa 100% Offline bez Internetu</strong>
                  Po pierwszym otwarciu i dodaniu do ekranu głównego Service Worker automatycznie zapisuje całą grę w pamięci telefonu. Możesz wyłączyć Wi-Fi oraz dane komórkowe (lub włączyć tryb samolotowy) i grać w dowolnym momencie!
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition cursor-pointer active:scale-98"
              >
                Rozumiem, wróć do gry
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
