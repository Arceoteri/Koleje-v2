import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  X,
  Trophy,
  CheckCircle2,
  Play,
  Flame,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { getDailyConfig } from '../game/generator';

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  completed: boolean;
  seconds: number;
  moves: number;
  completedAt: string;
}

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDaily: (dateStr: string) => void;
  isDark: boolean;
  dailyRecords: Record<string, DailyRecord>;
  todayStr: string; // YYYY-MM-DD
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  onStartDaily,
  isDark,
  dailyRecords,
  todayStr,
}) => {
  // Calendar viewed month state
  const [currentYear, setCurrentYear] = useState<number>(() => parseInt(todayStr.split('-')[0], 10));
  const [currentMonth, setCurrentMonth] = useState<number>(() => parseInt(todayStr.split('-')[1], 10) - 1); // 0-indexed

  if (!isOpen) return null;

  const todayRecord = dailyRecords[todayStr];
  const isTodayCompleted = !!todayRecord?.completed;
  const todayConfig = getDailyConfig(todayStr);

  // Calculate current streak
  let streak = 0;
  const checkDate = new Date();
  while (true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    if (dailyRecords[key]?.completed) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const totalCompleted = Object.values(dailyRecords).filter(r => r.completed).length;

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
  ];

  // Days in selected month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  const dayLabels = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wyzwanie Dnia i Kalendarz Pieczątek"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl p-4 sm:p-6 transition-all border ${
          isDark
            ? 'bg-slate-900 border-amber-500/30 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-md">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                Wyzwanie Dnia
                <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-400">
                  Daily
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Jedna unikalna trasa każdego dnia na świecie
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij wyzwanie dnia"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Streak & Stats Bar */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <div
            className={`p-2.5 rounded-2xl border flex items-center gap-2.5 ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Seria dni</div>
              <div className="text-base font-black text-orange-400">
                {streak} {streak === 1 ? 'dzień' : 'dni'}
              </div>
            </div>
          </div>

          <div
            className={`p-2.5 rounded-2xl border flex items-center gap-2.5 ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Pieczątki</div>
              <div className="text-base font-black text-amber-400">
                {totalCompleted} zaliczonych
              </div>
            </div>
          </div>
        </div>

        {/* Today's Banner Card */}
        <div
          className={`p-3.5 rounded-2xl border transition-all mb-4 relative overflow-hidden ${
            isTodayCompleted
              ? isDark
                ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500/40 text-emerald-100'
                : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-300 text-emerald-950'
              : isDark
              ? 'bg-gradient-to-br from-amber-950/40 to-slate-900 border-amber-500/50 text-slate-100'
              : 'bg-gradient-to-br from-amber-50 to-white border-amber-300 text-slate-900'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Dzisiejsze Zadanie ({todayStr})
              </span>
              <h3 className="font-black text-sm sm:text-base mt-1">
                Siatka {todayConfig.size}×{todayConfig.size} · Trudność:{' '}
                <span className="capitalize text-amber-400 font-extrabold">
                  {todayConfig.difficulty === 'extreme'
                    ? 'Popierdolony (Królewskie)'
                    : todayConfig.difficulty}
                </span>
              </h3>
            </div>

            {isTodayCompleted ? (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rotate-[-8deg] drop-shadow-md">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="47" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="3" strokeDasharray="6 3" />
                  <circle cx="50" cy="50" r="41" fill="none" stroke="#10b981" strokeWidth="1.8" />
                  <path id="bannerPathTop" d="M 18,50 A 32,32 0 1,1 82,50" fill="none" />
                  <path id="bannerPathBottom" d="M 82,50 A 32,32 0 0,1 18,50" fill="none" />
                  <text fill="#10b981" fontSize="10.5" fontWeight="900" letterSpacing="1.2">
                    <textPath href="#bannerPathTop" startOffset="50%" textAnchor="middle">KONTROLA</textPath>
                  </text>
                  <text fill="#10b981" fontSize="10.5" fontWeight="900" letterSpacing="1.2">
                    <textPath href="#bannerPathBottom" startOffset="50%" textAnchor="middle">BILETÓW</textPath>
                  </text>
                  <circle cx="50" cy="50" r="13" fill="#10b981" />
                  <path d="M 44,50 L 48,54 L 56,45" fill="none" stroke="#022c22" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : null}
          </div>

          {isTodayCompleted ? (
            <div className="mt-2.5 pt-2 border-t border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
              <span>
                Czas: <strong>{formatSeconds(todayRecord.seconds)}</strong> · Ruchy:{' '}
                <strong>{todayRecord.moves}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  onStartDaily(todayStr);
                  onClose();
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 transition cursor-pointer"
              >
                Zagraj ponownie
              </button>
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400">
                Rozwiąż dzisiejszą trasę, aby zdobyć złotą pieczątkę!
              </span>
              <button
                type="button"
                onClick={() => {
                  onStartDaily(todayStr);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Rozpocznij Wyzwanie</span>
              </button>
            </div>
          )}
        </div>

        {/* Monthly Stamp Calendar */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Kalendarz Pieczątek Maszynisty</span>
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Poprzedni miesiąc"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Następny miesiąc"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
            {dayLabels.map(d => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty offset slots */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square opacity-0 pointer-events-none" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
                day
              ).padStart(2, '0')}`;
              const isToday = dateKey === todayStr;
              const record = dailyRecords[dateKey];
              const isCompleted = !!record?.completed;

              const isFuture = dateKey > todayStr;

              return (
                <button
                  type="button"
                  key={dateKey}
                  disabled={isFuture}
                  onClick={() => {
                    if (!isFuture) {
                      onStartDaily(dateKey);
                      onClose();
                    }
                  }}
                  title={
                    isCompleted
                      ? `${dateKey}: Zaliczone! (${formatSeconds(record.seconds)}, ${record.moves} ruchów)`
                      : isFuture
                      ? `${dateKey}: Przyszłe wyzwanie (zablokowane)`
                      : `${dateKey}: Kliknij, aby zagrać w to wyzwanie`
                  }
                  className={`aspect-square relative rounded-xl border flex flex-col items-center justify-center transition-all ${
                    isFuture
                      ? 'opacity-30 border-dashed border-slate-700 cursor-not-allowed text-slate-600'
                      : isCompleted
                      ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-sm hover:scale-105 cursor-pointer ring-1 ring-amber-500/40'
                      : isToday
                      ? 'bg-slate-800 border-amber-400 text-amber-400 ring-2 ring-amber-400/50 font-black cursor-pointer'
                      : isDark
                      ? 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700 cursor-pointer'
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 cursor-pointer'
                  }`}
                >
                  <span className="text-[11px] font-bold leading-none">{day}</span>

                  {/* Circular Conductor Ticket Stamp on Completed Days */}
                  {isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-0.5">
                      <div className="w-full h-full max-w-[40px] max-h-[40px] rotate-[-12deg] flex items-center justify-center opacity-95 drop-shadow-sm">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle cx="50" cy="50" r="47" fill="rgba(245, 158, 11, 0.22)" stroke="#f59e0b" strokeWidth="3" strokeDasharray="5 2.5" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="1.8" />
                          <path id={`stampTop-${dateKey}`} d="M 18,50 A 32,32 0 1,1 82,50" fill="none" />
                          <path id={`stampBottom-${dateKey}`} d="M 82,50 A 32,32 0 0,1 18,50" fill="none" />
                          <text fill="#f59e0b" fontSize="10" fontWeight="900" letterSpacing="0.8">
                            <textPath href={`#stampTop-${dateKey}`} startOffset="50%" textAnchor="middle">KONTROLA</textPath>
                          </text>
                          <text fill="#f59e0b" fontSize="10" fontWeight="900" letterSpacing="0.8">
                            <textPath href={`#stampBottom-${dateKey}`} startOffset="50%" textAnchor="middle">BILETÓW</textPath>
                          </text>
                          <text x="50" y="55" textAnchor="middle" fill="#f59e0b" fontSize="15" fontWeight="900">★</text>
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Dot on today if uncompleted */}
                  {isToday && !isCompleted && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Eternal Guarantee Banner */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700 flex items-start gap-2 text-[11px] text-slate-400 leading-tight">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Gwarancja Wieczności:</strong> Każda dzienna trasa jest generowana deterministycznym
            algorytmem matematycznym (Mulberry32 PRNG + FNV-1a Hash). Żadna trasa nigdy się nie powtórzy
            w żaden inny dzień w historii i przyszłości gry!
          </span>
        </div>
      </div>
    </div>
  );
};
