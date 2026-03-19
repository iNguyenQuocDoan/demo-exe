/**
 * Minimal WebSocket relay server – rooms based on conversationId.
 * Messages are persisted in Firestore (client-side). This server only
 * relays messages to other clients in the same room in real-time.
 *
 * Run: node ws-server/index.js
 * Port: 4000 (override via WS_PORT env)
 */

const { WebSocketServer, WebSocket } = require("ws");

const PORT = parseInt(process.env.WS_PORT ?? "4000", 10);
const wss = new WebSocketServer({ port: PORT });

/** @type {Map<string, Set<WebSocket>>} */
const rooms = new Map();

wss.on("connection", (ws) => {
  let currentRoom = null;

  ws.on("message", (raw) => {
    let data;
    try { data = JSON.parse(raw.toString()); } catch { return; }

    if (data.type === "join") {
      // Leave previous room if any
      if (currentRoom && rooms.has(currentRoom)) {
        rooms.get(currentRoom).delete(ws);
      }
      currentRoom = data.roomId;
      if (!rooms.has(currentRoom)) rooms.set(currentRoom, new Set());
      rooms.get(currentRoom).add(ws);

      console.log(`[WS] ${data.userId ?? "?"} joined room: ${currentRoom} (size: ${rooms.get(currentRoom).size})`);

    } else if (data.type === "message") {
      const room = rooms.get(data.roomId);
      if (!room) return;

      const payload = JSON.stringify(data);
      // Broadcast to all OTHER clients in the room
      room.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }
  });

  ws.on("close", () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(ws);
      if (rooms.get(currentRoom).size === 0) rooms.delete(currentRoom);
    }
  });

  ws.on("error", (err) => {
    console.error("[WS] Error:", err.message);
  });
});

wss.on("listening", () => {
  console.log(`[WS] Server running on ws://localhost:${PORT}`);
});
