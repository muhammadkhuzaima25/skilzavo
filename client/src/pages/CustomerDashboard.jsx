import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, Save, CheckCircle, Camera, Loader } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import TimelineVisualizer from '../components/TimelineVisualizer';
import useAuth from '../hooks/useAuth';
import API from '../utils/axios';

const CustomerDashboard = () => {
  const { user, setUser } = useAuth();
  const { formatPrice } = useCurrency();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('tab') || 'overview';
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [chatRoom, setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState({ requests: true, projects: true });

  useEffect(() => {
    API.get('/api/requests/customer').then((r) => setRequests(r.data)).catch(() => {}).finally(() => setLoading((p) => ({ ...p, requests: false })));
    API.get('/api/projects/my').then((r) => setProjects(r.data)).catch(() => {}).finally(() => setLoading((p) => ({ ...p, projects: false })));
    return () => socket?.disconnect();
  }, []);

  const openChat = async (project) => {
    setChatRoom(project);
    setSelectedProject(project);
    const { io } = await import('socket.io-client');
    const s = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    setSocket(s);
    s.emit('join_room', project._id);
    s.on('receive_message', (msg) => setMessages((prev) => [...prev, msg]));
    API.get(`/api/messages/${project._id}`).then((r) => setMessages(r.data)).catch(() => {});
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatText.trim() || !socket || !chatRoom) return;
    socket.emit('send_message', {
      projectId: chatRoom._id,
      senderId: user._id,
      senderName: user.name,
      message: chatText,
    });
    setChatText('');
  };

  const closeChat = () => {
    if (socket) {
      socket.disconnect();
    }
    setSocket(null);
    setChatRoom(null);
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl font-bold text-gray-800 mb-8">Customer Dashboard</h1>

        {section === 'profile' ? (
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-5">Profile Settings</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <CustomerProfileForm user={user} setUser={setUser} />
              <div className="mt-4 text-center">
                <Link to="/dashboard/customer" className="text-primary text-sm font-medium hover:underline">
                  &larr; Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Requests */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-heading font-semibold text-lg text-gray-800 mb-4">My Requests</h2>
              {loading.requests ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="animate-spin text-primary" size={24} />
                </div>
              ) : requests.length === 0 ? (
                <p className="text-gray-400 text-sm">No requests yet. Browse services to get started!</p>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div key={req._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-primary-50 flex items-center justify-center text-primary font-bold text-sm">
                          {req.service?.title?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{req.service?.title || 'Service'}</p>
                          <p className="text-xs text-gray-400">Provider: {req.provider?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                          req.status === 'pending'
                            ? 'bg-accent'
                            : req.status === 'accepted'
                            ? 'bg-primary'
                            : req.status === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-gray-400 text-white'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-heading font-semibold text-lg text-gray-800 mb-4">My Projects</h2>
              {loading.projects ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="animate-spin text-primary" size={24} />
                </div>
              ) : projects.length === 0 ? (
                <p className="text-gray-400 text-sm">No projects yet.</p>
              ) : (
                <div className="space-y-4">
                  {projects.map((proj) => (
                    <div key={proj._id} className="border border-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() =>
                          setSelectedProject(selectedProject?._id === proj._id ? null : proj)
                        }
                      >
                        <div>
                          <p className="font-medium text-gray-800">{proj.title}</p>
                          <p className="text-xs text-gray-400">
                            Provider: {proj.provider?.name || 'N/A'} | Budget: {formatPrice(proj.budget)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-primary">{proj.progress || 0}%</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                              proj.status === 'completed'
                                ? 'bg-green-600'
                                : proj.status === 'in-progress'
                                ? 'bg-primary'
                                : 'bg-gray-400'
                            }`}
                          >
                            {proj.status}
                          </span>
                        </div>
                      </div>
                      {selectedProject?._id === proj._id && (
                        <div className="border-t border-gray-100 p-4 space-y-4">
                          <TimelineVisualizer
                            phases={proj.phases || []}
                            progress={proj.progress || 0}
                            deadline={
                              proj.phases?.length
                                ? proj.phases[proj.phases.length - 1]?.endDate
                                : null
                            }
                            project={proj}
                            userRole={user?.role}
                            onProjectUpdate={(updated) => {
                              setProjects((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
                            }}
                          />
                          <button
                            onClick={() => openChat(proj)}
                            className="text-primary text-sm font-medium hover:underline"
                          >
                            Open Chat
                          </button>

                          {proj.status === 'completed' && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-2">Leave a Review</h4>
                              <ReviewForm projectId={proj._id} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Profile */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-heading font-semibold text-lg text-gray-800 mb-4">Profile</h2>
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-3">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <h3 className="font-heading font-semibold text-gray-800">{user?.name}</h3>
                <p className="text-sm text-gray-400">{user?.email}</p>
                {user?.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                {user?.location && <p className="text-xs text-gray-400">{user.location}</p>}
              </div>
              <Link
                to="/dashboard/customer?tab=profile"
                className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors inline-block text-center"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
        )}

        {/* Chat Modal */}
        {chatRoom && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-heading font-semibold text-gray-800">Chat - {chatRoom.title}</h3>
                <button onClick={closeChat} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={msg._id || i}
                    className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                        msg.sender === user._id
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="font-medium text-xs mb-1 opacity-70">{msg.senderName}</p>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomerProfileForm = ({ user, setUser }) => {
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('location', form.location);
      fd.append('bio', form.bio);
      const { data } = await API.put('/api/auth/profile', fd);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
        <input
          type="email"
          value={user?.email || ''}
          disabled
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
        <input
          type="text"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+1 234 567 890"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="City, Country"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={3}
          maxLength={500}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{form.bio.length}/500</p>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
      </button>
    </form>
  );
};

const ReviewForm = ({ projectId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/reviews', { projectId, rating, comment });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (submitted) return <p className="text-green-600 text-sm">Review submitted!</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${n <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review..."
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      />
      <button
        type="submit"
        className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-dark"
      >
        Submit Review
      </button>
    </form>
  );
};

export default CustomerDashboard;
