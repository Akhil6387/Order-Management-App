import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Trash2, Eye, ShoppingCart, X, ChevronDown } from 'lucide-react'
import { PageHeader, Spinner, EmptyState, ConfirmModal, Modal, StatusBadge } from '../components/ui'

function CreateOrderForm({ customers, products, onSubmit, loading }) {
  const [customerId, setCustomerId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])

  const addItem = () => setItems((p) => [...p, { product_id: '', quantity: 1 }])
  const removeItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i))
  const setItem = (i, k, v) => setItems((p) => p.map((it, idx) => idx === i ? { ...it, [k]: v } : it))

  const total = items.reduce((sum, item) => {
    const prod = products.find((p) => p.id === Number(item.product_id))
    return sum + (prod ? Number(prod.price) * Number(item.quantity || 0) : 0)
  }, 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    const validItems = items.filter((it) => it.product_id && it.quantity > 0)
    if (!validItems.length) return alert('Add at least one product')
    onSubmit({
      customer_id: Number(customerId),
      notes,
      items: validItems.map((it) => ({ product_id: Number(it.product_id), quantity: Number(it.quantity) })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Customer *</label>
        <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
          <option value="">Select customer…</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Order Items *</label>
          <button type="button" className="btn-ghost text-xs py-1 px-2" onClick={addItem}>
            <Plus size={13} /> Add Item
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => {
            const prod = products.find((p) => p.id === Number(item.product_id))
            return (
              <div key={i} className="flex gap-2 items-center">
                <select
                  className="input flex-1"
                  value={item.product_id}
                  onChange={(e) => setItem(i, 'product_id', e.target.value)}
                  required
                >
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                      {p.name} (${Number(p.price).toFixed(2)}) — Stock: {p.stock_quantity}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max={prod?.stock_quantity || 999}
                  value={item.quantity}
                  onChange={(e) => setItem(i, 'quantity', e.target.value)}
                  className="input w-20 text-center"
                  required
                />
                {prod && (
                  <span className="text-xs text-surface-500 w-20 text-right flex-shrink-0">
                    ${(Number(prod.price) * Number(item.quantity)).toFixed(2)}
                  </span>
                )}
                {items.length > 1 && (
                  <button type="button" className="btn-ghost p-1.5 text-red-400 hover:bg-red-50 flex-shrink-0" onClick={() => removeItem(i)}>
                    <X size={13} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input resize-none" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional order notes…" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-surface-100">
        <div>
          <p className="text-xs text-surface-500">Total</p>
          <p className="text-xl font-semibold text-surface-900">${total.toFixed(2)}</p>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          Place Order
        </button>
      </div>
    </form>
  )
}

function OrderDetailModal({ order, open, onClose }) {
  if (!order) return null
  return (
    <Modal open={open} title={`Order #${order.id}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-surface-500 text-xs">Customer</p>
            <p className="font-medium">{order.customer?.full_name || '—'}</p>
            <p className="text-surface-400 text-xs">{order.customer?.email}</p>
          </div>
          <div>
            <p className="text-surface-500 text-xs">Status</p>
            <StatusBadge status={order.status} />
          </div>
          <div>
            <p className="text-surface-500 text-xs">Total</p>
            <p className="font-semibold text-lg">${Number(order.total_amount).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-surface-500 text-xs">Date</p>
            <p>{new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
        {order.notes && (
          <div className="bg-surface-50 rounded-lg p-3 text-sm">
            <p className="text-surface-500 text-xs mb-1">Notes</p>
            <p>{order.notes}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-surface-500 mb-2 uppercase tracking-wide font-medium">Items</p>
          <div className="space-y-2">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-surface-50 last:border-0">
                <div>
                  <p className="font-medium">{item.product?.name || `Product #${item.product_id}`}</p>
                  <p className="text-xs text-surface-400">${Number(item.unit_price).toFixed(2)} × {item.quantity}</p>
                </div>
                <p className="font-semibold">${(Number(item.unit_price) * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function Orders() {
  const { orders, customers, products, fetchOrders, fetchCustomers, fetchProducts, createOrder, updateOrderStatus, deleteOrder, loading } = useApp()
  const [showCreate, setShowCreate] = useState(false)
  const [viewOrder, setViewOrder] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchOrders()
    fetchCustomers()
    fetchProducts()
  }, [fetchOrders, fetchCustomers, fetchProducts])

  const handleCreate = async (form) => {
    setSaving(true)
    try { await createOrder(form); setShowCreate(false) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await deleteOrder(deleteItem.id); setDeleteItem(null) }
    finally { setSaving(false) }
  }

  const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} total orders`}
        action={
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Order
          </button>
        }
      />

      {loading.orders ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders yet" description="Create your first order to get started" />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr className="text-left text-xs text-surface-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-surface-50 hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-surface-600">#{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-surface-900">{o.customer?.full_name || '—'}</p>
                      <p className="text-xs text-surface-400">{o.customer?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="text-xs border border-surface-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      >
                        {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 font-semibold">${Number(o.total_amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-surface-400">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button className="btn-ghost p-1.5" onClick={() => setViewOrder(o)} title="View details">
                          <Eye size={14} />
                        </button>
                        <button className="btn-ghost p-1.5 text-red-500 hover:bg-red-50" onClick={() => setDeleteItem(o)} title="Delete">
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

      <Modal open={showCreate} title="New Order" onClose={() => setShowCreate(false)}>
        <CreateOrderForm customers={customers} products={products} onSubmit={handleCreate} loading={saving} />
      </Modal>

      <OrderDetailModal order={viewOrder} open={!!viewOrder} onClose={() => setViewOrder(null)} />

      <ConfirmModal
        open={!!deleteItem}
        title="Delete Order"
        message={`Delete Order #${deleteItem?.id}? Stock will be restored.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
        loading={saving}
      />
    </div>
  )
}
