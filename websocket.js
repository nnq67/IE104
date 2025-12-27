const WebSocket = require("ws");

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  console.log("✅ WebSocket server initialized");

  wss.on("connection", (ws) => {
    console.log("🟢 Client connected");

    ws.send(
      JSON.stringify({
        type: "WELCOME",
        message: "Connected to WebSocket server",
      })
    );

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data);
        console.log("📩 Received:", message);

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (err) {
        console.error("❌ Invalid JSON", err);
      }
    });

    ws.on("close", () => {
      console.log("🔴 Client disconnected");
    });
  });
}

module.exports = initWebSocket;
