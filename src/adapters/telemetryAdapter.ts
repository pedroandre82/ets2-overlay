/**
 * Adaptador de Telemetria (Adapter Pattern)
 * Converte qualquer formato bruto de payload de servidor (Node.js, WebSocket, etc.)
 * para o contrato de dados padronizado esperado pelos gadgets do overlay.
 */

export interface NormalizedTelemetryData {
  // Navigation Info (Route Advisor)
  navigationDistance: number;
  navigationTime: number;

  // Job Summary
  cargoName: string;
  cargoMass: number;
  citySource: string;
  companySource: string;
  cityDestination: string;
  companyDestination: string;
  specialJob: boolean;
  market: string;
  remainingDeliveryTime: number;

  // Next Rest Stop
  nextRestStop: number;

  // Trailer Info
  attached: boolean;
  brand: string;
  name: string;
  bodyType: string;
  chainType: string;

  // Configurações Globais do Simulador
  gameScale: number;
}

export function adaptTelemetryData(raw: any): NormalizedTelemetryData | null {
  if (!raw) return null;

  // Extração segura dos objetos do payload
  const job = raw.job || {};
  const cargo = job.cargo || {};
  const citySource = job.citySource || {};
  const companySource = job.companySource || {};
  const cityDestination = job.cityDestination || {};
  const companyDestination = job.companyDestination || {};
  const market = job.market || {};
  const game = raw.game || {};
  const nav = raw.navigation || {};

  // Trata suporte a trailer único ou múltiplos reboques (trailers)
  const trailer = raw.trailer || (Array.isArray(raw.trailers) ? raw.trailers : {}) || {};
  const trailerBrand = trailer.brand || {};

  return {
    // Navigation Info
    navigationDistance: nav.distance?.value ?? nav.distance ?? 0,
    navigationTime: nav.time?.value ?? nav.time ?? 0,

    // Job Summary
    cargoName: cargo.name ?? cargo.id ?? '',
    cargoMass: cargo.mass ?? 0,
    citySource: typeof citySource === 'string' ? citySource : (citySource.name ?? citySource.id ?? ''),
    companySource: typeof companySource === 'string' ? companySource : (companySource.name ?? companySource.id ?? ''),
    cityDestination: typeof cityDestination === 'string' ? cityDestination : (cityDestination.name ?? cityDestination.id ?? ''),
    companyDestination: typeof companyDestination === 'string' ? companyDestination : (companyDestination.name ?? companyDestination.id ?? ''),
    specialJob: Boolean(job.specialJob),
    market: typeof market === 'string' ? market : (market.id ?? market.name ?? ''),
    remainingDeliveryTime: job.deliveryTime?.value ?? job.deliveryTime ?? job.remainingTime ?? 0,

    // Next Rest Stop
    nextRestStop: game.nextRestStop?.value ?? game.nextRestStop ?? 0,

    // Trailer Info
    attached: Boolean(trailer.attached),
    brand: typeof trailerBrand === 'string' ? trailerBrand : (trailerBrand.name ?? trailerBrand.id ?? ''),
    name: trailer.name ?? '',
    bodyType: trailer.bodyType ?? '',
    chainType: trailer.chainType ?? '',

    // Global
    gameScale: game.scale ?? 19.0,
  };
}
