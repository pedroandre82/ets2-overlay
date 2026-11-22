'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface RefuelRecord {
  id: number;
  liters: number;
  avgConsumption: number;
  timeStr: string;
}

interface RefuelTelemetryData {
  refuel: boolean;
  refuelPayed: boolean;
  refuelAmountLiters: number;
  fuelAvgConsumption: number;
  timeAbs: number;
}

export const RefuelInfo: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Histórico dos últimos 3 abastecimentos (volume em Litros e consumo médio no momento)
  const [history, setHistory] = useState<RefuelRecord[]>([
    { id: 1, liters: 450, avgConsumption: 31.2, timeStr: '14:20' },
    { id: 2, liters: 380, avgConsumption: 33.5, timeStr: '09:15' },
    // { id: 3, liters: 510, avgConsumption: 29.8, timeStr: '18:40' },
  ]);

  // Estado para simulação no Modo DEMO
  const [demoState, setDemoState] = useState<RefuelTelemetryData>({
    refuel: false,
    refuelPayed: false,
    refuelAmountLiters: 420,
    fuelAvgConsumption: 31.8,
    timeAbs: 2880,
  });

  // Controle de disparo único do evento refuelPayed
  const prevRefuelPayedRef = useRef<boolean>(false);

  // Simulação no Modo DEMO
  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      const demoLiters = Math.floor(Math.random() * 250) + 300;
      const demoCons = Number((Math.random() * 4 + 29).toFixed(1));

      const newRecord: RefuelRecord = {
        id: Date.now(),
        liters: demoLiters,
        avgConsumption: demoCons,
        timeStr: 'NOW',
      };

      setHistory((prev) => [newRecord, ...prev.slice(0, 1)]);
    }, 6000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  const currentData: RefuelTelemetryData = isDemoMode
    ? demoState
    : {
        refuel: telemetryData?.refuel ?? false,
        refuelPayed: telemetryData?.refuelPayed ?? false,
        refuelAmountLiters: telemetryData?.refuelAmountLiters ?? 0,
        fuelAvgConsumption: Number((telemetryData?.fuelAvgConsumption ?? 0).toFixed(1)),
        timeAbs: telemetryData?.timeAbs ?? 0,
      };

  // Registra novo abastecimento em tempo real ao finalizar o evento no jogo
  useEffect(() => {
    if (isDemoMode) return;

    if (currentData.refuelPayed && !prevRefuelPayedRef.current && currentData.refuelAmountLiters > 0) {
      const liters = currentData.refuelAmountLiters;

      const totalMinutes = Math.max(0, currentData.timeAbs);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const mins = Math.floor(totalMinutes % 60);
      const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

      const newRecord: RefuelRecord = {
        id: Date.now(),
        liters,
        avgConsumption: currentData.fuelAvgConsumption || 30.0,
        timeStr,
      };

      setHistory((prev) => [newRecord, ...prev.slice(0, 1)]);
    }

    prevRefuelPayedRef.current = currentData.refuelPayed;
  }, [currentData.refuelPayed, currentData.refuelAmountLiters, currentData.fuelAvgConsumption, currentData.timeAbs, isDemoMode]);

  const lastRecord = history[0];

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-2 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm font-mono">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[7px] font-bold bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Header: Ícone da Bomba + Título */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 22V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v17" />
            <path d="M13 11h6a1 1 0 0 1 1 1v4a2 2 0 0 1-4 0v-3" />
            <path d="M7 11h4" />
          </svg>
          <span className="text-[9px] font-extrabold tracking-wider text-slate-300 uppercase">
            REFUEL LOG
          </span>
        </div>

        {currentData.refuel && (
          <span className="text-[7px] font-bold bg-emerald-500/20 text-emerald-400 px-1 rounded border border-emerald-500/40 animate-pulse">
            REFUELING...
          </span>
        )}
      </div>

      {/* Destaque Principal: Litros Adicionados no Último Abastecimento */}
      {lastRecord ? (
        <div className="bg-slate-950/60 border border-slate-800 rounded p-1.5 my-1 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[7px] font-bold text-slate-500 uppercase">LAST REFUEL</span>
            <div className="flex items-baseline gap-1 leading-none mt-0.5">
              <span className="text-2xl font-black text-emerald-400">+{lastRecord.liters}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">L</span>
            </div>
          </div>
          <span className="text-[9px] font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            {lastRecord.timeStr}
          </span>
        </div>
      ) : (
        <div className="text-center text-[9px] text-slate-500 my-2">No refuel recorded</div>
      )}

      {/* Histórico das Últimas 2 Paradas & Flutuação de Consumo */}
      <div className="w-full">
        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          LAST 2 TRIPS CONSUMPTION
        </span>

        <div className="space-y-1">
          {history.map((item, idx) => {
            const prevItem = history[idx + 1];
            const diff = prevItem ? item.avgConsumption - prevItem.avgConsumption : 0;
            const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff < 0 ? `${diff.toFixed(1)}` : '0.0';

            return (
              <div
                key={item.id || idx}
                className="flex items-center justify-between text-[8px] bg-slate-950/40 px-1.5 py-0.5 rounded border border-slate-800/80"
              >
                <span className="text-slate-500 font-bold">#{history.length - idx}</span>
                <span className="text-slate-200 font-extrabold">{item.avgConsumption} L/100km</span>
                {idx < history.length - 1 ? (
                  <span
                    className={`font-bold ${
                      diff > 0 ? 'text-red-400' : diff < 0 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {diffStr}
                  </span>
                ) : (
                  <span className="text-slate-600 font-bold">-</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
