const { WebSocketServer } = require('ws');
const { truckSimTelemetry } = require('trucksim-telemetry');

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`[ETS2 Telemetry Server] Servidor WebSocket iniciado na porta ${PORT}`);

const telemetry = truckSimTelemetry();

telemetry.on('connected', () => {
  console.log('[ETS2 Telemetry Server] 🟢 SDK do ETS2 Conectado com sucesso!');
});

// Converte valores BigInt em Number para permitir o JSON.stringify sem erro
const safeStringify = (obj) =>
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  );

// Transmite a telemetria a cada 50ms (20 FPS) aos clientes conectados
setInterval(() => {
  if (wss.clients.size === 0) return;

  const currentData = telemetry.data;
  if (!currentData) return;

  try {
    const payload = safeStringify(currentData);

    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // 1 = OPEN
        client.send(payload);
      }
    });
  } catch (err) {
    console.error('[ETS2 Telemetry Server] Erro na serialização:', err.message);
  }
}, 50);

wss.on('connection', (ws) => {
  console.log('[ETS2 Telemetry Server] 🟢 Overlay (Next.js) conectado!');

  // Envia a foto atualizada do jogo assim que o cliente reconecta
  if (telemetry.data) {
    try {
      ws.send(safeStringify(telemetry.data));
    } catch (err) {
      console.error('[ETS2 Telemetry Server] Erro no payload inicial:', err.message);
    }
  }
});