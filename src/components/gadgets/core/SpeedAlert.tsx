'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

export const SpeedAlert: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  const [speedLimit, setSpeedLimit] = useState<number>(80);
  const [displayedLimit, setDisplayedLimit] = useState<number>(80);
  const [animPhase, setAnimPhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const prevLimitRef = useRef<number>(80);

  // Animação em 2 etapas: Encolher -> Trocar Valor -> Expansão com Bounce
  const animateLimitChange = (newLimit: number) => {
    // 1. Fase de Encolhimento (Shrink / Exit)
    setAnimPhase('exit');

    // 2. Troca o número quando está invisível (150ms) e dispara a expansão com Bounce (Enter)
    setTimeout(() => {
      setDisplayedLimit(newLimit);
      setAnimPhase('enter');

      // 3. Estabiliza no tamanho final após o efeito de bounce (350ms)
      setTimeout(() => {
        setAnimPhase('idle');
      }, 350);
    }, 150);
  };

  // --- MODO DEMO: Alterna entre 80 km/h, 60 km/h e 110 km/h ---
  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setSpeedLimit((prev) => {
        const nextValue = prev === 80 ? 60 : prev === 60 ? 110 : 80;
        animateLimitChange(nextValue);
        return nextValue;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  // --- TELEMETRIA REAL ---
  useEffect(() => {
    if (isDemoMode) return;

    const telemetryData = data as NormalizedTelemetryData | undefined;
    const currentLimit = telemetryData?.speedLimitKmh ?? 0;

    if (currentLimit !== prevLimitRef.current) {
      prevLimitRef.current = currentLimit;
      setSpeedLimit(currentLimit);

      if (currentLimit > 0) {
        animateLimitChange(currentLimit);
      } else {
        setDisplayedLimit(0);
      }
    }
  }, [data, isDemoMode]);

  // Estilização dinâmica por fase da animação
  let animClasses = 'scale-100 opacity-100 shadow-black/50 border-red-600';

  if (animPhase === 'exit') {
    // Encolhe até sumir no ponto central (150ms)
    animClasses = 'scale-0 opacity-0 border-red-600 transition-all duration-150 ease-in';
  } else if (animPhase === 'enter') {
    // Surge expandindo além do tamanho normal com brilho e efeito mola/bounce
    animClasses = 'scale-110 opacity-100 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.95)] transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)]';
  } else if (animPhase === 'idle' && displayedLimit > 0) {
    // Retorna ao tamanho padrão (100%) suavemente
    animClasses = 'scale-100 opacity-100 shadow-black/50 border-red-600 transition-all duration-200 ease-out';
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[8px] font-mono bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30">
          DEMO
        </span>
      )}

      {/* Placa de Trânsito com Efeito Shrink & Pop/Bounce */}
      <div
        className={`w-28 h-28 rounded-full bg-white border-[7px] flex flex-col items-center justify-center shadow-lg transform origin-center ${animClasses}`}
      >
        {/* Valor do Limite */}
        <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none font-sans">
          {displayedLimit > 0 ? displayedLimit : '--'}
        </span>

        {/* Unidade */}
        <span className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase mt-0.5 font-sans">
          km/h
        </span>
      </div>
    </div>
  );
};
