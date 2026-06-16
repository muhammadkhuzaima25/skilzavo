import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, User, Clock, DollarSign, BarChart3, Settings, Eye, Star } from 'lucide-react'
import { useCurrency } from '../../context/CurrencyContext'
import TimelineVisualizer from '../TimelineVisualizer'
import TimelineSetupModal from './TimelineSetupModal'
import API from '../../utils/axios'

const fixThumbnailUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('https://')) return url
  if (url.startsWith('http://')) return url.replace('http://', 'https://')
  return url
}

const ManageOrders = () => {
  const { formatPrice, currency } = useCurrency()
  const [tab, setTab] = useState('active')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [setupProject, setSetupProject] = useState(null)

  const fetchOrders = () => {
    setLoading(true)
    API.get('/api/projects/my')
      .then((r) => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const filtered = orders.filter((o) => {
    if (tab === 'active') return o.status === 'in-progress' || o.status === 'not-started'
    if (tab === 'completed') return o.status === 'completed'
    if (tab === 'cancelled') return o.status === 'cancelled'
    return false
  })

  const tabs = [
    { id: 'active', label: 'Active Projects', color: 'teal', icon: BarChart3 },
    { id: 'completed', label: 'Completed', color: 'green', icon: CheckCircle },
    { id: 'cancelled', label: 'Cancelled', color: 'red', icon: XCircle },
  ]

  const statusStyles = {
    'not-started': 'bg-gray-400',
    'in-progress': 'bg-[#0A7C72]',
    'completed': 'bg-green-600',
    'cancelled': 'bg-red-500',
  }

  const StatusBadge = ({ status }) => (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${statusStyles[status] || 'bg-gray-400'}`}>
      {status}
    </span>
  )

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-5">Manage Orders</h2>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setExpanded(null) }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? t.id === 'active'
                    ? 'bg-[#0A7C72] text-white'
                    : t.id === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">No {tab} orders yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((order) => (
            <div
              key={order._id}
              className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary transition-all duration-200 overflow-hidden"
            >
              <Link
                to={tab === 'active' ? '#' : '#'}
                className="block"
                onClick={(e) => { if (tab === 'active') { e.preventDefault(); setExpanded(expanded === order._id ? null : order._id) } }}
              >
                <div className="relative aspect-[1280/769] bg-gray-50 overflow-hidden rounded-t-xl">
                  {(() => {
                    const thumb = order.service?.thumbnail || order.service?.image || null
                    return thumb ? (
                      <img
                        src={fixThumbnailUrl(thumb)}
                        alt={order.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-50">
                      <span className="text-[#0A7C72] text-3xl font-bold">
                        {order.title?.charAt(0) || 'O'}
                      </span>
                    </div>
                  )})()}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.08] transition-colors" />
                  {tab === 'active' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white text-primary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-lg">
                        <BarChart3 size={16} />
                        View Timeline
                      </span>
                    </div>
                  )}
                  <StatusBadge status={order.status} />
                </div>
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading font-semibold text-gray-800 text-sm leading-snug line-clamp-1">
                    {order.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-2.5">
                  <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {order.customer?.avatar ? (
                      <img src={order.customer.avatar} alt={order.customer.name || 'Client'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-[#0A7C72]">
                        {order.customer?.name?.charAt(0) || 'C'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 truncate">{order.customer?.name || 'Client'}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-heading font-bold text-[#0A7C72] text-lg">{formatPrice(order.service?.price || order.price || 0)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    <span>Created {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {tab === 'active' && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-[#0A7C72] text-[#0A7C72] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-teal-50 transition-colors"
                    >
                      <BarChart3 size={14} /> Timeline
                    </button>
                    <Link
                      to={`/dashboard/timeline/${order._id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={14} /> Full View
                    </Link>
                  </div>
                )}
              </div>
              {tab === 'active' && expanded === order._id && (
                <div className="border-t border-gray-100 p-4">
                  <TimelineVisualizer
                    phases={order.phases || []}
                    progress={order.progress || 0}
                    deadline={order.phases?.length ? order.phases[order.phases.length - 1]?.endDate : null}
                    project={order}
                    compact
                    userRole="provider"
                    onProjectUpdate={(updated) => {
                      setOrders((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {setupProject && (
        <TimelineSetupModal
          project={setupProject}
          onClose={() => setSetupProject(null)}
          onSaved={(updated) => {
            setOrders((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
            setSetupProject(null)
          }}
        />
      )}
    </div>
  )
}

export default ManageOrders
