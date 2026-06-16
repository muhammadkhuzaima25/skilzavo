import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Star } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const fixThumbnailUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('https://')) return url;
  if (url.startsWith('http://')) return url.replace('http://', 'https://');
  return url;
};

const ServiceCard = ({ service }) => {
  const { formatPrice, currency } = useCurrency();
  const [imgError, setImgError] = useState(false);
  const providerName = typeof service.provider === 'object' ? service.provider?.name : 'Provider';
  const providerAvatar = typeof service.provider === 'object' ? service.provider?.avatar : null;

  return (
    <Link
      to={`/services/${service._id}`}
      className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary transition-all duration-200 overflow-hidden block"
    >
      <div className="relative aspect-[1280/769] bg-gray-50 overflow-hidden rounded-t-xl">
        {service.thumbnail && !imgError ? (
          <img
            src={fixThumbnailUrl(service.thumbnail)}
            alt={service.title}
            className="absolute inset-0 w-full h-full object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              setImgError(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.08] transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-white text-primary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-lg">
            <Eye size={16} />
            View Details
          </span>
        </div>
        {service.category && (
          <span className="absolute top-3 left-3 bg-primary text-white px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm">
            {service.category}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-gray-800 text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
          {service.title}
        </h3>
        <div className="flex items-center gap-2 mt-2.5">
          <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {providerAvatar ? (
              <img src={providerAvatar} alt={providerName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-primary">
                {providerName?.charAt(0) || 'P'}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 truncate">{providerName}</span>
          <div className="flex items-center gap-0.5 ml-auto">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium text-gray-700">{service.rating || '0.0'}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-bold text-primary text-lg">{formatPrice(service.price)}</span>
            {currency !== 'USD' && (
              <span className="text-xs text-gray-400 font-medium">&bull; ${service.price}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={12} />
            <span>Delivery in {service.deliveryTime || 7} day{Number(service.deliveryTime || 7) > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
