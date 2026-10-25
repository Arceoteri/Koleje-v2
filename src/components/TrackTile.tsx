import React from 'react';
import { GemPalette, TrackType } from '../game/types';
import { Lock } from 'lucide-react';

interface TrackTileProps {
  track: TrackType;
  gemPalette: GemPalette;
  isFixed?: boolean;
  isHintLocked?: boolean;
  isDragSelected?: boolean;
  isStart?: boolean;
  isEnd?: boolean;
  endpointLabel?: 'A' | 'B';
  isHighlighted?: boolean;
  isError?: boolean;
  onClick?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerEnter?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  onPointerCancel?: (e: React.PointerEvent) => void;
  dataCellPos?: string;
  className?: string;
}

export const TrackTile: React.FC<TrackTileProps> = ({
  track,
  gemPalette,
  isFixed = false,
  isHintLocked = false,
  isDragSelected = false,
  isStart = false,
  isEnd = false,
  endpointLabel,
  isHighlighted = false,
  isError = false,
  onClick,
  onPointerDown,
  onPointerEnter,
  onPointerUp,
  onPointerCancel,
  dataCellPos,
  className = '',
}) => {
  const sleeperColor = '#5c3317'; // Consistent natural oak railway tie color
  const sleeperStroke = '#381e0d';
  const railColor = gemPalette.railColor;
  const baseHighlight = gemPalette.baseColor;

  const isPermanentlyLocked = isFixed || isHintLocked;

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      data-cell-pos={dataCellPos}
      disabled={isPermanentlyLocked}
      aria-label={`Pole toru: ${track}${isFixed ? ' (stałe początkowe)' : ''}${isHintLocked ? ' (zablokowana wskazówka)' : ''}`}
      className={`relative aspect-square w-full rounded-md transition-all duration-150 flex items-center justify-center select-none touch-manipulation overflow-hidden
        ${isPermanentlyLocked ? 'cursor-default ring-1 ring-amber-500/50' : 'cursor-pointer hover:brightness-110 active:scale-95'}
        ${isHintLocked ? 'ring-2 ring-amber-400 bg-amber-500/10' : ''}
        ${isDragSelected ? 'ring-2 ring-red-500 bg-red-500/30 shadow-[inset_0_0_14px_rgba(239,68,68,0.5)] z-20 scale-[0.98]' : ''}
        ${isError ? 'ring-2 ring-red-500 animate-pulse' : ''}
        ${isHighlighted ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 shadow-[0_0_14px_rgba(251,191,36,0.7)] animate-pulse z-10' : ''}
        ${className}
      `}
    >
      {/* Locked hint badge */}
      {isHintLocked && (
        <span
          className="absolute top-0.5 right-0.5 z-20 p-0.5 rounded-full bg-amber-500 text-slate-950 shadow-md"
          title="Odpowiedź ze wskazówki - zablokowana na stałe"
        >
          <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
        </span>
      )}

      {/* Endpoint badge */}
      {(isStart || isEnd) && endpointLabel && (
        <span
          className={`absolute top-0.5 left-0.5 z-20 text-[10px] font-black px-1 rounded-sm leading-tight shadow-md ${
            endpointLabel === 'A'
              ? 'bg-emerald-500 text-white'
              : 'bg-rose-500 text-white'
          }`}
        >
          {endpointLabel}
        </span>
      )}

      {/* SVG Tile Content */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full pointer-events-none drop-shadow-sm"
      >
        {/* Cell Grid background / Ballast gravel texture */}
        <rect
          x="1"
          y="1"
          width="98"
          height="98"
          rx="6"
          fill="currentColor"
          fillOpacity={track === 'EMPTY' ? 0.04 : 0.12}
        />

        {/* EMPTY state dot or subtle texture */}
        {track === 'EMPTY' && (
          <circle cx="50" cy="50" r="2" fill="currentColor" fillOpacity="0.18" />
        )}

        {/* X Mark for excluded track */}
        {track === 'X' && (
          <g key="track-x" className="animate-mark-pop origin-center">
            <line
              x1="26"
              y1="26"
              x2="74"
              y2="74"
              stroke="#ef4444"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <line
              x1="74"
              y1="26"
              x2="26"
              y2="74"
              stroke="#ef4444"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* HORIZONTAL TRACK */}
        {track === 'H' && (
          <g key="track-h" className="animate-track-pop origin-center">
            {/* 4 Wooden Sleepers extending naturally past both rails */}
            {[15, 38, 62, 85].map(x => (
              <g key={x}>
                <line
                  x1={x}
                  y1="22"
                  x2={x}
                  y2="78"
                  stroke={sleeperStroke}
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                <line
                  x1={x}
                  y1="22"
                  x2={x}
                  y2="78"
                  stroke={sleeperColor}
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </g>
            ))}

            {/* Rails */}
            <line x1="0" y1="36" x2="100" y2="36" stroke={railColor} strokeWidth="6" />
            <line x1="0" y1="64" x2="100" y2="64" stroke={railColor} strokeWidth="6" />
            {/* Rail highlights */}
            <line x1="0" y1="36" x2="100" y2="36" stroke={baseHighlight} strokeWidth="2" strokeOpacity="0.8" />
            <line x1="0" y1="64" x2="100" y2="64" stroke={baseHighlight} strokeWidth="2" strokeOpacity="0.8" />
          </g>
        )}

        {/* VERTICAL TRACK */}
        {track === 'V' && (
          <g key="track-v" className="animate-track-pop origin-center">
            {/* 4 Wooden Sleepers extending naturally past both rails */}
            {[15, 38, 62, 85].map(y => (
              <g key={y}>
                <line
                  x1="22"
                  y1={y}
                  x2="78"
                  y2={y}
                  stroke={sleeperStroke}
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                <line
                  x1="22"
                  y1={y}
                  x2="78"
                  y2={y}
                  stroke={sleeperColor}
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </g>
            ))}

            {/* Rails */}
            <line x1="36" y1="0" x2="36" y2="100" stroke={railColor} strokeWidth="6" />
            <line x1="64" y1="0" x2="64" y2="100" stroke={railColor} strokeWidth="6" />
            {/* Rail highlights */}
            <line x1="36" y1="0" x2="36" y2="100" stroke={baseHighlight} strokeWidth="2" strokeOpacity="0.8" />
            <line x1="64" y1="0" x2="64" y2="100" stroke={baseHighlight} strokeWidth="2" strokeOpacity="0.8" />
          </g>
        )}

        {/* CURVED TRACKS (Gentle rounded arcs bending in the direction of the center of the tile) */}
        {(track === 'CURVE_TR' ||
          track === 'CURVE_BR' ||
          track === 'CURVE_BL' ||
          track === 'CURVE_TL') && (
          <g key={`track-${track}`} className="animate-track-pop origin-center">
            <g
              transform={`rotate(${
                track === 'CURVE_TR'
                  ? 0
                  : track === 'CURVE_BR'
                  ? 90
                  : track === 'CURVE_BL'
                  ? 180
                  : 270
              } 50 50)`}
            >
              {/* 5 Radial Sleepers evenly spaced along the arc (15 deg intervals from 165 deg to 105 deg), perfectly centered under the rails */}
              <g>
                {/* Sleeper 1 (165 deg) */}
                <line x1="73.0" y1="7.2" x2="30.5" y2="18.6" stroke={sleeperStroke} strokeWidth="9" strokeLinecap="round" />
                <line x1="73.0" y1="7.2" x2="30.5" y2="18.6" stroke={sleeperColor} strokeWidth="7" strokeLinecap="round" />

                {/* Sleeper 2 (150 deg) */}
                <line x1="75.8" y1="14.0" x2="37.6" y2="36.0" stroke={sleeperStroke} strokeWidth="9" strokeLinecap="round" />
                <line x1="75.8" y1="14.0" x2="37.6" y2="36.0" stroke={sleeperColor} strokeWidth="7" strokeLinecap="round" />

                {/* Sleeper 3 (135 deg - Central diagonal sleeper directed at center 50, 50) */}
                <line x1="80.2" y1="19.8" x2="49.1" y2="50.9" stroke={sleeperStroke} strokeWidth="9" strokeLinecap="round" />
                <line x1="80.2" y1="19.8" x2="49.1" y2="50.9" stroke={sleeperColor} strokeWidth="7" strokeLinecap="round" />

                {/* Sleeper 4 (120 deg) */}
                <line x1="86.0" y1="24.2" x2="64.0" y2="62.4" stroke={sleeperStroke} strokeWidth="9" strokeLinecap="round" />
                <line x1="86.0" y1="24.2" x2="64.0" y2="62.4" stroke={sleeperColor} strokeWidth="7" strokeLinecap="round" />

                {/* Sleeper 5 (105 deg) */}
                <line x1="92.8" y1="27.0" x2="81.4" y2="69.5" stroke={sleeperStroke} strokeWidth="9" strokeLinecap="round" />
                <line x1="92.8" y1="27.0" x2="81.4" y2="69.5" stroke={sleeperColor} strokeWidth="7" strokeLinecap="round" />
              </g>

              {/* Inner and Outer Rails: smooth circular arcs bending towards the center */}
              {/* Outer Rail (Radius 64 centered at 100, 0) */}
              <path
                d="M 36 0 A 64 64 0 0 0 100 64"
                fill="none"
                stroke={railColor}
                strokeWidth="6"
                strokeLinecap="butt"
              />
              {/* Inner Rail (Radius 36 centered at 100, 0) */}
              <path
                d="M 64 0 A 36 36 0 0 0 100 36"
                fill="none"
                stroke={railColor}
                strokeWidth="6"
                strokeLinecap="butt"
              />

              {/* Rail highlights */}
              <path
                d="M 36 0 A 64 64 0 0 0 100 64"
                fill="none"
                stroke={baseHighlight}
                strokeWidth="2"
                strokeOpacity="0.8"
                strokeLinecap="butt"
              />
              <path
                d="M 64 0 A 36 36 0 0 0 100 36"
                fill="none"
                stroke={baseHighlight}
                strokeWidth="2"
                strokeOpacity="0.8"
                strokeLinecap="butt"
              />
            </g>
          </g>
        )}
      </svg>
    </button>
  );
};
