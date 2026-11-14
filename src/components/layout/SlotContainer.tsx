'use client';

import React from 'react';
import { SlotDefinition } from '@/types/layout';
import { slotMapping } from '@/config/slotMapping.config';
import { GADGET_REGISTRY, PlaceholderGadget } from '@/components/gadgets/registry';
import { useTelemetry } from '@/contexts/TelemetryContext';

interface SlotContainerProps {
  slot: SlotDefinition;
}

export const SlotContainer: React.FC<SlotContainerProps> = ({ slot }) => {
  const { data, isDemoMode } = useTelemetry();
  const gadgetKey = slotMapping[slot.id];
  const GadgetComponent = gadgetKey ? GADGET_REGISTRY[gadgetKey] : null;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${slot.x}px`,
        top: `${slot.y}px`,
        width: `${slot.width}px`,
        height: `${slot.height}px`,
      }}
      className="box-border p-1"
    >
      {GadgetComponent ? (
        <GadgetComponent data={data} isDemoMode={isDemoMode} />
      ) : (
        <PlaceholderGadget slotId={slot.id} width={slot.width} height={slot.height} />
      )}
    </div>
  );
};