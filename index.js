const WebSocket = require("ws");
const { readFileSync } = require("fs");

const data = JSON.parse(readFileSync("./input.json"));

async function begin(ws) {
  const startTime = Date.now();

  let index = 0;
  while (index < data.length) {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;

    while (elapsedTime >= data[index].RelativeMillis) {
      ws.send(JSON.stringify(data[index]));
      index++;
    }

    await new Promise((r) => setTimeout(r, 1000));
  }
}

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    if (data.toString() === "start") {
      begin(ws);
    }
  });
});
