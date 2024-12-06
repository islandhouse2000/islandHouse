// 필요한 모듈을 import 합니다.
import io from 'socket.io-client';

// 응답 타입을 정의하는 인터페이스입니다.
interface SocketResponse {
  success: boolean;
  error?: string;
}

// Socket 타입을 정의합니다.
type SocketType = ReturnType<typeof io>;

// 소켓 인스턴스를 정의하는 인터페이스입니다.
interface SocketInstance {
  socket: SocketType | null;
  connect: () => void;
  disconnect: () => void;
  isConnected: () => boolean;
}

// 소켓 변수를 선언합니다. 초기값은 null입니다.
let socket: SocketType | null = null;

// 소켓을 사용하는 훅을 정의합니다.
const useSocket = (): SocketInstance => {
  // 소켓 연결을 설정하는 함수입니다.
  const connectSocket = () => {
    if (!socket) {
      try {
        // 소켓 URL을 환경변수에서 가져오거나, 없다면 현재 window의 origin을 사용합니다.
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
          (typeof window !== 'undefined' ? window.location.origin : '');

        // 새로운 소켓 인스턴스를 생성합니다.
        const newSocket = io(socketUrl, {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          autoConnect: true,
          transports: ['websocket', 'polling']
        });

        // 이벤트 리스너를 설정합니다.
        setupEventListeners(newSocket);

        // 소켓 변수에 새 소켓을 할당합니다.
        socket = newSocket;
      } catch (error) {
        console.error('Socket connection error:', error);
      }
    }
  };

  // 소켓 연결을 끊는 함수입니다.
  const disconnect = () => {
    if (socket) {
      try {
        socket.disconnect();
        socket = null;
      } catch (error) {
        console.error('Socket disconnection error:', error);
      }
    }
  };

  // 소켓이 연결되어 있는지 확인하는 함수입니다.
  const isConnected = (): boolean => {
    return socket?.connected || false;
  };

  // 처음 훅이 사용될 때 자동으로 연결을 시도합니다.
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

// 이벤트 리스너를 설정하는 별도의 함수입니다.
function setupEventListeners(socket: SocketType) {
  socket.on('connect', () => {
    console.log('Socket connected successfully', socket.id);
  });

  socket.on('disconnect', (reason: string) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('error', (error: Error) => {
    console.error('Socket error:', error);
  });

  // 다른 이벤트 핸들러들도 여기에 추가합니다.
}

// 모듈로 내보냅니다.
export default useSocket;