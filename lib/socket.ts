import { Socket as SocketIOClient } from 'socket.io-client';
import io from 'socket.io-client';

let socket: SocketIOClient | null = null;

const useSocket = () => {
  if (!socket) {
    const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');

    // Socket.IO client configuration
    socket = io(socketServerUrl, {
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true
    });

    // Connection event handlers
    socket.on('connect', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Socket connected successfully');
      }
    });

    socket.on('connect_error', (error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Socket connection error:', error);
      }
      // Attempt to reconnect with polling if websocket fails
      if (socket?.io?.opts?.transports?.includes('websocket')) {
        socket.io.opts.transports = ['polling'];
      }
    });

    socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Socket disconnected:', reason);
      }
      if (reason === 'io server disconnect') {
        socket?.connect();
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
      }
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Attempting to reconnect:', attemptNumber);
      }
    });

    socket.on('reconnect_error', (error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Socket reconnection error:', error);
      }
    });

    socket.on('reconnect_failed', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Socket reconnection failed after all attempts');
      }
    });

    // Message acknowledgment handler
    socket.on('messageSent', (response: { success: boolean; error?: string }) => {
      if (!response.success && process.env.NODE_ENV !== 'production') {
        console.error('Message delivery failed:', response.error);
      }
    });

    // Error handler
    socket.on('error', (error: Error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Socket error:', error);
      }
    });
  }

  return { socket };
};

export default useSocket;