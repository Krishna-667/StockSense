import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { receiptsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Stepper } from '../../components/ui/Stepper';

export const ReceiptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager, user } = useAuth();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReceipt = async () => {
    try {
      const res = await receiptsApi.getById(id);
      if (res.data?.success) {
        setReceipt(res.data.receipt);
      }
    } catch (err) {
      toast.error('Failed to load receipt');
      navigate('/receipts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      await receiptsApi.update(id, { status: newStatus });
      toast.success(`Receipt marked as ${newStatus}`);
      fetchReceipt();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!isManager) {
      toast.error('Only Inventory Managers can validate incoming receipts');
      return;
    }

    setActionLoading(true);
    try {
      const res = await receiptsApi.validate(id);
      toast.success(res.data?.message || 'Receipt validated! Stock has been added to the ledger.');
      fetchReceipt();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Validation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this receipt?')) return;
    setActionLoading(true);
    try {
      await receiptsApi.cancel(id);
      toast.success('Receipt cancelled');
      fetchReceipt();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel receipt');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading receipt workflow...</p>
      </div>
    );
  }

  if (!receipt) return null;

  const steps = [
    { name: 'Draft', desc: 'Creation' },
    { name: 'Waiting', desc: 'In Transit' },
    { name: 'Ready', desc: 'At Dock' },
    { name: 'Done', desc: 'Stock Ledger' },
  ];

  const currentStepMap = {
    Draft: 1,
    Waiting: 2,
    Ready: 3,
    Done: 4,
    Cancelled: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top back link & actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/receipts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Receipts
        </Link>

        {receipt.status !== 'Done' && receipt.status !== 'Cancelled' && (
          <div className="flex items-center gap-2">
            {receipt.status === 'Draft' && (
              <Button
                variant="outline"
                size="sm"
                loading={actionLoading}
                onClick={() => handleUpdateStatus('Waiting')}
              >
                Mark In-Transit (Waiting)
              </Button>
            )}
            {receipt.status === 'Waiting' && (
              <Button
                variant="outline"
                size="sm"
                loading={actionLoading}
                onClick={() => handleUpdateStatus('Ready')}
              >
                Mark Arrived at Dock (Ready)
              </Button>
            )}

            {/* Validate Button */}
            {isManager ? (
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle2}
                loading={actionLoading}
                onClick={handleValidate}
              >
                Validate Receipt & Increase Stock
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Manager Validation Required</span>
              </div>
            )}

            <Button
              variant="danger"
              size="sm"
              icon={XCircle}
              loading={actionLoading}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono text-slate-900">
                REC-{receipt.id.toString().padStart(4, '0')}
              </h1>
              <Badge variant={receipt.status} />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Vendor: <strong className="text-slate-700">{receipt.supplier?.name || 'Standard Vendor'}</strong>
              {receipt.supplier?.email && ` (${receipt.supplier.email})`}
            </p>
            {receipt.notes && (
              <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                Notes: {receipt.notes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-400 uppercase text-[10px]">Created By</p>
              <p className="font-medium text-slate-700 mt-0.5">{receipt.creator?.name || 'Staff'}</p>
            </div>
            {receipt.validatedBy && (
              <>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <p className="font-semibold text-slate-400 uppercase text-[10px]">Validated By</p>
                  <p className="font-medium text-emerald-700 mt-0.5">
                    {receipt.validator?.name || 'Elena Rostova'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Workflow Progression Stepper */}
        <div className="pt-2">
          <Stepper
            steps={steps}
            currentStep={currentStepMap[receipt.status] || 1}
            status={receipt.status}
          />
        </div>
      </div>

      {/* Line Items Table */}
      <Card title="Incoming Product Line Items" subtitle="Verified units to be credited to the stock ledger">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4">Assigned Warehouse & Rack</th>
                <th className="py-3 px-4">Expected Quantity</th>
                <th className="py-3 px-4">Received Quantity</th>
                <th className="py-3 px-4">Ledger Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipt.lines.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    <Link to={`/products/${line.product.id}`} className="hover:text-brand-600">
                      {line.product.name}
                    </Link>
                    <span className="block text-xs font-mono text-slate-400">{line.product.sku}</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {line.location?.warehouse?.name || 'Main Warehouse'}
                    {line.location && (
                      <span className="block text-[11px] text-slate-400">
                        Rack: {line.location.name} ({line.location.aisle}-{line.location.rack}-{line.location.shelf})
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                    {line.expectedQty} {line.product.uom?.abbreviation}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                    {line.receivedQty} {line.product.uom?.abbreviation}
                  </td>
                  <td className="py-3.5 px-4">
                    {receipt.status === 'Done' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Posted (+{line.receivedQty})
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Pending Validation</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
