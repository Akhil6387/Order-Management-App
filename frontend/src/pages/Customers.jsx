import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Trash2, Search, Users } from 'lucide-react'
import { PageHeader, Spinner, EmptyState, ConfirmModal, Modal } from '../components/ui'

function CustomerForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone_number: '' })
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="label">Full Name *</label>
        <input className="input" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required placeholder="John Doe" />
      </div>
      <div>
        <label className="label">Email *</label>
        <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="john@example.com" />
      </div>
      <div>
        <label className="label">Phone</label>
        <input className="input" value={form.phone_number} onChange={(e) => set('phone_number', e.target.value)} placeholder="+1 555 000 0000" />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          Add Customer
        </button>
      </div>
    </form>
  )
}

export default function Customers() {
  const { customers, fetchCustomers, createCustomer, deleteCustomer, loading } = useApp()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const filtered = customers.filter(
    (c) => !search || c.full_name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (form) => {
    setSaving(true)
    try { await createCustomer(form); setShowCreate(false) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await deleteCustomer(deleteItem.id); setDeleteItem(null) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} registered customers`}
        action={
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add Customer
          </button>
        }
      />

      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input className="input pl-9" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading.customers ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" description={search ? 'Try a different search term' : 'Add your first customer to get started'} />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr className="text-left text-xs text-surface-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-surface-50 hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-surface-900">{c.full_name}</td>
                    <td className="px-4 py-3 text-surface-600">{c.email}</td>
                    <td className="px-4 py-3 text-surface-500">{c.phone_number || '—'}</td>
                    <td className="px-4 py-3 text-surface-400">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button className="btn-ghost p-1.5 text-red-500 hover:bg-red-50" onClick={() => setDeleteItem(c)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={showCreate} title="New Customer" onClose={() => setShowCreate(false)}>
        <CustomerForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      <ConfirmModal
        open={!!deleteItem}
        title="Delete Customer"
        message={`Delete "${deleteItem?.full_name}"? All their orders will also be deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
        loading={saving}
      />
    </div>
  )
}
