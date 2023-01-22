const WebSocket = require("ws");
const { readFileSync } = require("fs");

const data = JSON.parse(readFileSync("./input.json"));

async function begin(ws) {
  const startTime = Date.now();

  let index = 0;
  let cumulativeVolume = 0;
  let uniqueSymbols = new Set();
  while (index < data.length) {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;

    //create dict for this second
    let volume = {};
    let totalVolumeInPeriod = 0;
    while (index < data.length && elapsedTime >= data[index].RelativeMillis) {
      let message = data[index];

      if (message.MessageType === "NewOrderAcknowledged") {
        const data = {
          symbol: message.Symbol,
          price: message.OrderPrice,
          timestamp: message.TimeStamp,
        };
        uniqueSymbols.add(data.symbol);
        ws.send(JSON.stringify({ type: "message", data }));
      }

      index++;
      totalVolumeInPeriod++;

      if (volume[message.Symbol] === undefined) {
        volume[message.Symbol] = 1;
      } else volume[message.Symbol] += 1;
    }
    cumulativeVolume += totalVolumeInPeriod;
    totalVolumeInPeriod = 0;

    // Anomaly calculations
    const n = uniqueSymbols.size;
    const q3 = 0.75 * (n + 1);
    const IQR = q3 - 0.25 * (n + 1);
    if (cumulativeVolume > q3 + 1.5 * IQR) {
      ws.send(JSON.stringify({ type: "anomaly", data: q3 + 1.5 * IQR }));
    }

    //send volume
    ws.send(JSON.stringify({ type: "volume", data: volume }));
    volume = {};

    await new Promise((r) => setTimeout(r, 1000));
  }
}

const wss = new WebSocket.Server({ port: 8080 });
// NOTE: This is not yet a secure websocket server - we need to add SSL/TLS to this server (to be able to use wss:// instead of just ws://)

wss.on("connection", (ws) => {
  console.log("A new client has connected");

  ws.on("message", (data) => {
    if (data.toString() === "start") {
      begin(ws);
    }
  });
});
