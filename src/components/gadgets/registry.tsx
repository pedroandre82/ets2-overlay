import React from 'react';
import { GadgetComponent } from '@/types/gadget';
import { SystemStatus } from './core/SystemStatus';
import { SpeedAlert } from './core/SpeedAlert';
import { CruiseControl } from './core/CruiseControl';
import { Compass } from './core/Compass';
import { NavigationInfo } from './core/NavigationInfo';
import { JobSummary } from './core/JobSummary';
import { NextRestStop } from './core/NextRestStop';
import { TrailerInfo } from './core/TrailerInfo';
import { FuelInfo } from './core/FuelInfo';
import { BrakeInfo } from './core/BrakeInfo';
import { AdBlueInfo } from './core/AdBlueInfo';
import { SpeedAndGear } from './core/SpeedAndGear';
import { Tachometer } from './core/Tachometer';
import { TruckDiagnostics } from './core/TruckDiagnostics';
import { GameClock } from './core/GameClock';
import { RefuelInfo } from './core/RefuelInfo';
import { TrafficFineAlert } from './core/TrafficFineInfo';

export const GADGET_REGISTRY: Record<string, GadgetComponent> = {
  'core:system-status': SystemStatus,
  'core:speed-alert': SpeedAlert,
  'core:cruise-control': CruiseControl,
  'core:compass': Compass,
  'core:navigation-info': NavigationInfo,
  'core:job-summary': JobSummary,
  'core:next-rest-stop': NextRestStop,
  'core:trailer-info': TrailerInfo,
  'core:fuel-info': FuelInfo,
  'core:brake-info': BrakeInfo,
  'core:adblue-info': AdBlueInfo,
  'core:speed-and-gear': SpeedAndGear,
  'core:tachometer': Tachometer,
  'core:truck-diagnostics': TruckDiagnostics,
  'core:game-clock': GameClock,
  'core:refuel-info': RefuelInfo,
  'core:traffic-fine-alert': TrafficFineAlert,
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