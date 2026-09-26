import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Eye, ArrowDownToLine, Trash, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { receiptsApi, settingsApi, productsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const ReceiptList = () => {
  const [searchParams] = useSearchParams();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Creation modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);

  const [formData, setFormData] = useState({
    supplierId: '',
    notes: '',
    status: 'Draft',
    lines: [{ productId: '', locationId: '', expectedQty: 100 }],
  });
  const [saving, setSaving] = useState(false);

  const fetchReceipts = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await receiptsApi.getAll(params);
      if (res.data?.success) {
        setReceipts(res.data.receipts || []);
      }
    } catch (err) {
      console.error('Failed to load receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [supRes, prodRes, locRes] = await Promise.all([
        settingsApi.getSuppliers(),
        productsApi.getAll({ limit: 100 }),
        settingsApi.getLocations(),
      ]);
      if (supRes.data?.success) setSuppliers(supRes.data.suppliers || []);
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
    fetchReceipts();
  }, [statusFilter, search]);

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      const prefillProd = searchParams.get('productId');
      if (prefillProd) {
        setFormData((prev) => ({
          ...prev,
          lines: [{ productId: Number(prefillProd), locationId: '', expectedQty: 100 }],
        }));
      }
      setCreateModalOpen(true);
    }
  }, [searchParams]);

  const handleAddLine = () => {
    setFormData((prev) => ({
      ...prev,
      lines: [...prev.lines, { productId: '', locationId: '', expectedQty: 50 }],
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
    if (formData.lines.some((l) => !l.productId || l.expectedQty <= 0)) {
      toast.error('Please select a valid product and quantity for each line');
      return;
    }

    setSaving(true);
    try {
      await receiptsApi.create({
        supplierId: formData.supplierId ? Number(formData.supplierId) : null,
        notes: formData.notes,
        status: formData.status,
        lines: formData.lines.map((l) => ({
          productId: Number(l.productId),
          locationId: l.locationId ? Number(l.locationId) : null,
          expectedQty: Number(l.expectedQty),
          receivedQty: Number(l.expectedQty),
        })),
      });
      toast.success('Incoming receipt created');
      setCreateModalOpen(false);
      setFormData({
        supplierId: '',
        notes: '',
        status: 'Draft',
        lines: [{ productId: '', locationId: '', expectedQty: 100 }],
      });
      fetchReceipts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create receipt');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Incoming Goods (Receipts)</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Receive purchase orders from vendors and log them directly into stock
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setCreateModalOpen(true)}>
          New Receipt Order
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
            placeholder="Search by supplier or notes..."
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
          <option value="Ready">Ready</option>
          <option value="Done">Done (Validated)</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Receipt #</th>
                <th className="px-6 py-3.5">Supplier / Vendor</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Line Items</th>
                <th className="px-6 py-3.5">Created Date</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading receipts...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No receipts found.
                  </td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      <Link to={`/receipts/${r.id}`} className="hover:text-brand-600">
                        REC-{r.id.toString().padStart(4, '0')}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {r.supplier?.name || 'Standard Vendor'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={r.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {r.lines?.length || 0} product line(s)
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/receipts/${r.id}`}
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

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Goods Receipt" maxWidth="max-w-3xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Supplier / Vendor</label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
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
                <option value="Waiting">Waiting (Shipped by Vendor)</option>
                <option value="Ready">Ready (At Receiving Dock)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Notes / PO Reference</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder="e.g. PO #104 - Scheduled truck arrival dock 3"
            />
          </div>

          {/* Product Lines Dynamic List */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-700">Line Items</span>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line
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
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>

                  <select
                    value={line.locationId}
                    onChange={(e) => handleLineChange(idx, 'locationId', e.target.value)}
                    className="w-48 px-2.5 py-1.5 rounded border text-xs bg-white"
                  >
                    <option value="">Destination Rack</option>
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
                    value={line.expectedQty}
                    onChange={(e) => handleLineChange(idx, 'expectedQty', e.target.value)}
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
              Save Receipt
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
