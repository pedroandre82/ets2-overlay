'use client';

import React from 'react';
import { GadgetProps } from '@/types/gadget';

interface TrailerInfoData {
  attached: boolean;
  brand: string;
  name: string;
  bodyType: string;
  chainType: string;
}

export const TrailerInfo: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Dados simulados para o Modo Demo
  const demoData: TrailerInfoData = {
    attached: true,
    brand: 'Krone',
    name: 'Cool Liner',
    bodyType: 'Reefer',
    chainType: 'single',
  };

  const telemetryData = data as TrailerInfoData | undefined;
  const currentData: TrailerInfoData = isDemoMode || !telemetryData
    ? demoData
    : {
        attached: telemetryData.attached ?? false,
        brand: telemetryData.brand ?? '',
        name: telemetryData.name ?? '',
        bodyType: telemetryData.bodyType ?? '',
        chainType: telemetryData.chainType ?? '',
      };

  const isAttached = currentData.attached;
  const formattedChain = currentData.chainType
    ? currentData.chainType.replace('_', '-').toUpperCase()
    : 'SINGLE';

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-2 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm">
      {/* Barra Superior: Ícone, Status e Badges em Linha Única */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <div className="flex items-center gap-1.5">
          {/* Ícone */}
          <svg className="w-4 h-4 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="6" width="15" height="10" rx="1" />
            <circle cx="5" cy="18" r="2" />
            <circle cx="12" cy="18" r="2" />
            <path d="M16 11h4l3 3v2h-7" />
            <circle cx="19" cy="18" r="2" />
          </svg>

          {/* Badges de Status e Chain Type */}
          {isAttached ? (
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold uppercase">
                ATTACHED
              </span>
              <span className="text-[8px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30 font-bold uppercase">
                {formattedChain}
              </span>
            </div>
          ) : (
            <span className="text-[8px] font-mono bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700 font-bold uppercase">
              DETACHED
            </span>
          )}
        </div>

        {/* Badge Demo (sem sobreposição) */}
        {isDemoMode && (
          <span className="text-[8px] font-mono bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 font-bold">
            DEMO
          </span>
        )}
      </div>

      {/* Conteúdo Central: Model + Body Type em Linha Única */}
      {isAttached ? (
        <div className="flex items-center justify-between my-auto font-mono text-xs">
          {/* Modelo */}
          <div className="flex flex-col truncate max-w-[60%]">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">MODEL</span>
            <span className="font-bold text-cyan-300 truncate">
              {currentData.brand} {currentData.name}
            </span>
          </div>

          {/* Tipo de Carroceria */}
          <div className="flex flex-col text-right truncate max-w-[35%]">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">BODY TYPE</span>
            <span className="font-bold text-slate-200 capitalize truncate">
              {currentData.bodyType || '--'}
            </span>
          </div>
        </div>
      ) : (
        <div className="my-auto flex items-center justify-center font-mono">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            NO TRAILER ATTACHED
          </span>
        </div>
      )}
    </div>
  );
};