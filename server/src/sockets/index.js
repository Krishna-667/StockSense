let io = null;

const initSocket = (socketIoInstance) => {
  io = socketIoInstance;

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.io: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => io;

const emitStockUpdated = (payload) => {
  if (io) {
    io.emit('stock:updated', payload);
  }
};

const emitKpiUpdated = (payload) => {
  if (io) {
    io.emit('kpi:updated', payload);
  }
};

const emitActivityNew = (payload) => {
  if (io) {
    io.emit('activity:new', payload);
  }
};

const emitNotificationNew = (payload) => {
  if (io) {
    io.emit('notification:new', payload);
  }
};

module.exports = {
  initSocket,
  getIo,
  emitStockUpdated,
  emitKpiUpdated,
  emitActivityNew,
  emitNotificationNew,
};
