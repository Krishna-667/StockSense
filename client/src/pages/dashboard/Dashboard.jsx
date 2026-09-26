import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  PackageX,
  ArrowDownToLine,
  ArrowUpFromLine,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowRight,
  Plus,
  ArrowLeftRight,
  PackageCheck,
  Truck,
  FileCheck,
  ShoppingCart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const Dashboard = () => {
  const { lastKpiUpdate, lastActivity, lastStockUpdate } = useSocket();

  const [kpis, setKpis] = useState({
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    totalProducts: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [chartDays, setChartDays] = useState(7);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [kpisRes, chartRes, lowStockRes, activityRes] = await Promise.all([
        dashboardApi.getKpis(),
        dashboardApi.getChart(chartDays),
        dashboardApi.getLowStock(),
        dashboardApi.getActivity(),
      ]);

      if (kpisRes.data?.success) setKpis(kpisRes.data.kpis);
      if (chartRes.data?.success) setChartData(chartRes.data.chart);
      if (lowStockRes.data?.success) setLowStockProducts(lowStockRes.data.lowStock);
      if (activityRes.data?.success) setActivities(activityRes.data.activity);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiSuggestions = async () => {
    setAiLoading(true);
    try {
      const res = await dashboardApi.getAiSuggestions();
      if (res.data?.success) {
        setAiSuggestions(res.data.suggestions || []);
      }
    } catch (err) {
      console.error('Failed to load AI suggestions:', err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAiSuggestions();
  }, [chartDays]);

  useEffect(() => {
    if (lastKpiUpdate) {
      setKpis(lastKpiUpdate);
    }
  }, [lastKpiUpdate]);

  useEffect(() => {
    if (lastActivity) {
      setActivities((prev) => [lastActivity, ...prev.slice(0, 9)]);
      dashboardApi.getChart(chartDays).then((res) => {
        if (res.data?.success) setChartData(res.data.chart);
      });
      dashboardApi.getLowStock().then((res) => {
        if (res.data?.success) setLowStockProducts(res.data.lowStock);
      });
    }
  }, [lastActivity]);

  useEffect(() => {
    if (lastStockUpdate) {
      dashboardApi.getKpis().then((res) => {
        if (res.data?.success) setKpis(res.data.kpis);
      });
    }
  }, [lastStockUpdate]);

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Calculate active items percentage for Donut
  const activeStockPercentage = kpis.totalProducts > 0
    ? Math.round(((kpis.totalProducts - kpis.lowStock - kpis.outOfStock) / kpis.totalProducts) * 100)
    : 100;

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zoho-border shadow-zoho-card">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time inventory summary and operational metrics</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/receipts">
            <Button variant="primary" size="sm" icon={Plus}>
              New Receipt
            </Button>
          </Link>
          <Link to="/deliveries">
            <Button variant="secondary" size="sm" icon={ArrowUpFromLine}>
              New Delivery
            </Button>
          </Link>
          <Link to="/transfers">
            <Button variant="secondary" size="sm" icon={ArrowLeftRight}>
              Transfer Stock
            </Button>
          </Link>
          <button
            onClick={() => {
              fetchDashboardData();
              fetchAiSuggestions();
            }}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ZOHO SECTION 1: Sales Activity & Inventory Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sales Activity (4 metric blocks) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zoho-border p-5 shadow-zoho-card">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Inventory & Operations Activity</h3>
            <span className="text-xs text-slate-400 font-medium">Real-Time Sync</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Box 1: To Be Packed */}
            <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-100 text-center hover:bg-blue-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold shadow-xs">
                <PackageCheck className="w-4 h-4" />
              </div>
              <span className="text-2xl font-bold text-blue-700 block">{kpis.pendingDeliveries}</span>
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-tight block mt-1">TO BE PACKED</span>
              <span className="text-[10px] text-slate-400 font-mono">Deliveries</span>
            </div>

            {/* Box 2: To Be Shipped */}
            <div className="p-4 rounded-lg bg-rose-50/60 border border-rose-100 text-center hover:bg-rose-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-zoho-red text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-2xl font-bold text-zoho-red block">{kpis.pendingReceipts}</span>
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-tight block mt-1">TO BE RECEIVED</span>
              <span className="text-[10px] text-slate-400 font-mono">Inbound Dock</span>
            </div>

            {/* Box 3: Low Stock Warning */}
            <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-100 text-center hover:bg-amber-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-2xl font-bold text-amber-700 block">{kpis.lowStock}</span>
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-tight block mt-1">LOW STOCK</span>
              <span className="text-[10px] text-slate-400 font-mono">Items Warning</span>
            </div>

            {/* Box 4: Out of Stock */}
            <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-100 text-center hover:bg-emerald-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold shadow-xs">
                <PackageX className="w-4 h-4" />
              </div>
              <span className="text-2xl font-bold text-emerald-700 block">{kpis.outOfStock}</span>
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-tight block mt-1">OUT OF STOCK</span>
              <span className="text-[10px] text-slate-400 font-mono">Immediate Order</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Inventory Summary Box */}
        <div className="bg-white rounded-xl border border-zoho-border p-5 shadow-zoho-card flex flex-col justify-between">
          <div className="pb-3 mb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Inventory Summary</h3>
          </div>

          <div className="space-y-4 my-auto">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">QUANTITY IN HAND</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{kpis.totalStock.toLocaleString()}</span>
              <span className="text-xs text-slate-500 block mt-0.5">Total registered physical units</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">PENDING INBOUND DOCK</span>
              <span className="text-xl font-bold text-zoho-red font-mono">{kpis.pendingReceipts} Orders</span>
              <span className="text-xs text-slate-500 block mt-0.5">Incoming supplier receipts</span>
            </div>
          </div>
        </div>
      </div>

      {/* ZOHO SECTION 2: Product Details & Critical Low Stock Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Details & Donut Progress */}
        <div className="bg-white rounded-xl border border-zoho-border p-5 shadow-zoho-card">
          <div className="pb-3 mb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Product Details</h3>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3.5 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Low Stock Items</span>
                <span className="font-bold text-zoho-red font-mono text-sm">{kpis.lowStock}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">All Item SKUs</span>
                <span className="font-bold text-slate-800 font-mono text-sm">{kpis.totalProducts}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Stock Qty</span>
                <span className="font-bold text-slate-800 font-mono text-sm">{kpis.totalStock}</span>
              </div>
            </div>

            {/* Circular Progress Indicator */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${activeStockPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-extrabold text-slate-800 font-mono">{activeStockPercentage}%</span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase">Optimal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Items List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zoho-border p-5 shadow-zoho-card">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Critical Low Stock Replenishment</h3>
            <Link to="/products?stockStatus=LOW_STOCK" className="text-xs font-semibold text-zoho-red hover:underline flex items-center gap-1">
              View All Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              All inventory items are optimal above reorder thresholds!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5 font-semibold">Item SKU</th>
                    <th className="pb-2.5 font-semibold">Current Stock</th>
                    <th className="pb-2.5 font-semibold">Reorder Level</th>
                    <th className="pb-2.5 font-semibold">Urgency</th>
                    <th className="pb-2.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockProducts.slice(0, 4).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-900">
                        {p.name}
                        <span className="block text-[10px] text-slate-400 font-mono">{p.sku}</span>
                      </td>
                      <td className="py-2.5 font-bold text-zoho-red">
                        {p.currentStock} {p.uom}
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono">
                        {p.reorderLevel} {p.uom}
                      </td>
                      <td className="py-2.5">
                        <Badge variant={p.urgency} />
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          to={`/receipts?create=true&productId=${p.id}`}
                          className="inline-flex items-center px-2.5 py-1 rounded bg-zoho-red text-white hover:bg-zoho-redHover font-semibold text-[11px] shadow-xs"
                        >
                          Restock
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ZOHO SECTION 3: Stock Movement Volume & AI Restock Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zoho-border p-5 shadow-zoho-card">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Stock Movement Velocity</h3>
              <p className="text-xs text-slate-500">Double-entry stock ledger transaction trends</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setChartDays(7)}
                className={`px-2.5 py-1 rounded transition-all ${
                  chartDays === 7 ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartDays(30)}
                className={`px-2.5 py-1 rounded transition-all ${
                  chartDays === 30 ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E52E2E" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#E52E2E" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorTransfers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#1A73E8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E1F28',
                    color: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="inbound"
                  name="Inbound Receipts"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorInbound)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="outbound"
                  name="Outbound Deliveries"
                  stroke="#E52E2E"
                  fillOpacity={1}
                  fill="url(#colorOutbound)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="transfers"
                  name="Internal Transfers"
                  stroke="#1A73E8"
                  fillOpacity={1}
                  fill="url(#colorTransfers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Stream & AI Restock */}
        <div className="bg-white rounded-xl border border-zoho-border p-5 shadow-zoho-card flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Recent Activity Log</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zoho-red"></span>
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar my-auto">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Waiting for live activities...</p>
            ) : (
              activities.map((act, i) => (
                <div key={act.id || i} className="flex items-start gap-3 text-xs pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {act.user ? act.user.charAt(0) : 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium leading-snug">
                      <span className="font-semibold text-slate-900">{act.user}</span> {act.action}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {formatRelativeTime(act.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
