import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import Redis from 'ioredis';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO with proper CORS and transport config
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
  });

  // Socket.IO middleware for authentication if needed
  io.use(async (socket, next) => {
    try {
      // Add any authentication logic here if needed
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Handle socket connections
  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    // Handle user registration
    socket.on('register', async ({ userId, role }) => {
      try {
        // Store user connection in Redis
        await redis.hset(
          `socket:user:${userId}`,
          {
            socketId: socket.id,
            role,
            connectedAt: new Date().toISOString(),
          }
        );
        
        // Join room based on role
        socket.join(role);
        console.log(`User ${userId} registered as ${role}`);
      } catch (error) {
        console.error('Error in register:', error);
      }
    });

    // Handle user messages
    socket.on('userRegister', async ({ userId, message }) => {
      try {
        // Get admin sockets from Redis
        const adminSockets = await redis.keys('socket:user:*');
        const admins = await Promise.all(
          adminSockets.map(async (key) => {
            const userData = await redis.hgetall(key);
            return userData.role === 'admin' ? userData : null;
          })
        );

        const activeAdmins = admins.filter(Boolean);
        if (activeAdmins.length > 0) {
          // Emit to all admin sockets
          io.to('admin').emit('receiveMessage', message);
          socket.emit('messageSent', { success: true });
        } else {
          socket.emit('messageSent', {
            success: false,
            error: 'No admin available',
          });
        }
      } catch (error) {
        console.error('Error in userRegister:', error);
        socket.emit('messageSent', {
          success: false,
          error: 'Internal server error',
        });
      }
    });

    // Handle all request events
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
      socket.on(eventName, async (data) => {
        try {
          const responseEvent = eventName
            .replace('Request', 'Receive')
            .replace('select', 'select')
            .replace('Ids', 'MultiIds')
            .replace('Id', 'MultiId');

          // Store event in Redis for persistence
          await redis.rpush(`events:${socket.id}`, JSON.stringify({
            event: eventName,
            data,
            timestamp: new Date().toISOString()
          }));

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

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        // Remove user from Redis
        const userKeys = await redis.keys('socket:user:*');
        for (const key of userKeys) {
          const userData = await redis.hgetall(key);
          if (userData.socketId === socket.id) {
            await redis.del(key);
            break;
          }
        }
        console.log('Client disconnected:', socket.id);
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});