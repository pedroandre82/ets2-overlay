'use client';

import React, { useState, useEffect } from 'react';
import { GadgetProps } from '@/types/gadget';

interface CompassData {
  heading: number; // 0 a 360 graus
}

// Retorna a sigla cardeal em inglês
const getCardinalDirection = (deg: number): string => {
  const normalized = ((deg % 360) + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return 'N';
  if (normalized >= 22.5 && normalized < 67.5) return 'NE';
  if (normalized >= 67.5 && normalized < 112.5) return 'E';
  if (normalized >= 112.5 && normalized < 157.5) return 'SE';
  if (normalized >= 157.5 && normalized < 202.5) return 'S';
  if (normalized >= 202.5 && normalized < 247.5) return 'SW';
  if (normalized >= 247.5 && normalized < 292.5) return 'W';
  return 'NW';
};

export const Compass: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  const [heading, setHeading] = useState<number>(0);

  // --- MODO DEMO: ROTAÇÃO CONTÍNUA LENTA ---
  useEffect(() => {
    if (!isDemoMode) return;

    let animFrameId: number;
    const animate = () => {
      setHeading((prev) => (prev + 0.11) % 360);
      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameId);
  }, [isDemoMode]);

  // --- TELEMETRIA REAL ---
  useEffect(() => {
    if (isDemoMode) return;
    const telemetryData = data as CompassData | undefined;
    if (telemetryData?.heading !== undefined) {
      setHeading(((telemetryData.heading % 360) + 360) % 360);
    }
  }, [data, isDemoMode]);

  // Marcadores da fita horizontal a cada 15 graus
  const markers = [];
  for (let deg = 0; deg < 360; deg += 15) {
    let label = '';
    let isMain = false;
    if (deg === 0) { label = 'N'; isMain = true; }
    else if (deg === 45) label = 'NE';
    else if (deg === 90) { label = 'E'; isMain = true; }
    else if (deg === 135) label = 'SE';
    else if (deg === 180) { label = 'S'; isMain = true; }
    else if (deg === 225) label = 'SW';
    else if (deg === 270) { label = 'W'; isMain = true; }
    else if (deg === 315) label = 'NW';

    markers.push({ deg, label, isMain });
  }

  const currentHeading = Math.round(heading);
  const cardinalText = getCardinalDirection(currentHeading);

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-1.5 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm">
      {/* Badge Demo */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[8px] font-mono bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Header */}
      <div className="flex items-center justify-center text-[10px] font-mono border-b border-slate-800 pb-0.5">
        {/* <span className="font-bold tracking-wider text-slate-400 uppercase">COMPASS</span> */}
        <span className="text-cyan-400 font-bold">
          {String(currentHeading).padStart(3, '0')}° <span className="text-emerald-400">{cardinalText}</span>
        </span>
      </div>

      {/* Fita Deslizante da Bússola */}
      <div className="relative w-full h-10 my-auto bg-slate-950/70 rounded border border-slate-800/80 overflow-hidden flex items-center">
        {/* Marcador Central Fixo */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-0.5 h-full bg-cyan-400 z-20 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-0.5 text-cyan-400 text-[8px] z-20">▼</div>

        {/* Graduação e Letras */}
        <div className="w-full h-full relative">
          {markers.map((m) => {
            let diff = heading - m.deg;
            while (diff < -180) diff += 360;
            while (diff > 180) diff -= 360;

            const pxOffset = diff * 1.8;
            const leftPx = 72 + pxOffset; // Centro do slot 160px

            if (leftPx < -20 || leftPx > 160) return null;

            return (
              <div
                key={m.deg}
                style={{ left: `${leftPx}px` }}
                className="absolute top-0 bottom-0 -translate-x-1/2 flex flex-col items-center justify-between py-1"
              >
                <div
                  className={`w-0.5 rounded-full ${
                    m.isMain ? 'h-3 bg-cyan-300' : m.label ? 'h-2 bg-slate-400' : 'h-1.5 bg-slate-600'
                  }`}
                />
                <span
                  className={`text-[9px] font-mono font-bold leading-none ${
                    m.deg === 0
                      ? 'text-red-400 font-extrabold'
                      : m.isMain
                      ? 'text-cyan-300'
                      : 'text-slate-400'
                  }`}
                >
                  {m.label || '•'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};