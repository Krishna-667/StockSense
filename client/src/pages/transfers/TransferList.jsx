import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeftRight, CheckCircle2, Search, ArrowRight, Warehouse, MapPin, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import { transfersApi, settingsApi, productsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const TransferList = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    fromWarehouseId: '',
    toWarehouseId: '',
    fromLocationId: '',
    toLocationId: '',
    notes: '',
    lines: [{ productId: '', quantity: 10 }],
  });

  const fetchTransfers = async () => {
    try {
      const res = await transfersApi.getAll();
      if (res.data?.success) {
        setTransfers(res.data.transfers || []);
      }
    } catch (err) {
      console.error('Failed to load transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [whRes, locRes, prodRes] = await Promise.all([
        settingsApi.getWarehouses(),
        settingsApi.getLocations(),
        productsApi.getAll({ limit: 100 }),
      ]);
      if (whRes.data?.success) setWarehouses(whRes.data.warehouses || []);
      if (locRes.data?.success) setLocations(locRes.data.locations || []);
      if (prodRes.data?.success) setProducts(prodRes.data.products || []);
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  };

  useEffect(() => {
    fetchTransfers();
    fetchMetadata();
  }, []);

  const handleAddLine = () => {
    setFormData((prev) => ({
      ...prev,
      lines: [...prev.lines, { productId: '', quantity: 10 }],
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
    if (!formData.fromWarehouseId || !formData.toWarehouseId) {
      toast.error('Source and destination warehouses are required');
      return;
    }
    if (formData.lines.some((l) => !l.productId || l.quantity <= 0)) {
      toast.error('Select a valid product and quantity for each line');
      return;
    }

    setActionLoading(true);
    try {
      await transfersApi.create({
        fromWarehouseId: Number(formData.fromWarehouseId),
        toWarehouseId: Number(formData.toWarehouseId),
        fromLocationId: formData.fromLocationId ? Number(formData.fromLocationId) : null,
        toLocationId: formData.toLocationId ? Number(formData.toLocationId) : null,
        notes: formData.notes,
        lines: formData.lines.map((l) => ({
          productId: Number(l.productId),
          quantity: Number(l.quantity),
        })),
      });
      toast.success('Transfer draft created');
      setCreateModalOpen(false);
      setFormData({
        fromWarehouseId: '',
        toWarehouseId: '',
        fromLocationId: '',
        toLocationId: '',
        notes: '',
        lines: [{ productId: '', quantity: 10 }],
      });
      fetchTransfers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create transfer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidateTransfer = async (id) => {
    setActionLoading(true);
    try {
      const res = await transfersApi.validate(id);
      toast.success(res.data?.message || 'Transfer completed! Stock ledger updated with double entries.');
      fetchTransfers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete transfer. Check source stock.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Internal Transfers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Relocate stock between warehouses or rack positions with full traceability
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setCreateModalOpen(true)}>
          New Transfer Movement
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Transfer #</th>
                <th className="px-6 py-3.5">From Origin</th>
                <th className="px-6 py-3.5">To Destination</th>
                <th className="px-6 py-3.5">Products Moved</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading internal transfers...
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No transfer orders found.
                  </td>
                </tr>
              ) : (
                transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      TRF-{t.id.toString().padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">
                      <span className="font-semibold block text-slate-900">
                        {t.fromWarehouse?.name || 'Main Warehouse'}
                      </span>
                      {t.fromLocation && (
                        <span className="text-[11px] text-slate-400">
                          Rack: {t.fromLocation.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">
                      <span className="font-semibold block text-slate-900">
                        {t.toWarehouse?.name || 'Production Floor'}
                      </span>
                      {t.toLocation && (
                        <span className="text-[11px] text-slate-400">
                          Rack: {t.toLocation.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {t.lines?.map((l) => (
                        <span key={l.id} className="block font-medium">
                          {l.quantity} {l.product?.uom?.abbreviation} · {l.product?.name}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={t.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {t.status !== 'Done' ? (
                        <Button
                          variant="success"
                          size="sm"
                          icon={CheckCircle2}
                          loading={actionLoading}
                          onClick={() => handleValidateTransfer(t.id)}
                        >
                          Execute Transfer
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Initiate Internal Stock Transfer" maxWidth="max-w-3xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">From Warehouse (Origin) *</label>
              <select
                required
                value={formData.fromWarehouseId}
                onChange={(e) => setFormData({ ...formData, fromWarehouseId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
              >
                <option value="">Select Origin Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">From Rack Location</label>
              <select
                value={formData.fromLocationId}
                onChange={(e) => setFormData({ ...formData, fromLocationId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
              >
                <option value="">Select Origin Rack</option>
                {locations
                  .filter((l) => !formData.fromWarehouseId || l.warehouseId === Number(formData.fromWarehouseId))
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-3 rounded-xl border border-blue-200">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">To Warehouse (Destination) *</label>
              <select
                required
                value={formData.toWarehouseId}
                onChange={(e) => setFormData({ ...formData, toWarehouseId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
              >
                <option value="">Select Destination Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">To Rack Location</label>
              <select
                value={formData.toLocationId}
                onChange={(e) => setFormData({ ...formData, toLocationId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
              >
                <option value="">Select Destination Rack</option>
                {locations
                  .filter((l) => !formData.toWarehouseId || l.warehouseId === Number(formData.toWarehouseId))
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Notes / Reason</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder="e.g. Replenish Assembly Rack for shift #2"
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-700">Materials to Transfer</span>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Material
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {formData.lines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <select
                    required
                    value={line.productId}
                    onChange={(e) => handleLineChange(idx, 'productId', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded border text-xs bg-white"
                  >
                    <option value="">Select Material *</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — Available: {p.currentStock}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Qty"
                    value={line.quantity}
                    onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                    className="w-28 px-2 py-1.5 rounded border text-xs"
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
            <Button type="submit" loading={actionLoading} variant="primary">
              Create Transfer Movement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
