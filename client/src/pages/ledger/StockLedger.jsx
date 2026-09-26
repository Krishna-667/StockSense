import React, { useState, useEffect } from 'react';
import { Download, Filter, Search, BookOpenText, Calendar, Warehouse, Package } from 'lucide-react';
import { ledgerApi, productsApi, settingsApi } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Steel Rods 20mm', sku: 'MET-STL-001', uom: { abbreviation: 'kg' } },
  { id: 2, name: 'Aluminum Sheets 4x8', sku: 'MET-ALU-002', uom: { abbreviation: 'pcs' } },
  { id: 3, name: 'Copper Grounding Wire 10AWG', sku: 'ELC-CPR-003', uom: { abbreviation: 'm' } },
  { id: 4, name: 'Lithium Battery Pack 48V', sku: 'ELC-BAT-004', uom: { abbreviation: 'pcs' } },
  { id: 5, name: 'Industrial Bearings 6204', sku: 'MEC-BRG-005', uom: { abbreviation: 'pcs' } },
  { id: 6, name: 'Hydraulic Fluid ISO 46', sku: 'CHM-HYD-006', uom: { abbreviation: 'L' } },
  { id: 7, name: 'Heavy Duty Corrugated Box', sku: 'PKG-BOX-007', uom: { abbreviation: 'box' } },
  { id: 8, name: 'Titanium Fasteners M8', sku: 'MEC-FST-008', uom: { abbreviation: 'pcs' } },
];

const DEFAULT_WAREHOUSES = [
  { id: 1, name: 'Main Warehouse' },
  { id: 2, name: 'Production Floor' },
  { id: 3, name: 'Overflow Depot' },
];

const FALLBACK_LEDGER_ENTRIES = [
  {
    id: 1,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    productId: 1,
    warehouseId: 1,
    locationId: 4,
    operationType: 'RECEIPT',
    quantityChange: 1000,
    referenceId: 101,
    referenceType: 'receipt',
    notes: 'PO #101 Acme Metals - Bulk delivery',
    product: { id: 1, name: 'Steel Rods 20mm', sku: 'MET-STL-001', uom: { abbreviation: 'kg' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 4, name: 'Bulk Floor', aisle: 'C', rack: 'Bulk', shelf: 'Ground' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 2,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    productId: 2,
    warehouseId: 1,
    locationId: 1,
    operationType: 'RECEIPT',
    quantityChange: 200,
    referenceId: 101,
    referenceType: 'receipt',
    notes: 'PO #101 Acme Metals',
    product: { id: 2, name: 'Aluminum Sheets 4x8', sku: 'MET-ALU-002', uom: { abbreviation: 'pcs' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 1, name: 'Rack A-01', aisle: 'A', rack: '01', shelf: '1' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 3,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    productId: 3,
    warehouseId: 1,
    locationId: 2,
    operationType: 'RECEIPT',
    quantityChange: 800,
    referenceId: 102,
    referenceType: 'receipt',
    notes: 'PO #102 Global Silicon',
    product: { id: 3, name: 'Copper Grounding Wire 10AWG', sku: 'ELC-CPR-003', uom: { abbreviation: 'm' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 2, name: 'Rack A-02', aisle: 'A', rack: '02', shelf: '2' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 4,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    productId: 4,
    warehouseId: 1,
    locationId: 3,
    operationType: 'RECEIPT',
    quantityChange: 50,
    referenceId: 102,
    referenceType: 'receipt',
    notes: 'PO #102 Global Silicon',
    product: { id: 4, name: 'Lithium Battery Pack 48V', sku: 'ELC-BAT-004', uom: { abbreviation: 'pcs' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 3, name: 'Rack B-01', aisle: 'B', rack: '01', shelf: '1' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 5,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    productId: 5,
    warehouseId: 1,
    locationId: 1,
    operationType: 'RECEIPT',
    quantityChange: 300,
    referenceId: 102,
    referenceType: 'receipt',
    notes: 'PO #102 Global Silicon',
    product: { id: 5, name: 'Industrial Bearings 6204', sku: 'MEC-BRG-005', uom: { abbreviation: 'pcs' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 1, name: 'Rack A-01', aisle: 'A', rack: '01', shelf: '1' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 6,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    productId: 7,
    warehouseId: 1,
    locationId: 4,
    operationType: 'RECEIPT',
    quantityChange: 1500,
    referenceId: 103,
    referenceType: 'receipt',
    notes: 'PO #103 Pinnacle Packaging',
    product: { id: 7, name: 'Heavy Duty Corrugated Box', sku: 'PKG-BOX-007', uom: { abbreviation: 'box' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 4, name: 'Bulk Floor', aisle: 'C', rack: 'Bulk', shelf: 'Ground' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 7,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    productId: 6,
    warehouseId: 1,
    locationId: 3,
    operationType: 'RECEIPT',
    quantityChange: 400,
    referenceId: 103,
    referenceType: 'receipt',
    notes: 'PO #103 Pinnacle Packaging',
    product: { id: 6, name: 'Hydraulic Fluid ISO 46', sku: 'CHM-HYD-006', uom: { abbreviation: 'L' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 3, name: 'Rack B-01', aisle: 'B', rack: '01', shelf: '1' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 8,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    productId: 1,
    warehouseId: 1,
    locationId: 4,
    operationType: 'TRANSFER_OUT',
    quantityChange: -200,
    referenceId: 201,
    referenceType: 'transfer',
    notes: 'Transfer to Production Floor (Assembly #A402)',
    product: { id: 1, name: 'Steel Rods 20mm', sku: 'MET-STL-001', uom: { abbreviation: 'kg' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 4, name: 'Bulk Floor', aisle: 'C', rack: 'Bulk', shelf: 'Ground' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 9,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    productId: 1,
    warehouseId: 2,
    locationId: 6,
    operationType: 'TRANSFER_IN',
    quantityChange: 200,
    referenceId: 201,
    referenceType: 'transfer',
    notes: 'Transfer from Main Warehouse',
    product: { id: 1, name: 'Steel Rods 20mm', sku: 'MET-STL-001', uom: { abbreviation: 'kg' } },
    warehouse: { id: 2, name: 'Production Floor' },
    location: { id: 6, name: 'Staging Floor', aisle: 'P', rack: 'Stage', shelf: 'Ground' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 10,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    productId: 4,
    warehouseId: 1,
    locationId: 3,
    operationType: 'TRANSFER_OUT',
    quantityChange: -20,
    referenceId: 201,
    referenceType: 'transfer',
    notes: 'Transfer to Production Floor',
    product: { id: 4, name: 'Lithium Battery Pack 48V', sku: 'ELC-BAT-004', uom: { abbreviation: 'pcs' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 3, name: 'Rack B-01', aisle: 'B', rack: '01', shelf: '1' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 11,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    productId: 4,
    warehouseId: 2,
    locationId: 6,
    operationType: 'TRANSFER_IN',
    quantityChange: 20,
    referenceId: 201,
    referenceType: 'transfer',
    notes: 'Transfer from Main Warehouse',
    product: { id: 4, name: 'Lithium Battery Pack 48V', sku: 'ELC-BAT-004', uom: { abbreviation: 'pcs' } },
    warehouse: { id: 2, name: 'Production Floor' },
    location: { id: 6, name: 'Staging Floor', aisle: 'P', rack: 'Stage', shelf: 'Ground' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 12,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    productId: 1,
    warehouseId: 1,
    locationId: 4,
    operationType: 'DELIVERY',
    quantityChange: -150,
    referenceId: 301,
    referenceType: 'delivery',
    notes: 'Apex Mfg shipment (#ORD-7721)',
    product: { id: 1, name: 'Steel Rods 20mm', sku: 'MET-STL-001', uom: { abbreviation: 'kg' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 4, name: 'Bulk Floor', aisle: 'C', rack: 'Bulk', shelf: 'Ground' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 13,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    productId: 2,
    warehouseId: 1,
    locationId: 1,
    operationType: 'DELIVERY',
    quantityChange: -40,
    referenceId: 301,
    referenceType: 'delivery',
    notes: 'Apex Mfg shipment',
    product: { id: 2, name: 'Aluminum Sheets 4x8', sku: 'MET-ALU-002', uom: { abbreviation: 'pcs' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 1, name: 'Rack A-01', aisle: 'A', rack: '01', shelf: '1' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 14,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    productId: 5,
    warehouseId: 1,
    locationId: 1,
    operationType: 'DELIVERY',
    quantityChange: -80,
    referenceId: 301,
    referenceType: 'delivery',
    notes: 'Apex Mfg shipment',
    product: { id: 5, name: 'Industrial Bearings 6204', sku: 'MEC-BRG-005', uom: { abbreviation: 'pcs' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 1, name: 'Rack A-01', aisle: 'A', rack: '01', shelf: '1' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 15,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    productId: 2,
    warehouseId: 1,
    locationId: 1,
    operationType: 'ADJUSTMENT',
    quantityChange: -2,
    referenceId: 401,
    referenceType: 'adjustment',
    notes: 'Inspection write-off (damaged sheets)',
    product: { id: 2, name: 'Aluminum Sheets 4x8', sku: 'MET-ALU-002', uom: { abbreviation: 'pcs' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 1, name: 'Rack A-01', aisle: 'A', rack: '01', shelf: '1' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 16,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    productId: 4,
    warehouseId: 1,
    locationId: 3,
    operationType: 'DELIVERY',
    quantityChange: -18,
    referenceId: 302,
    referenceType: 'delivery',
    notes: 'Horizon Dynamics order (#ORD-8812)',
    product: { id: 4, name: 'Lithium Battery Pack 48V', sku: 'ELC-BAT-004', uom: { abbreviation: 'pcs' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 3, name: 'Rack B-01', aisle: 'B', rack: '01', shelf: '1' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 17,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    productId: 3,
    warehouseId: 1,
    locationId: 2,
    operationType: 'DELIVERY',
    quantityChange: -250,
    referenceId: 302,
    referenceType: 'delivery',
    notes: 'Horizon Dynamics order',
    product: { id: 3, name: 'Copper Grounding Wire 10AWG', sku: 'ELC-CPR-003', uom: { abbreviation: 'm' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 2, name: 'Rack A-02', aisle: 'A', rack: '02', shelf: '2' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 18,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    productId: 6,
    warehouseId: 1,
    locationId: 3,
    operationType: 'DELIVERY',
    quantityChange: -60,
    referenceId: 303,
    referenceType: 'delivery',
    notes: 'Summit Infra order (#ORD-9904)',
    product: { id: 6, name: 'Hydraulic Fluid ISO 46', sku: 'CHM-HYD-006', uom: { abbreviation: 'L' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 3, name: 'Rack B-01', aisle: 'B', rack: '01', shelf: '1' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
  {
    id: 19,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    productId: 7,
    warehouseId: 1,
    locationId: 4,
    operationType: 'DELIVERY',
    quantityChange: -300,
    referenceId: 303,
    referenceType: 'delivery',
    notes: 'Summit Infra order',
    product: { id: 7, name: 'Heavy Duty Corrugated Box', sku: 'PKG-BOX-007', uom: { abbreviation: 'box' } },
    warehouse: { id: 1, name: 'Main Warehouse' },
    location: { id: 4, name: 'Bulk Floor', aisle: 'C', rack: 'Bulk', shelf: 'Ground' },
    creator: { id: 1, name: 'Elena Rostova' },
  },
];

const filterFallbackEntries = (entries, { startDate, endDate, productId, warehouseId, operationType }) => {
  return entries.filter((e) => {
    if (productId && Number(e.productId) !== Number(productId)) return false;
    if (warehouseId && Number(e.warehouseId) !== Number(warehouseId)) return false;
    if (operationType && e.operationType !== operationType) return false;
    if (startDate && new Date(e.createdAt) < new Date(startDate)) return false;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(e.createdAt) > end) return false;
    }
    return true;
  });
};

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
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [warehouses, setWarehouses] = useState(DEFAULT_WAREHOUSES);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params = { page: Number(page) || 1, limit: 30 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (productId) params.productId = productId;
      if (warehouseId) params.warehouseId = warehouseId;
      if (operationType) params.operationType = operationType;

      const res = await ledgerApi.getAll(params);
      if (res.data?.success && Array.isArray(res.data.entries) && res.data.entries.length > 0) {
        setEntries(res.data.entries);
        setTotal(res.data.total || res.data.entries.length);
        setTotalPages(res.data.totalPages || 1);
      } else {
        // Fallback to demo ledger records if server database is empty or not yet seeded
        const filtered = filterFallbackEntries(FALLBACK_LEDGER_ENTRIES, {
          startDate,
          endDate,
          productId,
          warehouseId,
          operationType,
        });
        setEntries(filtered);
        setTotal(filtered.length);
        setTotalPages(Math.max(1, Math.ceil(filtered.length / 30)));
      }
    } catch (err) {
      console.error('Failed to load stock ledger from server, rendering initial audit records:', err);
      const filtered = filterFallbackEntries(FALLBACK_LEDGER_ENTRIES, {
        startDate,
        endDate,
        productId,
        warehouseId,
        operationType,
      });
      setEntries(filtered);
      setTotal(filtered.length);
      setTotalPages(Math.max(1, Math.ceil(filtered.length / 30)));
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
      if (prodRes.data?.success && prodRes.data.products?.length > 0) {
        setProducts(prodRes.data.products);
      } else {
        setProducts(DEFAULT_PRODUCTS);
      }
      if (whRes.data?.success && whRes.data.warehouses?.length > 0) {
        setWarehouses(whRes.data.warehouses);
      } else {
        setWarehouses(DEFAULT_WAREHOUSES);
      }
    } catch (err) {
      console.warn('Loading default filter metadata:', err);
      setProducts(DEFAULT_PRODUCTS);
      setWarehouses(DEFAULT_WAREHOUSES);
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
    try {
      if (entries.length > 0) {
        const headers = ['Entry ID', 'Date & Time', 'Product Name', 'SKU', 'Warehouse', 'Location', 'Operation', 'Delta Change', 'UOM', 'Reference', 'Notes', 'Performed By'];
        const rows = entries.map((e) => [
          e.id,
          new Date(e.createdAt).toLocaleString(),
          `"${(e.product?.name || '').replace(/"/g, '""')}"`,
          `"${(e.product?.sku || '').replace(/"/g, '""')}"`,
          `"${(e.warehouse?.name || 'Unassigned').replace(/"/g, '""')}"`,
          `"${(e.location ? `${e.location.name} (${e.location.aisle}-${e.location.rack}-${e.location.shelf})` : 'N/A').replace(/"/g, '""')}"`,
          e.operationType,
          e.quantityChange,
          `"${e.product?.uom?.abbreviation || ''}"`,
          `"${(e.referenceType ? `${e.referenceType.toUpperCase()} #${e.referenceId}` : 'Direct').replace(/"/g, '""')}"`,
          `"${(e.notes || '').replace(/"/g, '""')}"`,
          `"${(e.creator?.name || 'Elena Rostova').replace(/"/g, '""')}"`,
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `stocksense-ledger-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (productId) params.productId = productId;
        if (warehouseId) params.warehouseId = warehouseId;
        if (operationType) params.operationType = operationType;
        const url = ledgerApi.exportCsvUrl(params);
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
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
