import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { ArrowLeft, CheckCircle, Clock, AlertCircle, BarChart3, Activity, User, DollarSign, Calendar, MessageSquare } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { useCurrency } from '../../context/CurrencyContext'
import API from '../../utils/axios'
import Chat from '../../components/Chat'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const getPhaseDate = (dayNumber, project) => {
  if (!project?.startDate) return `Day ${dayNumber}`
  const date = new Date(project.startDate)
  date.setDate(date.getDate() + (dayNumber - 1))
  if (isNaN(date.getTime())) return `Day ${dayNumber}`
  return date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })
}

const CountdownBox = ({ value, label, overdue }) => (
  <div className={`flex flex-col items-center bg-white rounded-xl border-2 px-4 py-3 min-w-[72px] ${overdue ? 'border-red-400' : 'border-[#0A7C72]'}`}>
    <span className={`text-2xl font-bold tabular-nums ${overdue ? 'text-red-500' : 'text-[#0A7C72]'}`}>
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-xs text-gray-500 mt-0.5">{label}</span>
  </div>
)

const StatusBadge = ({ status }) => {
  const styles = {
    'not-started': 'bg-gray-400',
    'in-progress': 'bg-[#0A7C72]',
    'completed': 'bg-green-600',
    'cancelled': 'bg-red-500',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${styles[status] || 'bg-gray-400'}`}>
      {status}
    </span>
  )
}

const TimelineView = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { convertPrice, formatPrice } = useCurrency()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(null)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const isProvider = user?.role === 'provider' || user?.role === 'admin'

  useEffect(() => {
    API.get(`/api/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!project?.startDate || !project?.totalDays) return
    const endDate = new Date(project.startDate)
    endDate.setDate(endDate.getDate() + project.totalDays)
    const timer = setInterval(() => {
      const now = new Date()
      const diff = endDate - now
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        clearInterval(timer)
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [project])

  const overdue = project?.startDate && project?.totalDays
    ? (new Date().getTime() - (new Date(project.startDate).getTime() + project.totalDays * 86400000)) > 0
    : false

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Project not found</p>
      </div>
    )
  }

  const phases = project.phases || []
  const progress = project.progress || 0
  const completedCount = phases.filter((p) => p.status === 'completed').length
  const totalCount = phases.length
  const price = project?.price || project?.service?.price || 0

  const chartData = phases.length
    ? {
        labels: phases.map((p) => p.phase || p.title),
        datasets: [{
          label: 'Progress',
          data: phases.map((p) => (p.endDay || 1) - (p.startDay || 1)),
          backgroundColor: phases.map((p) => {
            if (p.status === 'completed') return '#16A34A'
            if (p.status === 'in-progress') return '#0A7C72'
            return '#E5E7EB'
          }),
          borderRadius: 6,
        }],
      }
    : null

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.raw} days` } } },
    scales: {
      x: {
        min: 0,
        max: project.totalDays || undefined,
        grid: { display: false },
        title: project.totalDays ? { display: true, text: 'Project Days', color: '#6B7280', font: { size: 11 } } : undefined,
      },
      y: { ticks: { font: { size: 12, family: 'Inter' } }, grid: { display: false } },
    },
  }

  const handleMarkComplete = async (idx) => {
    setCompleting(idx)
    try {
      const { data } = await API.put(`/api/projects/${id}/timeline/${idx}/complete`)
      setProject(data)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update phase')
    } finally {
      setCompleting(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/dashboard/overview" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-sm text-gray-500 mt-1">{project.service?.title || 'Service'}</p>
              <p className="text-sm text-gray-500">{project.provider?.name || 'Provider'}</p>
            </div>
            <StatusBadge status={project.status} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-[#0A7C72]" />
            <h3 className="font-semibold text-gray-900">Delivery Countdown</h3>
            {overdue && (
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">OVERDUE</span>
            )}
          </div>
          {project?.startDate && project?.totalDays ? (
            <div className="flex gap-3 flex-wrap">
              <CountdownBox value={timeLeft.days} label="Days" overdue={overdue} />
              <CountdownBox value={timeLeft.hours} label="Hours" overdue={overdue} />
              <CountdownBox value={timeLeft.minutes} label="Min" overdue={overdue} />
              <CountdownBox value={timeLeft.seconds} label="Sec" overdue={overdue} />
            </div>
          ) : (
            <p className="text-sm text-gray-400">No deadline set for this project.</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {phases.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
                <BarChart3 size={48} className="mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900">No timeline set</h3>
                <p className="text-sm text-gray-500 mt-1">The provider hasn't set up the project timeline yet.</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <BarChart3 size={20} className="text-[#0A7C72]" />
                      <h2 className="text-lg font-bold text-gray-900">Project Timeline</h2>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#16A34A]" />Completed</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#0A7C72]" />Active</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-200" />Pending</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div className="bg-[#0A7C72] h-4 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-lg font-bold text-[#0A7C72]">{progress}%</span>
                  </div>

                  {chartData && (
                    <div className="h-[250px]">
                      <Bar data={chartData} options={chartOptions} />
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Phase Details</h2>
                  <div className="space-y-3">
                    {phases.map((phase, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                              phase.status === 'completed' ? 'bg-[#0A7C72]' : phase.status === 'in-progress' ? 'bg-[#F97316]' : 'bg-gray-300'
                            }`} />
                            <div>
                              <p className="font-medium text-gray-900">{phase.phase || phase.title}</p>
                              <p className="text-sm text-gray-400 mt-0.5">
                                {getPhaseDate(phase.startDay || 1, project)} — {getPhaseDate(phase.endDay || 1, project)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${
                              phase.status === 'completed' ? 'bg-[#0A7C72]' : phase.status === 'in-progress' ? 'bg-[#F97316]' : 'bg-gray-400'
                            }`}>
                              {phase.status === 'completed' ? 'Completed' : phase.status === 'in-progress' ? 'In Progress' : 'Pending'}
                            </span>
                            {isProvider && phase.status === 'pending' && (
                              <button
                                onClick={() => handleMarkComplete(idx)}
                                disabled={completing === idx}
                                className="flex items-center gap-1 text-xs text-[#0A7C72] font-medium border border-[#0A7C72] px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
                              >
                                <CheckCircle size={14} />
                                {completing === idx ? '...' : 'Mark Complete'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-[#0A7C72]" /> Progress Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Phases</span>
                  <span className="font-semibold text-gray-900">{totalCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Completed</span>
                  <span className="font-semibold text-[#0A7C72]">{completedCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">In Progress</span>
                  <span className="font-semibold text-[#F97316]">{phases.filter((p) => p.status === 'in-progress').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending</span>
                  <span className="font-semibold text-gray-400">{phases.filter((p) => p.status === 'pending').length}</span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Overall</span>
                    <span className="font-bold text-[#0A7C72] text-lg">{progress}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Project Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5"><DollarSign size={14} /> Budget</span>
                  <span className="font-semibold text-gray-900">
                    {price > 0 ? formatPrice(price) : 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5"><User size={14} /> Customer</span>
                  <span className="font-semibold text-gray-900">{project.customer?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5"><User size={14} /> Provider</span>
                  <span className="font-semibold text-gray-900">{project.provider?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5"><Calendar size={14} /> Started</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-[#0A7C72]" /> Project Chat
            </h3>
            <Chat projectId={id} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineView
