import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react'
import { Spinner, StatusBadge } from '../components/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-surface-500">{label}</p>
        <p className="text-2xl font-semibold text-surface-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { dashboard, fetchDashboard, loading } = useApp()

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  if (loading.dashboard && !dashboard) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  const d = dashboard || {}
  const statusData = Object.entries(d.order_status_breakdown || {}).map(([status, count]) => ({
    status, count,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-surface-500 mt-0.5">Overview of your business operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={d.total_products ?? '—'} icon={Package} color="bg-brand-500" />
        <StatCard label="Total Customers" value={d.total_customers ?? '—'} icon={Users} color="bg-emerald-500" />
        <StatCard label="Total Orders" value={d.total_orders ?? '—'} icon={ShoppingCart} color="bg-amber-500" />
        <StatCard
          label="Total Revenue"
          value={d.total_revenue != null ? `$${Number(d.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
          icon={DollarSign}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Order Status Chart */}
        {statusData.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-surface-700 mb-4 flex items-center gap-2">
              <TrendingUp size={15} /> Orders by Status
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={statusData} barSize={32}>
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4361ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Low Stock */}
        {(d.low_stock_products?.length > 0) && (
          <div className="card">
            <h2 className="text-sm font-semibold text-surface-700 mb-4 flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-500" />
              Low Stock Alerts
              <span className="badge-yellow ml-auto">{d.low_stock_count}</span>
            </h2>
            <div className="space-y-2">
              {d.low_stock_products.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-surface-100 last:border-0">
                  <div>
                    <p className="font-medium text-surface-800">{p.name}</p>
                    <p className="text-xs text-surface-400 font-mono">{p.sku}</p>
                  </div>
                  <span className={`font-semibold ${p.stock_quantity === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                    {p.stock_quantity} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      {d.recent_orders?.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-surface-700 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-400 text-xs uppercase tracking-wide border-b border-surface-100">
                  <th className="pb-2 pr-4">Order #</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {d.recent_orders.map((o) => (
                  <tr key={o.id} className="border-b border-surface-50 last:border-0">
                    <td className="py-2.5 pr-4 font-mono text-xs text-surface-600">#{o.id}</td>
                    <td className="py-2.5 pr-4"><StatusBadge status={o.status} /></td>
                    <td className="py-2.5 pr-4 font-medium">${Number(o.total_amount).toFixed(2)}</td>
                    <td className="py-2.5 text-surface-400">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
