import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  PackageX,
  ArrowDownToLine,
  ArrowUpFromLine,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  ArrowLeftRight,
  Zap,
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

  return (
    <div className="space-y-8 select-none pb-12">
      {/* High-Impact Hero Command Center Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-7 sm:p-9 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Real-Time Inventory Telemetry Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              Logistics Command Center
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              Real-time stock ledger intelligence, automated reorder triggers, and multi-warehouse operations.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/receipts">
              <Button variant="primary" size="md" icon={Plus}>
                Inbound Receipt
              </Button>
            </Link>
            <Link to="/deliveries">
              <Button variant="outline" size="md" icon={ArrowUpFromLine} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Outbound Delivery
              </Button>
            </Link>
            <Link to="/transfers">
              <Button variant="success" size="md" icon={ArrowLeftRight}>
                Transfer Stock
              </Button>
            </Link>
            <button
              onClick={() => {
                fetchDashboardData();
                fetchAiSuggestions();
              }}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all shadow-sm"
              title="Refresh telemetry data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 5 Real-Time KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard
          title="Total Stock Units"
          value={kpis.totalStock.toLocaleString()}
          icon={Boxes}
          color="blue"
          subtitle={`Across ${kpis.totalProducts} active SKUs`}
          trend="+8.4% velocity"
        />
        <StatCard
          title="Low Stock Alert"
          value={kpis.lowStock}
          icon={AlertTriangle}
          color="amber"
          subtitle="At or below reorder level"
          badge={kpis.lowStock > 0 ? <Badge variant="LOW_STOCK" /> : null}
        />
        <StatCard
          title="Out of Stock"
          value={kpis.outOfStock}
          icon={PackageX}
          color="rose"
          subtitle="Immediate restock needed"
          badge={kpis.outOfStock > 0 ? <Badge variant="OUT_OF_STOCK" /> : null}
        />
        <StatCard
          title="Pending Receipts"
          value={kpis.pendingReceipts}
          icon={ArrowDownToLine}
          color="purple"
          subtitle="Awaiting dock validation"
        />
        <StatCard
          title="Pending Deliveries"
          value={kpis.pendingDeliveries}
          icon={ArrowUpFromLine}
          color="emerald"
          subtitle="Picking & staging orders"
        />
      </div>

      {/* Main Grid: Charts & AI Restock Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Stock Movement Chart */}
        <Card
          className="lg:col-span-2"
          title="Stock Movement Volume"
          subtitle="Inbound receipts vs Outbound shipments (double-entry ledger)"
          action={
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setChartDays(7)}
                className={`px-3 py-1 rounded-xl transition-all ${
                  chartDays === 7 ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartDays(30)}
                className={`px-3 py-1 rounded-xl transition-all ${
                  chartDays === 30 ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                30 Days
              </button>
            </div>
          }
        >
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorTransfers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#fff',
                    borderRadius: '16px',
                    border: '1px solid #1E293B',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '14px' }} />
                <Area
                  type="monotone"
                  dataKey="inbound"
                  name="Inbound Receipts"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorInbound)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="outbound"
                  name="Outbound Deliveries"
                  stroke="#F43F5E"
                  fillOpacity={1}
                  fill="url(#colorOutbound)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="transfers"
                  name="Internal Transfers"
                  stroke="#6366F1"
                  fillOpacity={1}
                  fill="url(#colorTransfers)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right 1 Col: Live Activity Stream */}
        <Card
          title="Live Activity Stream"
          subtitle="Real-time WebSocket event feeds"
          action={
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          }
        >
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">Waiting for live activities...</p>
            ) : (
              activities.map((act, i) => (
                <div key={act.id || i} className="flex items-start gap-3.5 text-xs pb-3.5 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200/60 shadow-xs">
                    {act.user ? act.user.charAt(0) : 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium leading-snug">
                      <span className="font-bold text-slate-900">{act.user}</span> {act.action}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {formatRelativeTime(act.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Low Stock Alert Table + AI Restock Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Critical Low-Stock Inventory Table */}
        <Card
          title="Critical Inventory Replenishment"
          subtitle="Products currently at or below reorder thresholds"
          action={
            <Link
              to="/products?stockStatus=LOW_STOCK"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {lowStockProducts.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs font-medium">
              All inventory levels are currently optimal above reorder thresholds!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">Product SKU</th>
                    <th className="pb-3 font-semibold">Current Stock</th>
                    <th className="pb-3 font-semibold">Reorder Level</th>
                    <th className="pb-3 font-semibold">Urgency</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">
                        {p.name}
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{p.sku}</span>
                      </td>
                      <td className="py-3 font-semibold text-slate-800">
                        <span className={p.currentStock <= 0 ? 'text-red-600 font-bold' : 'text-amber-600 font-semibold'}>
                          {p.currentStock} {p.uom}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 font-mono">
                        {p.reorderLevel} {p.uom}
                      </td>
                      <td className="py-3">
                        <Badge variant={p.urgency} />
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/receipts?create=true&productId=${p.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] border border-indigo-200/60 shadow-xs"
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
        </Card>

        {/* AI-Powered Restock Suggestions (Claude Engine) */}
        <Card
          dark={true}
          title="AI Restock Intelligence"
          subtitle="Predictive consumption rate & replenishment targets"
          action={
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <span>Claude Engine</span>
            </div>
          }
        >
          {aiLoading ? (
            <div className="p-10 text-center text-slate-400 text-xs font-medium">
              <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Analyzing consumption velocity & calculating restock windows...
            </div>
          ) : aiSuggestions.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs font-medium">
              No immediate stockout risks predicted based on historical ledger velocity.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {aiSuggestions.slice(0, 4).map((s) => (
                <div
                  key={s.productId}
                  className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/80 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs tracking-tight">{s.productName}</span>
                    <Badge variant={s.urgency} />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{s.recommendation}</p>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span>
                      Daily Burn: <strong className="text-white font-mono">{s.dailyBurnRate} {s.uom}/day</strong>
                    </span>
                    <span>
                      Order Target: <strong className="text-emerald-400 font-mono font-bold">+{s.suggestedReorder} {s.uom}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
