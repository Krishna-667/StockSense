import React, { useState, useEffect } from 'react';
import { Plus, SlidersHorizontal, CheckCircle2, Search, Trash, AlertTriangle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { adjustmentsApi, settingsApi, productsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const AdjustmentList = () => {
  const { isManager } = useAuth();
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    warehouseId: '',
    locationId: '',
    reason: 'Physical Count Discrepancy',
    notes: '',
    lines: [{ productId: '', recordedQty: 0, physicalQty: 0, deltaQty: 0 }],
  });

  const fetchAdjustments = async () => {
    try {
      const res = await adjustmentsApi.getAll();
      if (res.data?.success) {
        setAdjustments(res.data.adjustments || []);
      }
    } catch (err) {
      console.error('Failed to load adjustments:', err);
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
    fetchAdjustments();
    fetchMetadata();
  }, []);

  const handleProductSelect = (idx, productId) => {
    const prod = products.find((p) => p.id === Number(productId));
    const recorded = prod ? prod.currentStock : 0;
    setFormData((prev) => {
      const updated = [...prev.lines];
      updated[idx] = {
        ...updated[idx],
        productId,
        recordedQty: recorded,
        physicalQty: recorded,
        deltaQty: 0,
      };
      return { ...prev, lines: updated };
    });
  };

  const handlePhysicalQtyChange = (idx, physicalQty) => {
    const pQty = parseFloat(physicalQty) || 0;
    setFormData((prev) => {
      const updated = [...prev.lines];
      const rQty = updated[idx].recordedQty || 0;
      updated[idx] = {
        ...updated[idx],
        physicalQty: pQty,
        deltaQty: pQty - rQty, // Auto-computes delta!
      };
      return { ...prev, lines: updated };
    });
  };

  const handleAddLine = () => {
    setFormData((prev) => ({
      ...prev,
      lines: [...prev.lines, { productId: '', recordedQty: 0, physicalQty: 0, deltaQty: 0 }],
    }));
  };

  const handleRemoveLine = (idx) => {
    if (formData.lines.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx),
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.warehouseId) {
      toast.error('Warehouse is required');
      return;
    }
    if (formData.lines.some((l) => !l.productId)) {
      toast.error('Select a valid product for each line');
      return;
    }

    setActionLoading(true);
    try {
      await adjustmentsApi.create({
        warehouseId: Number(formData.warehouseId),
        locationId: formData.locationId ? Number(formData.locationId) : null,
        reason: formData.reason,
        notes: formData.notes,
        lines: formData.lines.map((l) => ({
          productId: Number(l.productId),
          recordedQty: Number(l.recordedQty),
          physicalQty: Number(l.physicalQty),
        })),
      });
      toast.success('Stock adjustment draft created');
      setCreateModalOpen(false);
      setFormData({
        warehouseId: '',
        locationId: '',
        reason: 'Physical Count Discrepancy',
        notes: '',
        lines: [{ productId: '', recordedQty: 0, physicalQty: 0, deltaQty: 0 }],
      });
      fetchAdjustments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create adjustment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidateAdjustment = async (id) => {
    if (!isManager) {
      toast.error('Only Inventory Managers can validate stock adjustments');
      return;
    }

    setActionLoading(true);
    try {
      const res = await adjustmentsApi.validate(id);
      toast.success(res.data?.message || 'Adjustment applied to ledger successfully!');
      fetchAdjustments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply adjustment');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stock Adjustments</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Reconcile physical inventory counts with recorded ledger balances
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setCreateModalOpen(true)}>
          New Stock Adjustment
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Adjustment #</th>
                <th className="px-6 py-3.5">Warehouse & Location</th>
                <th className="px-6 py-3.5">Reason</th>
                <th className="px-6 py-3.5">Count & Delta</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading adjustments...
                  </td>
                </tr>
              ) : adjustments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No adjustments found.
                  </td>
                </tr>
              ) : (
                adjustments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      ADJ-{a.id.toString().padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">
                      <span className="font-semibold block text-slate-900">{a.warehouse?.name}</span>
                      {a.location && <span className="text-[11px] text-slate-400">Rack: {a.location.name}</span>}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700 font-medium">
                      {a.reason}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">
                      {a.lines?.map((l) => (
                        <div key={l.id} className="flex items-center gap-2">
                          <span className="text-slate-600 font-medium">{l.product?.name}:</span>
                          <span className="text-slate-400">Rec: {l.recordedQty}</span>
                          <span className="text-slate-800">Phys: {l.physicalQty}</span>
                          <span className={`font-bold ${l.deltaQty > 0 ? 'text-emerald-600' : l.deltaQty < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            ({l.deltaQty > 0 ? `+${l.deltaQty}` : l.deltaQty})
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={a.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {a.status !== 'Done' ? (
                        isManager ? (
                          <Button
                            variant="success"
                            size="sm"
                            icon={CheckCircle2}
                            loading={actionLoading}
                            onClick={() => handleValidateAdjustment(a.id)}
                          >
                            Validate & Reconcile
                          </Button>
                        ) : (
                          <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md font-medium border border-amber-200">
                            Manager Approval Needed
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
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

      {/* Create Adjustment Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="New Physical Count Adjustment" maxWidth="max-w-3xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Target Warehouse *</label>
              <select
                required
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Rack Location (Optional)</label>
              <select
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
              >
                <option value="">All Locations in Warehouse</option>
                {locations
                  .filter((l) => !formData.warehouseId || l.warehouseId === Number(formData.warehouseId))
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Reason for Adjustment *</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
              >
                <option value="Physical Count Discrepancy">Physical Count Discrepancy</option>
                <option value="Damaged Goods Write-off">Damaged Goods Write-off</option>
                <option value="Expired Stock Removal">Expired Stock Removal</option>
                <option value="Annual Stocktake Audit">Annual Stocktake Audit</option>
                <option value="Packaging Breakage">Packaging Breakage</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Audit Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                placeholder="e.g. Found during safety inspection"
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-700">Count Comparison (Delta Auto-Calculated)</span>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {formData.lines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <select
                    required
                    value={line.productId}
                    onChange={(e) => handleProductSelect(idx, e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded border text-xs bg-white"
                  >
                    <option value="">Select Product *</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>

                  <div className="text-xs text-slate-500 font-mono w-24">
                    Rec: <strong className="text-slate-800">{line.recordedQty}</strong>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">Phys:</span>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="Physical"
                      value={line.physicalQty}
                      onChange={(e) => handlePhysicalQtyChange(idx, e.target.value)}
                      className="w-20 px-2 py-1.5 rounded border text-xs text-center font-mono font-bold"
                    />
                  </div>

                  <div className="text-xs font-mono font-bold w-20 text-center">
                    Delta:{' '}
                    <span
                      className={
                        line.deltaQty > 0
                          ? 'text-emerald-600'
                          : line.deltaQty < 0
                          ? 'text-rose-600'
                          : 'text-slate-400'
                      }
                    >
                      {line.deltaQty > 0 ? `+${line.deltaQty}` : line.deltaQty}
                    </span>
                  </div>

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
              Create Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
