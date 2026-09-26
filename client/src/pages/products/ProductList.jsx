import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi, settingsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';

export const ProductList = () => {
  const { isManager } = useAuth();
  const { lastStockUpdate } = useSocket();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // New product form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    uomId: '',
    reorderLevel: 10,
    description: '',
  });
  const [saving, setSaving] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchProducts = async () => {
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (stockStatus) params.stockStatus = stockStatus;

      const res = await productsApi.getAll(params);
      if (res.data?.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [catsRes, uomsRes] = await Promise.all([
        settingsApi.getCategories(),
        settingsApi.getUOMs(),
      ]);
      if (catsRes.data?.success) setCategories(catsRes.data.categories || []);
      if (uomsRes.data?.success) setUoms(uomsRes.data.uoms || []);
    } catch (err) {
      console.error('Failed to fetch metadata:', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, selectedCategory, stockStatus]);

  // Update on WebSocket stock update
  useEffect(() => {
    if (lastStockUpdate) {
      fetchProducts();
    }
  }, [lastStockUpdate]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      toast.error('Product name and SKU are required');
      return;
    }

    setSaving(true);
    try {
      await productsApi.create({
        ...formData,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        uomId: formData.uomId ? Number(formData.uomId) : null,
        reorderLevel: Number(formData.reorderLevel),
      });
      toast.success('Product created successfully');
      setCreateModalOpen(false);
      setFormData({ name: '', sku: '', categoryId: '', uomId: '', reorderLevel: 10, description: '' });
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const handleImportCsv = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('Please select a CSV file');
      return;
    }

    const data = new FormData();
    data.append('file', importFile);

    setImporting(true);
    try {
      const res = await productsApi.importCsv(data);
      if (res.data?.success) {
        toast.success(`Successfully imported ${res.data.importedCount} products!`);
        if (res.data.errors && res.data.errors.length > 0) {
          toast(res.data.errors.join('\n'), { icon: '⚠️', duration: 6000 });
        }
        setImportModalOpen(false);
        setImportFile(null);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'CSV Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate product "${name}"?`)) return;
    try {
      await productsApi.delete(id);
      toast.success('Product removed');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products & Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage SKU catalog and location-level stock availability
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href={productsApi.exportCsvUrl()}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
          <Button
            variant="outline"
            icon={Upload}
            onClick={() => setImportModalOpen(true)}
          >
            Import CSV
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            New Product
          </Button>
        </div>
      </div>

      {/* Filters & Inline Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Debounced Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or category..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Stock Levels</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Product & SKU</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Reorder Level</th>
                <th className="px-6 py-3.5 w-60">Stock Level</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading product inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/products/${p.id}`}
                        className="font-semibold text-slate-900 hover:text-brand-600 transition-colors block"
                      >
                        {p.name}
                      </Link>
                      <span className="text-xs font-mono text-slate-400 block mt-0.5">{p.sku}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {p.category?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {p.reorderLevel} {p.uom?.abbreviation || 'pcs'}
                    </td>
                    <td className="px-6 py-4">
                      <ProgressBar
                        current={p.currentStock}
                        target={p.reorderLevel * 2}
                        showValue={true}
                        uom={p.uom?.abbreviation || ''}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={p.stockStatus} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/${p.id}`}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {isManager && (
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deactivate Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Product Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Inventory Product"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Copper Grounding Wire"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                SKU (Unique Barcode/Code) *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase"
                placeholder="e.g. ELC-CPR-099"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Unit of Measure (UOM)
              </label>
              <select
                value={formData.uomId}
                onChange={(e) => setFormData({ ...formData, uomId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">Select Unit</option>
                {uoms.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.abbreviation})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Reorder Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Description & Specifications
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Material properties, vendor part numbers, or handling precautions..."
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} variant="primary">
              Create Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk CSV Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Bulk Import Products via CSV"
      >
        <form onSubmit={handleImportCsv} className="space-y-4">
          <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 text-center hover:border-brand-500 transition-colors">
            <FileSpreadsheet className="w-10 h-10 text-brand-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Choose CSV File to Upload</p>
            <p className="text-xs text-slate-500 mt-1">Columns: name, sku, category, uom, reorder_level, description</p>
            <input
              type="file"
              accept=".csv"
              required
              onChange={(e) => setImportFile(e.target.files[0])}
              className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" onClick={() => setImportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={importing} variant="primary">
              Process Bulk Import
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
