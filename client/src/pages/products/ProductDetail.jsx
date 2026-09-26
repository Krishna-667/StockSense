import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Boxes,
  ArrowLeft,
  Warehouse,
  MapPin,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  Edit,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi, settingsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager } = useAuth();

  const [product, setProduct] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uoms, setUoms] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    uomId: '',
    reorderLevel: 10,
    description: '',
  });

  const fetchProduct = async () => {
    try {
      const [prodRes, ledgerRes] = await Promise.all([
        productsApi.getById(id),
        productsApi.getLedger(id),
      ]);

      if (prodRes.data?.success) {
        setProduct(prodRes.data.product);
        setFormData({
          name: prodRes.data.product.name,
          sku: prodRes.data.product.sku,
          categoryId: prodRes.data.product.categoryId || '',
          uomId: prodRes.data.product.uomId || '',
          reorderLevel: prodRes.data.product.reorderLevel,
          description: prodRes.data.product.description || '',
        });
      }
      if (ledgerRes.data?.success) {
        setLedger(ledgerRes.data.ledger || []);
      }
    } catch (err) {
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    settingsApi.getCategories().then((res) => {
      if (res.data?.success) setCategories(res.data.categories || []);
    });
    settingsApi.getUOMs().then((res) => {
      if (res.data?.success) setUoms(res.data.uoms || []);
    });
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await productsApi.update(id, {
        ...formData,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        uomId: formData.uomId ? Number(formData.uomId) : null,
        reorderLevel: Number(formData.reorderLevel),
      });
      toast.success('Product updated successfully');
      setEditModalOpen(false);
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading product details and rack locations...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products Catalog
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Edit} onClick={() => setEditModalOpen(true)}>
            Edit Product
          </Button>
        </div>
      </div>

      {/* Main Product Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
              <Badge variant={product.stockStatus} />
            </div>
            <p className="text-sm font-mono text-slate-400 mt-1">SKU: {product.sku}</p>
            {product.description && (
              <p className="text-xs text-slate-600 mt-2 max-w-2xl">{product.description}</p>
            )}
          </div>

          <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 shrink-0">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Total Available Stock
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-0.5">
                {product.currentStock}{' '}
                <span className="text-sm font-medium text-slate-500">
                  {product.uom?.abbreviation || 'pcs'}
                </span>
              </p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Reorder Point
              </p>
              <p className="text-xl font-bold text-slate-700 mt-0.5">
                {product.reorderLevel}{' '}
                <span className="text-xs font-normal text-slate-500">
                  {product.uom?.abbreviation || 'pcs'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rack-Level Stock Breakdown per Warehouse */}
      <Card
        title="Location Availability (Per Warehouse & Rack)"
        subtitle="Stock ledger distribution across warehouses and specific shelf slots"
      >
        {(!product.stockBreakdown || product.stockBreakdown.length === 0) ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No stock has been received at any warehouse yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.stockBreakdown.map((wh) => (
              <div
                key={wh.warehouseId}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-slate-800 text-sm">{wh.warehouseName}</span>
                  </div>
                  <span className="font-bold text-sm text-slate-900">
                    {wh.totalStock} {product.uom?.abbreviation}
                  </span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {wh.locations.length === 0 ? (
                    <p className="text-xs text-slate-400">No specific rack recorded</p>
                  ) : (
                    wh.locations.map((loc) => (
                      <div key={loc.locationId} className="bg-white p-2.5 rounded-lg border border-slate-100">
                        <ProgressBar
                          current={loc.stock}
                          target={Math.max(product.reorderLevel, loc.stock)}
                          label={`${loc.locationName} (${loc.aisle || 'N/A'}-${loc.rack || 'N/A'}-${loc.shelf || 'N/A'})`}
                          showValue={true}
                          uom={product.uom?.abbreviation}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Movement History / Audit Ledger for this Product */}
      <Card
        title="Product Movement History"
        subtitle="Immutable ledger log of receipts, deliveries, transfers, and physical counts"
      >
        {ledger.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-400">No ledger entries recorded for this item.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Operation</th>
                  <th className="py-2.5 px-4">Warehouse & Rack</th>
                  <th className="py-2.5 px-4">Quantity Change</th>
                  <th className="py-2.5 px-4">Notes / Reference</th>
                  <th className="py-2.5 px-4">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge variant={entry.operationType} />
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">
                      {entry.warehouse?.name || 'Unassigned'}
                      {entry.location && ` · ${entry.location.name}`}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold">
                      <span className={entry.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {entry.quantityChange > 0 ? `+${entry.quantityChange}` : entry.quantityChange}{' '}
                        {product.uom?.abbreviation}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{entry.notes || '—'}</td>
                    <td className="py-2.5 px-4 text-slate-500">{entry.creator?.name || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Product Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Product Details">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">SKU</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">UOM</label>
              <select
                value={formData.uomId}
                onChange={(e) => setFormData({ ...formData, uomId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
              >
                <option value="">Select UOM</option>
                {uoms.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Reorder Level</label>
              <input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
