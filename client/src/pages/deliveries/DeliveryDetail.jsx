import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, ShieldCheck, BookmarkCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { deliveriesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Stepper } from '../../components/ui/Stepper';

export const DeliveryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager } = useAuth();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDelivery = async () => {
    try {
      const res = await deliveriesApi.getById(id);
      if (res.data?.success) {
        setDelivery(res.data.delivery);
      }
    } catch (err) {
      toast.error('Failed to load delivery order');
      navigate('/deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      await deliveriesApi.update(id, { status: newStatus });
      toast.success(`Delivery status updated to ${newStatus}`);
      fetchDelivery();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!isManager) {
      toast.error('Only Inventory Managers can validate outgoing delivery orders');
      return;
    }

    setActionLoading(true);
    try {
      const res = await deliveriesApi.validate(id);
      toast.success(res.data?.message || 'Delivery order validated! Stock deducted from ledger.');
      fetchDelivery();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Validation failed. Check available stock.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this delivery order?')) return;
    setActionLoading(true);
    try {
      await deliveriesApi.cancel(id);
      toast.success('Delivery order cancelled');
      fetchDelivery();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading delivery order workflow...</p>
      </div>
    );
  }

  if (!delivery) return null;

  const steps = [
    { name: 'Draft', desc: 'Planning' },
    { name: 'Picking', desc: 'Warehouse Floor' },
    { name: 'Packing & Ready', desc: 'Stock Reserved' },
    { name: 'Dispatched', desc: 'Stock Deducted' },
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
      <div className="flex items-center justify-between">
        <Link
          to="/deliveries"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Deliveries
        </Link>

        {delivery.status !== 'Done' && delivery.status !== 'Cancelled' && (
          <div className="flex items-center gap-2">
            {delivery.status === 'Draft' && (
              <Button
                variant="outline"
                size="sm"
                loading={actionLoading}
                onClick={() => handleUpdateStatus('Waiting')}
              >
                Send to Picking Floor
              </Button>
            )}
            {delivery.status === 'Waiting' && (
              <Button
                variant="outline"
                size="sm"
                icon={BookmarkCheck}
                loading={actionLoading}
                onClick={() => handleUpdateStatus('Ready')}
              >
                Mark Packed & Reserve Stock
              </Button>
            )}

            {isManager ? (
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle2}
                loading={actionLoading}
                onClick={handleValidate}
              >
                Validate & Dispatch Outbound Stock
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

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono text-slate-900">
                DEL-{delivery.id.toString().padStart(4, '0')}
              </h1>
              <Badge variant={delivery.status} />
              {delivery.status === 'Ready' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  <BookmarkCheck className="w-3.5 h-3.5 text-blue-600" /> Stock Reserved
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Customer: <strong className="text-slate-700">{delivery.customer?.name || 'Commercial Customer'}</strong>
              {delivery.customer?.address && ` · ${delivery.customer.address}`}
            </p>
            {delivery.notes && (
              <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                Notes: {delivery.notes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-400 uppercase text-[10px]">Created By</p>
              <p className="font-medium text-slate-700 mt-0.5">{delivery.creator?.name || 'Staff'}</p>
            </div>
            {delivery.validatedBy && (
              <>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <p className="font-semibold text-slate-400 uppercase text-[10px]">Validated By</p>
                  <p className="font-medium text-emerald-700 mt-0.5">{delivery.validator?.name}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stepper */}
        <div className="pt-2">
          <Stepper
            steps={steps}
            currentStep={currentStepMap[delivery.status] || 1}
            status={delivery.status}
          />
        </div>
      </div>

      {/* Items */}
      <Card title="Outbound Item Reservation & Packing List" subtitle="Verify quantities before final dispatch">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4">Source Warehouse & Rack</th>
                <th className="py-3 px-4">Requested Qty</th>
                <th className="py-3 px-4">Packed / Delivered Qty</th>
                <th className="py-3 px-4">Ledger Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {delivery.lines.map((line) => (
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
                    {line.requestedQty} {line.product.uom?.abbreviation}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {line.deliveredQty} {line.product.uom?.abbreviation}
                  </td>
                  <td className="py-3.5 px-4">
                    {delivery.status === 'Done' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" /> Deducted (-{line.deliveredQty})
                      </span>
                    ) : delivery.status === 'Ready' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        <BookmarkCheck className="w-3.5 h-3.5 text-blue-600" /> Reserved for Customer
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Pending Picking</span>
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
