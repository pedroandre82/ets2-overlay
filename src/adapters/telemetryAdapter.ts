/**
 * Adaptador Unificado e Contrato de Telemetria ETS2 / ATS (v2.0)
 * Base de Dados Imutável para Gadgets do Overlay
 */

export interface WheelData {
  radius: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  suspDeflection: number;
  velocity: number;
  steering: number;
  rotation: number;
  lift: number;
  liftOffset: number;
  steerable: boolean;
  simulated: boolean;
  powered: boolean;
  liftable: boolean;
  onGround: boolean;
  substance: number;
}

export interface TrailerData {
  attached: boolean;
  id: string;
  brand: string;
  brandId: string;
  name: string;
  bodyType: string;
  chainType: string;
  licensePlate: string;
  licensePlateCountry: string;
  licensePlateCountryId: string;
  wearChassis: number;
  wearWheels: number;
  wearBody: number;
  cargoDamage: number;
  wheelCount: number;
  worldX: number;
  worldY: number;
  worldZ: number;
}

export interface NormalizedTelemetryData {
  // 1. Sessão & Metadados
  serverConnected: boolean;
  gameConnected: boolean;
  gamePaused: boolean;
  gameScale: number;
  gameVersion: string;
  telemetryPluginRevision: number;
  simulationTime: number;
  renderTime: number;
  multiplayerTimeOffset: number;

  // 2. Física & Vetores de Aceleração/Orientação
  accelerationX: number; // m/s²
  accelerationY: number; // m/s²
  accelerationZ: number; // m/s²
  gForceX: number;
  gForceY: number;
  gForceZ: number;
  gForceTotal: number;
  lvAccelerationX: number;
  lvAccelerationY: number;
  lvAccelerationZ: number;
  avAccelerationX: number;
  avAccelerationY: number;
  avAccelerationZ: number;
  aaAccelerationX: number;
  aaAccelerationY: number;
  aaAccelerationZ: number;
  cabinAAX: number; cabinAAY: number; cabinAAZ: number;
  cabinAVX: number; cabinAVY: number; cabinAVZ: number;
  cabinOffsetX: number; cabinOffsetY: number; cabinOffsetZ: number;
  cabinRotationX: number; cabinRotationY: number; cabinRotationZ: number;
  headOffsetX: number; headOffsetY: number; headOffsetZ: number;
  headRotationX: number; headRotationY: number; headRotationZ: number;
  coordinateX: number; coordinateY: number; coordinateZ: number;
  rotationX: number; rotationY: number; rotationZ: number;
  heading: number; // 0° a 360°

  // 3. Velocidade & Motor
  speedMs: number;
  speedKmh: number;
  speedMph: number;
  speedLimitMs: number;
  speedLimitKmh: number;
  speedLimitMph: number;
  engineRpm: number;
  engineRpmMax: number;
  gear: number;
  gearDashboard: number;
  totalGearsForward: number;
  totalGearsReverse: number;
  gearDifferential: number;
  shifterType: string;
  shifterSlot: number;
  selectorCount: number;
  odometerKm: number;

  // 4. Entradas & Controles
  userSteer: number; userThrottle: number; userBrake: number; userClutch: number;
  gameSteer: number; gameThrottle: number; gameBrake: number; gameClutch: number;
  electricEnabled: boolean; engineEnabled: boolean;
  parkBrake: boolean; motorBrake: boolean;
  retarderLevel: number; retarderSteps: number;
  cruiseControl: boolean; cruiseControlSpeedKmh: number; cruiseControlSpeedMph: number;
  differentialLock: boolean; liftAxle: boolean; wipers: boolean;

  // 5. Fluidos & Sensores
  fuelLiters: number; fuelCapacityLiters: number; fuelAvgConsumption: number; fuelRangeKm: number; fuelWarning: boolean;
  adblueLiters: number; adblueCapacityLiters: number; adblueWarning: boolean;
  airPressure: number; airPressureWarning: boolean; airPressureEmergency: boolean;
  oilPressure: number; oilTemperature: number; waterTemperature: number; waterTemperatureWarning: boolean;
  batteryVoltage: number; batteryVoltageWarning: boolean; brakeTemperature: number;

  // 6. Iluminação
  blinkerLeftActive: boolean; blinkerRightActive: boolean; blinkerHazard: boolean;
  lightsParking: boolean; lightsBeamLow: boolean; lightsBeamHigh: boolean; lightsBeacon: boolean;
  lightsBrake: boolean; lightsReverse: boolean;
  lightsAuxFront: number; lightsAuxRoof: number; lightsDashboard: number;

  // 7. Danos
  wearEnginePct: number; wearTransmissionPct: number; wearCabinPct: number; wearChassisPct: number; wearWheelsPct: number;

  // 8. Frete & Carga
  onJob: boolean; cargoLoaded: boolean; cargoName: string; cargoId: string;
  cargoMassKg: number; cargoMassTons: number; cargoDamagePct: number;
  unitCount: number; unitMassKg: number;
  citySource: string; citySourceId: string; companySource: string; companySourceId: string;
  cityDestination: string; cityDestinationId: string; companyDestination: string; companyDestinationId: string;
  specialJob: boolean; jobMarket: string; jobIncome: number; jobDeliveryTimeRemainingMin: number; plannedDistanceKm: number;

  // 9. Rota & Descanso
  routeDistanceKm: number; routeDistanceMeters: number; routeTimeSeconds: number; nextRestStopMin: number;

  // 10. Veículo
  truckBrand: string; truckBrandId: string; truckName: string; truckId: string; truckLicensePlate: string; truckLicensePlateCountry: string;

  // 11. Reboques & Rodas
  attached: boolean;
  trailers: TrailerData[];
  truckWheels: WheelData[];

  // 12. Eventos & Infrações
  fined: boolean; fineAmount: number; fineOffence: string;
  tollgate: boolean; tollgatePayAmount: number;
  ferry: boolean; ferryPayAmount: number; ferrySourceName: string; ferryTargetName: string;
  train: boolean; trainPayAmount: number; trainSourceName: string; trainTargetName: string;
  refuel: boolean; refuelAmountLiters: number; refuelPayed: boolean;
}

export const adaptTelemetryData = (raw: any): NormalizedTelemetryData => {
  if (!raw) return createEmptyTelemetryData();

  const src = raw.current || raw;

  const rawSpeedMs = src.speed ?? 0;
  const rawLimitMs = src.speedLimit ?? 0;
  const rawCruiseMs = src.cruiseControlSpeed ?? 0;
  const rawRouteDistanceMeters = src.routeDistance ?? 0;
  const rawRotationX = src.rotationX ?? 0;

  const ax = src.accelerationX ?? 0;
  const ay = src.accelerationY ?? 0;
  const az = src.accelerationZ ?? 0;
  const gTotal = Math.sqrt(ax * ax + ay * ay + az * az) / 9.81;

  const rawTrailers: any[] = Array.isArray(src.trailers) ? src.trailers : [];
  const parsedTrailers: TrailerData[] = rawTrailers.map((t) => ({
    attached: Boolean(t.attached),
    id: t.id ?? '', brand: t.brand ?? '', brandId: t.brandId ?? '', name: t.name ?? '',
    bodyType: t.bodyType ?? '', chainType: t.chainType ?? '',
    licensePlate: t.licensePlate ?? '', licensePlateCountry: t.licensePlateCountry ?? '', licensePlateCountryId: t.licensePlateCountryId ?? '',
    wearChassis: Math.round((t.wearChassis ?? 0) * 100),
    wearWheels: Math.round((t.wearWheels ?? 0) * 100),
    wearBody: Math.round((t.wearBody ?? 0) * 100),
    cargoDamage: Math.round((t.cargoDamage ?? 0) * 100),
    wheelCount: t.wheelCount ?? 0, worldX: t.worldX ?? 0, worldY: t.worldY ?? 0, worldZ: t.worldZ ?? 0,
  }));

  const wheelCount = src.truckWheelCount ?? 0;
  const parsedWheels: WheelData[] = [];
  for (let i = 0; i < wheelCount; i++) {
    parsedWheels.push({
      radius: src.truckWheelRadius?.[i] ?? 0,
      positionX: src.truckWheelPositionX?.[i] ?? 0, positionY: src.truckWheelPositionY?.[i] ?? 0, positionZ: src.truckWheelPositionZ?.[i] ?? 0,
      suspDeflection: src.truckWheelSuspDeflection?.[i] ?? 0, velocity: src.truckWheelVelocity?.[i] ?? 0,
      steering: src.truckWheelSteering?.[i] ?? 0, rotation: src.truckWheelRotation?.[i] ?? 0,
      lift: src.truckWheelLift?.[i] ?? 0, liftOffset: src.truckWheelLiftOffset?.[i] ?? 0,
      steerable: Boolean(src.truckWheelSteerable?.[i]), simulated: Boolean(src.truckWheelSimulated?.[i]),
      powered: Boolean(src.truckWheelPowered?.[i]), liftable: Boolean(src.truckWheelLiftable?.[i]),
      onGround: Boolean(src.truckWheelOnGround?.[i]), substance: src.truckWheelSubstance?.[i] ?? 0,
    });
  }

  const firstTrailer = parsedTrailers[0];

const isWoTr = Boolean(src.jobMarket && src.jobMarket.includes('external'));

const rawDeliveryTime = src.timeAbsDelivery ?? 0;
const currentGameTime = src.timeAbs ?? 0;

// Considera válido apenas se for maior que zero e menor que UINT32_MAX (4294967295)
const hasValidDeliveryTime = rawDeliveryTime > 0 && rawDeliveryTime < 4294967295;

let jobDeliveryTimeRemainingMin = 0;

if (hasValidDeliveryTime) {
  if (isWoTr) {
    const currentRealTimeMin = Math.floor(Date.now() / 60000);
    const deliveryTimeMin = rawDeliveryTime > 100000000
      ? Math.floor(rawDeliveryTime / 60)
      : rawDeliveryTime;

    jobDeliveryTimeRemainingMin = deliveryTimeMin > currentRealTimeMin
      ? (deliveryTimeMin - currentRealTimeMin)
      : 0;
  } else {
    // Frete Single-Player normal
    jobDeliveryTimeRemainingMin = rawDeliveryTime > currentGameTime
      ? (rawDeliveryTime - currentGameTime)
      : 0;
  }
}

  // LOG
  // console.log('[Telemetry Debug - Job Delivery]', { 
  //   jobMarket: src.jobMarket, 
  //   rawDeliveryTime: src.timeAbsDelivery, 
  //   currentGameTime: src.timeAbs, 
  //   dateNowSec: Math.floor(Date.now() / 1000), 
  //   dateNowMin: Math.floor(Date.now() / 60000), 
  //   isWoTr, 
  //   jobDeliveryTimeRemainingMin,
  // });

  return {
    serverConnected: true, gameConnected: Boolean(src.sdkActive), gamePaused: Boolean(src.paused), gameScale: src.scale ?? 19,
    gameVersion: `${src.versionMajor ?? 1}.${src.versionMinor ?? 0}`, telemetryPluginRevision: src.telemetryPluginRevision ?? 0,
    simulationTime: src.simulatedTime ?? 0, renderTime: src.renderTime ?? 0, multiplayerTimeOffset: src.multiplayerTimeOffset ?? 0,

    accelerationX: ax, accelerationY: ay, accelerationZ: az,
    gForceX: Number((ax / 9.81).toFixed(2)), gForceY: Number((ay / 9.81).toFixed(2)), gForceZ: Number((az / 9.81).toFixed(2)), gForceTotal: Number(gTotal.toFixed(2)),
    lvAccelerationX: src.lvAccelerationX ?? 0, lvAccelerationY: src.lvAccelerationY ?? 0, lvAccelerationZ: src.lvAccelerationZ ?? 0,
    avAccelerationX: src.avAccelerationX ?? 0, avAccelerationY: src.avAccelerationY ?? 0, avAccelerationZ: src.avAccelerationZ ?? 0,
    aaAccelerationX: src.aaAccelerationX ?? 0, aaAccelerationY: src.aaAccelerationY ?? 0, aaAccelerationZ: src.aaAccelerationZ ?? 0,
    cabinAAX: src.cabinAAX ?? 0, cabinAAY: src.cabinAAY ?? 0, cabinAAZ: src.cabinAAZ ?? 0,
    cabinAVX: src.cabinAVX ?? 0, cabinAVY: src.cabinAVY ?? 0, cabinAVZ: src.cabinAVZ ?? 0,
    cabinOffsetX: src.cabinOffsetX ?? 0, cabinOffsetY: src.cabinOffsetY ?? 0, cabinOffsetZ: src.cabinOffsetZ ?? 0,
    cabinRotationX: src.cabinOffsetrotationX ?? 0, cabinRotationY: src.cabinOffsetrotationY ?? 0, cabinRotationZ: src.cabinOffsetrotationZ ?? 0,
    headOffsetX: src.headOffsetX ?? 0, headOffsetY: src.headOffsetY ?? 0, headOffsetZ: src.headOffsetZ ?? 0,
    headRotationX: src.headOffsetrotationX ?? 0, headRotationY: src.headOffsetrotationY ?? 0, headRotationZ: src.headOffsetrotationZ ?? 0,
    coordinateX: src.coordinateX ?? 0, coordinateY: src.coordinateY ?? 0, coordinateZ: src.coordinateZ ?? 0,
    rotationX: rawRotationX, rotationY: src.rotationY ?? 0, rotationZ: src.rotationZ ?? 0,
    heading: Math.round((((360 - (rawRotationX * 360)) % 360 + 360) % 360)),

    speedMs: rawSpeedMs, speedKmh: Math.round(rawSpeedMs * 3.6), speedMph: Math.round(rawSpeedMs * 2.23694),
    speedLimitMs: rawLimitMs, speedLimitKmh: Math.round(rawLimitMs * 3.6), speedLimitMph: Math.round(rawLimitMs * 2.23694),
    engineRpm: Math.round(src.engineRpm ?? 0), engineRpmMax: Math.round(src.engineRpmMax ?? 1900),
    gear: src.gear ?? 0, gearDashboard: src.gearDashboard ?? 0, totalGearsForward: src.gears ?? 12, totalGearsReverse: src.gearsReverse ?? 2,
    gearDifferential: src.gearDifferential ?? 0, shifterType: src.shifterType ?? 'automatic', shifterSlot: src.shifterSlot ?? 0, selectorCount: src.selectorCount ?? 0,
    odometerKm: Math.round(src.truckOdometer ?? 0),

    userSteer: src.userSteer ?? 0, userThrottle: src.userThrottle ?? 0, userBrake: src.userBrake ?? 0, userClutch: src.userClutch ?? 0,
    gameSteer: src.gameSteer ?? 0, gameThrottle: src.gameThrottle ?? 0, gameBrake: src.gameBrake ?? 0, gameClutch: src.gameClutch ?? 0,
    electricEnabled: Boolean(src.electricEnabled), engineEnabled: Boolean(src.engineEnabled),
    parkBrake: Boolean(src.parkBrake), motorBrake: Boolean(src.motorBrake), retarderLevel: src.retarderBrake ?? 0, retarderSteps: src.retarderStepCount ?? 0,
    cruiseControl: Boolean(src.cruiseControl), cruiseControlSpeedKmh: Math.round(rawCruiseMs * 3.6), cruiseControlSpeedMph: Math.round(rawCruiseMs * 2.23694),
    differentialLock: Boolean(src.differentialLock), liftAxle: Boolean(src.liftAxle || src.liftAxleIndicator), wipers: Boolean(src.wipers),

    fuelLiters: Math.round(src.fuel ?? 0), fuelCapacityLiters: Math.round(src.fuelCapacity ?? 0), fuelAvgConsumption: src.fuelAvgConsumption ?? 0,
    fuelRangeKm: Math.round(src.fuelRange ?? 0), fuelWarning: Boolean(src.fuelWarning),
    adblueLiters: Math.round(src.adblue ?? 0), adblueCapacityLiters: Math.round(src.adblueCapacity ?? 0), adblueWarning: Boolean(src.adblueWarning),
    airPressure: Math.round(src.airPressure ?? 0), airPressureWarning: Boolean(src.airPressureWarning), airPressureEmergency: Boolean(src.airPressureEmergency),
    oilPressure: Math.round(src.oilPressure ?? 0), oilTemperature: Math.round(src.oilTemperature ?? 0), waterTemperature: Math.round(src.waterTemperature ?? 0), waterTemperatureWarning: Boolean(src.waterTemperatureWarning),
    batteryVoltage: Number((src.batteryVoltage ?? 0).toFixed(1)), batteryVoltageWarning: Boolean(src.batteryVoltageWarning), brakeTemperature: Math.round(src.brakeTemperature ?? 0),

    blinkerLeftActive: Boolean(src.blinkerLeftActive || src.blinkerLeftOn), blinkerRightActive: Boolean(src.blinkerRightActive || src.blinkerRightOn), blinkerHazard: Boolean(src.lightsHazard),
    lightsParking: Boolean(src.lightsParking), lightsBeamLow: Boolean(src.lightsBeamLow), lightsBeamHigh: Boolean(src.lightsBeamHigh), lightsBeacon: Boolean(src.lightsBeacon),
    lightsBrake: Boolean(src.lightsBrake), lightsReverse: Boolean(src.lightsReverse), lightsAuxFront: src.lightsAuxFront ?? 0, lightsAuxRoof: src.lightsAuxRoof ?? 0, lightsDashboard: src.lightsDashboard ?? 0,

    wearEnginePct: Math.round((src.wearEngine ?? 0) * 100), wearTransmissionPct: Math.round((src.wearTransmission ?? 0) * 100), wearCabinPct: Math.round((src.wearCabin ?? 0) * 100),
    wearChassisPct: Math.round((src.wearChassis ?? 0) * 100), wearWheelsPct: Math.round((src.wearWheels ?? 0) * 100),

    onJob: Boolean(src.onJob), cargoLoaded: Boolean(src.isCargoLoaded), cargoName: src.cargo ?? '', cargoId: src.cargoId ?? '', cargoMassKg: Math.round(src.cargoMass ?? 0),
    cargoMassTons: Number(((src.cargoMass ?? 0) / 1000).toFixed(1)), cargoDamagePct: Math.round((src.cargoDamage ?? 0) * 100), unitCount: src.unitCount ?? 0, unitMassKg: src.unitMass ?? 0,
    citySource: src.citySrc ?? '', citySourceId: src.citySrcId ?? '', companySource: src.compSrc ?? '', companySourceId: src.compSrcId ?? '',
    cityDestination: src.cityDst ?? '', cityDestinationId: src.cityDstId ?? '', companyDestination: src.compDst ?? '', companyDestinationId: src.compDstId ?? '',
    specialJob: Boolean(src.specialJob), jobMarket: src.jobMarket ?? '', jobIncome: src.jobIncome ?? 0, jobDeliveryTimeRemainingMin, plannedDistanceKm: src.plannedDistanceKm ?? 0,

    routeDistanceKm: Math.round(rawRouteDistanceMeters / 1000), routeDistanceMeters: rawRouteDistanceMeters, routeTimeSeconds: src.routeTime ?? 0, nextRestStopMin: src.restStop ?? 0,

    truckBrand: src.truckBrand ?? 'Volvo', truckBrandId: src.truckBrandId ?? 'volvo', truckName: src.truckName ?? 'Truck', truckId: src.truckId ?? '', truckLicensePlate: src.truckLicensePlate ?? '', truckLicensePlateCountry: src.truckLicensePlateCountry ?? '',

    attached: Boolean(firstTrailer?.attached), trailers: parsedTrailers, truckWheels: parsedWheels,

    fined: Boolean(src.fined), fineAmount: src.fineAmount ?? 0, fineOffence: src.fineOffence ?? '', tollgate: Boolean(src.tollgate), tollgatePayAmount: src.tollgatePayAmount ?? 0,
    ferry: Boolean(src.ferry), ferryPayAmount: src.ferryPayAmount ?? 0, ferrySourceName: src.ferrySourceName ?? '', ferryTargetName: src.ferryTargetName ?? '',
    train: Boolean(src.train), trainPayAmount: src.trainPayAmount ?? 0, trainSourceName: src.trainSourceName ?? '', trainTargetName: src.trainTargetName ?? '',
    refuel: Boolean(src.refuel), refuelAmountLiters: Math.round(src.refuelAmount ?? 0), refuelPayed: Boolean(src.refuelPayed),
  };
};

function createEmptyTelemetryData(): NormalizedTelemetryData {
  return {
    serverConnected: false, gameConnected: false, gamePaused: false, gameScale: 19, gameVersion: '1.0', telemetryPluginRevision: 0, simulationTime: 0, renderTime: 0, multiplayerTimeOffset: 0,
    accelerationX: 0, accelerationY: 0, accelerationZ: 0, gForceX: 0, gForceY: 0, gForceZ: 0, gForceTotal: 0, lvAccelerationX: 0, lvAccelerationY: 0, lvAccelerationZ: 0, avAccelerationX: 0, avAccelerationY: 0, avAccelerationZ: 0, aaAccelerationX: 0, aaAccelerationY: 0, aaAccelerationZ: 0,
    cabinAAX: 0, cabinAAY: 0, cabinAAZ: 0, cabinAVX: 0, cabinAVY: 0, cabinAVZ: 0, cabinOffsetX: 0, cabinOffsetY: 0, cabinOffsetZ: 0, cabinRotationX: 0, cabinRotationY: 0, cabinRotationZ: 0, headOffsetX: 0, headOffsetY: 0, headOffsetZ: 0, headRotationX: 0, headRotationY: 0, headRotationZ: 0, coordinateX: 0, coordinateY: 0, coordinateZ: 0, rotationX: 0, rotationY: 0, rotationZ: 0, heading: 0,
    speedMs: 0, speedKmh: 0, speedMph: 0, speedLimitMs: 0, speedLimitKmh: 0, speedLimitMph: 0, engineRpm: 0, engineRpmMax: 1900, gear: 0, gearDashboard: 0, totalGearsForward: 12, totalGearsReverse: 2, gearDifferential: 0, shifterType: 'automatic', shifterSlot: 0, selectorCount: 0, odometerKm: 0,
    userSteer: 0, userThrottle: 0, userBrake: 0, userClutch: 0, gameSteer: 0, gameThrottle: 0, gameBrake: 0, gameClutch: 0, electricEnabled: false, engineEnabled: false, parkBrake: false, motorBrake: false, retarderLevel: 0, retarderSteps: 0, cruiseControl: false, cruiseControlSpeedKmh: 0, cruiseControlSpeedMph: 0, differentialLock: false, liftAxle: false, wipers: false,
    fuelLiters: 0, fuelCapacityLiters: 0, fuelAvgConsumption: 0, fuelRangeKm: 0, fuelWarning: false, adblueLiters: 0, adblueCapacityLiters: 0, adblueWarning: false, airPressure: 0, airPressureWarning: false, airPressureEmergency: false, oilPressure: 0, oilTemperature: 0, waterTemperature: 0, waterTemperatureWarning: false, batteryVoltage: 0, batteryVoltageWarning: false, brakeTemperature: 0,
    blinkerLeftActive: false, blinkerRightActive: false, blinkerHazard: false, lightsParking: false, lightsBeamLow: false, lightsBeamHigh: false, lightsBeacon: false, lightsBrake: false, lightsReverse: false, lightsAuxFront: 0, lightsAuxRoof: 0, lightsDashboard: 0,
    wearEnginePct: 0, wearTransmissionPct: 0, wearCabinPct: 0, wearChassisPct: 0, wearWheelsPct: 0,
    onJob: false, cargoLoaded: false, cargoName: '', cargoId: '', cargoMassKg: 0, cargoMassTons: 0, cargoDamagePct: 0, unitCount: 0, unitMassKg: 0, citySource: '', citySourceId: '', companySource: '', companySourceId: '', cityDestination: '', cityDestinationId: '', companyDestination: '', companyDestinationId: '', specialJob: false, jobMarket: '', jobIncome: 0, jobDeliveryTimeRemainingMin: 0, plannedDistanceKm: 0,
    routeDistanceKm: 0, routeDistanceMeters: 0, routeTimeSeconds: 0, nextRestStopMin: 0,
    truckBrand: '', truckBrandId: '', truckName: '', truckId: '', truckLicensePlate: '', truckLicensePlateCountry: '',
    attached: false, trailers: [], truckWheels: [],
    fined: false, fineAmount: 0, fineOffence: '', tollgate: false, tollgatePayAmount: 0, ferry: false, ferryPayAmount: 0, ferrySourceName: '', ferryTargetName: '', train: false, trainPayAmount: 0, trainSourceName: '', trainTargetName: '', refuel: false, refuelAmountLiters: 0, refuelPayed: false,
  };
}