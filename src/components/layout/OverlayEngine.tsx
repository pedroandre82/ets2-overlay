'use client';

import React, { useEffect } from 'react';
import { LayoutConfig } from '@/types/layout';
import { SlotContainer } from '@/components/layout/SlotContainer';
import { useTelemetry } from '@/contexts/TelemetryContext';

interface OverlayEngineProps {
  layout: LayoutConfig;
}

export const OverlayEngine: React.FC<OverlayEngineProps> = ({ layout }) => {
  const { isDemoMode } = useTelemetry();

    // Teste rápido de dados recebidos e traduzidos
  // const { rawData, data} = useTelemetry();
  // useEffect(() => {
  //   if (rawData) {
  //     console.log('📦 JSON BRUTO DO SERVIDOR:', rawData);
  //   }
  //   if (data) {
  //     console.log('🔄 DADOS TRADUZIDOS PELO ADAPTER:', data);
  //   }
  // }, [rawData, data]);

  return (
    <div
      style={{
        width: `${layout.width}px`,
        height: `${layout.height}px`,
      }}
      className="relative overflow-hidden bg-slate-950 text-white select-none font-sans"
    >
      {/* Viewport Transparente para Captura de Tela do Jogo */}
      <div
        style={{
          position: 'absolute',
          left: `${layout.gameViewport.x}px`,
          top: `${layout.gameViewport.y}px`,
          width: `${layout.gameViewport.width}px`,
          height: `${layout.gameViewport.height}px`,
        }}
        className="pointer-events-none flex items-center justify-center border border-dashed border-emerald-500/20"
      >
        <span className="text-emerald-500/30 text-xs font-mono tracking-widest uppercase">
          Área Transparente - Jogo ({layout.gameViewport.width}x{layout.gameViewport.height})
          {isDemoMode && ' (MODO DEMO ATIVADO)'}
        </span>
      </div>

      {/* Slots posicionados dinamicamente via Layout Config */}
      {layout.slots.map((slot) => (
        <SlotContainer key={slot.id} slot={slot} />
      ))}
    </div>
  );
};