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
  ShieldAlert,
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

  // React to live WebSocket events without page refresh!
  useEffect(() => {
    if (lastKpiUpdate) {
      setKpis(lastKpiUpdate);
    }
  }, [lastKpiUpdate]);

  useEffect(() => {
    if (lastActivity) {
      setActivities((prev) => [lastActivity, ...prev.slice(0, 9)]);
      // Refresh chart and low stock in background
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
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operations Control Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock ledger intelligence and inventory movements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={() => {
              fetchDashboardData();
              fetchAiSuggestions();
            }}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* 5 Real-Time KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Stock Units"
          value={kpis.totalStock.toLocaleString()}
          icon={Boxes}
          color="blue"
          subtitle={`Across ${kpis.totalProducts} active products`}
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
          subtitle="Picking / staging orders"
        />
      </div>

      {/* Main Grid: Charts & AI Restock Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Stock Movement Chart */}
        <Card
          className="lg:col-span-2"
          title="Stock Movement Volume"
          subtitle="Inbound receipts vs Outbound shipments (double-entry ledger)"
          action={
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setChartDays(7)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  chartDays === 7 ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setChartDays(30)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  chartDays === 30 ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Last 30 Days
              </button>
            </div>
          }
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorTransfers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
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
                  name="Inbound (Receipts)"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorInbound)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="outbound"
                  name="Outbound (Deliveries)"
                  stroke="#EF4444"
                  fillOpacity={1}
                  fill="url(#colorOutbound)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="transfers"
                  name="Internal Transfers"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorTransfers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right 1 Col: Live Activity Feed */}
        <Card
          title="Live Operational Feed"
          subtitle="Real-time WebSocket event stream"
          action={
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          }
        >
          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Waiting for live activities...</p>
            ) : (
              activities.map((act, i) => (
                <div key={act.id || i} className="flex items-start gap-3 text-xs pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {act.user ? act.user.charAt(0) : 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium leading-snug">
                      <span className="font-semibold text-slate-900">{act.user}</span> {act.action}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {formatRelativeTime(act.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Low Stock Alert Table + AI Restock Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Low-Stock Products */}
        <Card
          title="Critical Low-Stock Inventory"
          subtitle="Products requiring immediate replenishment"
          action={
            <Link
              to="/products?stockStatus=LOW_STOCK"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View Catalog <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          {lowStockProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              All inventory levels are currently above reorder thresholds!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Current Stock</th>
                    <th className="pb-2">Reorder Level</th>
                    <th className="pb-2">Urgency</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 font-medium text-slate-900">
                        {p.name}
                        <span className="block text-[10px] text-slate-400 font-mono">{p.sku}</span>
                      </td>
                      <td className="py-2.5 font-semibold text-slate-800">
                        <span className={p.currentStock <= 0 ? 'text-red-600 font-bold' : 'text-amber-600 font-semibold'}>
                          {p.currentStock} {p.uom}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500">
                        {p.reorderLevel} {p.uom}
                      </td>
                      <td className="py-2.5">
                        <Badge variant={p.urgency} />
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          to={`/receipts?create=true&productId=${p.id}`}
                          className="inline-flex items-center px-2 py-1 rounded bg-brand-50 text-brand-700 hover:bg-brand-100 font-medium text-[11px]"
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

        {/* AI-Powered Restock Suggestions (Claude API Engine) */}
        <Card
          title="AI-Powered Restock Suggestions"
          subtitle="Consumption rate forecast based on 30-day stock ledger trends"
          action={
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Intelligent Analyst</span>
            </div>
          }
        >
          {aiLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Computing consumption velocity & replenishment targets...
            </div>
          ) : aiSuggestions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No immediate stockout risks predicted based on historical ledger entries.
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {aiSuggestions.slice(0, 4).map((s) => (
                <div
                  key={s.productId}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-900 text-xs">{s.productName}</span>
                    <Badge variant={s.urgency} />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{s.recommendation}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                    <span>
                      Daily Burn Rate: <strong className="text-slate-700 font-mono">{s.dailyBurnRate} {s.uom}/day</strong>
                    </span>
                    <span>
                      Suggested Order: <strong className="text-brand-600 font-mono">+{s.suggestedReorder} {s.uom}</strong>
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
