import React, { useState, useEffect } from 'react';
import { Warehouse, MapPin, Layers, Scale, Truck, Building, User, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const Settings = () => {
  const { user, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('warehouses');

  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Modals
  const [whModal, setWhModal] = useState(false);
  const [locModal, setLocModal] = useState(false);
  const [catModal, setCatModal] = useState(false);
  const [uomModal, setUomModal] = useState(false);
  const [supModal, setSupModal] = useState(false);
  const [custModal, setCustModal] = useState(false);

  // Forms
  const [whForm, setWhForm] = useState({ name: '', address: '', isActive: true });
  const [locForm, setLocForm] = useState({ warehouseId: '', name: '', aisle: '', rack: '', shelf: '' });
  const [catForm, setCatForm] = useState({ name: '', parentId: '' });
  const [uomForm, setUomForm] = useState({ name: '', abbreviation: '' });
  const [partyForm, setPartyForm] = useState({ name: '', email: '', phone: '', address: '' });

  const fetchAllSettings = async () => {
    try {
      const [whRes, locRes, catRes, uomRes, supRes, custRes] = await Promise.all([
        settingsApi.getWarehouses(),
        settingsApi.getLocations(),
        settingsApi.getCategories(),
        settingsApi.getUOMs(),
        settingsApi.getSuppliers(),
        settingsApi.getCustomers(),
      ]);

      if (whRes.data?.success) setWarehouses(whRes.data.warehouses || []);
      if (locRes.data?.success) setLocations(locRes.data.locations || []);
      if (catRes.data?.success) setCategories(catRes.data.categories || []);
      if (uomRes.data?.success) setUoms(uomRes.data.uoms || []);
      if (supRes.data?.success) setSuppliers(supRes.data.suppliers || []);
      if (custRes.data?.success) setCustomers(custRes.data.customers || []);
    } catch (err) {
      console.error('Failed to load settings data:', err);
    }
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      await settingsApi.createWarehouse(whForm);
      toast.success('Warehouse created');
      setWhModal(false);
      setWhForm({ name: '', address: '', isActive: true });
      fetchAllSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create warehouse');
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      await settingsApi.createLocation({
        ...locForm,
        warehouseId: Number(locForm.warehouseId),
      });
      toast.success('Location rack created');
      setLocModal(false);
      setLocForm({ warehouseId: '', name: '', aisle: '', rack: '', shelf: '' });
      fetchAllSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create location');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await settingsApi.createCategory({
        ...catForm,
        parentId: catForm.parentId ? Number(catForm.parentId) : null,
      });
      toast.success('Category created');
      setCatModal(false);
      setCatForm({ name: '', parentId: '' });
      fetchAllSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleCreateUOM = async (e) => {
    e.preventDefault();
    try {
      await settingsApi.createUOM(uomForm);
      toast.success('Unit of Measure created');
      setUomModal(false);
      setUomForm({ name: '', abbreviation: '' });
      fetchAllSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create UOM');
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      await settingsApi.createSupplier(partyForm);
      toast.success('Supplier added');
      setSupModal(false);
      setPartyForm({ name: '', email: '', phone: '', address: '' });
      fetchAllSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add supplier');
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await settingsApi.createCustomer(partyForm);
      toast.success('Customer added');
      setCustModal(false);
      setPartyForm({ name: '', email: '', phone: '', address: '' });
      fetchAllSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add customer');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Setup & Directories</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure warehouses, rack coordinates, product hierarchies, and partner books
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-4">
        {[
          { id: 'warehouses', label: 'Warehouses & Racks', icon: Warehouse },
          { id: 'categories', label: 'Product Categories', icon: Layers },
          { id: 'uoms', label: 'Units of Measure', icon: Scale },
          { id: 'partners', label: 'Suppliers & Customers', icon: Building },
          { id: 'profile', label: 'My Account & Roles', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Warehouses & Locations Tab */}
      {activeTab === 'warehouses' && (
        <div className="space-y-6">
          <Card
            title="Registered Warehouses"
            subtitle="Central facilities and manufacturing depots"
            action={
              isManager && (
                <Button size="sm" icon={Plus} onClick={() => setWhModal(true)}>
                  Add Warehouse
                </Button>
              )
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {warehouses.map((w) => (
                <div key={w.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900 text-sm">{w.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-200">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{w.address || 'Standard Hub'}</p>
                  <p className="text-xs text-brand-600 font-medium">
                    {locations.filter((l) => l.warehouseId === w.id).length} designated locations / racks
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Warehouse Rack Locations"
            subtitle="Aisle, Rack, and Shelf coordinates for precision placement"
            action={
              isManager && (
                <Button size="sm" icon={Plus} onClick={() => setLocModal(true)}>
                  Add Rack Slot
                </Button>
              )
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <th className="pb-2">Rack Name</th>
                    <th className="pb-2">Warehouse</th>
                    <th className="pb-2">Aisle</th>
                    <th className="pb-2">Rack</th>
                    <th className="pb-2">Shelf</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {locations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-semibold text-slate-800">{loc.name}</td>
                      <td className="py-2.5 text-slate-600">{loc.warehouse?.name}</td>
                      <td className="py-2.5 font-mono text-slate-500">{loc.aisle || '—'}</td>
                      <td className="py-2.5 font-mono text-slate-500">{loc.rack || '—'}</td>
                      <td className="py-2.5 font-mono text-slate-500">{loc.shelf || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <Card
          title="Product Categories"
          subtitle="Hierarchical classification structure"
          action={
            isManager && (
              <Button size="sm" icon={Plus} onClick={() => setCatModal(true)}>
                Add Category
              </Button>
            )
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="font-semibold text-xs text-slate-900 block">{c.name}</span>
                {c.parent ? (
                  <span className="text-[10px] text-slate-400 mt-1 block">Subcategory of: {c.parent.name}</span>
                ) : (
                  <span className="text-[10px] text-brand-600 mt-1 block">Primary Category</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Units of Measure Tab */}
      {activeTab === 'uoms' && (
        <Card
          title="Units of Measure (UOM)"
          subtitle="Stock tracking units for materials and items"
          action={
            isManager && (
              <Button size="sm" icon={Plus} onClick={() => setUomModal(true)}>
                Add UOM
              </Button>
            )
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {uoms.map((u) => (
              <div key={u.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="font-bold text-sm font-mono text-brand-600 block">{u.abbreviation}</span>
                <span className="text-xs text-slate-700 mt-0.5 block">{u.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Partners Tab */}
      {activeTab === 'partners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            title="Vendors & Suppliers"
            action={
              <Button size="sm" icon={Plus} onClick={() => setSupModal(true)}>
                Add Supplier
              </Button>
            }
          >
            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {suppliers.map((s) => (
                <div key={s.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                  <span className="font-semibold text-slate-900 block">{s.name}</span>
                  <span className="text-slate-500 block">{s.email || 'No email registered'}</span>
                  <span className="text-slate-400 text-[11px] block mt-0.5">{s.address}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Customers & Clients"
            action={
              <Button size="sm" icon={Plus} onClick={() => setCustModal(true)}>
                Add Customer
              </Button>
            }
          >
            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {customers.map((c) => (
                <div key={c.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                  <span className="font-semibold text-slate-900 block">{c.name}</span>
                  <span className="text-slate-500 block">{c.email || 'No email registered'}</span>
                  <span className="text-slate-400 text-[11px] block mt-0.5">{c.address}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Profile & Security Tab */}
      {activeTab === 'profile' && (
        <Card title="Account Profile & RBAC Privileges">
          <div className="max-w-xl space-y-4 text-sm">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xl">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{user?.name}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <div className="mt-1">
                  <Badge variant={user?.role || 'STAFF'} />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-semibold uppercase tracking-wider text-slate-500">Your System Permissions</p>
              <ul className="space-y-1.5 text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> View products, rack inventories, and live ledger
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Create draft receipts, picking orders, transfers, and counts
                </li>
                {isManager ? (
                  <>
                    <li className="flex items-center gap-2 font-semibold text-purple-700">
                      <span className="text-purple-600">✓</span> Full Manager Access: Validate and commit receipts to ledger
                    </li>
                    <li className="flex items-center gap-2 font-semibold text-purple-700">
                      <span className="text-purple-600">✓</span> Full Manager Access: Validate and commit outbound deliveries
                    </li>
                    <li className="flex items-center gap-2 font-semibold text-purple-700">
                      <span className="text-purple-600">✓</span> Full Manager Access: Validate physical count adjustments
                    </li>
                  </>
                ) : (
                  <li className="flex items-center gap-2 text-slate-400">
                    <span>—</span> Final validation requires Inventory Manager elevation
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Add Warehouse Modal */}
      <Modal isOpen={whModal} onClose={() => setWhModal(false)} title="Create Warehouse Facility">
        <form onSubmit={handleCreateWarehouse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Facility Name *</label>
            <input
              type="text"
              required
              value={whForm.name}
              onChange={(e) => setWhForm({ ...whForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder="e.g. Western Distribution Hub"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={whForm.address}
              onChange={(e) => setWhForm({ ...whForm, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder="Address, City, State"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setWhModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Facility</Button>
          </div>
        </form>
      </Modal>

      {/* Add Location Modal */}
      <Modal isOpen={locModal} onClose={() => setLocModal(false)} title="Add Warehouse Rack Location">
        <form onSubmit={handleCreateLocation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Warehouse *</label>
            <select
              required
              value={locForm.warehouseId}
              onChange={(e) => setLocForm({ ...locForm, warehouseId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Location / Rack Display Name *</label>
            <input
              type="text"
              required
              value={locForm.name}
              onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder="e.g. Rack C-04"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Aisle</label>
              <input
                type="text"
                value={locForm.aisle}
                onChange={(e) => setLocForm({ ...locForm, aisle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                placeholder="C"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Rack</label>
              <input
                type="text"
                value={locForm.rack}
                onChange={(e) => setLocForm({ ...locForm, rack: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                placeholder="04"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Shelf</label>
              <input
                type="text"
                value={locForm.shelf}
                onChange={(e) => setLocForm({ ...locForm, shelf: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                placeholder="1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setLocModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Rack Slot</Button>
          </div>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal isOpen={catModal} onClose={() => setCatModal(false)} title="Create Product Category">
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder="e.g. Electronic Sensors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Parent Category (Optional)</label>
            <select
              value={catForm.parentId}
              onChange={(e) => setCatForm({ ...catForm, parentId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
            >
              <option value="">None (Top-Level Primary)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCatModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Category</Button>
          </div>
        </form>
      </Modal>

      {/* Add UOM Modal */}
      <Modal isOpen={uomModal} onClose={() => setUomModal(false)} title="Add Unit of Measure">
        <form onSubmit={handleCreateUOM} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Unit Full Name *</label>
            <input
              type="text"
              required
              value={uomForm.name}
              onChange={(e) => setUomForm({ ...uomForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder="e.g. Metric Ton"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Abbreviation *</label>
            <input
              type="text"
              required
              value={uomForm.abbreviation}
              onChange={(e) => setUomForm({ ...uomForm, abbreviation: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder="e.g. MT"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setUomModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Unit</Button>
          </div>
        </form>
      </Modal>

      {/* Add Supplier / Customer Modal */}
      <Modal
        isOpen={supModal || custModal}
        onClose={() => {
          setSupModal(false);
          setCustModal(false);
        }}
        title={supModal ? 'Add Vendor / Supplier' : 'Add Client / Customer'}
      >
        <form onSubmit={supModal ? handleCreateSupplier : handleCreateCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={partyForm.name}
              onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder="e.g. Northern Steel & Wire Co."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={partyForm.email}
                onChange={(e) => setPartyForm({ ...partyForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                placeholder="contact@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={partyForm.phone}
                onChange={(e) => setPartyForm({ ...partyForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Address</label>
            <input
              type="text"
              value={partyForm.address}
              onChange={(e) => setPartyForm({ ...partyForm, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder="Street, City, State"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setSupModal(false);
                setCustModal(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Partner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
