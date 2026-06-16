import { useState, useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { CheckCircle, Clock, AlertCircle, ChevronRight, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import API from '../utils/axios'
import TimelineSetupModal from './provider/TimelineSetupModal'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const formatDate = (d) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const getPhaseDate = (phase, project) => {
  if (phase.startDate && !isNaN(new Date(phase.startDate).getTime())) {
    return formatDate(new Date(phase.startDate))
  }
  const day = phase.startDay || 1
  if (!project?.startDate) return `Day ${day}`
  const date = new Date(project.startDate)
  date.setDate(date.getDate() + day - 1)
  return formatDate(date)
}

const getPhaseEndDate = (phase, project) => {
  if (phase.endDate && !isNaN(new Date(phase.endDate).getTime())) {
    return formatDate(new Date(phase.endDate))
  }
  const day = phase.endDay || 1
  if (!project?.startDate) return `Day ${day}`
  const date = new Date(project.startDate)
  date.setDate(date.getDate() + day - 1)
  return formatDate(date)
}

const TimelineVisualizer = ({ phases = [], progress = 0, deadline, project, compact, userRole, onProjectUpdate }) => {
  const [showSetup, setShowSetup] = useState(false)
  const [completing, setCompleting] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const hasPhases = phases.length > 0
  const isProvider = userRole === 'provider' || userRole === 'admin'

  const chartData = useMemo(() => {
    if (!hasPhases) return null
    const labels = phases.map((p) => p.title)
    const colors = { completed: '#0A7C72', 'in-progress': '#F97316', pending: '#E5E7EB' }
    const bgColors = phases.map((p) => colors[p.status] || colors.pending)
    const data = phases.map((p) => {
      if (p.startDay != null) {
        return Math.max(1, (p.endDay || p.startDay) - p.startDay + 1)
      }
      const start = new Date(p.startDate)
      const end = new Date(p.endDate)
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1
      return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
    })
    return { labels, datasets: [{ data, backgroundColor: bgColors, borderRadius: 4 }] }
  }, [phases])

  const getCountdown = () => {
    if (!deadline) return null
    const now = new Date()
    const end = new Date(deadline)
    const diff = end - now
    if (diff <= 0) return { text: 'Overdue', overdue: true }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return { text: `${days} days remaining`, overdue: false }
  }

  const countdown = getCountdown()

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { display: false },
      y: { ticks: { font: { size: 11, family: 'Inter' } }, grid: { display: false } },
    },
    plugins: {
      tooltip: {
        callbacks: { label: (ctx) => `${ctx.raw} days` },
      },
    },
  }

  const handleMarkComplete = async (idx) => {
    setCompleting(idx)
    try {
      const { data } = await API.put(`/api/projects/${project._id}/timeline/${idx}/complete`)
      if (onProjectUpdate) onProjectUpdate(data)
      showToast(`Phase "${phases[idx].title}" completed!`)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update phase')
    } finally {
      setCompleting(null)
    }
  }

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-[#0A7C72]" />
            <h3 className="font-semibold text-gray-800">Project Timeline</h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#0A7C72]" />Done</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />Active</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-200" />Pending</span>
          </div>
        </div>

        {!hasPhases ? (
          <div className="text-center py-6 text-gray-400">
            <BarChart3 size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No timeline set yet</p>
            {isProvider && project && (
              <button
                onClick={() => setShowSetup(true)}
                className="mt-3 bg-[#0A7C72] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#065F55]"
              >
                Setup Timeline
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div className="bg-[#0A7C72] h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="font-bold text-[#0A7C72] text-sm">{progress}%</span>
            </div>

            {chartData && (
              <div className={compact ? 'h-36' : 'h-48'} style={{ height: compact ? 144 : 192 }}>
                <Bar data={chartData} options={options} />
              </div>
            )}

            <div className="space-y-2 mt-4">
              {phases.map((phase, idx) => (
                <div key={idx} className={`flex items-center justify-between text-sm rounded-lg p-3 ${compact ? 'bg-transparent border-b border-gray-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      phase.status === 'completed' ? 'bg-[#0A7C72]' : phase.status === 'in-progress' ? 'bg-[#F97316]' : 'bg-gray-300'
                    }`} />
                    <span className="font-medium text-gray-700 truncate">{phase.title}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-400 hidden sm:inline">
                      {getPhaseDate(phase, project)} — {getPhaseEndDate(phase, project)}
                    </span>
                    {phase.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-[#0A7C72] text-xs font-medium">
                        <CheckCircle size={14} /> Done
                      </span>
                    ) : isProvider && phase.status === 'pending' ? (
                      <button
                        onClick={() => handleMarkComplete(idx)}
                        disabled={completing === idx}
                        className="text-xs text-[#0A7C72] font-medium hover:underline flex items-center gap-1"
                      >
                        {completing === idx ? '...' : <><CheckCircle size={14} /> Mark Complete</>}
                      </button>
                    ) : phase.status === 'in-progress' ? (
                      <span className="flex items-center gap-1 text-[#F97316] text-xs font-medium">
                        <Clock size={14} /> In Progress
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock size={14} /> Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {countdown && (
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className={`text-sm flex items-center gap-1.5 ${countdown.overdue ? 'text-red-500' : 'text-gray-500'}`}>
                  {countdown.overdue ? <AlertCircle size={14} /> : <Clock size={14} />}
                  {countdown.text}
                </span>
                {project && (
                  <Link
                    to={`/dashboard/timeline/${project._id}`}
                    className="text-xs text-[#0A7C72] font-medium hover:underline flex items-center gap-1"
                  >
                    Full view <ChevronRight size={12} />
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        {isProvider && hasPhases && (
          <div className="mt-3">
            <button
              onClick={() => setShowSetup(true)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Edit timeline
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          {toast}
        </div>
      )}

      {showSetup && project && (
        <TimelineSetupModal
          project={project}
          onClose={() => setShowSetup(false)}
          onSaved={(updated) => { if (onProjectUpdate) onProjectUpdate(updated) }}
        />
      )}
    </>
  )
}

export default TimelineVisualizer
