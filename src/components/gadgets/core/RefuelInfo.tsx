'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

// ============================================================================
// CONFIGURAÇÕES DO GADGET
// ============================================================================
// Altere este valor para definir quantas linhas de histórico serão exibidas no slot (ex: 2 ou 3)
const MAX_HISTORY_ENTRIES = 2;

interface RefuelRecord {
  id: number;
  liters: number;
  odometerKm: number;
  avgConsumption: number | null; // null no 1º registro de tanque cheio ou se não houver linha de base
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
  // --------------------------------------------------------------------------
  // 1. Configuração da Unidade de Consumo (.env.local)
  // --------------------------------------------------------------------------
  const rawUnit = (process.env.NEXT_PUBLIC_FUEL_UNIT || 'L/100KM').toUpperCase();
  const isKmL = rawUnit === 'KM/L';
  const unitLabel = isKmL ? 'KM/L' : 'L/100KM';

  // --------------------------------------------------------------------------
  // 2. Estados do React
  // --------------------------------------------------------------------------
  const [history, setHistory] = useState<RefuelRecord[]>([]);

  // --------------------------------------------------------------------------
  // 3. Referências de Memória (Cálculo Tank-to-Tank)
  // --------------------------------------------------------------------------
  const isRefuelingSessionRef = useRef<boolean>(false);
  const fuelAtStartRef = useRef<number | null>(null);
  const accumulatedLitersRef = useRef<number>(0);
  const lastFullOdometerRef = useRef<number | null>(null);

  // Referências para detectar trocas de veículo e alterações externas ("mágicas")
  const prevPlateRef = useRef<string>('');
  const prevFuelLitersRef = useRef<number | null>(null);
  const prevFuelCapacityRef = useRef<number | null>(null);

  // --------------------------------------------------------------------------
  // 4. Função de Reset Manual e Limpeza de Estado
  // --------------------------------------------------------------------------
  const handleReset = (reason = 'Reset manual executado pelo usuário') => {
    console.log(`[RefuelInfo] 🔄 ${reason}`);
    setHistory([]);
    accumulatedLitersRef.current = 0;
    lastFullOdometerRef.current = null;
    isRefuelingSessionRef.current = false;
    fuelAtStartRef.current = null;
  };

  // --------------------------------------------------------------------------
  // 5. Simulação para Modo DEMO
  // --------------------------------------------------------------------------
  const [demoState, setDemoState] = useState<RefuelTelemetryData>({
    refuel: false,
    fuelLiters: 400,
    fuelCapacityLiters: 600,
    odometerKm: 12500,
    speedKmh: 0,
    truckLicensePlate: 'DEMO-88',
  });

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

      setHistory((prev) => [newRecord, ...prev.slice(0, MAX_HISTORY_ENTRIES - 1)]);
    }, 6000);

    return () => clearInterval(interval);
  }, [isDemoMode, isKmL]);

  // --------------------------------------------------------------------------
  // 6. Normalização dos Dados de Telemetria
  // --------------------------------------------------------------------------
  const telemetryData = data as NormalizedTelemetryData | undefined;

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

  // --------------------------------------------------------------------------
  // 7. Loop Principal de Processamento de Telemetria
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isDemoMode) return;

    const currentPlate = currentData.truckLicensePlate;
    const currentFuel = currentData.fuelLiters;
    const currentCapacity = currentData.fuelCapacityLiters;
    const currentOdo = currentData.odometerKm;
    const currentSpeed = currentData.speedKmh;
    const isRefuelingFlag = currentData.refuel;

    // A) DETECÇÃO DE TROCA DE VEÍCULO (Por Placa)
    if (prevPlateRef.current && currentPlate && currentPlate !== prevPlateRef.current) {
      handleReset(`Troca de veículo detectada (Placa antiga: "${prevPlateRef.current}", Nova: "${currentPlate}").`);
    }
    prevPlateRef.current = currentPlate;

    // B) DETECÇÃO DE ABASTECIMENTO "MÁGICO" (Oficina / Guincho / Quick Job)
    const prevFuel = prevFuelLitersRef.current;
    const prevCap = prevFuelCapacityRef.current;

    if (!isRefuelingSessionRef.current && !isRefuelingFlag) {
      // Ignora a inicialização (prevCap > 10 evita falso positivo quando a app conecta)
      const isRealCapacityChange = prevCap !== null && prevCap > 10 && currentCapacity !== prevCap;
      const isMagicRefuel = prevFuel !== null && currentFuel > prevFuel + 20;

      if (isMagicRefuel || isRealCapacityChange) {
        console.log(
          `[RefuelInfo] 🛠️ Alteração externa de combustível/oficina detectada ` +
            `(Fuel: ${prevFuel}L -> ${currentFuel}L, Cap: ${prevCap}L -> ${currentCapacity}L). ` +
            `Nova linha de base definida: ${currentOdo} km.`
        );
        lastFullOdometerRef.current = currentOdo;
        accumulatedLitersRef.current = 0;
      }
    }
    prevFuelLitersRef.current = currentFuel;
    prevFuelCapacityRef.current = currentCapacity;

    // C) INÍCIO DO ABASTECIMENTO NA BOMBA
    if (isRefuelingFlag && !isRefuelingSessionRef.current) {
      isRefuelingSessionRef.current = true;
      fuelAtStartRef.current = currentFuel;
      console.log(`[RefuelInfo] ⛽ Abastecimento iniciado na bomba. Nível inicial: ${currentFuel}L.`);
    }

    // D) CONCLUSÃO DO ABASTECIMENTO (Veículo voltou a rodar > 1 km/h)
    if (isRefuelingSessionRef.current && currentSpeed > 1) {
      const startFuel = fuelAtStartRef.current ?? currentFuel;
      const litersAdded = Math.max(0, currentFuel - startFuel);

      // Descarta acionamentos acidentais da bomba (<= 0.5 Litros)
      if (litersAdded > 0.5) {
        const isTankFull = currentFuel >= currentCapacity - 2.0;

        if (isTankFull) {
          // --- ABASTECIMENTO COMPLETO (FULL) ---
          const totalLegLiters = accumulatedLitersRef.current + litersAdded;
          let calculatedAvg: number | null = null;

          // Se já existir uma linha de base anterior válida, calcula a média do trecho
          if (lastFullOdometerRef.current !== null && currentOdo > lastFullOdometerRef.current) {
            const deltaKm = currentOdo - lastFullOdometerRef.current;
            if (deltaKm > 0 && totalLegLiters > 0) {
              calculatedAvg = isKmL
                ? Number((deltaKm / totalLegLiters).toFixed(1))
                : Number(((totalLegLiters / deltaKm) * 100).toFixed(1));
            }
          }

          console.log(
            `[RefuelInfo] ✅ Abastecimento COMPLETO registrado: +${Math.round(litersAdded)}L ` +
              `(Total do ciclo: ${totalLegLiters}L, Odômetro: ${currentOdo} km). ` +
              `${
                calculatedAvg !== null
                  ? `Média calculada: ${calculatedAvg} ${unitLabel}`
                  : 'Primeira parada cheia registrada (linha de base definida, sem média prévia).'
              }`
          );

          const newRecord: RefuelRecord = {
            id: Date.now(),
            liters: Math.round(litersAdded),
            odometerKm: currentOdo,
            avgConsumption: calculatedAvg,
          };

          // Insere apenas abastecimentos FULL no histórico visível
          setHistory((prev) => [newRecord, ...prev.slice(0, MAX_HISTORY_ENTRIES - 1)]);

          // Atualiza a linha de base para o próximo ciclo e zera o acumulador
          lastFullOdometerRef.current = currentOdo;
          accumulatedLitersRef.current = 0;
        } else {
          // --- ABASTECIMENTO PARCIAL (PARTIAL) ---
          accumulatedLitersRef.current += litersAdded;
          console.log(
            `[RefuelInfo] ⚠️ Abastecimento PARCIAL registrado: +${Math.round(litersAdded)}L ` +
              `(Odômetro: ${currentOdo} km). Total acumulado para a próxima parada cheia: ${accumulatedLitersRef.current}L.`
          );
        }
      }

      // Encerra a sessão de abastecimento
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
    unitLabel,
  ]);

  // --------------------------------------------------------------------------
  // 8. Renderização da Interface
  // --------------------------------------------------------------------------
  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-2 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm font-mono">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[7px] font-bold bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Cabeçalho do Gadget */}
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
            onClick={() => handleReset('Reset manual pelo botão do gadget')}
            title="Resetar histórico de consumo"
            className="text-[7px] font-bold text-slate-500 hover:text-slate-300 bg-slate-950 px-1 py-0.5 rounded border border-slate-800 transition-colors"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Conteúdo Principal: Tabela Compacta */}
      <div className="flex-1 my-1 flex flex-col justify-center">
        {/* Cabeçalho das Colunas */}
        <div className="grid grid-cols-4 text-[7px] font-bold text-slate-500 uppercase border-b border-slate-800/80 pb-0.5 mb-1 text-center">
          <span className="text-left pl-0.5">ODO (KM)</span>
          <span>VOL</span>
          <span>{unitLabel}</span>
          <span className="text-right pr-0.5">VAR</span>
        </div>

        {/* Linhas de Dados */}
        {history.length > 0 ? (
          <div className="space-y-1">
            {history.map((item, idx) => {
              const nextValidItem = history.slice(idx + 1).find((r) => r.avgConsumption !== null);
              const hasVal = item.avgConsumption !== null;
              const hasPrevVal = Boolean(nextValidItem && nextValidItem.avgConsumption !== null);

              const diff = hasVal && hasPrevVal ? item.avgConsumption! - nextValidItem!.avgConsumption! : 0;
              const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff < 0 ? `${diff.toFixed(1)}` : '0.0';

              // Regras de Cores para a Coluna VAR:
              // Para KM/L: maior é melhor (positivo = verde, negativo = vermelho)
              // Para L/100KM: menor é melhor (negativo = verde, positivo = vermelho)
              const isGood = isKmL ? diff > 0 : diff < 0;
              const isBad = isKmL ? diff < 0 : diff > 0;

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

                  {/* Coluna 3: Consumo (L/100KM ou KM/L) */}
                  <span className="text-slate-200 font-black">
                    {hasVal ? item.avgConsumption : '--'}
                  </span>

                  {/* Coluna 4: Variação (VAR) */}
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

      {/* Rodapé */}
      <div className="flex items-center justify-between text-[7px] text-slate-500 pt-0.5 border-t border-slate-800/60">
        <span>TANK-TO-TANK LOG</span>
        <span>
          {history.length}/{MAX_HISTORY_ENTRIES} ENTRIES
        </span>
      </div>
    </div>
  );
};
