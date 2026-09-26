import React, { useState, useEffect } from 'react';
import { Download, Filter, Search, BookOpenText, Calendar, Warehouse, Package } from 'lucide-react';
import { ledgerApi, productsApi, settingsApi } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const StockLedger = () => {
  const { lastStockUpdate } = useSocket();

  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [operationType, setOperationType] = useState('');

  // Dropdown data
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (productId) params.productId = productId;
      if (warehouseId) params.warehouseId = warehouseId;
      if (operationType) params.operationType = operationType;

      const res = await ledgerApi.getAll(params);
      if (res.data?.success) {
        setEntries(res.data.entries || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load stock ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [prodRes, whRes] = await Promise.all([
        productsApi.getAll({ limit: 100 }),
        settingsApi.getWarehouses(),
      ]);
      if (prodRes.data?.success) setProducts(prodRes.data.products || []);
      if (whRes.data?.success) setWarehouses(whRes.data.warehouses || []);
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [page, startDate, endDate, productId, warehouseId, operationType]);

  useEffect(() => {
    if (lastStockUpdate) {
      fetchLedger();
    }
  }, [lastStockUpdate]);

  const handleExportCsv = () => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (productId) params.productId = productId;
    if (warehouseId) params.warehouseId = warehouseId;
    if (operationType) params.operationType = operationType;

    const url = ledgerApi.exportCsvUrl(params);
    window.open(url, '_blank');
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setProductId('');
    setWarehouseId('');
    setOperationType('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stock Ledger</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              Double-Entry Heart
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Complete, immutable audit trail of every unit movement ever recorded
          </p>
        </div>
        <Button variant="outline" icon={Download} onClick={handleExportCsv}>
          Export Filtered CSV
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Product */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">Product</label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">Warehouse</label>
            <select
              value={warehouseId}
              onChange={(e) => {
                setWarehouseId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Operation */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">Operation Type</label>
            <select
              value={operationType}
              onChange={(e) => {
                setOperationType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">All Operations</option>
              <option value="RECEIPT">Inbound (Receipt)</option>
              <option value="DELIVERY">Outbound (Delivery)</option>
              <option value="TRANSFER_IN">Transfer In</option>
              <option value="TRANSFER_OUT">Transfer Out</option>
              <option value="ADJUSTMENT">Stock Adjustment</option>
            </select>
          </div>
        </div>

        {(startDate || endDate || productId || warehouseId || operationType) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={resetFilters}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4">Warehouse & Rack Location</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4 font-right">Delta Change</th>
                <th className="py-3 px-4">Source Reference</th>
                <th className="py-3 px-4">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Querying ledger entries...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No ledger records match the selected criteria.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {entry.product?.name}
                      <span className="block font-mono text-[10px] text-slate-400">{entry.product?.sku}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-medium text-slate-900">{entry.warehouse?.name || 'Unassigned'}</span>
                      {entry.location && (
                        <span className="block text-[10px] text-slate-400">
                          {entry.location.name} ({entry.location.aisle}-{entry.location.rack}-{entry.location.shelf})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={entry.operationType} />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sm">
                      <span
                        className={
                          entry.quantityChange > 0
                            ? 'text-emerald-600'
                            : entry.quantityChange < 0
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }
                      >
                        {entry.quantityChange > 0 ? `+${entry.quantityChange}` : entry.quantityChange}{' '}
                        <span className="text-[10px] font-normal text-slate-400">
                          {entry.product?.uom?.abbreviation || ''}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {entry.referenceType ? (
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {entry.referenceType.toUpperCase()} #{entry.referenceId}
                        </span>
                      ) : (
                        '—'
                      )}
                      {entry.notes && <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{entry.notes}</p>}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {entry.creator?.name || 'System Operator'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Showing page {page} of {totalPages} ({total} movements)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
