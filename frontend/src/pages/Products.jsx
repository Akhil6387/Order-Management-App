import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react'
import { PageHeader, Spinner, EmptyState, ConfirmModal, Modal } from '../components/ui'

function ProductForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState(
    initial || { name: '', sku: '', description: '', price: '', stock_quantity: '' }
  )
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="label">Product Name *</label>
        <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="e.g. Wireless Mouse" />
      </div>
      <div>
        <label className="label">SKU *</label>
        <input className="input font-mono" value={form.sku} onChange={(e) => set('sku', e.target.value)} required placeholder="e.g. WM-001" disabled={!!initial} />
        {initial && <p className="text-xs text-surface-400 mt-1">SKU cannot be changed after creation</p>}
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input resize-none" rows={2} value={form.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Optional product description" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Price ($) *</label>
          <input className="input" type="number" step="0.01" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} required placeholder="0.00" />
        </div>
        <div>
          <label className="label">Stock Qty *</label>
          <input className="input" type="number" min="0" value={form.stock_quantity} onChange={(e) => set('stock_quantity', e.target.value)} required placeholder="0" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <Spinner size="sm" />}
          {initial ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}

export default function Products() {
  const { products, fetchProducts, createProduct, updateProduct, deleteProduct, loading } = useApp()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const filtered = products.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (form) => {
    setSaving(true)
    try { await createProduct(form); setShowCreate(false) }
    finally { setSaving(false) }
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    try { await updateProduct(editItem.id, form); setEditItem(null) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await deleteProduct(deleteItem.id); setDeleteItem(null) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products in inventory`}
        action={
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add Product
          </button>
        }
      />

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input className="input pl-9" placeholder="Search by name or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      {loading.products ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description={search ? 'Try a different search term' : 'Create your first product to get started'} />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr className="text-left text-xs text-surface-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-surface-50 hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-surface-900">{p.name}</p>
                      {p.description && <p className="text-xs text-surface-400 truncate max-w-xs">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-surface-600">{p.sku}</td>
                    <td className="px-4 py-3 font-medium">${Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${p.stock_quantity === 0 ? 'text-red-500' : p.stock_quantity <= 10 ? 'text-amber-500' : 'text-emerald-600'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button className="btn-ghost p-1.5" onClick={() => setEditItem(p)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn-ghost p-1.5 text-red-500 hover:bg-red-50" onClick={() => setDeleteItem(p)} title="Delete">
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

      <Modal open={showCreate} title="New Product" onClose={() => setShowCreate(false)}>
        <ProductForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      <Modal open={!!editItem} title="Edit Product" onClose={() => setEditItem(null)}>
        {editItem && (
          <ProductForm
            initial={{ name: editItem.name, sku: editItem.sku, description: editItem.description, price: editItem.price, stock_quantity: editItem.stock_quantity }}
            onSubmit={handleUpdate}
            loading={saving}
          />
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteItem}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteItem?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
        loading={saving}
      />
    </div>
  )
}
