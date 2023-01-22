const WebSocket = require("ws");
const { readFileSync } = require("fs");

const data = JSON.parse(readFileSync("./input.json"));

async function begin(ws) {
  const startTime = Date.now();

  let index = 0;
  while (index < data.length) {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;

    //create dict for this second
    let dict = {};
    while (index < data.length && elapsedTime >= data[index].RelativeMillis) {
      let message = data[index];

      if (message.MessageType === "NewOrderAcknowledged") {
        const data = { symbol: message.Symbol, price: message.OrderPrice };
        ws.send(JSON.stringify({ type: "message", data }));
      }

      index++;

      if (dict[message.Symbol] === undefined) {
        dict[message.Symbol] = 1;
      } else dict[message.Symbol] += 1;
    }

    //send dict
    ws.send(JSON.stringify({ type: "volume", data: dict }));
    dict = {};

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
