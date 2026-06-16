import { useState } from 'react'
import { X, Plus, Trash2, Save } from 'lucide-react'
import API from '../../utils/axios'

const DEFAULT_PHASES = [
  { title: 'Research', startDay: 1, endDay: 2 },
  { title: 'Planning', startDay: 2, endDay: 3 },
  { title: 'Execution', startDay: 3, endDay: 7 },
  { title: 'Review', startDay: 7, endDay: 8 },
  { title: 'Delivery', startDay: 8, endDay: 10 },
]

const TimelineSetupModal = ({ project, onClose, onSaved }) => {
  const totalDays = project.service?.deliveryTime || 10
  const [phases, setPhases] = useState(() => {
    if (project.phases?.length) {
      return project.phases.map((p) => ({
        title: p.title,
        startDay: p.startDay || Math.ceil((new Date(p.startDate) - new Date(project.startDate || project.createdAt)) / (1000 * 60 * 60 * 24)) + 1,
        endDay: p.endDay || Math.ceil((new Date(p.endDate) - new Date(project.startDate || project.createdAt)) / (1000 * 60 * 60 * 24)) + 1,
      }))
    }
    return DEFAULT_PHASES.map((p) => ({ ...p }))
  })
  const [saving, setSaving] = useState(false)

  const addPhase = () => {
    const lastEnd = phases.length ? phases[phases.length - 1].endDay : 0
    setPhases([...phases, { title: '', startDay: lastEnd + 1, endDay: Math.min(lastEnd + 2, totalDays) }])
  }

  const removePhase = (idx) => {
    setPhases(phases.filter((_, i) => i !== idx))
  }

  const updatePhase = (idx, field, value) => {
    const updated = phases.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    setPhases(updated)
  }

  const save = async () => {
    const valid = phases.filter((p) => p.title.trim())
    if (!valid.length) return
    const now = project.startDate ? new Date(project.startDate) : new Date(project.createdAt || Date.now())
    const timelinePhases = valid.map((p) => ({
      title: p.title.trim(),
      description: '',
      startDate: new Date(now.getTime() + (p.startDay - 1) * 86400000),
      endDate: new Date(now.getTime() + (p.endDay - 1) * 86400000),
      status: 'pending',
    }))
    setSaving(true)
    try {
      const { data } = await API.put(`/api/projects/${project._id}/timeline`, { phases: timelinePhases })
      onSaved(data)
      onClose()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save timeline')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Setup Project Timeline</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <p className="text-sm text-gray-500">Total project duration: <span className="font-semibold text-gray-900">{totalDays} days</span></p>
          {phases.map((phase, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Phase {idx + 1}</span>
                {phases.length > 1 && (
                  <button onClick={() => removePhase(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                )}
              </div>
              <input
                type="text"
                value={phase.title}
                onChange={(e) => updatePhase(idx, 'title', e.target.value)}
                placeholder="Phase name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0A7C72]"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Day</label>
                  <input
                    type="number" min={1} max={totalDays}
                    value={phase.startDay}
                    onChange={(e) => updatePhase(idx, 'startDay', Math.max(1, Math.min(Number(e.target.value), totalDays)))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0A7C72]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Day</label>
                  <input
                    type="number" min={1} max={totalDays}
                    value={phase.endDay}
                    onChange={(e) => updatePhase(idx, 'endDay', Math.max(1, Math.min(Number(e.target.value), totalDays)))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0A7C72]"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addPhase}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg py-3 text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            <Plus size={16} /> Add Phase
          </button>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
          <button
            onClick={save}
            disabled={saving || !phases.some((p) => p.title.trim())}
            className="flex items-center gap-2 bg-[#0A7C72] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#065F55] disabled:bg-gray-300"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Timeline'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TimelineSetupModal
