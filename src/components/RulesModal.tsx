import React from 'react';
import { X, HelpCircle, CheckCircle2, AlertTriangle, Sparkles, Navigation } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, isDark }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Zasady gry Train Tracks"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-6 transition-all ${
          isDark
            ? 'bg-slate-900 border border-slate-700 text-slate-100'
            : 'bg-white border border-slate-200 text-slate-900'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Zasady Gry: Tory Kolejowe</h2>
              <p className="text-xs text-slate-400">Klasyczna łamigłówka logiczna (Train Tracks Puzzle)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij zasady"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-sm leading-relaxed">
          {/* Cel gry */}
          <section className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <h3 className="font-semibold text-amber-400 flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4" /> Główny Cel Gry
            </h3>
            <p className="text-slate-300">
              Twoim zadaniem jest ułożenie <strong>jednej, ciągłej linii torów</strong> kolejowych,
              która łączy wjazd do krainy (punkt <strong className="text-emerald-400">A</strong>) z
              wyjazdem (punkt <strong className="text-rose-400">B</strong>).
            </p>
          </section>

          {/* Zasady torów */}
          <section className="space-y-2">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Navigation className="w-4 h-4 text-sky-400" /> Żelazne reguły trasy
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1">
              <li>
                <strong>Ciągłość:</strong> Tory nie mogą się rozgałęziać (żadnych rozjazdów!) ani krzyżować.
              </li>
              <li>
                <strong>Brak pętli:</strong> Niedozwolone są zamknięte pętle ani luźne odnogi. Wszystkie postawione tory muszą tworzyć jedną wspólną trasę od A do B.
              </li>
              <li>
                <strong>Wskazówki liczbowe:</strong> Liczby na brzegu planszy informują, <em>dokładnie ile pól</em> w danym wierszu i kolumnie musi zawierać tory kolejowe.
              </li>
              <li>
                <strong>Pola z cyfrą 0:</strong> Oznaczają, że w całym rzędzie lub kolumnie nie ma ani jednego fragmentu toru – możesz tam bez obaw wstawiać <span className="text-red-400 font-bold">X</span>!
              </li>
            </ul>
          </section>

          {/* Stopnie trudności */}
          <section className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Stopnie Trudności
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="font-bold text-emerald-400">🟢 Łatwy (Easy):</span> Odsłania na start ~20% trasy (punkty A, B i kluczowe zakręty) oraz automatycznie stawia <strong>X</strong> w wierszach i kolumnach z cyfrą 0.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="font-bold text-amber-400">🟡 Średni (Medium):</span> Odsłania punkty A i B oraz 1 losową podpowiedź trasy. Brak automatycznych X – stawiasz je sam!
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="font-bold text-rose-400">🔴 Trudny (Hard):</span> Odsłania wyłącznie wjazd A i wyjazd B. Zero dodatkowych podpowiedzi, bardziej kręta trasa.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="font-bold text-purple-400">💜 Bardzo trudny:</span> Na start tylko A i B, a 2 do 3 cyfr wskazówek jest ukrytych pod znakiem <strong>?</strong>.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-rose-500/40 bg-rose-950/20">
                <span className="font-bold text-rose-400">☠️ Popierdolony (Extreme):</span> Wjazd i wyjazd podane są tylko na krawędziach perymetru planszy (nie ma gotowych kafelków A i B na siatce!). Dodatkowo aż połowa cyfr wskazówek jest zasłonięta znakami <strong>?</strong>. Prawdziwe wyzwanie dedukcyjne!
              </div>
            </div>
          </section>

          {/* Narzędzia w dolnym pasku */}
          <section className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Narzędzia i obsługa klikania
            </h3>
            <p className="text-slate-300 text-xs">
              Wybierz tryb z dolnego paska, a następnie dotknij pola na planszy:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700">
                <strong>🔄 Cykl:</strong> Przełącza kolejno: Puste ➔ Poziomy ➔ Pionowy ➔ 4 Zakręty ➔ X.
              </div>
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700">
                <strong>━ / ┃ Proste:</strong> Przełącza wyłącznie proste (Poziomy ➔ Pionowy ➔ Puste).
              </div>
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700">
                <strong>↗ ↘ ↙ ↖ Zakręty:</strong> Kliknij konkretny zakręt w pasku, aby od razu stawiać go na planszy.
              </div>
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700">
                <strong>❌ Krzyżyk:</strong> Błyskawicznie oznacza pola, na których na pewno nie biegną tory.
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 font-semibold text-sm rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg active:scale-95"
          >
            Rozumiem, zaczynajmy!
          </button>
        </div>
      </div>
    </div>
  );
};
