import { Server } from 'socket.io';
import { NextApiResponseServerIO } from '@/types/next';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const ioHandler = (req: Request) => {
  if (!process.env.NEXT_PUBLIC_FRONTEND_URL) {
    return new NextResponse("Socket server error", { status: 500 });
  }

  try {
    const headersList = headers();
    const io = new Server({
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Store connected users in memory (consider using Redis for production)
    let connectedUsers: any[] = [];

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('register', ({ userId, role }) => {
        // Remove any existing connections for this user
        connectedUsers = connectedUsers.filter(user => user.userID !== userId);
        
        // Add new connection
        connectedUsers.push({
          socketId: socket.id,
          userID: userId,
          role: role,
          socket,
          connectedAt: new Date()
        });
      });

      socket.on('userRegister', ({ userId, message }) => {
        try {
          const recipient_admin = connectedUsers.find(
            (user) => user.role === 'admin'
          );
          if (recipient_admin) {
            recipient_admin.socket.emit('receiveMessage', message);
            socket.emit('messageSent', { success: true });
          } else {
            socket.emit('messageSent', { 
              success: false, 
              error: 'No admin available' 
            });
          }
        } catch (error) {
          console.error('Error in userRegister:', error);
          socket.emit('messageSent', { 
            success: false, 
            error: 'Internal server error' 
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        connectedUsers = connectedUsers.filter(
          (user) => user.socketId !== socket.id
        );
      });

      // Handle all request events with acknowledgments
      const requestEvents = [
        'registerRequest',
        'verifyRequest',
        'depositRequest',
        'withdrawalRequest',
        'selectAllIds',
        'selectIds',
        'selectHistoryAllIds',
        'selectHistoryIds',
        'selectWithdrawalAllIds',
        'selectWithdrawalIds',
        'selectWithdrawalHistoryAllIds',
        'selectWithdrawalHistoryIds',
        'selectCodeVerifyAllIds',
        'selectCodeVerifyIds',
        'selectRegisterAllIds',
        'selectRegisterIds'
      ];

      requestEvents.forEach(eventName => {
        socket.on(eventName, (data) => {
          try {
            const responseEvent = eventName.replace('Request', 'Receive')
              .replace('select', 'select')
              .replace('Ids', 'MultiIds')
              .replace('Id', 'MultiId');
            
            socket.emit(responseEvent, data);
            socket.emit(`${eventName}Ack`, { success: true });
          } catch (error) {
            console.error(`Error in ${eventName}:`, error);
            socket.emit(`${eventName}Ack`, { 
              success: false, 
              error: 'Internal server error' 
            });
          }
        });
      });
    });

    // Clean up disconnected users periodically
    setInterval(() => {
      connectedUsers = connectedUsers.filter(user => 
        user.socket && user.socket.connected
      );
    }, 30000);

    return new NextResponse("Socket server running", { status: 200 });
  } catch (error) {
    console.error('Socket server error:', error);
    return new NextResponse("Socket server error", { status: 500 });
  }
};

export { ioHandler as GET, ioHandler as POST };