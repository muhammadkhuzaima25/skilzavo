import { useState, useRef, useEffect, useMemo } from 'react'
import { Camera, Trash2, User, Briefcase, Lock, Plus, X, Eye, EyeOff } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import API from '../../utils/axios'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const fileRef = useRef(null)

  const [activeTab, setActiveTab] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null)

  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
  })

  const parseJsonArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      return JSON.parse(data);
    } catch {
      return data.split(',').map(s => s.trim()).filter(Boolean);
    }
  };

  const [profInfo, setProfInfo] = useState({
    skills: parseJsonArray(user?.skills),
    skillInput: '',
    experience: user?.experience || '',
    hourlyRate: user?.hourlyRate || '',
    languages: parseJsonArray(user?.languages),
    langInput: '',
    portfolioWebsite: user?.portfolioWebsite || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
    fiverrUrl: user?.fiverrUrl || '',
  })

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  })

  const [stats, setStats] = useState({ services: 0, orders: 0, rating: 0 })

  useEffect(() => {
    API.get('/api/services/my-services').then(r => setStats(s => ({ ...s, services: r.data.length }))).catch(() => {})
    API.get('/api/projects/my').then(r => setStats(s => ({ ...s, orders: r.data.length }))).catch(() => {})
  }, [])

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'bg-gray-200', width: '0%' }
    const hasNumbers = /\d/.test(pwd)
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd)
    if (pwd.length < 6) return { label: 'Weak', color: 'bg-red-500', width: '33%' }
    if (pwd.length >= 6 && pwd.length <= 9) return { label: 'Medium', color: 'bg-orange-500', width: '66%' }
    if (pwd.length >= 10 && hasNumbers && hasSpecial) return { label: 'Strong', color: 'bg-green-500', width: '100%' }
    return { label: 'Medium', color: 'bg-orange-500', width: '66%' }
  }

  const passStrength = useMemo(() => getPasswordStrength(security.newPassword), [security.newPassword])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const profilePic = user?.profilePicture
  const roleLabel = user?.role === 'provider' ? 'Service Provider' : user?.role === 'admin' ? 'Administrator' : 'Customer'

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      showToast('Max file size 2MB')
      return
    }
    const formData = new FormData()
    formData.append('image', file)
    setUploading(true);
    try {
      const res = await API.put('/api/auth/profile-picture', formData)
      updateUser(res.data)
      showToast('Profile picture updated')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload')
    } finally {
      setUploading(false);
    }
  }

  const handleRemove = async () => {
    if (!confirm('Remove profile picture?')) return
    try {
      const res = await API.delete('/api/auth/profile-picture')
      updateUser(res.data)
      showToast('Profile picture removed')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove')
    }
  }

  const submitPersonalInfo = async (e) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      fd.append('name', personalInfo.name)
      fd.append('phone', personalInfo.phone)
      fd.append('location', personalInfo.location)
      fd.append('bio', personalInfo.bio)
      const res = await API.put('/api/auth/profile', fd)
      updateUser(res.data)
      showToast('Personal info updated')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save')
    }
  }

  const submitProfInfo = async (e) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      fd.append('skills', JSON.stringify(profInfo.skills))
      fd.append('experience', profInfo.experience)
      fd.append('hourlyRate', String(profInfo.hourlyRate))
      fd.append('languages', JSON.stringify(profInfo.languages))
      fd.append('portfolioWebsite', profInfo.portfolioWebsite)
      fd.append('linkedinUrl', profInfo.linkedinUrl)
      fd.append('githubUrl', profInfo.githubUrl)
      fd.append('fiverrUrl', profInfo.fiverrUrl)
      const res = await API.put('/api/auth/profile', fd)
      updateUser(res.data)
      showToast('Professional info updated')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save')
    }
  }

  const submitPassword = async (e) => {
    e.preventDefault()
    if (security.newPassword !== security.confirmPassword) {
      showToast('Passwords do not match')
      return
    }
    if (security.newPassword.length < 6) {
      showToast('Password must be at least 6 characters')
      return
    }
    try {
      await API.put('/api/auth/password', {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      })
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '', showCurrent: false, showNew: false, showConfirm: false })
      showToast('Password updated successfully')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update password')
    }
  }

  const addSkill = () => {
    const s = profInfo.skillInput.trim()
    if (s && !profInfo.skills.includes(s)) {
      setProfInfo({ ...profInfo, skills: [...profInfo.skills, s], skillInput: '' })
    }
  }

  const addLanguage = () => {
    const l = profInfo.langInput.trim()
    if (l && !profInfo.languages.includes(l)) {
      setProfInfo({ ...profInfo, languages: [...profInfo.languages, l], langInput: '' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm shadow-md z-50">
          {toast}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center h-fit">
            <div className="w-[120px] h-[120px] rounded-full bg-primary flex items-center justify-center overflow-hidden mx-auto">
              {profilePic ? (
                <img src={profilePic} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-4">{user?.name}</h3>
            <span className="inline-block bg-teal-50 text-teal-700 text-xs px-3 py-1 rounded-full mt-2">{roleLabel}</span>
            <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
            <p className="text-sm text-gray-400 mt-1">
              Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>

            <div className="border-t border-gray-100 my-4" />

            <div className="flex justify-around">
              <div>
                <p className="font-bold text-teal-700">{stats.services}</p>
                <p className="text-sm text-gray-400">Services</p>
              </div>
              <div>
                <p className="font-bold text-teal-700">{stats.orders}</p>
                <p className="text-sm text-gray-400">Orders</p>
              </div>
              <div>
                <p className="font-bold text-teal-700">{user?.rating || '0.0'}</p>
                <p className="text-sm text-gray-400">Rating</p>
              </div>
            </div>

            <div className="border-t border-gray-100 my-4" />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full bg-primary text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary-dark disabled:opacity-50"
            >
              <Camera size={16} />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
            {profilePic && (
              <button
                type="button"
                onClick={handleRemove}
                className="w-full border border-red-500 text-red-500 rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 mt-2 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Remove Photo
              </button>
            )}
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleUpload} />
          </div>
        </div>

        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex border-b border-gray-200">
              {['Personal Info', 'Professional Info', 'Security'].map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`px-6 py-3 text-sm transition-colors ${
                    activeTab === i
                      ? 'text-teal-700 border-b-2 border-teal-700 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 0 && (
                <form onSubmit={submitPersonalInfo}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={personalInfo.name}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                      <input
                        type="text"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                      <input
                        type="text"
                        value={personalInfo.location}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                        placeholder="City, Country"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
                      <input
                        type="text"
                        value={personalInfo.username}
                        disabled
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={personalInfo.email}
                        disabled
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
                      <textarea
                        value={personalInfo.bio}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                        rows={4}
                        maxLength={500}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 resize-none"
                      />
                      <p className="text-xs text-gray-400 text-right mt-1">{personalInfo.bio.length}/500</p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="mt-4 bg-primary text-white px-6 py-2 rounded-lg text-sm hover:bg-primary-dark float-right"
                  >
                    Save Changes
                  </button>
                </form>
              )}

              {activeTab === 1 && (
                <form onSubmit={submitProfInfo} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Skills</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profInfo.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => setProfInfo({ ...profInfo, skills: profInfo.skills.filter((s) => s !== skill) })}
                            className="hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={profInfo.skillInput}
                        onChange={(e) => setProfInfo({ ...profInfo, skillInput: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                        placeholder="Type a skill and press Enter"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      />
                      <button type="button" onClick={addSkill} disabled={!profInfo.skillInput.trim()} className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark disabled:bg-gray-300">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Experience</label>
                      <select
                        value={profInfo.experience}
                        onChange={(e) => setProfInfo({ ...profInfo, experience: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      >
                        <option value="">Select experience</option>
                        <option>Less than 1 year</option>
                        <option>1-2 years</option>
                        <option>3-5 years</option>
                        <option>5-10 years</option>
                        <option>10+ years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Hourly Rate</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          value={profInfo.hourlyRate}
                          onChange={(e) => setProfInfo({ ...profInfo, hourlyRate: e.target.value })}
                          placeholder="0"
                          min="0"
                          className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Languages</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profInfo.languages.map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => setProfInfo({ ...profInfo, languages: profInfo.languages.filter((l) => l !== lang) })}
                            className="hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={profInfo.langInput}
                        onChange={(e) => setProfInfo({ ...profInfo, langInput: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLanguage() } }}
                        placeholder="Type a language and press Enter"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      />
                      <button type="button" onClick={addLanguage} disabled={!profInfo.langInput.trim()} className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark disabled:bg-gray-300">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 my-2" />

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Portfolio Website</label>
                      <input
                        type="url"
                        value={profInfo.portfolioWebsite}
                        onChange={(e) => setProfInfo({ ...profInfo, portfolioWebsite: e.target.value })}
                        placeholder="https://yourportfolio.com"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn URL</label>
                      <input
                        type="url"
                        value={profInfo.linkedinUrl}
                        onChange={(e) => setProfInfo({ ...profInfo, linkedinUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">GitHub URL</label>
                      <input
                        type="url"
                        value={profInfo.githubUrl}
                        onChange={(e) => setProfInfo({ ...profInfo, githubUrl: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Fiverr URL</label>
                      <input
                        type="url"
                        value={profInfo.fiverrUrl}
                        onChange={(e) => setProfInfo({ ...profInfo, fiverrUrl: e.target.value })}
                        placeholder="https://fiverr.com/..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-4 bg-primary text-white px-6 py-2 rounded-lg text-sm hover:bg-primary-dark float-right"
                  >
                    Save Changes
                  </button>
                </form>
              )}

              {activeTab === 2 && (
                <form onSubmit={submitPassword} className="space-y-4">
                  {[
                    { key: 'currentPassword', label: 'Current Password', showKey: 'showCurrent' },
                    { key: 'newPassword', label: 'New Password', showKey: 'showNew' },
                    { key: 'confirmPassword', label: 'Confirm Password', showKey: 'showConfirm' },
                  ].map(({ key, label, showKey }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                      <div className="relative">
                        <input
                          type={security[showKey] ? 'text' : 'password'}
                          value={security[key]}
                          onChange={(e) => setSecurity({ ...security, [key]: e.target.value })}
                          placeholder="••••••••"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => setSecurity({ ...security, [showKey]: !security[showKey] })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {security[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {security.newPassword && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Password Strength:</span>
                        <span className="font-medium" style={{ color: passStrength.color.replace('bg-', '') }}>{passStrength.label}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${passStrength.color} transition-all duration-300`} style={{ width: passStrength.width }}></div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="mt-4 bg-primary text-white px-6 py-2 rounded-lg text-sm hover:bg-primary-dark float-right"
                  >
                    Update Password
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
