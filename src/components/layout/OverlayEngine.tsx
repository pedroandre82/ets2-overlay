'use client';

import React, { useState } from 'react';
import { LayoutConfig } from '@/types/layout';
import { SlotContainer } from '@/components/layout/SlotContainer';

interface OverlayEngineProps {
  layout: LayoutConfig;
}

export const OverlayEngine: React.FC<OverlayEngineProps> = ({ layout }) => {
  const [isDemoMode] = useState<boolean>(true);

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
        </span>
      </div>

      {/* Slots posicionados dinamicamente via Layout Config */}
      {layout.slots.map((slot) => (
        <SlotContainer key={slot.id} slot={slot} isDemoMode={isDemoMode} />
      ))}
    </div>
  );
};