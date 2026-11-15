'use client';

import React from 'react';
import { GadgetProps } from '@/types/gadget';

interface SystemStatusData {
  serverConnected: boolean;
  gameConnected: boolean;
  gamePaused: boolean;
}

export const SystemStatus: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  const demoData: SystemStatusData = {
    serverConnected: false,
    gameConnected: true,
    gamePaused: false,
  };

  const telemetryData = data as SystemStatusData | undefined;

  const status: SystemStatusData = isDemoMode || !telemetryData
    ? demoData
    : {
        serverConnected: telemetryData.serverConnected ?? false,
        gameConnected: telemetryData.gameConnected ?? false,
        gamePaused: telemetryData.gamePaused ?? false,
      };

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-2 flex flex-col justify-between text-xs font-mono select-none backdrop-blur-sm">
      {/* Indicadores de Status */}
      <div className="space-y-1 my-auto">

        {/* Status do Servidor Backend */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">Server:</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                status.serverConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className={status.serverConnected ? 'text-emerald-400 font-semibold' : 'text-red-400'}>
              {status.serverConnected ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Status do Jogo (SDK) */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">SDK:</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                status.gameConnected ? 'bg-cyan-400' : 'bg-red-500'
              }`}
            />
            <span className={status.gameConnected ? 'text-cyan-400 font-semibold' : 'text-red-400'}>
              {status.gameConnected ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Status de Pausa do Jogo */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">State:</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              isDemoMode
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : !status.gameConnected
                ? 'bg-slate-800 text-slate-500'
                : status.gamePaused
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            { isDemoMode
              ? 'DEMO' 
              : !status.gameConnected ? 'UNAVAILABLE' 
              : status.gamePaused ? 'PAUSED' 
              : 'ON GAME'}
          </span>
        </div>
      </div>
    </div>
  );
};
