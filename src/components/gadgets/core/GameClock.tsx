'use client';

import React, { useState, useEffect } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface GameClockData {
  timeAbs: number; // Minutos acumulados no jogo
}

const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const GameClock: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Estado do Horário Real (relogio do sistema/navegador)
  const [realTime, setRealTime] = useState<string>('00:00:00');

  // Estado para simulação no Modo DEMO
  const [demoState, setDemoState] = useState<GameClockData>({
    timeAbs: 875, // 14:35 de Segunda-feira
  });

  // Atualização em tempo real do relógio do sistema (1 segundo)
  useEffect(() => {
    const updateRealClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setRealTime(`${h}:${m}:${s}`);
    };

    updateRealClock();
    const interval = setInterval(updateRealClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulação do tempo do jogo no Modo DEMO
  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setDemoState((prev) => ({
        timeAbs: prev.timeAbs + 1,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  const currentData: GameClockData = isDemoMode
    ? demoState
    : {
        timeAbs: telemetryData?.timeAbs ?? 0,
      };

  // Cálculo do tempo do jogo
  const totalMinutes = Math.max(0, currentData.timeAbs);
  const gameHours = Math.floor((totalMinutes % 1440) / 60);
  const gameMins = Math.floor(totalMinutes % 60);
  const dayIndex = Math.floor(totalMinutes / 1440) % 7;

  const gameTimeStr = `${String(gameHours).padStart(2, '0')}:${String(gameMins).padStart(2, '0')}`;
  const dayNameStr = DAYS_OF_WEEK[dayIndex] || 'MON';

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-1.5 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm font-mono">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[7px] font-bold bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Seção Superior: Horário do Jogo (Destaque Principal) */}
      <div className="flex-1 flex flex-col items-center justify-center pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[7px] font-bold tracking-wider text-slate-400 uppercase">IN-GAME</span>
          <span className="text-[8px] font-bold bg-cyan-500/20 text-cyan-300 px-1 rounded border border-cyan-500/30">
            {dayNameStr}
          </span>
        </div>

        <div className="leading-none mt-1">
          <span className="text-3xl font-black text-cyan-300 tracking-tight">
            {gameTimeStr}
          </span>
        </div>
      </div>

      {/* Linha Divisória */}
      <div className="w-full h-[1px] bg-slate-800/80 my-0.5" />

      {/* Seção Inferior: Horário Real (Menor e Discreto) */}
      <div className="flex items-center justify-between text-[9px] px-1 pb-0.5 shrink-0">
        <span className="text-slate-500 font-bold uppercase text-[7px] tracking-wider">REAL TIME:</span>
        <span className="text-slate-200 font-bold tracking-wide">{realTime}</span>
      </div>
    </div>
  );
};
