/**
 * Adaptador de Telemetria (Adapter Pattern)
 * Converte qualquer formato bruto de payload de servidor (Node.js, WebSocket, etc.)
 * para o contrato de dados padronizado esperado pelos gadgets do overlay.
 */

export interface NormalizedTelemetryData {
  navigationDistance: number;
  navigationTime: number;
  cargoName: string;
  cargoMass: number;
  citySource: string;
  companySource: string;
  cityDestination: string;
  companyDestination: string;
  specialJob: boolean;
  market: string;
  remainingDeliveryTime: number;
  nextRestStop: number;
  attached: boolean;
  brand: string;
  name: string;
  bodyType: string;
  chainType: string;
  gameScale: number;
}

export const adaptTelemetryData = (raw: any): NormalizedTelemetryData => {
  if (!raw) {
    return {
      navigationDistance: 0,
      navigationTime: 0,
      cargoName: '',
      cargoMass: 0,
      citySource: '',
      companySource: '',
      cityDestination: '',
      companyDestination: '',
      specialJob: false,
      market: '',
      remainingDeliveryTime: 0,
      nextRestStop: 0,
      attached: false,
      brand: '',
      name: '',
      bodyType: '',
      chainType: '',
      gameScale: 19,
    };
  }

  // Extrai do nó `current` ou da raiz
  const src = raw.current || raw;
  const firstTrailer = Array.isArray(src.trailers) && src.trailers.length > 0 ? src.trailers : null;

  return {
    navigationDistance: src.routeDistance ?? src.navigation?.navigationDistance ?? 0,
    navigationTime: src.routeTime ?? src.navigation?.navigationTime ?? 0,
    cargoName: src.cargo ?? src.job?.cargo?.name ?? '',
    cargoMass: src.cargoMass ?? src.job?.cargo?.mass ?? 0,
    citySource: src.citySrc ?? src.job?.citySource ?? '',
    companySource: src.compSrc ?? src.job?.companySource ?? '',
    cityDestination: src.cityDst ?? src.job?.cityDestination ?? '',
    companyDestination: src.compDst ?? src.job?.companyDestination ?? '',
    specialJob: Boolean(src.specialJob ?? src.job?.specialJob),
    market: src.jobMarket ?? src.job?.market ?? '',
    remainingDeliveryTime: src.timeAbsDelivery ?? 0,
    nextRestStop: src.restStop ?? src.game?.nextRestStop ?? 0,
    attached: Boolean(firstTrailer?.attached ?? src.trailer?.attached),
    brand: src.truckBrand ?? firstTrailer?.brand ?? src.truck?.constants?.brand ?? '',
    name: src.truckName ?? firstTrailer?.name ?? src.truck?.constants?.name ?? '',
    bodyType: firstTrailer?.bodyType ?? src.trailer?.bodyType ?? '',
    chainType: firstTrailer?.chainType ?? src.trailer?.chainType ?? '',
    gameScale: src.scale ?? src.game?.scale ?? 19,
  };
};
