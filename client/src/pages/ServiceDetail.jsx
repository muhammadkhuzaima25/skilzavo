import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Star, Clock, Shield, MessageSquare, CheckCircle, ChevronDown, ChevronUp, MapPin, Globe, Award, User, Briefcase, Send, Eye } from 'lucide-react'
import ReviewCard from '../components/ReviewCard'
import { useCurrency } from '../context/CurrencyContext'
import useAuth from '../hooks/useAuth'
import API from '../utils/axios'

const ServiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { formatPrice, currency } = useCurrency()
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [imgError, setImgError] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    API.get(`/api/services/${id}`)
      .then((res) => {
        setService(res.data)
        return API.get(`/api/reviews/${res.data.provider._id}`)
      })
      .then((res) => setReviews(res.data))
      .catch(() => navigate('/services'))
  }, [id, navigate])

  const handleRequest = async () => {
    if (!user) return navigate('/login')
    setSubmitting(true)
    try {
      await API.post('/api/requests', { serviceId: id, message })
      setSuccess('Request submitted successfully! The provider will review it.')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
        </div>
      </div>
    )
  }

  const provider = service.provider
  const images = [service.thumbnail].filter(Boolean)
  const descLong = service.description?.length > 300
  const displayDesc = showFullDesc ? service.description : service.description?.slice(0, 300)
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : service.rating || '0.0'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link to="/services" className="hover:text-gray-600">Services</Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-[200px]">{service.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative aspect-[1280/769] bg-gray-100">
                {service.thumbnail && !imgError ? (
                  <>
                    <img
                      src={service.thumbnail.startsWith('https://') ? service.thumbnail : `https://${service.thumbnail.replace(/^http:\/\//, '')}`}
                      alt={service.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0A7C72]/10 to-teal-50">
                    <Eye size={64} className="text-[#0A7C72]/30" />
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 p-3 border-t border-gray-100 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${activeImg === i ? 'border-[#0A7C72]' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-white bg-[#0A7C72] px-2.5 py-1 rounded-full">{service.category}</span>
                  {service.subCategory && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{service.subCategory}</span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{service.title}</h1>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          className={s <= Math.round(Number(avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">{avgRating}</span>
                    <span className="text-gray-400 text-sm">({reviews.length || service.totalReviews || 0})</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <Clock size={15} />
                    <span>Delivery in {service.deliveryTime || 7} day{Number(service.deliveryTime || 7) > 1 ? 's' : ''}</span>
                  </div>
                  {service.revisions && Number(service.revisions) > 0 && (
                    <>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                        <Shield size={15} />
                        <span>{service.revisions} revision{Number(service.revisions) > 1 ? 's' : ''}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {displayDesc}
                    {descLong && !showFullDesc && '...'}
                  </div>
                  {descLong && (
                    <button
                      onClick={() => setShowFullDesc(!showFullDesc)}
                      className="mt-2 text-[#0A7C72] text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      {showFullDesc ? <>Show less <ChevronUp size={14} /></> : <>Read more <ChevronDown size={14} /></>}
                    </button>
                  )}
                </div>

                {service.tags?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full font-medium hover:bg-gray-200 transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {service.addOns?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Upgrades</h3>
                    <div className="space-y-2">
                      {service.addOns.map((addon, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                          <div className="flex items-center gap-3">
                            <CheckCircle size={16} className="text-[#0A7C72]" />
                            <span className="text-sm text-gray-700">{addon.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-gray-900">{formatPrice(addon.price)}</span>
                            {addon.extraDays > 0 && (
                              <span className="text-xs text-gray-400 ml-2">+{addon.extraDays} day{addon.extraDays > 1 ? 's' : ''}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-5">About the Seller</h2>
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div
                  className="flex items-center gap-4 cursor-pointer group"
                  onClick={() => navigate(`/provider/${provider._id}`)}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0A7C72] to-teal-400 flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0">
                    {provider.avatar ? (
                      <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
                    ) : (
                      provider.name?.charAt(0) || 'P'
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-[#0A7C72] transition-colors">{provider.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">{avgRating}</span>
                      <span className="text-xs text-gray-400">({reviews.length || provider.totalReviews || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                  {provider.location && (
                    <div>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={12} /> Location</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{provider.location}</p>
                    </div>
                  )}
                  {provider.experience && (
                    <div>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Briefcase size={12} /> Experience</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{provider.experience}</p>
                    </div>
                  )}
                  {provider.hourlyRate > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Award size={12} /> Hourly Rate</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{formatPrice(provider.hourlyRate)}/hr</p>
                    </div>
                  )}
                  {provider.languages?.length > 0 && (
                    <div className="col-span-2 sm:col-span-3">
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Globe size={12} /> Languages</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{provider.languages.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>

              {provider.bio && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Bio</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{provider.bio}</p>
                </div>
              )}

              {provider.skills?.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {provider.skills.map((skill, i) => (
                      <span key={i} className="bg-[#0A7C72]/10 text-[#0A7C72] text-xs px-3 py-1.5 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate(`/provider/${provider._id}`)}
                className="mt-5 text-[#0A7C72] text-sm font-medium hover:underline flex items-center gap-1"
              >
                <User size={14} /> View Full Profile
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Reviews ({reviews.length})
              </h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-gray-900">{avgRating}</span>
                    <div className="flex mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={s <= Math.round(Number(avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 mt-1 block">{reviews.length} review{reviews.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">No reviews yet. Be the first to order this service!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <ReviewCard key={r._id} review={r} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 self-start sticky top-24">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="text-center pb-5 border-b border-gray-100">
                <p className="text-sm text-gray-400">Starting from</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{formatPrice(service.price)}</p>
              </div>

              <div className="space-y-3 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="font-medium text-gray-800">{service.deliveryTime || 7} day{Number(service.deliveryTime || 7) > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Revisions</span>
                  <span className="font-medium text-gray-800">{service.revisions || 'Unlimited'}</span>
                </div>
                {provider && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Provider</span>
                    <span className="font-medium text-gray-800">{provider.name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-800">{service.category}</span>
                </div>
              </div>

              {user && user.role === 'customer' ? (
                <div className="pt-5 space-y-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a message to the provider describing your requirements..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A7C72] focus:border-[#0A7C72] resize-none h-28"
                  />
                  <button
                    onClick={handleRequest}
                    disabled={submitting}
                    className="w-full bg-[#0A7C72] text-white py-3 rounded-xl font-semibold hover:bg-[#065F55] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    {submitting ? 'Submitting...' : 'Continue to Order'}
                  </button>
                  {success && (
                    <p className="text-green-600 text-sm text-center font-medium">{success}</p>
                  )}
                  <p className="text-xs text-gray-400 text-center">You won't be charged yet</p>
                </div>
              ) : user && user.role === 'provider' ? (
                <div className="pt-5">
                  <button
                    disabled
                    className="w-full bg-gray-200 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed"
                  >
                    Your Service
                  </button>
                </div>
              ) : (
                <div className="pt-5 space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-[#0A7C72] text-white py-3 rounded-xl font-semibold hover:bg-[#065F55] transition-colors"
                  >
                    Sign In to Order
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Create an Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetail
