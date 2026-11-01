import React, { useEffect, useState, useRef } from 'react';
import { soundManager } from '../utils/audio';
import { hapticManager } from '../utils/haptics';
import { LOCOMOTIVE_SKINS, LocomotiveSkinId } from '../game/skins';

interface AnimatedTrainRideProps {
  path: { r: number; c: number }[];
  size: number;
  onComplete: () => void;
  gemColor?: string;
  skinId?: LocomotiveSkinId;
}

interface SmokePuff {
  id: number;
  x: number; // Percentage on board
  y: number; // Percentage on board
  size: number;
  opacity: number;
}

export const AnimatedTrainRide: React.FC<AnimatedTrainRideProps> = ({
  path,
  size,
  onComplete,
  skinId = 'classic',
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [swayAngle, setSwayAngle] = useState<number>(0);
  const [smokePuffs, setSmokePuffs] = useState<SmokePuff[]>([]);
  const puffIdRef = useRef<number>(0);

  const skin = LOCOMOTIVE_SKINS[skinId] || LOCOMOTIVE_SKINS.classic;

  useEffect(() => {
    if (!path || path.length === 0) {
      onComplete();
      return;
    }

    // Play steam whistle greeting & medium haptic
    soundManager.playTrainWhistle();
    hapticManager.medium();

    let step = 0;
    // 30% slower than before: ~180ms to 320ms per cell depending on path length
    const intervalTime = Math.max(180, Math.min(320, 3800 / path.length));

    const timer = setInterval(() => {
      step++;
      if (step < path.length) {
        setCurrentStep(step);

        // Direction calculation
        const prev = path[step - 1];
        const curr = path[step];
        const dr = curr.r - prev.r;
        const dc = curr.c - prev.c;

        let baseAngle = 0;
        if (dc === 1) baseAngle = 0;      // Moving Right
        else if (dr === 1) baseAngle = 90;  // Moving Down
        else if (dc === -1) baseAngle = 180; // Moving Left
        else if (dr === -1) baseAngle = 270; // Moving Up
        setRotation(baseAngle);

        // Add subtle rhythmic track sway (+/- 3 degrees)
        setSwayAngle(step % 2 === 0 ? 3.5 : -3.5);

        // Sound & haptic pulse per track segment
        soundManager.playTrainChug();
        hapticManager.light();

        // Calculate chimney position slightly behind current cell in percentage
        const puffX = ((prev.c + 1 + 0.5) / (size + 1)) * 100;
        const puffY = ((prev.r + 1 + 0.5) / (size + 1)) * 100;

        puffIdRef.current++;
        setSmokePuffs(prevPuffs => [
          ...prevPuffs.slice(-10),
          {
            id: puffIdRef.current,
            x: puffX,
            y: puffY,
            size: Math.random() * 10 + 16,
            opacity: 0.85,
          },
        ]);
      } else {
        clearInterval(timer);
        soundManager.playTrainWhistle();
        hapticManager.victory();
        setTimeout(() => {
          onComplete();
        }, 700);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [path, size, onComplete]);

  if (!path || path.length === 0) return null;

  const curr = path[Math.min(currentStep, path.length - 1)];
  const leftPct = ((curr.c + 1 + 0.5) / (size + 1)) * 100;
  const topPct = ((curr.r + 1 + 0.5) / (size + 1)) * 100;

  // Cell size reference for scalable proportions
  const cellSizePct = (1 / (size + 1)) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Dynamic drifting steam smoke puffs */}
      {smokePuffs.map(puff => (
        <div
          key={puff.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[2px] transition-all duration-1000 pointer-events-none animate-ping"
          style={{
            left: `${puff.x}%`,
            top: `${puff.y}%`,
            width: `${puff.size}px`,
            height: `${puff.size}px`,
            backgroundColor: skin.steamColor,
            opacity: puff.opacity,
          }}
        />
      ))}

      {/* Top-Down Animated Locomotive & Tender */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 transition-all ease-linear pointer-events-none will-change-transform"
        style={{
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: `${cellSizePct * 1.35}%`,
          height: `${cellSizePct * 1.35}%`,
          transform: `translate(-50%, -50%) rotate(${rotation + swayAngle}deg)`,
          transitionDuration: `${Math.max(160, Math.min(300, 3600 / path.length))}ms`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          viewBox="0 0 150 70"
          className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Dynamic Body Metal Gradient for the active skin */}
            <linearGradient id={`skinBoiler-${skin.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={skin.bodyGradient.start} />
              <stop offset="50%" stopColor={skin.bodyGradient.mid} />
              <stop offset="100%" stopColor={skin.bodyGradient.end} />
            </linearGradient>

            {/* Brass Trim Gradient */}
            <linearGradient id="brassMetallic" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Forward Headlight Beam Gradient */}
            <linearGradient id="headlightCone" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={skin.lightBeamColor} stopOpacity="0.85" />
              <stop offset="30%" stopColor={skin.lightBeamColor} stopOpacity="0.45" />
              <stop offset="100%" stopColor={skin.lightBeamColor} stopOpacity="0" />
            </linearGradient>

            {/* Glowing Cab Interior */}
            <radialGradient id="cabGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
            </radialGradient>
          </defs>

          {/* 1. FORWARD HEADLIGHT BEAM (Shooting forward from the front onto the tracks) */}
          <polygon
            points="132,35 185,10 185,60"
            fill="url(#headlightCone)"
            className="animate-pulse"
          />

          {/* 2. REAR TENDER (Carrying Coal & Water Supply) */}
          <g id="tender">
            {/* Tender chassis */}
            <rect
              x="6"
              y="18"
              width="26"
              height="34"
              rx="4"
              fill={`url(#skinBoiler-${skin.id})`}
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            {/* Tender water tank outer edge */}
            <rect
              x="8"
              y="20"
              width="22"
              height="30"
              rx="3"
              fill="#090d16"
              stroke={skin.trimColor}
              strokeWidth="0.8"
            />
            {/* Coal chunks inside tender */}
            <ellipse cx="19" cy="35" rx="8" ry="11" fill="#020617" />
            <circle cx="15" cy="31" r="3.2" fill="#1e293b" />
            <circle cx="21" cy="33" r="3" fill="#334155" />
            <circle cx="16" cy="38" r="2.8" fill="#1e293b" />
            <circle cx="22" cy="39" r="2.5" fill="#334155" />
            <circle cx="18" cy="35" r="3" fill="#0f172a" />

            {/* Red rear buffer lamps */}
            <ellipse cx="6" cy="22" rx="2" ry="3" fill={skin.bufferColor} />
            <ellipse cx="6" cy="48" rx="2" ry="3" fill={skin.bufferColor} />
          </g>

          {/* 3. ARTICULATED GANGWAY (Connection between tender & cab) */}
          <rect x="30" y="27" width="8" height="16" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
          <line x1="32" y1="27" x2="32" y2="43" stroke="#475569" strokeWidth="1.2" />
          <line x1="36" y1="27" x2="36" y2="43" stroke="#475569" strokeWidth="1.2" />

          {/* 4. MAIN LOCOMOTIVE (TOP-DOWN VIEW) */}
          <g id="locomotive">
            {/* Side walkways running along the boiler */}
            <rect x="36" y="16" width="90" height="38" rx="5" fill="#090d16" stroke="#1e293b" strokeWidth="1" />

            {/* Main Cylindrical Boiler */}
            <rect
              x="52"
              y="21"
              width="74"
              height="28"
              rx="12"
              fill={`url(#skinBoiler-${skin.id})`}
              stroke="#0f172a"
              strokeWidth="1.6"
            />

            {/* Brass Boiler Bands (Metallic straps across the top of boiler) */}
            <line x1="68" y1="21" x2="68" y2="49" stroke={skin.trimColor} strokeWidth="2.2" />
            <line x1="84" y1="21" x2="84" y2="49" stroke={skin.trimColor} strokeWidth="2.2" />
            <line x1="100" y1="21" x2="100" y2="49" stroke={skin.trimColor} strokeWidth="2.2" />
            <line x1="114" y1="21" x2="114" y2="49" stroke={skin.trimColor} strokeWidth="2.2" />

            {/* Steam Dome 1 (Front Brass Dome) */}
            <circle
              cx="92"
              cy="35"
              r="6.5"
              fill="url(#brassMetallic)"
              stroke="#78350f"
              strokeWidth="1.2"
            />
            <circle cx="92" cy="35" r="3" fill="#fef08a" opacity="0.6" />

            {/* Sand Dome 2 (Rear Dome) */}
            <circle
              cx="76"
              cy="35"
              r="5.5"
              fill="url(#brassMetallic)"
              stroke="#78350f"
              strokeWidth="1.2"
            />
            <circle cx="76" cy="35" r="2.2" fill="#fef08a" opacity="0.6" />

            {/* Smokestack / Chimney (From above, with dark soot ring) */}
            <circle cx="118" cy="35" r="6" fill="#090d16" stroke="#475569" strokeWidth="1.5" />
            <circle cx="118" cy="35" r="4.2" fill="#020617" />
            <circle cx="118" cy="35" r="2" fill="#f59e0b" opacity="0.8" className="animate-ping" />

            {/* Side Piston Cylinder Housings (Projecting left & right) */}
            <rect x="110" y="14" width="16" height="7" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="110" y="49" width="16" height="7" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />

            {/* Front Smokebox curved front nose */}
            <path
              d="M125,23 C132,27 132,43 125,47 Z"
              fill="#090d16"
              stroke={skin.accentColor}
              strokeWidth="1.2"
            />

            {/* Front Headlight Lantern */}
            <rect
              x="126"
              y="29"
              width="7"
              height="12"
              rx="2"
              fill="url(#brassMetallic)"
              stroke="#78350f"
              strokeWidth="1"
            />
            <ellipse cx="132" cy="35" rx="2.5" ry="4" fill="#ffffff" stroke="#f59e0b" strokeWidth="1" />

            {/* Front Buffer Beam & Twin Heavy Buffers */}
            <rect x="133" y="17" width="4.5" height="36" rx="2" fill={skin.bufferColor} stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="136" cy="22" r="3.2" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="136" cy="48" r="3.2" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1" />

            {/* Engineer Cabin Roof (Wider cabin with curved roof & hatches) */}
            <rect
              x="36"
              y="15"
              width="24"
              height="40"
              rx="4"
              fill={skin.roofColor}
              stroke="#0f172a"
              strokeWidth="1.6"
            />
            {/* Cab Roof Vent Hood */}
            <rect x="42" y="27" width="12" height="16" rx="2" fill="#0f172a" stroke={skin.trimColor} strokeWidth="1" />

            {/* Left & Right Driver Windows showing warm interior glow */}
            <rect x="41" y="17" width="8" height="3.5" rx="1" fill="url(#cabGlow)" />
            <rect x="41" y="49.5" width="8" height="3.5" rx="1" fill="url(#cabGlow)" />
          </g>
        </svg>
      </div>
    </div>
  );
};
