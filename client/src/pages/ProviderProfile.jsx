import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReviewCard from '../components/ReviewCard';
import { useCurrency } from '../context/CurrencyContext';
import API from '../utils/axios';

const ProviderProfile = () => {
  const { id } = useParams();
  const { formatPrice, currency } = useCurrency();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    API.get(`/api/auth/providers/${id}`)
      .then((res) => {
        setProvider(res.data);
        return API.get(`/api/services`, { params: { provider: id } });
      })
      .then((res) => setServices(res.data))
      .catch(() => {});

    API.get(`/api/reviews/${id}`)
      .then((res) => setReviews(res.data))
      .catch(() => {});
  }, [id]);

  const parseArrayData = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      if (typeof data === 'string') {
        return data.replace(/[\[\]"']/g, '').split(',').map(s => s.trim()).filter(Boolean);
      }
      return [];
    }
  };

  if (!provider) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  const cleanSkills = parseArrayData(provider.skills);
  const cleanLanguages = parseArrayData(provider.languages);

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-inner">
              {provider.profilePicture ? (
                <img src={provider.profilePicture} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-teal-700 font-bold text-3xl">
                  {provider.name?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-heading text-2xl font-bold text-gray-800">{provider.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{provider.rating || '0.0'}</span>
                  <span className="text-gray-400 text-sm">({provider.totalReviews || 0} reviews)</span>
                </div>
              </div>
              <p className="text-gray-500 mt-3 text-sm leading-relaxed">{provider.bio || 'No bio yet.'}</p>
              {cleanSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  {cleanSkills.map((skill, i) => (
                    <span key={i} className="bg-teal-50 text-teal-700 text-xs px-3 py-1 rounded-full font-medium border border-teal-100 shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-heading font-semibold text-lg text-gray-800 mb-4">Services</h2>
              {services.length === 0 ? (
                <p className="text-gray-400 text-sm">No services listed yet.</p>
              ) : (
                <div className="space-y-3">
                  {services.map((svc) => (
                    <Link
                      key={svc._id}
                      to={`/services/${svc._id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-sm">
                          {svc.title?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{svc.title}</p>
                          <p className="text-xs text-gray-400">{svc.category}</p>
                        </div>
                      </div>
                      <span className="font-heading font-bold text-teal-700">{formatPrice(svc.price)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-heading font-semibold text-lg text-gray-800 mb-4">
                Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <ReviewCard key={r._id} review={r} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-heading font-semibold text-gray-800 mb-4">Info</h3>
              <div className="space-y-4 text-sm">
                {provider.experience && (
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Experience</p>
                    <p className="font-medium text-gray-800">{provider.experience}</p>
                  </div>
                )}
                {provider.hourlyRate > 0 && (
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Hourly Rate</p>
                    <p className="font-medium text-gray-800">${provider.hourlyRate}/hr</p>
                  </div>
                )}
                {cleanLanguages.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1.5">Languages</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cleanLanguages.map((lang, i) => (
                        <span key={i} className="bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-0.5 rounded text-xs font-medium">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Member Since</p>
                  <p className="font-medium text-gray-800">
                    {new Date(provider.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {provider.portfolio?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-heading font-semibold text-gray-800 mb-4">Portfolio</h3>
                <div className="space-y-3">
                  {provider.portfolio.map((item, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm text-gray-800">{item.title}</p>
                      {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
