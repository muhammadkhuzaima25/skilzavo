import { useState, useEffect } from 'react';
import { CheckCircle, Clock, User, XCircle } from 'lucide-react';
import API from '../../utils/axios';

const Requests = ({ onRequestUpdate }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/requests/provider')
      .then((r) => setRequests(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateRequest = async (id, status) => {
    try {
      await API.put(`/api/requests/${id}`, { status });
      setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
      onRequestUpdate?.(status);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const pending = requests.filter((r) => r.status === 'pending');

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-gray-900 mb-5">Requests</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : pending.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Clock size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No pending requests</p>
            <p className="text-xs mt-1">When customers request your services, they'll appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((req) => (
              <div
                key={req._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl gap-3"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {req.service?.title || 'Service'}
                      </p>
                      <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-medium">
                        pending
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      From: <span className="font-medium text-gray-700">{req.customer?.name || 'Unknown'}</span>
                    </p>
                    {req.message && (
                      <p className="text-xs text-gray-400 mt-1.5 bg-white rounded-lg p-2 border border-gray-100">
                        "{req.message}"
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-shrink-0">
                  <button
                    onClick={() => updateRequest(req._id, 'accepted')}
                    className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
                  >
                    <CheckCircle size={15} />
                    Accept
                  </button>
                  <button
                    onClick={() => updateRequest(req._id, 'rejected')}
                    className="inline-flex items-center gap-1.5 border border-red-300 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    <XCircle size={15} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
