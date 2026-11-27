'use client';

import React, { useRef } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface FuelData {
  fuelLiters: number;
  fuelCapacityLiters: number;
  fuelAvgConsumption: number;
  fuelRangeKm: number;
  fuelWarning: boolean;
}

export const FuelInfo: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Ref para memorizar o último consumo válido e evitar oscilações para "--"
  const lastValidAvgRef = useRef<number>(0);

  // Refs para rastrear a tendência de variação do consumo médio
  const prevAvgRef = useRef<number | null>(null);
  const trendRef = useRef<'up' | 'down' | null>(null);

  // Dados de teste no Modo DEMO
  const demoData: FuelData = {
    fuelLiters: 480,
    fuelCapacityLiters: 600,
    fuelAvgConsumption: 0.425, // ~42.5 L/100km ou ~2.35 km/L
    fuelRangeKm: 1129,
    fuelWarning: false,
  };

  const telemetryData = data as NormalizedTelemetryData | undefined;

  // Seleção dos dados
  const currentData: FuelData = isDemoMode
    ? demoData
    : {
        fuelLiters: telemetryData?.fuelLiters ?? 0,
        fuelCapacityLiters: telemetryData?.fuelCapacityLiters ?? 0,
        fuelAvgConsumption: telemetryData?.fuelAvgConsumption ?? 0,
        fuelRangeKm: telemetryData?.fuelRangeKm ?? 0,
        fuelWarning: telemetryData?.fuelWarning ?? false,
      };

  const capacity = currentData.fuelCapacityLiters || 1;
  const fuelPct = Math.min(100, Math.max(0, Math.round((currentData.fuelLiters / capacity) * 100)));
  const isLow = currentData.fuelWarning || (capacity > 0 && fuelPct <= 15);

  // --- CONFIGURAÇÃO DA UNIDADE DE CONSUMO VIA .ENV.LOCAL ---
  const fuelUnit = (process.env.NEXT_PUBLIC_FUEL_UNIT || 'L/100km').toUpperCase();
  const isKmL = fuelUnit === 'KM/L' || fuelUnit === 'KML';

  // Atualiza o último valor válido recebido para evitar flicker
  const rawAvg = currentData.fuelAvgConsumption;
  if (rawAvg > 0) {
    lastValidAvgRef.current = rawAvg;
  }
  const effectiveAvg = rawAvg > 0 ? rawAvg : lastValidAvgRef.current;

  // Trata conversão independente se o valor vier em L/km (0.425) ou L/100km (42.5)
  const lPer100 = effectiveAvg > 5 ? effectiveAvg : effectiveAvg * 100;

  // --- MONITORAMENTO DA TENDÊNCIA DO CONSUMO MÉDIO ---
  if (lPer100 > 0) {
    if (prevAvgRef.current !== null) {
      const diff = lPer100 - prevAvgRef.current;
      // Registra alteração de tendência quando houver variação superior a 0.001
      if (Math.abs(diff) > 0.001) {
        if (diff > 0) {
          // O consumo em L/100km aumentou (gasto maior)
          trendRef.current = isKmL ? 'down' : 'up';
        } else {
          // O consumo em L/100km diminuiu (gasto menor)
          trendRef.current = isKmL ? 'up' : 'down';
        }
        prevAvgRef.current = lPer100;
      }
    } else {
      prevAvgRef.current = lPer100;
    }
  }

  let formattedAvgConsumption = '--';
  if (lPer100 > 0) {
    if (isKmL) {
      const kmPerL = (100 / lPer100).toFixed(2);
      formattedAvgConsumption = `${kmPerL} km/L`;
    } else {
      formattedAvgConsumption = `${lPer100.toFixed(1)} L/100km`;
    }
  }

  // Símbolo e cor da seta de tendência
  let trendIcon = null;
  if (trendRef.current !== null && lPer100 > 0) {
    if (trendRef.current === 'up') {
      // 'up': Para KM/L = aumento de eficiência (Verde). Para L/100km = aumento de gasto (Vermelho).
      const isGood = isKmL;
      trendIcon = (
        <span className={`text-[10px] font-black mr-1 ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
          ▲
        </span>
      );
    } else if (trendRef.current === 'down') {
      // 'down': Para KM/L = queda de eficiência (Vermelho). Para L/100km = redução de gasto (Verde).
      const isGood = !isKmL;
      trendIcon = (
        <span className={`text-[10px] font-black mr-1 ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
          ▼
        </span>
      );
    }
  }

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-2 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm font-mono">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[8px] bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Header (Altura fixa estrita shrink-0) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1 h-5 shrink-0">
        <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
          <svg
            className={`w-3.5 h-3.5 ${isLow ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 22V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v17" />
            <path d="M13 11h4a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h0" />
            <path d="M3 22h10" />
            <rect x="6" y="6" width="4" height="4" rx="1" />
          </svg>
          FUEL STATUS
        </span>
        {isLow && (
          <span className="text-[8px] bg-red-500/20 text-red-400 px-1 rounded border border-red-500/30 font-bold animate-pulse">
            LOW FUEL
          </span>
        )}
      </div>

      {/* Seção Central: Barra de Progresso do Tanque + Autonomia (Flex-1) */}
      <div className="flex-1 flex flex-col justify-center space-y-2 py-1">
        {/* Nível do Tanque */}
        <div className="w-full space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-slate-200">
              {currentData.fuelLiters} / {capacity} L
            </span>
            <span className={`font-bold ${isLow ? 'text-red-400' : 'text-cyan-300'}`}>
              {fuelPct}%
            </span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isLow
                  ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  : fuelPct <= 30
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${fuelPct}%` }}
            />
          </div>
        </div>

        {/* Autonomia Destaque (Ícone de Estrada/Rodovia) */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded px-2 py-1 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-400 uppercase font-semibold">ESTIMATED RANGE</span>
            <span className={`text-base font-black leading-tight ${isLow ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
              {currentData.fuelRangeKm.toLocaleString()} <span className="text-xs font-bold text-slate-400">km</span>
            </span>
          </div>
          <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400" title="Autonomia na estrada">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19L9 3h6l5 16" />
              <path d="M12 6v2" />
              <path d="M12 11v2" />
              <path d="M12 16v2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Rodapé: Consumo Médio com Seta de Tendência */}
      <div className="flex items-center justify-between text-[9px] border-t border-slate-800/80 pt-1 h-5 shrink-0 whitespace-nowrap overflow-hidden">
        <span className="text-slate-400 uppercase font-semibold shrink-0">AVG:</span>
        <span className="text-emerald-400 font-bold text-[10px] truncate ml-1 flex items-center">
          {trendIcon}
          {formattedAvgConsumption}
        </span>
      </div>
    </div>
  );
};
