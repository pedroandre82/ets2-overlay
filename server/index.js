const { WebSocketServer } = require('ws');
const trucksimTelemetryModule = require('trucksim-telemetry');

const truckSimTelemetry =
  trucksimTelemetryModule.truckSimTelemetry || trucksimTelemetryModule;

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`[ETS2 Telemetry Server] Servidor WebSocket iniciado na porta ${PORT}`);

const telemetry = truckSimTelemetry();
let hasLoggedData = false;

const broadcast = (data) => {
  if (!data) return;

  if (!hasLoggedData) {
    console.log('[ETS2 Telemetry Server] 🟢 DADOS DO JOGO RECEBIDOS COM SUCESSO!');
    hasLoggedData = true;
  }

  if (wss.clients.size === 0) return;
  const payload = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
};

telemetry.on('connected', () => {
  console.log('[ETS2 Telemetry Server] 🟢 SDK do ETS2 Conectado!');
});

// Escuta os eventos de telemetria
telemetry.on('data', broadcast);
telemetry.on('telemetry', broadcast);

// Fallback por leitura direta da memória
setInterval(() => {
  try {
    if (typeof telemetry.getData === 'function') {
      const data = telemetry.getData();
      if (data) broadcast(data);
    }
  } catch (err) {
    // Jogo fechado ou pausado
  }
}, 100);

wss.on('connection', (ws) => {
  console.log('[ETS2 Telemetry Server] 🟢 Overlay (Next.js) conectado!');
});
