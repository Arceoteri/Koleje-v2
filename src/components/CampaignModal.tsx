import React, { useState } from 'react';
import {
  MapPin,
  X,
  Star,
  Lock,
  ChevronRight,
  Compass,
  Trophy,
  Train,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  CAMPAIGN_REGIONS,
  CAMPAIGN_LEVELS,
  CampaignLevel,
  CampaignSaveData,
  calculateTotalStars,
} from '../game/campaignData';
import { LOCOMOTIVE_SKINS, LocomotiveSkinId } from '../game/skins';
import { soundManager } from '../utils/audio';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (levelId: number) => void;
  isDark: boolean;
  campaignData: CampaignSaveData;
  onSelectSkin: (skinId: LocomotiveSkinId) => void;
}

export const CampaignModal: React.FC<CampaignModalProps> = ({
  isOpen,
  onClose,
  onSelectLevel,
  isDark,
  campaignData,
  onSelectSkin,
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'skins'>('map');
  const [selectedRegionId, setSelectedRegionId] = useState<number>(1);

  if (!isOpen) return null;

  const totalStars = calculateTotalStars(campaignData.records);
  const selectedRegion = CAMPAIGN_REGIONS.find(r => r.id === selectedRegionId) || CAMPAIGN_REGIONS[0];
  const regionLevels = CAMPAIGN_LEVELS.filter(l => l.regionId === selectedRegionId);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLevelUnlocked = (level: CampaignLevel): boolean => {
    // Level 1 is always unlocked
    if (level.id === 1) return true;
    // Check if region is unlocked
    const region = CAMPAIGN_REGIONS.find(r => r.id === level.regionId);
    if (region && totalStars < region.unlockStars) return false;
    // Check if previous level was completed
    const prevRecord = campaignData.records[level.id - 1];
    return !!prevRecord?.completed;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wielka Transkontynentalna Ekspedycja Kolejowa"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl p-4 sm:p-6 transition-all border ${
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
              <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                Ekspedycja Kolejowa
                <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-400">
                  Kampania
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Połącz 5 krain i zbuduj wielką transkontynentalną magistralę
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij kampanię"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Stars & Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 my-3">
          {/* Stars Pill */}
          <div
            className={`w-full sm:w-auto px-3 py-1.5 rounded-xl border flex items-center justify-between sm:justify-start gap-2 ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 text-amber-400 font-black text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{totalStars} / 150</span>
            </div>
            <span className="text-[11px] text-slate-400">Gwiazdek Inżyniera</span>
          </div>

          {/* Mode Tabs */}
          <div className="flex w-full sm:w-auto p-1 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Mapa Szlaków</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('skins')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'skins'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Train className="w-3.5 h-3.5" />
              <span>Parowozownia ({Object.values(LOCOMOTIVE_SKINS).filter(s => totalStars >= s.requiredStars).length}/4)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: REGION MAP & STATIONS */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            {/* Region Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CAMPAIGN_REGIONS.map(reg => {
                const isRegionLocked = totalStars < reg.unlockStars;
                const isSelected = reg.id === selectedRegionId;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => setSelectedRegionId(reg.id)}
                    className={`shrink-0 px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-slate-800 ring-2 ring-amber-400/30'
                        : isDark
                        ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/50'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isRegionLocked && <Lock className="w-3 h-3 text-rose-400" />}
                      <span
                        className="text-xs font-extrabold"
                        style={{ color: isSelected ? '#f59e0b' : reg.color }}
                      >
                        {reg.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isRegionLocked ? `Wymaga ${reg.unlockStars} ⭐` : reg.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Region Banner Card */}
            <div
              className={`p-3.5 rounded-2xl border relative overflow-hidden bg-gradient-to-r ${selectedRegion.accentBg} border-slate-700/80`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/40 text-slate-300">
                    {selectedRegion.subtitle}
                  </span>
                  <h3 className="text-base font-black text-white mt-1">
                    {selectedRegion.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedRegion.themeDesc}
                  </p>
                </div>
                {totalStars < selectedRegion.unlockStars && (
                  <div className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Zablokowany ({selectedRegion.unlockStars} ⭐)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Station List */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
                Stacje Kolejowe ({regionLevels[0].id} – {regionLevels[regionLevels.length - 1].id})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {regionLevels.map(level => {
                  const unlocked = isLevelUnlocked(level);
                  const record = campaignData.records[level.id];
                  const completed = !!record?.completed;
                  const stars = record?.stars || 0;

                  return (
                    <div
                      key={level.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        !unlocked
                          ? 'opacity-40 border-slate-800 bg-slate-900/40 cursor-not-allowed'
                          : completed
                          ? isDark
                            ? 'bg-slate-800/90 border-amber-500/40 hover:border-amber-400'
                            : 'bg-amber-50/50 border-amber-300 hover:border-amber-400'
                          : isDark
                          ? 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                          : 'bg-white border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-700/70 text-slate-200 text-xs font-black flex items-center justify-center shrink-0">
                            {level.id}
                          </span>
                          <div>
                            <div className="font-black text-xs sm:text-sm leading-snug">
                              {level.name}
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">
                              {level.description}
                            </div>
                          </div>
                        </div>

                        {/* Stars Display */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1, 2, 3].map(s => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                stars >= s
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-600 fill-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Station Info & Play Action */}
                      <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          Siatka <strong>{level.size}×{level.size}</strong> ·{' '}
                          <span className="capitalize">{level.difficulty}</span>
                        </span>

                        {unlocked ? (
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playClick();
                              onSelectLevel(level.id);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm active:scale-95 transition cursor-pointer"
                          >
                            <span>{completed ? 'Powtórz' : 'Wyrusz'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Zablokowana
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOCOMOTIVE SHED / SKINS */}
        {activeTab === 'skins' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-amber-400">
                <Sparkles className="w-4 h-4" />
                Parowozownia Ekspedycji
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Zdobywaj gwiazdki w stacjach kampanii, aby odblokowywać unikalne parowozy. Wybrana
                lokomotywa będzie dumnie przemierzać tory widokiem z góry po każdym zwycięstwie!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(LOCOMOTIVE_SKINS).map(skin => {
                const unlocked = totalStars >= skin.requiredStars;
                const isSelected = campaignData.selectedSkin === skin.id;

                return (
                  <div
                    key={skin.id}
                    className={`p-3.5 rounded-2xl border transition-all relative ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/40'
                        : unlocked
                        ? isDark
                          ? 'border-slate-700 bg-slate-800/80 hover:border-slate-600'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                        : 'border-slate-800 bg-slate-900/40 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-sm text-slate-100 flex items-center gap-1.5">
                          {skin.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {skin.subtitle}
                        </p>
                      </div>

                      {isSelected ? (
                        <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : null}
                    </div>

                    {/* Preview Box */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center">
                      <div className="w-28 h-12 flex items-center justify-center">
                        {/* Top-down miniature vector preview */}
                        <svg viewBox="0 0 150 70" className="w-full h-full">
                          <defs>
                            <linearGradient id={`prev-${skin.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={skin.bodyGradient.start} />
                              <stop offset="50%" stopColor={skin.bodyGradient.mid} />
                              <stop offset="100%" stopColor={skin.bodyGradient.end} />
                            </linearGradient>
                          </defs>
                          {/* Tender */}
                          <rect x="10" y="20" width="24" height="30" rx="3" fill={`url(#prev-${skin.id})`} stroke="#000" strokeWidth="1" />
                          <ellipse cx="22" cy="35" rx="7" ry="10" fill="#020617" />
                          {/* Boiler */}
                          <rect x="48" y="22" width="68" height="26" rx="10" fill={`url(#prev-${skin.id})`} stroke="#000" strokeWidth="1" />
                          {/* Bands */}
                          <line x1="64" y1="22" x2="64" y2="48" stroke={skin.trimColor} strokeWidth="2" />
                          <line x1="80" y1="22" x2="80" y2="48" stroke={skin.trimColor} strokeWidth="2" />
                          <line x1="96" y1="22" x2="96" y2="48" stroke={skin.trimColor} strokeWidth="2" />
                          {/* Domes & Chimney */}
                          <circle cx="74" cy="35" r="4.5" fill={skin.trimColor} />
                          <circle cx="88" cy="35" r="5" fill={skin.trimColor} />
                          <circle cx="108" cy="35" r="5" fill="#000" stroke="#475569" strokeWidth="1" />
                          {/* Cab */}
                          <rect x="36" y="16" width="20" height="38" rx="3" fill={skin.roofColor} stroke="#000" strokeWidth="1" />
                          {/* Buffers */}
                          <rect x="120" y="18" width="4" height="34" rx="2" fill={skin.bufferColor} />
                          {/* Headlight beam preview */}
                          <polygon points="120,35 145,20 145,50" fill={skin.lightBeamColor} opacity="0.35" />
                        </svg>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400">
                        {skin.requiredStars === 0
                          ? 'Darmowa'
                          : `Wymaga ${skin.requiredStars} ⭐`}
                      </span>

                      {unlocked ? (
                        <button
                          type="button"
                          disabled={isSelected}
                          onClick={() => {
                            soundManager.playClick();
                            onSelectSkin(skin.id);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                            isSelected
                              ? 'bg-slate-700 text-slate-400 cursor-default'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                          }`}
                        >
                          {isSelected ? 'Wybrana' : 'Załóż'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Zablokowana
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
