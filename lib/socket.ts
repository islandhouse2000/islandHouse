import { Socket } from 'socket.io-client';
import io from 'socket.io-client';

interface SocketResponse {
  success: boolean;
  error?: string;
}

interface SocketInstance {
  socket: Socket | null;
}

let socket: Socket | null = null;

const useSocket = (): SocketInstance => {
  if (!socket) {
    const socketServerUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
      (typeof window !== 'undefined' 
        ? window.location.origin
        : '');

    socket = io(socketServerUrl, {
      path: '/api/socket',
      addTrailingSlash: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 30000,
      autoConnect: true,
      transports: ['websocket'],
    });

    // Add connection event handlers
    socket.on('connect', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Socket connected successfully');
      }
    });

    socket.on('connect_error', (error: Error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Socket connection error:', error);
      }
      // Try to reconnect with websocket only
      if (socket?.io?.opts) {
        socket.io.opts.transports = ['websocket'];
      }
    });

    socket.on('disconnect', (reason: string) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Socket disconnected:', reason);
      }
      if (!socket?.connected) {
        setTimeout(() => socket?.connect(), 1000);
      }
    });

    socket.on('reconnect', (attemptNumber: number) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
      }
    });

    socket.on('reconnect_attempt', (attemptNumber: number) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Attempting to reconnect:', attemptNumber);
      }
    });

    socket.on('reconnect_error', (error: Error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Socket reconnection error:', error);
      }
    });

    socket.on('reconnect_failed', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Socket reconnection failed after all attempts');
      }
    });

    socket.on('error', (error: Error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Socket error:', error);
      }
    });

    socket.on('messageSent', (response: SocketResponse) => {
      if (!response.success && process.env.NODE_ENV !== 'production') {
        console.error('Message delivery failed:', response.error);
      }
    });
  }

  return { socket };
};

export default useSocket;