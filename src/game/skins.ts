export type LocomotiveSkinId = 'classic' | 'forest' | 'arrow' | 'gold';

export interface LocomotiveSkin {
  id: LocomotiveSkinId;
  name: string;
  subtitle: string;
  requiredStars: number;
  bodyGradient: {
    start: string;
    mid: string;
    end: string;
  };
  trimColor: string;
  roofColor: string;
  bufferColor: string;
  lightBeamColor: string;
  steamColor: string;
  accentColor: string;
  iconBg: string;
}

export const LOCOMOTIVE_SKINS: Record<LocomotiveSkinId, LocomotiveSkin> = {
  classic: {
    id: 'classic',
    name: 'Klasyczny Parowóz PKP',
    subtitle: 'Węglowa legenda polskich szlaków kolejowych',
    requiredStars: 0,
    bodyGradient: { start: '#334155', mid: '#0f172a', end: '#020617' },
    trimColor: '#f59e0b',
    roofColor: '#dc2626',
    bufferColor: '#b91c1c',
    lightBeamColor: '#fef08a',
    steamColor: 'rgba(255, 255, 255, 0.85)',
    accentColor: '#e2e8f0',
    iconBg: 'from-slate-700 to-slate-900',
  },
  forest: {
    id: 'forest',
    name: 'Leśny Ekspres',
    subtitle: 'Szmaragdowo-złota maszyna stworzona do leśnych traktów',
    requiredStars: 25,
    bodyGradient: { start: '#047857', mid: '#065f46', end: '#022c22' },
    trimColor: '#fbbf24',
    roofColor: '#064e3b',
    bufferColor: '#d97706',
    lightBeamColor: '#a7f3d0',
    steamColor: 'rgba(236, 253, 245, 0.9)',
    accentColor: '#34d399',
    iconBg: 'from-emerald-700 to-emerald-950',
  },
  arrow: {
    id: 'arrow',
    name: 'Błękitna Strzała',
    subtitle: 'Aerodynamiczny król górskich przełęczy w szafirowym chromie',
    requiredStars: 70,
    bodyGradient: { start: '#2563eb', mid: '#1d4ed8', end: '#0f172a' },
    trimColor: '#e2e8f0',
    roofColor: '#1e3a8a',
    bufferColor: '#3b82f6',
    lightBeamColor: '#93c5fd',
    steamColor: 'rgba(239, 246, 255, 0.9)',
    accentColor: '#60a5fa',
    iconBg: 'from-blue-700 to-slate-950',
  },
  gold: {
    id: 'gold',
    name: 'Złoty Smok Szyn',
    subtitle: 'Cesarski parowóz wykuwany z litego mosiądzu i szczerego złota',
    requiredStars: 130,
    bodyGradient: { start: '#f59e0b', mid: '#d97706', end: '#78350f' },
    trimColor: '#ef4444',
    roofColor: '#b45309',
    bufferColor: '#991b1b',
    lightBeamColor: '#fef08a',
    steamColor: 'rgba(254, 240, 138, 0.9)',
    accentColor: '#fbbf24',
    iconBg: 'from-amber-500 to-amber-900',
  },
};
