'use client';

import React from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface JobSummaryData {
  cargoName: string;
  cargoMassTons: number;
  citySource: string;
  companySource: string;
  cityDestination: string;
  companyDestination: string;
  specialJob: boolean;
  jobMarket: string; // ex: 'external_contracts', 'freight_market', 'cargo_market', 'quick_job'
  jobDeliveryTimeRemainingMin: number; // em minutos
  routeTimeSeconds: number; // em segundos (tempo estipulado no GPS)
}

export const JobSummary: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Dados de teste no Modo Demo (Simulando frete WoTr com tempo em azul)
  const demoData: JobSummaryData = {
    cargoName: 'Medical Equipment',
    cargoMassTons: 14,
    citySource: 'Hamburg',
    companySource: 'LKW',
    cityDestination: 'Verona',
    companyDestination: 'Transinet',
    specialJob: false,
    jobMarket: 'quick_job',
    jobDeliveryTimeRemainingMin: 1080, // 18 horas reais restantes no WoTr
    routeTimeSeconds: 36000, // 10h no GPS
  };

  const telemetryData = data as NormalizedTelemetryData | undefined;

  const currentData: JobSummaryData = isDemoMode
    ? demoData
    : {
        cargoName: telemetryData?.cargoName ?? '',
        cargoMassTons: telemetryData?.cargoMassTons ?? 0,
        citySource: telemetryData?.citySource ?? '',
        companySource: telemetryData?.companySource ?? '',
        cityDestination: telemetryData?.cityDestination ?? '',
        companyDestination: telemetryData?.companyDestination ?? '',
        specialJob: telemetryData?.specialJob ?? false,
        jobMarket: telemetryData?.jobMarket ?? '',
        jobDeliveryTimeRemainingMin: telemetryData?.jobDeliveryTimeRemainingMin ?? 0,
        routeTimeSeconds: telemetryData?.routeTimeSeconds ?? 0,
      };

  const hasJob = Boolean(currentData.cargoName || currentData.cityDestination);
  const isWoTr = currentData.jobMarket.includes('external');

  // Formatação do tempo restante (Horas e Minutos)
  const totalMins = Math.max(0, currentData.jobDeliveryTimeRemainingMin);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  // Risco de atraso: calcula se o tempo limite é menor que o tempo de viagem do GPS
  const navTimeMin = Math.round(currentData.routeTimeSeconds / 60);
  const isLateRisk =
    !isWoTr &&
    hasJob &&
    navTimeMin > 0 &&
    totalMins > 0 &&
    totalMins < navTimeMin;

  // Definição da cor do texto do tempo restante
  const timeTextColor = isLateRisk
    ? 'text-red-400'
    : isWoTr
    ? 'text-cyan-400 font-semibold'
    : 'text-emerald-400';

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-2 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm">
      {/* Badge Demo */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[8px] font-mono bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Linha Superior: Carga + Badge Special */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <div className="flex items-center gap-1.5 truncate pr-2">
          <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase">CARGO:</span>
          <span className="text-xs font-bold font-mono text-cyan-300 truncate">
            {hasJob ? `${currentData.cargoName} (${currentData.cargoMassTons}t)` : 'NO ACTIVE JOB'}
          </span>
        </div>

        {currentData.specialJob && (
          <span className="text-[8px] font-mono bg-purple-500/20 text-purple-300 px-1 rounded border border-purple-500/40 font-bold animate-pulse shrink-0">
            SPECIAL
          </span>
        )}
      </div>

      {/* Linha Central: Origem ➔ Destino */}
      <div className="flex items-center justify-between my-auto text-xs font-mono">
        <div className="flex flex-col truncate max-w-[42%]">
          <span className="text-slate-200 font-bold truncate">
            {hasJob ? currentData.citySource : '--'}
          </span>
          <span className="text-[9px] text-slate-400 truncate">
            {hasJob && currentData.companySource ? `(${currentData.companySource})` : ''}
          </span>
        </div>

        <span className="text-cyan-400 font-bold px-1">➔</span>

        <div className="flex flex-col text-right truncate max-w-[42%]">
          <span className="text-slate-200 font-bold truncate">
            {hasJob ? currentData.cityDestination : '--'}
          </span>
          <span className="text-[9px] text-slate-400 truncate">
            {hasJob && currentData.companyDestination ? `(${currentData.companyDestination})` : ''}
          </span>
        </div>
      </div>

      {/* Linha Inferior: Alterada unicamente para tratar WoTr sem tempo válido */}
      <div className="border-t border-slate-800/80 pt-1 font-mono text-[10px]">
        {hasJob && isWoTr && totalMins === 0 ? (
          <div className="w-full text-center font-bold text-cyan-400 uppercase tracking-wider">
            World of Trucks Delivery Job
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold uppercase">DELIVERY TIME:</span>
              {isWoTr && (
                <span className="text-[8px] bg-cyan-500/20 text-cyan-300 px-1 rounded border border-cyan-500/40 font-bold">
                  WOTR (REAL)
                </span>
              )}
            </div>

            {hasJob ? (
              <div className="flex items-center gap-1.5">
                {isLateRisk && (
                  <span className="text-[8px] bg-red-500/20 text-red-400 px-1 rounded border border-red-500/40 font-bold animate-pulse">
                    LATE RISK
                  </span>
                )}
                <span className={`font-bold ${timeTextColor}`}>
                  {hours}h {mins}m
                </span>
              </div>
            ) : (
              <span className="text-slate-500">--</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};