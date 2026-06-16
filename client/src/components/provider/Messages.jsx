import { useState, useEffect } from 'react'
import { MessageSquare, Search, User, ChevronLeft, Clock } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import API from '../../utils/axios'
import Chat from '../Chat'

const Messages = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [showMobileList, setShowMobileList] = useState(true)

  useEffect(() => {
    API.get('/api/projects/my')
      .then((r) => setProjects(r.data))
      .catch(() => {})
  }, [])

  const otherPerson = (project) => {
    if (!user) return { name: 'Unknown', avatar: null }
    const isProvider = project.provider?._id === user._id || project.provider === user._id
    return isProvider
      ? { name: project.customer?.name || 'Client', avatar: project.customer?.avatar || null }
      : { name: project.provider?.name || 'Provider', avatar: project.provider?.avatar || null }
  }

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase()
    const person = otherPerson(p)
    return (
      p.title?.toLowerCase().includes(q) ||
      person.name?.toLowerCase().includes(q)
    )
  })

  const selectProject = (project) => {
    setSelected(project)
    setShowMobileList(false)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-4 sm:-m-6 lg:-m-8">
      <div className={`w-full sm:w-80 lg:w-96 border-r border-gray-100 bg-white flex flex-col flex-shrink-0 ${
        showMobileList ? 'block' : 'hidden sm:block'
      }`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3">Inbox</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A7C72] focus:border-[#0A7C72]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No conversations</div>
          ) : (
            filtered.map((project) => {
              const person = otherPerson(project)
              const isActive = selected?._id === project._id
              return (
                <button
                  key={project._id}
                  onClick={() => selectProject(project)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isActive ? 'bg-teal-50 border-l-2 border-[#0A7C72]' : 'hover:bg-gray-50 border-l-2 border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {person.avatar ? (
                      <img src={person.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} className="text-[#0A7C72]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800 truncate">{person.name}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{project.title}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-gray-50 ${showMobileList ? 'hidden sm:flex' : 'flex'}`}>
        {selected ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-gray-200">
              <button className="sm:hidden text-gray-500" onClick={() => setShowMobileList(true)}>
                <ChevronLeft size={20} />
              </button>
              {(() => {
                const person = otherPerson(selected)
                return (
                  <>
                    <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {person.avatar ? (
                        <img src={person.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} className="text-[#0A7C72]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{person.name}</p>
                      <p className="text-xs text-gray-400 truncate">{selected.title}</p>
                    </div>
                  </>
                )
              })()}
            </div>
            <div className="flex-1 p-4">
              <Chat projectId={selected._id} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
