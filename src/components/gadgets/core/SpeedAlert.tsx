'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GadgetProps } from '@/types/gadget';

interface SpeedAlertData {
  speedLimit: number; // km/h
}

export const SpeedAlert: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  const [speedLimit, setSpeedLimit] = useState<number>(80);
  const [isAlerting, setIsAlerting] = useState<boolean>(false);
  const prevLimitRef = useRef<number>(80);

  // --- LÓGICA DO MODO DEMO ---
  useEffect(() => {
    if (!isDemoMode) return;

    // No modo Demo, alterna o limite entre 80 km/h e 60 km/h a cada 5s para testar a animação
    const interval = setInterval(() => {
      setSpeedLimit((prev) => {
        const nextValue = prev === 80 ? 60 : 80;
        triggerAlert();
        return nextValue;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  // --- LÓGICA DE TELEMETRIA REAL ---
  useEffect(() => {
    if (isDemoMode) return;

    const telemetryData = data as SpeedAlertData | undefined;
    const currentLimit = telemetryData?.speedLimit ?? 0;

    // Dispara o alerta sempre que o limite mudar e for maior que 0
    if (currentLimit > 0 && currentLimit !== prevLimitRef.current) {
      prevLimitRef.current = currentLimit;
      setSpeedLimit(currentLimit);
      triggerAlert();
    }
  }, [data, isDemoMode]);

  // Função para disparar a animação visual por 2 segundos
  const triggerAlert = () => {
    setIsAlerting(true);
    setTimeout(() => {
      setIsAlerting(false);
    }, 2000);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      {/* Badge indicativo de Demo Mode */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[8px] font-mono bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30">
          DEMO
        </span>
      )}

      {/* Placa de Trânsito com Efeito Pulsante e Glow */}
      <div
        className={`w-28 h-28 rounded-full bg-white border-[7px] border-red-600 flex flex-col items-center justify-center shadow-lg transition-all duration-300 ${
          isAlerting
            ? 'scale-120 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.9)] animate-pulse'
            : 'scale-100 shadow-black/50'
        }`}
      >
        {/* Valor do Limite */}
        <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none font-sans">
          {speedLimit > 0 ? speedLimit : '--'}
        </span>

        {/* Unidade */}
        <span className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase mt-0.5 font-sans">
          km/h
        </span>
      </div>
    </div>
  );
};