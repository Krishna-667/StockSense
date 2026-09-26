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

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const prisma = require('./src/lib/prisma');
const seed = require('./prisma/seed');

server.listen(PORT, async () => {
  console.log(`🚀 StockSense API Server running at http://localhost:${PORT}`);
  console.log(`📡 Socket.io server initialized and listening`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  try {
    const ledgerCount = await prisma.stockLedger.count();
    if (ledgerCount === 0) {
      console.log('🌱 Database has no stock ledger entries. Auto-seeding initial dataset...');
      await seed();
    }
  } catch (err) {
    console.warn('Startup database auto-seed check:', err.message);
  }
});

process.on('SIGINT', () => {
  console.log('Shutting down server gracefully...');
  server.close(() => {
    process.exit(0);
  });
});
