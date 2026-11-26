'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface RefuelRecord {
  id: number;
  liters: number;
  odometerKm: number;
  avgConsumption: number | null; // null no 1º registro de tanque cheio
}

interface RefuelTelemetryData {
  refuel: boolean;
  fuelLiters: number;
  fuelCapacityLiters: number;
  odometerKm: number;
  speedKmh: number;
  truckLicensePlate: string;
}

export const RefuelInfo: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Leitura da unidade de consumo configurada no .env.local (Padrão: L/100KM, Opção: KM/L)
  const rawUnit = (process.env.NEXT_PUBLIC_FUEL_UNIT || 'L/100KM').toUpperCase();
  const isKmL = rawUnit === 'KM/L';
  const unitLabel = isKmL ? 'KM/L' : 'L/100KM';

  // Histórico de até 2 registros visíveis (apenas abastecimentos FULL)
  const [history, setHistory] = useState<RefuelRecord[]>([]);

  // Referências de estado para controle do ciclo tank-to-tank e veículos
  const isRefuelingSessionRef = useRef<boolean>(false);
  const fuelAtStartRef = useRef<number | null>(null);
  const accumulatedLitersRef = useRef<number>(0);
  const lastFullOdometerRef = useRef<number | null>(null);

  // Referências para detectar trocas de veículo e aumentos "mágicos" no combustível
  const prevPlateRef = useRef<string>('');
  const prevFuelLitersRef = useRef<number | null>(null);
  const prevFuelCapacityRef = useRef<number | null>(null);

  // Função de reset manual
  const handleReset = () => {
    setHistory([]);
    accumulatedLitersRef.current = 0;
    lastFullOdometerRef.current = null;
    isRefuelingSessionRef.current = false;
    fuelAtStartRef.current = null;
  };

  // Dados simulados para o Modo DEMO
  const [demoState, setDemoState] = useState<RefuelTelemetryData>({
    refuel: false,
    fuelLiters: 400,
    fuelCapacityLiters: 600,
    odometerKm: 12500,
    speedKmh: 0,
    truckLicensePlate: 'DEMO-88',
  });

  // Simulação no Modo DEMO (gera paradas de tanque cheio a cada 6s)
  useEffect(() => {
    if (!isDemoMode) return;

    let mockOdo = 10000;

    const interval = setInterval(() => {
      mockOdo += Math.floor(Math.random() * 400) + 600;
      const demoLiters = 450;
      const avg = isKmL ? Number((Math.random() * 0.5 + 3.1).toFixed(1)) : Number((Math.random() * 4 + 29).toFixed(1));

      const newRecord: RefuelRecord = {
        id: Date.now(),
        liters: demoLiters,
        odometerKm: mockOdo,
        avgConsumption: avg,
      };

      setHistory((prev) => [newRecord, ...prev.slice(0, 1)]); // Mantém no máximo 2 linhas
    }, 6000);

    return () => clearInterval(interval);
  }, [isDemoMode, isKmL]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  // Extração dos dados da telemetria
  const currentData: RefuelTelemetryData = isDemoMode
    ? demoState
    : {
        refuel: telemetryData?.refuel ?? false,
        fuelLiters: telemetryData?.fuelLiters ?? 0,
        fuelCapacityLiters: telemetryData?.fuelCapacityLiters ?? 1,
        odometerKm: Math.round(telemetryData?.odometerKm ?? 0),
        speedKmh: Math.round(telemetryData?.speedKmh ?? 0),
        truckLicensePlate: telemetryData?.truckLicensePlate ?? '',
      };

  // Processamento contínuo da telemetria
  useEffect(() => {
    if (isDemoMode) return;

    const currentPlate = currentData.truckLicensePlate;
    const currentFuel = currentData.fuelLiters;
    const currentCapacity = currentData.fuelCapacityLiters;
    const currentOdo = currentData.odometerKm;
    const currentSpeed = currentData.speedKmh;
    const isRefuelingFlag = currentData.refuel;

    // 1. Reset Automático ao Trocar de Veículo (Placa alterada)
    if (prevPlateRef.current && currentPlate && currentPlate !== prevPlateRef.current) {
      handleReset();
    }
    prevPlateRef.current = currentPlate;

    // 2. Detecção de "Abastecimento Mágico" / Oficina / Guincho / Quick Job
    const prevFuel = prevFuelLitersRef.current;
    const prevCap = prevFuelCapacityRef.current;

    if (!isRefuelingSessionRef.current && !isRefuelingFlag) {
      // Se o combustível aumentou mais de 20L sem passar pela bomba OU a capacidade do tanque mudou
      if (
        (prevFuel !== null && currentFuel > prevFuel + 20) ||
        (prevCap !== null && prevCap > 0 && currentCapacity !== prevCap)
      ) {
        // Redefine a linha de base silenciosamente sem poluir o histórico
        lastFullOdometerRef.current = currentOdo;
        accumulatedLitersRef.current = 0;
      }
    }
    prevFuelLitersRef.current = currentFuel;
    prevFuelCapacityRef.current = currentCapacity;

    // 3. Início do Abastecimento na Bomba
    if (isRefuelingFlag && !isRefuelingSessionRef.current) {
      isRefuelingSessionRef.current = true;
      fuelAtStartRef.current = currentFuel;
    }

    // 4. Conclusão do Abastecimento: Veículo voltou a se mover (> 1 km/h)
    if (isRefuelingSessionRef.current && currentSpeed > 1) {
      const startFuel = fuelAtStartRef.current ?? currentFuel;
      const litersAdded = Math.max(0, currentFuel - startFuel);

      if (litersAdded > 0.5) {
        const isTankFull = currentFuel >= currentCapacity - 2.0;

        if (isTankFull) {
          // Tanque CHEIO: Calcula a média do trecho considerando paradas parciais anteriores
          const totalLegLiters = accumulatedLitersRef.current + litersAdded;
          let calculatedAvg: number | null = null;

          if (lastFullOdometerRef.current !== null && currentOdo > lastFullOdometerRef.current) {
            const deltaKm = currentOdo - lastFullOdometerRef.current;
            if (deltaKm > 0 && totalLegLiters > 0) {
              calculatedAvg = isKmL
                ? Number((deltaKm / totalLegLiters).toFixed(1))
                : Number(((totalLegLiters / deltaKm) * 100).toFixed(1));
            }
          }

          const newRecord: RefuelRecord = {
            id: Date.now(),
            liters: Math.round(litersAdded),
            odometerKm: currentOdo,
            avgConsumption: calculatedAvg,
          };

          // Insere apenas registros CHEIOS no histórico visível (máximo 2 linhas)
          setHistory((prev) => [newRecord, ...prev.slice(0, 1)]);

          lastFullOdometerRef.current = currentOdo;
          accumulatedLitersRef.current = 0;
        } else {
          // Tanque PARCIAL: Acumula volume e não adiciona na tabela visível
          accumulatedLitersRef.current += litersAdded;
        }
      }

      isRefuelingSessionRef.current = false;
      fuelAtStartRef.current = null;
    }
  }, [
    currentData.refuel,
    currentData.fuelLiters,
    currentData.fuelCapacityLiters,
    currentData.odometerKm,
    currentData.speedKmh,
    currentData.truckLicensePlate,
    isDemoMode,
    isKmL,
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

        <div className="flex items-center gap-1">
          {currentData.refuel && (
            <span className="text-[7px] font-bold bg-emerald-500/20 text-emerald-400 px-1 rounded border border-emerald-500/40 animate-pulse">
              PUMPING...
            </span>
          )}
          <button
            onClick={handleReset}
            title="Resetar histórico de consumo"
            className="text-[7px] font-bold text-slate-500 hover:text-slate-300 bg-slate-950 px-1 py-0.5 rounded border border-slate-800 transition-colors"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Conteúdo Principal: Tabela Compacta de 2 Linhas */}
      <div className="flex-1 my-1 flex flex-col justify-center">
        {/* Cabeçalho da Tabela */}
        <div className="grid grid-cols-4 text-[7px] font-bold text-slate-500 uppercase border-b border-slate-800/80 pb-0.5 mb-1 text-center">
          <span className="text-left pl-0.5">ODO (KM)</span>
          <span>VOL</span>
          <span>{unitLabel}</span>
          <span className="text-right pr-0.5">VAR</span>
        </div>

        {/* Linhas de Dados (Apenas Abastecimentos FULL) */}
        {history.length > 0 ? (
          <div className="space-y-1">
            {history.map((item, idx) => {
              const nextValidItem = history[idx + 1];
              const hasVal = item.avgConsumption !== null;
              const hasPrevVal = Boolean(nextValidItem && nextValidItem.avgConsumption !== null);

              const diff = hasVal && hasPrevVal ? item.avgConsumption! - nextValidItem!.avgConsumption! : 0;
              const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff < 0 ? `${diff.toFixed(1)}` : '0.0';

              // Regra de Cores para VAR:
              // Para L/100KM: menor é melhor (negativo = verde, positivo = vermelho)
              // Para KM/L: maior é melhor (positivo = verde, negativo = vermelho)
              const isPositiveBetter = isKmL;
              const isGood = isPositiveBetter ? diff > 0 : diff < 0;
              const isBad = isPositiveBetter ? diff < 0 : diff > 0;

              return (
                <div
                  key={item.id || idx}
                  className="grid grid-cols-4 text-[8px] font-bold items-center bg-slate-950/60 border border-slate-800/90 rounded px-0.5 py-1 text-center"
                >
                  {/* Coluna 1: ODO */}
                  <span className="text-slate-400 text-left pl-0.5 font-mono">
                    {item.odometerKm.toLocaleString()}
                  </span>

                  {/* Coluna 2: VOL */}
                  <span className="text-emerald-400 font-extrabold">
                    +{item.liters}L
                  </span>

                  {/* Coluna 3: L/100KM ou KM/L */}
                  <span className="text-slate-200 font-black">
                    {hasVal ? item.avgConsumption : '--'}
                  </span>

                  {/* Coluna 4: VAR */}
                  <span
                    className={`text-right pr-0.5 font-black ${
                      hasVal && hasPrevVal
                        ? isGood
                          ? 'text-emerald-400'
                          : isBad
                          ? 'text-red-400'
                          : 'text-slate-500'
                        : 'text-slate-600'
                    }`}
                  >
                    {hasVal && hasPrevVal ? diffStr : '-'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-[8px] text-slate-500 text-center py-2">
            No full refuels recorded yet.
            <br />
            <span className="text-[7px] text-slate-600">Fill tank & drive to build log</span>
          </div>
        )}
      </div>

      {/* Rodapé Minimalista */}
      <div className="flex items-center justify-between text-[7px] text-slate-500 pt-0.5 border-t border-slate-800/60">
        <span>TANK-TO-TANK LOG</span>
        <span>{history.length}/2 ENTRIES</span>
      </div>
    </div>
  );
};
