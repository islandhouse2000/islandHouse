import socketClient, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

const useSocket = () => {
  if (!socket) {
    const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;

    // Socket.IO client configuration
    socket = socketClient(socketServerUrl, {
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
      console.log('Socket connected successfully');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      // Attempt to reconnect with polling if websocket fails
      if (socket?.io?.opts?.transports?.includes('websocket')) {
        socket.io.opts.transports = ['polling'];
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Reconnect if server disconnected
        socket?.connect();
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Attempting to reconnect:', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after all attempts');
    });

    // Message acknowledgment handler
    socket.on('messageSent', (response: { success: boolean; error?: string }) => {
      if (!response.success) {
        console.error('Message delivery failed:', response.error);
      }
    });

    // Error handler
    socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });
  }

  return { socket };
};

export default useSocket;