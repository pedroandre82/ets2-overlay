'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface RefuelRecord {
  id: number;
  liters: number;
  odometerKm: number;
  isFull: boolean;
  avgConsumption: number | null; // null em abastecimento parcial ou 1º registro
}

interface RefuelTelemetryData {
  refuel: boolean;
  refuelAmountLiters: number;
  fuelLiters: number;
  fuelCapacityLiters: number;
  odometerKm: number;
  speedKmh: number;
}

export const RefuelInfo: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Histórico com no máximo 3 registros
  const [history, setHistory] = useState<RefuelRecord[]>([]);

  // Referências para acúmulo entre paradas e ciclo tank-to-tank
  const sessionLitersRef = useRef<number>(0);
  const accumulatedLitersRef = useRef<number>(0);
  const lastFullOdometerRef = useRef<number | null>(null);
  const isRefuelingRef = useRef<boolean>(false);

  // Dados simulados para o Modo DEMO
  const [demoState, setDemoState] = useState<RefuelTelemetryData>({
    refuel: false,
    refuelAmountLiters: 0,
    fuelLiters: 400,
    fuelCapacityLiters: 600,
    odometerKm: 12500,
    speedKmh: 0,
  });

  // Simulação no Modo DEMO
  useEffect(() => {
    if (!isDemoMode) return;

    let mockOdo = 10000;
    let cycleCount = 0;

    const interval = setInterval(() => {
      cycleCount++;
      mockOdo += Math.floor(Math.random() * 400) + 600;
      const isFull = cycleCount % 2 !== 0;
      const demoLiters = isFull ? 450 : 180;
      const avg = isFull ? Number((Math.random() * 4 + 29).toFixed(1)) : null;

      const newRecord: RefuelRecord = {
        id: Date.now(),
        liters: demoLiters,
        odometerKm: mockOdo,
        isFull,
        avgConsumption: avg,
      };

      setHistory((prev) => [newRecord, ...prev.slice(0, 2)]);
    }, 6000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  // Extração estrita conforme os nomes de propriedade declarados no NormalizedTelemetryData
  const currentData: RefuelTelemetryData = isDemoMode
    ? demoState
    : {
        refuel: telemetryData?.refuel ?? false,
        refuelAmountLiters: telemetryData?.refuelAmountLiters ?? 0,
        fuelLiters: telemetryData?.fuelLiters ?? 0,
        fuelCapacityLiters: telemetryData?.fuelCapacityLiters ?? 1,
        odometerKm: Math.round(telemetryData?.odometerKm ?? 0),
        speedKmh: Math.round(telemetryData?.speedKmh ?? 0),
      };

  // Monitoramento do ciclo de abastecimento em tempo real
  useEffect(() => {
    if (isDemoMode) return;

    const isRefueling = currentData.refuel;
    const currentAmount = currentData.refuelAmountLiters;
    const currentOdo = currentData.odometerKm;
    const currentSpeed = currentData.speedKmh;
    const isTankFull = currentData.fuelLiters >= currentData.fuelCapacityLiters - 2;

    // Retém o maior volume na bomba durante a parada
    if (isRefueling) {
      isRefuelingRef.current = true;
      if (currentAmount > sessionLitersRef.current) {
        sessionLitersRef.current = currentAmount;
      }
    }

    // Gatilho de Fechamento: Veículo voltou a se mover (> 1 km/h) após abastecer
    if (isRefuelingRef.current && currentSpeed > 1 && sessionLitersRef.current > 0) {
      const sessionLiters = sessionLitersRef.current;
      const totalLitersForCycle = accumulatedLitersRef.current + sessionLiters;

      let calculatedAvg: number | null = null;

      if (isTankFull) {
        if (lastFullOdometerRef.current !== null && currentOdo > lastFullOdometerRef.current) {
          const deltaKm = currentOdo - lastFullOdometerRef.current;
          if (deltaKm > 0) {
            calculatedAvg = Number(((totalLitersForCycle / deltaKm) * 100).toFixed(1));
          }
        }
        lastFullOdometerRef.current = currentOdo;
        accumulatedLitersRef.current = 0;
      } else {
        accumulatedLitersRef.current += sessionLiters;
      }

      const newRecord: RefuelRecord = {
        id: Date.now(),
        liters: sessionLiters,
        odometerKm: currentOdo,
        isFull: isTankFull,
        avgConsumption: calculatedAvg,
      };

      setHistory((prev) => [newRecord, ...prev.slice(0, 2)]);

      sessionLitersRef.current = 0;
      isRefuelingRef.current = false;
    }
  }, [
    currentData.refuel,
    currentData.refuelAmountLiters,
    currentData.fuelLiters,
    currentData.fuelCapacityLiters,
    currentData.odometerKm,
    currentData.speedKmh,
    isDemoMode,
  ]);

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-2 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm font-mono">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[7px] font-bold bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 22V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v17" />
            <path d="M13 11h6a1 1 0 0 1 1 1v4a2 2 0 0 1-4 0v-3" />
            <path d="M7 11h4" />
          </svg>
          <span className="text-[9px] font-extrabold tracking-wider text-slate-300 uppercase">
            LAST REFUELS
          </span>
        </div>

        {currentData.refuel && (
          <span className="text-[7px] font-bold bg-emerald-500/20 text-emerald-400 px-1 rounded border border-emerald-500/40 animate-pulse">
            PUMPING...
          </span>
        )}
      </div>

      {/* Lista de Registros */}
      <div className="flex-1 my-1 flex flex-col justify-center space-y-1">
        {history.length > 0 ? (
          history.map((item, idx) => {
            const nextValidItem = history.slice(idx + 1).find((r) => r.avgConsumption !== null);
            const hasVal = item.avgConsumption !== null;
            const hasPrevVal = Boolean(nextValidItem && nextValidItem.avgConsumption !== null);

            const diff = hasVal && hasPrevVal ? item.avgConsumption! - nextValidItem!.avgConsumption! : 0;
            const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff < 0 ? `${diff.toFixed(1)}` : '0.0';

            return (
              <div
                key={item.id || idx}
                className="bg-slate-950/60 border border-slate-800/90 rounded p-1.5 flex items-center justify-between"
              >
                {/* Coluna Esquerda: Status, Volume e Odômetro */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[7px] font-extrabold px-1 rounded ${
                        item.isFull
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.isFull ? 'FULL' : 'PART'}
                    </span>
                    <span className="text-[9px] font-black text-slate-200">
                      +{item.liters}L
                    </span>
                  </div>
                  <span className="text-[7px] text-slate-500 font-bold leading-tight mt-0.5">
                    {item.odometerKm.toLocaleString()} km
                  </span>
                </div>

                {/* Coluna Direita: Consumo Calculado e Variação */}
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-extrabold text-slate-200">
                    {hasVal ? `${item.avgConsumption} L/100km` : '-- L/100km'}
                  </span>

                  {hasVal && hasPrevVal ? (
                    <span
                      className={`text-[8px] font-bold ${
                        diff > 0 ? 'text-red-400' : diff < 0 ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {diffStr}
                    </span>
                  ) : (
                    <span className="text-[8px] text-slate-600 font-bold">-</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-[8px] text-slate-500 text-center py-4">
            No refuels recorded yet.
            <br />
            <span className="text-[7px] text-slate-600">Drive & refuel to build log</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[7px] text-slate-500 pt-0.5 border-t border-slate-800/60">
        <span>TANK-TO-TANK LOG</span>
        <span>{history.length}/3 ENTRIES</span>
      </div>
    </div>
  );
};
