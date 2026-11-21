export interface TruckGaugeProfile {
  rpmMaxGauge: number;       // Rotação máxima da escala impressa no mostrador (ex: 2500 RPM)
  greenZoneMin: number;      // Início da faixa verde econômica (ex: 1000 RPM)
  greenZoneMax: number;      // Fim da faixa verde (ex: 1500 RPM)
  engineBrakeMin?: number;   // Início da faixa de freio motor (ex: 1700 RPM)
  redlineMin: number;        // Início da zona vermelha/redline (ex: 2100 RPM)
  speedoMaxKmh?: number;     // Escala máxima do velocímetro analógico (ex: 140 km/h)
}

export const TRUCK_SPECS: Record<string, TruckGaugeProfile> = {
  // Volvo (ex: FH, FH16)
  'vehicle.volvo.fh_2024': {
    rpmMaxGauge: 2600,
    greenZoneMin: 900,
    greenZoneMax: 1700,
    engineBrakeMin: 1700,
    redlineMin: 2500,
    speedoMaxKmh: 140,
  },
  'volvo': {
    rpmMaxGauge: 2500,
    greenZoneMin: 1000,
    greenZoneMax: 1500,
    engineBrakeMin: 1700,
    redlineMin: 2100,
    speedoMaxKmh: 140,
  },
  // Scania (ex: R, S)
  'scania': {
    rpmMaxGauge: 2500,
    greenZoneMin: 1000,
    greenZoneMax: 1500,
    engineBrakeMin: 1600,
    redlineMin: 2100,
    speedoMaxKmh: 140,
  },
  // Fallback genérico para caminhões não cadastrados
  'default': {
    rpmMaxGauge: 2500,
    greenZoneMin: 1000,
    greenZoneMax: 1500,
    engineBrakeMin: 1700,
    redlineMin: 2100,
    speedoMaxKmh: 140,
  },
};

/**
  Retorna o perfil do mostrador buscando primeiro por ID específico,
  depois por marca e finalmente pelo fallback padrão.
 */
export function getTruckSpec(truckId?: string, truckBrandId?: string): TruckGaugeProfile {
  if (truckId && TRUCK_SPECS[truckId]) {
    return TRUCK_SPECS[truckId];
  }
  if (truckBrandId && TRUCK_SPECS[truckBrandId.toLowerCase()]) {
    return TRUCK_SPECS[truckBrandId.toLowerCase()];
  }
  return TRUCK_SPECS['default'];
}
