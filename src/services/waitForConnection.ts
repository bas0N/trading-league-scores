import WebSocket from "ws";

export function waitForConnection(webSocket: WebSocket) {
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (webSocket.readyState === WebSocket.OPEN) {
        clearInterval(timer);
        console.log("connected!");
        resolve(null);
      }
    }, 1000);
  });
}
