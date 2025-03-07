import { useEffect, useRef } from 'react';

export default function useWebSocket({ 
  url, 
  onOpen, 
  onMessage, 
  onClose, 
  onError 
}) {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = new WebSocket(url);
    socket.current.onopen = onOpen;
    socket.current.onmessage = onMessage;
    socket.current.onclose = onClose;
    socket.current.onerror = onError;

    return () => {
      if (socket.current) socket.current.close();
    };
  }, [url]);

  return socket;
}