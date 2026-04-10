import { useEffect, useRef, useCallback } from "react";

type MessageHandler = (data: unknown) => void;

export function useWebSocket(path: string, onMessage: MessageHandler) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = import.meta.env.VITE_WS_HOST || window.location.host;
    const url = `${protocol}://${host}/ws${path}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      // Reconnect after 3 seconds
      reconnectTimerRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();

    return ws;
  }, [path, onMessage]);

  useEffect(() => {
    const ws = connect();
    return () => {
      clearTimeout(reconnectTimerRef.current);
      ws.close();
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { send };
}
