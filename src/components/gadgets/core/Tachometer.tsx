'use client';

import React, { useState, useEffect } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';
import { getTruckSpec, TruckGaugeProfile } from '@/config/truckSpecs';

interface TachometerData {
  engineRpm: number;
  engineRpmMax: number;
  motorBrake: boolean;
  truckId: string;
  truckBrandId: string;
}

export const Tachometer: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Estado para simulação no Modo DEMO (Oscila o RPM de 600 a 2300)
  const [demoState, setDemoState] = useState<TachometerData>({
    engineRpm: 1250,
    engineRpmMax: 2500,
    motorBrake: false,
    truckId: 'vehicle.volvo.fh_2024',
    truckBrandId: 'volvo',
  });

  useEffect(() => {
    if (!isDemoMode) return;

    let dir = 1;
    const interval = setInterval(() => {
      setDemoState((prev) => {
        let nextRpm = prev.engineRpm + dir * 80;
        if (nextRpm >= 2300) {
          nextRpm = 2300;
          dir = -1;
        } else if (nextRpm <= 600) {
          nextRpm = 600;
          dir = 1;
        }
        return {
          ...prev,
          engineRpm: nextRpm,
          motorBrake: nextRpm > 1800,
        };
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  const currentData: TachometerData = isDemoMode
    ? demoState
    : {
        engineRpm: Math.round(telemetryData?.engineRpm ?? 0),
        engineRpmMax: telemetryData?.engineRpmMax ?? 2500,
        motorBrake: telemetryData?.motorBrake ?? false,
        truckId: telemetryData?.truckId ?? '',
        truckBrandId: telemetryData?.truckBrandId ?? '',
      };

  // Carrega as configurações do caminhão atual
  const spec: TruckGaugeProfile = getTruckSpec(currentData.truckId, currentData.truckBrandId);
  const maxRpmScale = spec.rpmMaxGauge;

  // Geometria do Mostrador Circular SVG (Centro em 80, 72, Raio 54)
  const cx = 80;
  const cy = 72;
  const radius = 54;
  const startAngleGauge = -120; // 0 RPM (canto inferior esquerdo)
  const totalAngleSpan = 240;  // Ângulo total de varredura

  // Converte RPM em ângulo de rotação em graus (-120° até +120°)
  const rpmToAngle = (rpm: number) => {
    const clampedRpm = Math.min(maxRpmScale, Math.max(0, rpm));
    return startAngleGauge + (clampedRpm / maxRpmScale) * totalAngleSpan;
  };

  // Função auxiliar para desenhar arcos SVG
  const describeArc = (startAng: number, endAng: number, arcRadius: number) => {
    const startRad = (startAng * Math.PI) / 180;
    const endRad = (endAng * Math.PI) / 180;

    const startX = cx + arcRadius * Math.sin(startRad);
    const startY = cy - arcRadius * Math.cos(startRad);
    const endX = cx + arcRadius * Math.sin(endRad);
    const endY = cy - arcRadius * Math.cos(endRad);

    const largeArcFlag = endAng - startAng > 180 ? 1 : 0;
    return `M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  // Ângulos das zonas coloridas
  const greenStart = rpmToAngle(spec.greenZoneMin);
  const greenEnd = rpmToAngle(spec.greenZoneMax);
  const redlineStart = rpmToAngle(spec.redlineMin);
  const redlineEnd = rpmToAngle(maxRpmScale);

  // Ângulo atual do ponteiro
  const needleAngle = rpmToAngle(currentData.engineRpm);
  const isInRedline = currentData.engineRpm >= spec.redlineMin;
  const isInGreenZone =
    currentData.engineRpm >= spec.greenZoneMin && currentData.engineRpm <= spec.greenZoneMax;

  // Marcas Numéricas da Escala (de 500 em 500 RPM)
  const ticks = [0, 500, 1000, 1500, 2000, 2500];

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-1.5 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm font-mono">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[7px] font-bold bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Rótulo Superior */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[7px] font-bold tracking-wider text-slate-400 uppercase">RPM x100</span>
        {currentData.motorBrake && (
          <span className="text-[7px] font-bold bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/40 animate-pulse">
            ENG BRAKE
          </span>
        )}
      </div>

      {/* Mostrador SVG Principal */}
      <div className="relative w-full h-[115px] flex items-center justify-center">
        <svg viewBox="0 0 160 145" className="w-full h-full">
          {/* 1. Trilho de Fundo da Escala */}
          <path
            d={describeArc(startAngleGauge, startAngleGauge + totalAngleSpan, radius)}
            fill="none"
            stroke="#1e293b"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* 2. Faixa Verde Econômica */}
          <path
            d={describeArc(greenStart, greenEnd, radius)}
            fill="none"
            stroke="#10b981"
            strokeWidth="6"
            strokeOpacity="0.85"
          />

          {/* 3. Faixa Vermelha (Redline) */}
          <path
            d={describeArc(redlineStart, redlineEnd, radius)}
            fill="none"
            stroke="#ef4444"
            strokeWidth="6"
            strokeOpacity="0.85"
          />

          {/* 4. Marcas e Números (0, 5, 10, 15, 20, 25) */}
          {ticks.map((val) => {
            if (val > maxRpmScale) return null;
            const ang = rpmToAngle(val);
            const rad = (ang * Math.PI) / 180;

            const tickInnerR = radius - 8;
            const tickOuterR = radius - 4;
            const labelR = radius - 16;

            const x1 = cx + tickInnerR * Math.sin(rad);
            const y1 = cy - tickInnerR * Math.cos(rad);
            const x2 = cx + tickOuterR * Math.sin(rad);
            const y2 = cy - tickOuterR * Math.cos(rad);

            const lx = cx + labelR * Math.sin(rad);
            const ly = cy - labelR * Math.cos(rad);

            return (
              <g key={val}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1.5" />
                <text
                  x={lx}
                  y={ly + 3}
                  textAnchor="middle"
                  className="fill-slate-400 text-[8px] font-bold font-mono"
                >
                  {val / 100}
                </text>
              </g>
            );
          })}

          {/* 5. Agulha do Conta-Giros */}
          <g
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Corpo da Agulha */}
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - (radius - 6)}
              stroke={isInRedline ? '#ef4444' : '#ffffff'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* 6. Centro do Mostrador / Pino Central */}
          <circle cx={cx} cy={cy} r="6" className="fill-slate-800 stroke-slate-500" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="2" className="fill-cyan-400" />
        </svg>

        {/* Leitura Numérica Digital no Centro-Inferior */}
        <div className="absolute bottom-0 text-center flex flex-col items-center">
          <span
            className={`text-base font-black leading-none ${
              isInRedline
                ? 'text-red-400 animate-pulse'
                : isInGreenZone
                ? 'text-emerald-400'
                : 'text-slate-100'
            }`}
          >
            {currentData.engineRpm}
          </span>
          <span className="text-[7px] text-slate-400 font-bold uppercase mt-0.5">RPM</span>
        </div>
      </div>
    </div>
  );
};
