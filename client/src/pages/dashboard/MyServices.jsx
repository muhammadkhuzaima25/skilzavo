import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Edit3, Eye, Plus, Star, Trash2 } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import CreateServiceForm from '../../components/provider/CreateServiceForm';
import API from '../../utils/axios';

const DashboardMyServices = () => {
  const { formatPrice, currency } = useCurrency();
  const [services, setServices] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editServiceId, setEditServiceId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = () => {
    API.get('/api/services/my-services')
      .then((r) => setServices(r.data))
      .catch(() => {});
  };

  const deleteService = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await API.delete(`/api/services/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
      showToast('Service deleted successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleEdit = (id) => {
    setEditServiceId(id);
    setShowCreateForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading text-xl font-bold text-gray-900">My Services</h2>
        <button
          onClick={() => { setEditServiceId(null); setShowCreateForm(true); }}
          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-accent-600 transition-colors"
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Eye size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No services yet. Create your first service!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc) => (
            <div key={svc._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative aspect-[1280/769] bg-gray-50 overflow-hidden">
                {svc.thumbnail ? (
                  <img
                    src={svc.thumbnail.startsWith('https://') ? svc.thumbnail : `https://${svc.thumbnail.replace(/^http:\/\//, '')}`}
                    alt={svc.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-50">
                    <Eye size={32} className="text-primary-200" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-heading font-semibold text-gray-800 text-sm truncate">{svc.title}</h3>
                  <div className="flex items-center gap-0.5 text-xs text-gray-500">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    {svc.rating || '0.0'}
                  </div>
                </div>
                <span className="inline-block bg-primary text-white px-2 py-0.5 rounded text-xs font-medium mb-2">
                  {svc.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                  <Clock size={12} />
                  <span>Delivery in {svc.deliveryTime || 7} day{Number(svc.deliveryTime || 7) > 1 ? 's' : ''}</span>
                </div>
                <div className="border-t border-gray-50 pt-2 mt-2 flex items-center justify-between">
                  <span className="font-heading font-bold text-primary text-base">
                    {formatPrice(svc.price)}
                    {currency !== 'USD' && (
                      <span className="text-xs text-gray-400 font-normal ml-1">&bull; ${svc.price}</span>
                    )}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link
                    to={`/services/${svc._id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-dark transition-colors"
                  >
                    <Eye size={12} /> View
                  </Link>
                  <button
                    onClick={() => handleEdit(svc._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-primary text-primary px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-50 transition-colors"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => deleteService(svc._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-red-300 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateForm && (
        <CreateServiceForm
          editServiceId={editServiceId}
          onClose={() => { setShowCreateForm(false); setEditServiceId(null); }}
          onCreated={(s) => {
            setServices((prev) => [...prev, s]);
            setShowCreateForm(false);
            setEditServiceId(null);
            showToast('Service created successfully');
          }}
          onUpdated={() => {
            fetchServices();
            setShowCreateForm(false);
            setEditServiceId(null);
            showToast('Service updated successfully');
          }}
          onPublish={() => {
            setShowCreateForm(false);
            setEditServiceId(null);
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  );
};

export default DashboardMyServices;
