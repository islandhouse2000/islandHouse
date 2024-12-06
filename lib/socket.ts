import { Socket as SocketIOClient } from 'socket.io-client';
import io from 'socket.io-client';

interface SocketResponse {
  success: boolean;
  error?: string;
}

interface SocketInstance {
  socket: typeof SocketIOClient | null;
  connect: () => void;
  disconnect: () => void;
  isConnected: () => boolean;
}

let socket: typeof SocketIOClient | null = null;

const useSocket = (): SocketInstance => {
  const connectSocket = () => {
    if (!socket) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
        (typeof window !== 'undefined' ? window.location.origin : '');

      const newSocket = io(socketUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully', newSocket.id);
      });

      newSocket.on('connect_error', (error: Error) => {
        console.error('Socket connection error:', error);
        // Try to reconnect with both transports
        if (newSocket.io?.opts) {
          newSocket.io.opts.transports = ['websocket', 'polling'];
        }
      });

      newSocket.on('disconnect', (reason: string) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Reconnect if server disconnected
          setTimeout(() => newSocket.connect(), 1000);
        }
      });

      newSocket.on('reconnect', (attemptNumber: number) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
      });

      newSocket.on('reconnect_attempt', () => {
        console.log('Attempting to reconnect...');
      });

      newSocket.on('reconnect_error', (error: Error) => {
        console.error('Socket reconnection error:', error);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed after all attempts');
      });

      newSocket.on('error', (error: Error) => {
        console.error('Socket error:', error);
      });

      // Event handlers for user registration and messaging
      newSocket.on('messageSent', (response: SocketResponse) => {
        if (!response.success) {
          console.error('Message delivery failed:', response.error);
        }
      });

      // Handle server events
      newSocket.on('receiveMessage', (message: any) => {
        console.log('Received message:', message);
      });

      // Handle various response events
      const responseEvents = [
        'registerReceive',
        'verifyReceive',
        'depositReceive',
        'withdrawalReceive',
        'selectAllMultiIds',
        'selectMultiIds',
        'selectHistoryMultiIds',
        'selectWithdrawalMultiIds',
        'selectWithdrawalHistoryMultiIds',
        'selectCodeVerifyMultiIds',
        'selectRegisterMultiIds'
      ];

      responseEvents.forEach(eventName => {
        newSocket.on(eventName, (data: any) => {
          console.log(`Received ${eventName}:`, data);
        });

        newSocket.on(`${eventName}Ack`, (response: SocketResponse) => {
          if (!response.success) {
            console.error(`${eventName} failed:`, response.error);
          }
        });
      });

      socket = newSocket;
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  const isConnected = (): boolean => {
    return socket?.connected || false;
  };

  // Auto-connect when the hook is used
  if (typeof window !== 'undefined' && !socket) {
    connectSocket();
  }

  return {
    socket,
    connect: connectSocket,
    disconnect,
    isConnected,
  };
};

export default useSocket;