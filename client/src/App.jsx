import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Layout } from './components/layout/Layout';

// Pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Dashboard } from './pages/dashboard/Dashboard';
import { ProductList } from './pages/products/ProductList';
import { ProductDetail } from './pages/products/ProductDetail';
import { ReceiptList } from './pages/receipts/ReceiptList';
import { ReceiptDetail } from './pages/receipts/ReceiptDetail';
import { DeliveryList } from './pages/deliveries/DeliveryList';
import { DeliveryDetail } from './pages/deliveries/DeliveryDetail';
import { TransferList } from './pages/transfers/TransferList';
import { AdjustmentList } from './pages/adjustments/AdjustmentList';
import { StockLedger } from './pages/ledger/StockLedger';
import { Settings } from './pages/settings/Settings';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/receipts" element={<ReceiptList />} />
              <Route path="/receipts/:id" element={<ReceiptDetail />} />
              <Route path="/deliveries" element={<DeliveryList />} />
              <Route path="/deliveries/:id" element={<DeliveryDetail />} />
              <Route path="/transfers" element={<TransferList />} />
              <Route path="/adjustments" element={<AdjustmentList />} />
              <Route path="/ledger" element={<StockLedger />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}
