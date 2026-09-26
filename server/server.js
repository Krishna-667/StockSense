require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const { initSocket } = require('./src/sockets');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initSocket(io);

server.listen(PORT, () => {
  console.log(`🚀 StockSense API Server running at http://localhost:${PORT}`);
  console.log(`📡 Socket.io server initialized and listening`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down server gracefully...');
  server.close(() => {
    process.exit(0);
  });
});
