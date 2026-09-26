import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { socket } from '../lib/socket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastActivity, setLastActivity] = useState(null);
  const [lastStockUpdate, setLastStockUpdate] = useState(null);
  const [lastKpiUpdate, setLastKpiUpdate] = useState(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onStockUpdated(payload) {
      setLastStockUpdate(payload);
    }

    function onKpiUpdated(payload) {
      setLastKpiUpdate(payload);
    }

    function onActivityNew(payload) {
      setLastActivity(payload);
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-brand-500 p-4`}
          >
            <div className="flex-1">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Live System Activity</p>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                <span className="font-semibold text-slate-800">{payload.user}</span> {payload.action}
              </p>
            </div>
          </div>
        ),
        { duration: 4000 }
      );
    }

    function onNotificationNew(payload) {
      toast(payload.title + ': ' + payload.message, {
        icon: '🔔',
        style: {
          borderRadius: '10px',
          background: '#0F172A',
          color: '#fff',
        },
      });
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('stock:updated', onStockUpdated);
    socket.on('kpi:updated', onKpiUpdated);
    socket.on('activity:new', onActivityNew);
    socket.on('notification:new', onNotificationNew);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('stock:updated', onStockUpdated);
      socket.off('kpi:updated', onKpiUpdated);
      socket.off('activity:new', onActivityNew);
      socket.off('notification:new', onNotificationNew);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        lastActivity,
        lastStockUpdate,
        lastKpiUpdate,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
