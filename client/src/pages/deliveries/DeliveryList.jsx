import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, ArrowUpFromLine, Trash, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { deliveriesApi, settingsApi, productsApi } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const DeliveryList = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Creation modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);

  const [formData, setFormData] = useState({
    customerId: '',
    notes: '',
    status: 'Draft',
    lines: [{ productId: '', locationId: '', requestedQty: 10 }],
  });
  const [saving, setSaving] = useState(false);

  const fetchDeliveries = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await deliveriesApi.getAll(params);
      if (res.data?.success) {
        setDeliveries(res.data.deliveries || []);
      }
    } catch (err) {
      console.error('Failed to load delivery orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [custRes, prodRes, locRes] = await Promise.all([
        settingsApi.getCustomers(),
        productsApi.getAll({ limit: 100 }),
        settingsApi.getLocations(),
      ]);
      if (custRes.data?.success) setCustomers(custRes.data.customers || []);
      if (prodRes.data?.success) setProducts(prodRes.data.products || []);
      if (locRes.data?.success) setLocations(locRes.data.locations || []);
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter, search]);

  const handleAddLine = () => {
    setFormData((prev) => ({
      ...prev,
      lines: [...prev.lines, { productId: '', locationId: '', requestedQty: 10 }],
    }));
  };

  const handleRemoveLine = (idx) => {
    if (formData.lines.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx),
    }));
  };

  const handleLineChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.lines];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, lines: updated };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (formData.lines.some((l) => !l.productId || l.requestedQty <= 0)) {
      toast.error('Please select a valid product and quantity for each line');
      return;
    }

    setSaving(true);
    try {
      await deliveriesApi.create({
        customerId: formData.customerId ? Number(formData.customerId) : null,
        notes: formData.notes,
        status: formData.status,
        lines: formData.lines.map((l) => ({
          productId: Number(l.productId),
          locationId: l.locationId ? Number(l.locationId) : null,
          requestedQty: Number(l.requestedQty),
          deliveredQty: Number(l.requestedQty),
        })),
      });
      toast.success('Delivery order draft created');
      setCreateModalOpen(false);
      setFormData({
        customerId: '',
        notes: '',
        status: 'Draft',
        lines: [{ productId: '', locationId: '', requestedQty: 10 }],
      });
      fetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create delivery order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Outgoing Deliveries</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pick, pack, and validate customer shipments
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setCreateModalOpen(true)}>
          New Delivery Order
        </Button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or order note..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Waiting">Waiting</option>
          <option value="Ready">Ready (Picked & Packed)</option>
          <option value="Done">Done (Dispatched)</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Delivery #</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Items Count</th>
                <th className="px-6 py-3.5">Created Date</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading delivery orders...
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No delivery orders found.
                  </td>
                </tr>
              ) : (
                deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      <Link to={`/deliveries/${d.id}`} className="hover:text-brand-600">
                        DEL-{d.id.toString().padStart(4, '0')}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {d.customer?.name || 'Commercial Customer'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={d.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {d.lines?.length || 0} product item(s)
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/deliveries/${d.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Delivery Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Outgoing Delivery Order" maxWidth="max-w-3xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Customer Client</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
              >
                <option value="Draft">Draft (Planning)</option>
                <option value="Waiting">Waiting (Pending Picking)</option>
                <option value="Ready">Ready (Picked & Reserved)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Order Notes / Customer Reference</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder="e.g. Order #ORD-9920 - Urgent shipment via freight carrier"
            />
          </div>

          {/* Dynamic Lines */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-700">Outbound Items</span>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {formData.lines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <select
                    required
                    value={line.productId}
                    onChange={(e) => handleLineChange(idx, 'productId', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded border text-xs bg-white"
                  >
                    <option value="">Select Product *</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — Stock: {p.currentStock}
                      </option>
                    ))}
                  </select>

                  <select
                    value={line.locationId}
                    onChange={(e) => handleLineChange(idx, 'locationId', e.target.value)}
                    className="w-48 px-2.5 py-1.5 rounded border text-xs bg-white"
                  >
                    <option value="">Source Rack</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.warehouse?.name} · {loc.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Qty"
                    value={line.requestedQty}
                    onChange={(e) => handleLineChange(idx, 'requestedQty', e.target.value)}
                    className="w-24 px-2 py-1.5 rounded border text-xs"
                  />

                  {formData.lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} variant="primary">
              Save Delivery Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
