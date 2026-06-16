import { useState, useEffect, useMemo, useRef } from 'react'
import { SlidersHorizontal, ChevronDown, X, SearchX, Star, Filter } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import ServiceCard from '../components/ServiceCard'
import API from '../utils/axios'
import { useCurrency } from '../context/CurrencyContext'

const SORT_OPTIONS = ['Best Match', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Top Rated']

const FILTER_SECTIONS = [
  { id: 'delivery', label: 'Delivery Speed' },
  { id: 'budget', label: 'Your Budget' },
  { id: 'trust', label: 'Provider Trust Score' },
  { id: 'verified', label: 'Verified Providers Only' },
]

const Services = () => {
  const { formatPrice: convert } = useCurrency()
  const budgetOptions = [
    { value: 'any', label: 'Any Budget', min: 0, max: Infinity },
    { value: 'under20', label: `Under ${convert(20)}`, min: -Infinity, max: 20 },
    { value: '20to50', label: `${convert(20)} \u2013 ${convert(50)}`, min: 20, max: 50 },
    { value: '50to100', label: `${convert(50)} \u2013 ${convert(100)}`, min: 50, max: 100 },
    { value: '100to200', label: `${convert(100)} \u2013 ${convert(200)}`, min: 100, max: 200 },
    { value: '200plus', label: `${convert(200)}+`, min: 200, max: Infinity },
  ]
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const [deliveryDays, setDeliveryDays] = useState(10)
  const [budgetOption, setBudgetOption] = useState('any')
  const [trustScore, setTrustScore] = useState(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('Best Match')

  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const sidebarRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (searchQuery) params.search = searchQuery
    API.get('/api/services', { params })
      .then(res => setServices(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [searchQuery])

  const activeFilterCount = [
    deliveryDays < 10,
    budgetOption !== 'any',
    trustScore > 0,
    verifiedOnly,
  ].filter(Boolean).length

  const filtered = useMemo(() => {
    let result = [...services]

    result = result.filter(s => (s.deliveryTime || 7) <= deliveryDays)

    if (budgetOption !== 'any') {
      const opt = budgetOptions.find(o => o.value === budgetOption)
      if (opt) {
        const { min, max } = opt
        result = result.filter(s => {
          const p = s.price || 0
          return min === -Infinity ? p <= max : max === Infinity ? p >= min : (p >= min && p <= max)
        })
      }
    }

    if (trustScore > 0) {
      result = result.filter(s => (s.rating || 0) >= trustScore)
    }

    if (verifiedOnly) {
      result = result.filter(s => s.provider?.verified)
    }

    switch (sortBy) {
      case 'Newest':
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        break
      case 'Price: Low to High':
        result.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'Price: High to Low':
        result.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'Top Rated':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
    }

    return result
  }, [services, deliveryDays, budgetOption, trustScore, verifiedOnly, sortBy])

  const clearFilters = () => {
    setDeliveryDays(10)
    setBudgetOption('any')
    setTrustScore(0)
    setVerifiedOnly(false)
  }

  const hasActiveFilters = activeFilterCount > 0

  const deliveryPercent = ((deliveryDays - 1) / 9) * 100

  const CollapsibleSection = ({ id, label, children }) => {
    const [open, setOpen] = useState(true)
    return (
      <div className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <span className="text-sm font-semibold text-gray-900">{label}</span>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && <div className="space-y-2">{children}</div>}
      </div>
    )
  }

  const FilterSidebar = () => (
    <div className="space-y-1">
      <CollapsibleSection id="delivery" label="Delivery Speed">
        <p className="text-sm text-gray-500 mb-1">Within <span className="font-semibold text-gray-900">{deliveryDays}</span> {deliveryDays === 1 ? 'day' : 'days'}</p>
        <div className="relative h-2 bg-gray-200 rounded-full mt-3 mb-4">
          <div className="absolute h-full bg-[#0A7C72] rounded-full" style={{ width: `${deliveryPercent}%` }} />
          <input
            type="range" min={1} max={10} step={1}
            value={deliveryDays}
            onChange={(e) => setDeliveryDays(Number(e.target.value))}
            className="absolute top-1/2 -translate-y-1/2 w-full h-6 appearance-none bg-transparent cursor-pointer z-10
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0A7C72]
              [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-runnable-track]:appearance-none [&::-webkit-slider-runnable-track]:bg-transparent"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>1 day</span>
          <span>10 days</span>
        </div>
      </CollapsibleSection>

      <CollapsibleSection id="budget" label="Your Budget">
        <div className="space-y-1">
          {budgetOptions.map(opt => {
            const selected = budgetOption === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setBudgetOption(opt.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selected ? 'bg-teal-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selected ? 'border-[#0A7C72]' : 'border-gray-300'
                }`}>
                  {selected && <span className="w-2 h-2 rounded-full bg-[#0A7C72]" />}
                </span>
                <span className={selected ? 'text-[#0A7C72] font-medium' : 'text-gray-700'}>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection id="trust" label="Provider Trust Score">
        <p className="text-xs text-gray-500 mb-2">
          {trustScore === 0
            ? 'Show all providers'
            : `Show providers rated ${trustScore}\u2605 and above`}
        </p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setTrustScore(trustScore === star ? 0 : star)}
              className="transition-colors"
            >
              <Star
                size={24}
                className={star <= trustScore ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
              />
            </button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection id="verified" label="Verified Providers Only">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {verifiedOnly ? 'Showing verified providers only' : 'Include all providers'}
          </span>
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              verifiedOnly ? 'bg-[#0A7C72]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                verifiedOnly ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )

  const MobileFilterDrawer = () => (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">Smart Filters</h3>
          <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <FilterSidebar />
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
          {hasActiveFilters && (
            <button
              onClick={() => { clearFilters(); setShowMobileFilters(false) }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Reset All
            </button>
          )}
          <button
            onClick={() => setShowMobileFilters(false)}
            className="flex-1 bg-[#0A7C72] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#065F55]"
          >
            Show {filtered.length} {filtered.length === 1 ? 'service' : 'services'}
          </button>
        </div>
      </div>
    </div>
  )

  const activeFilterPills = []
  if (deliveryDays < 10) {
    activeFilterPills.push({ key: 'delivery', label: `Within ${deliveryDays} days`, onRemove: () => setDeliveryDays(10) })
  }
  if (budgetOption !== 'any') {
    const opt = budgetOptions.find(o => o.value === budgetOption)
    if (opt) activeFilterPills.push({ key: 'budget', label: opt.label, onRemove: () => setBudgetOption('any') })
  }
  if (trustScore > 0) {
    activeFilterPills.push({ key: 'trust', label: `${trustScore}\u2605+ Trust Score`, onRemove: () => setTrustScore(0) })
  }
  if (verifiedOnly) {
    activeFilterPills.push({ key: 'verified', label: 'Verified Only', onRemove: () => setVerifiedOnly(false) })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">All Services</h1>
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside ref={sidebarRef} className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <SlidersHorizontal size={18} className="text-[#0A7C72]" />
                <h2 className="text-base font-bold text-gray-900">Refine Results</h2>
              </div>
              <FilterSidebar />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {activeFilterPills.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeFilterPills.map(pill => (
                  <span
                    key={pill.key}
                    className="inline-flex items-center gap-1.5 bg-white text-[#0A7C72] text-xs font-medium px-3 py-1.5 rounded-full border border-[#0A7C72]"
                  >
                    {pill.label}
                    <button onClick={pill.onRemove} className="hover:text-red-500 ml-0.5">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-xs text-[#0A7C72] font-medium hover:underline ml-1"
                >
                  Reset All
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{filtered.length}</span> {filtered.length === 1 ? 'service' : 'services'}
              </p>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#0A7C72] cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-400">Loading services...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 mb-4">
                  <SearchX size={32} className="text-[#0A7C72]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No matches found</h3>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-5 py-2 bg-[#0A7C72] text-white rounded-lg text-sm font-medium hover:bg-[#065F55] transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(s => (
                  <ServiceCard key={s._id} service={s} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <button
        onClick={() => setShowMobileFilters(true)}
        className="fixed bottom-6 right-6 z-40 lg:hidden bg-[#0A7C72] text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-[#065F55] transition-colors"
      >
        <Filter size={16} />
        Smart Filter
        {hasActiveFilters && (
          <span className="bg-white text-[#0A7C72] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {showMobileFilters && <MobileFilterDrawer />}
    </div>
  )
}

export default Services
