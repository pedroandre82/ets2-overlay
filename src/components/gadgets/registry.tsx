import React from 'react';
import { GadgetComponent } from '@/types/gadget';
import { SystemStatus } from './core/SystemStatus';
import { SpeedAlert } from './core/SpeedAlert';
import { CruiseControl } from './core/CruiseControl';
import { Compass } from './core/Compass';

export const GADGET_REGISTRY: Record<string, GadgetComponent> = {
  'core:system-status': SystemStatus,
  'core:speed-alert': SpeedAlert,
  'core:cruise-control': CruiseControl,
  'core:compass': Compass,
};

interface PlaceholderProps {
  slotId: string;
  width?: number;
  height?: number;
}

export const PlaceholderGadget: React.FC<PlaceholderProps> = ({ slotId, width, height }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 border border-dashed border-cyan-500/40 rounded text-cyan-400 p-1 text-center select-none backdrop-blur-sm">
      <span className="text-[9px] font-mono tracking-widest text-cyan-500/70 uppercase">SLOT</span>
      <span className="text-xs font-bold font-mono text-cyan-300">{slotId}</span>
      {width && height && (
        <span className="text-[9px] font-mono text-cyan-400/60 mt-0.5">({width}x{height})</span>
      )}
    </div>
  );
};