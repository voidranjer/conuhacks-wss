const WebSocket = require("ws");
const { readFileSync } = require("fs");

const data = JSON.parse(readFileSync("./input.json"));

async function begin(ws) {
  const startTime = Date.now();

  let index = 0;
  while (index < data.length) {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;

    while (index < data.length && elapsedTime >= data[index].RelativeMillis) {
      let message = data[index];
      if (message.MessageType === "NewOrderAcknowledged")
        ws.send(JSON.stringify(message));
      index++;
    }

    await new Promise((r) => setTimeout(r, 1000));
  }
}

const wss = new WebSocket.Server({ port: 443 });

wss.on("connection", (ws) => {
  console.log("A new client has connected");

  ws.on("message", (data) => {
    if (data.toString() === "start") {
      begin(ws);
    }
  });
});
