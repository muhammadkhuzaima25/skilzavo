import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  FileText,
  Globe,
  Paintbrush,
  Palette,
  Play,
  Search,
  Smartphone,
  TrendingUp,
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import CategoryPills from '../components/CategoryPills';
import ServiceCard from '../components/ServiceCard';
import API from '../utils/axios';

const trendingData = [
  { name: 'Web Development', icon: Globe },
  { name: 'Logo Design', icon: Paintbrush },
  { name: 'Digital Marketing', icon: TrendingUp },
  { name: 'Content Writing', icon: FileText },
  { name: 'Video Editing', icon: Clapperboard },
  { name: 'UI/UX Design', icon: Palette },
  { name: 'SEO', icon: Search },
  { name: 'Mobile Apps', icon: Smartphone },
];

const HeroShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg className="absolute -left-20 -top-20 w-96 h-96 text-white/5" viewBox="0 0 200 200" fill="currentColor">
      <circle cx="100" cy="100" r="80" />
    </svg>
    <svg className="absolute -right-32 -bottom-32 w-[500px] h-[500px] text-white/5" viewBox="0 0 200 200" fill="currentColor">
      <polygon points="100,10 190,190 10,190" />
    </svg>
    <svg className="absolute left-1/3 top-10 w-32 h-32 text-white/[0.03]" viewBox="0 0 100 100" fill="currentColor">
      <rect x="10" y="10" width="80" height="80" rx="10" />
    </svg>
    <svg className="absolute right-1/4 bottom-20 w-24 h-24 text-white/[0.04]" viewBox="0 0 100 100" fill="currentColor">
      <polygon points="50,5 95,95 5,95" />
    </svg>
    <svg className="absolute left-10 top-1/2 w-16 h-16 text-white/[0.03]" viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="50" r="40" />
    </svg>
    <svg className="absolute right-10 top-1/4 w-20 h-20 text-white/[0.03]" viewBox="0 0 100 100" fill="currentColor">
      <rect x="10" y="10" width="80" height="80" rx="20" transform="rotate(45 50 50)" />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
      <span className="font-heading text-[200px] font-black text-white select-none">S</span>
    </div>
  </div>
);

const Home = () => {
  const [services, setServices] = useState([]);
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const trendingRef = useRef(null);

  useEffect(() => {
    const params = {};
    if (category) params.category = category;
    if (searchQuery) params.search = searchQuery;
    API.get('/api/services', { params }).then((res) => setServices(res.data)).catch(() => {});
  }, [category, searchQuery]);

  const scrollTrending = (dir) => {
    if (!trendingRef.current) return;
    trendingRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  return (
    <div className="font-body">
      <section className="relative bg-[#0A7C72] overflow-hidden">
        <HeroShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Find the perfect service
            </h1>
                <p className="text-lg md:text-xl text-white/80 mb-8">
              Connect with skilled freelancers and bring your projects to life
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar onSearch={setSearchQuery} placeholder="What service are you looking for?" />
            </div>
            <button className="mt-8 inline-flex items-center gap-2 border-2 border-white/30 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
              <Play size={16} fill="white" />
              How Skilzavo Works
            </button>
          </div>
        </div>
      </section>

      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <CategoryPills selected={category} onSelect={setCategory} />
        </div>
      </div>

      {!category && !searchQuery && (
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">
                Trending on Skilzavo
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollTrending(-1)}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-all duration-200"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollTrending(1)}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-all duration-200"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div
              ref={trendingRef}
              className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {trendingData.map((item) => {
                const Icon = item.icon;
                const catValue = item.name === 'Mobile Apps' ? 'Mobile Development' : item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setCategory(catValue)}
                    className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm hover:border-primary hover:shadow-md transition-all duration-200 flex-shrink-0 group min-w-[200px]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800 whitespace-nowrap">{item.name}</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-primary ml-auto transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className={`${!category && !searchQuery ? 'bg-primary-50' : 'bg-white'} py-12 md:py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">
              {category || searchQuery ? 'Search Results' : 'Popular Services'}
            </h2>
            <Link to="/services" className="text-primary font-medium text-sm hover:text-primary-dark flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.slice(0, 8).map((s) => (
              <ServiceCard key={s._id} service={s} />
            ))}
            {services.length === 0 && (
              <p className="col-span-full text-center text-gray-400 py-12">No services yet. Be the first to offer one!</p>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: '500+', label: 'Active Freelancers' },
              { value: '1,000+', label: 'Projects Completed' },
              { value: '98%', label: 'Client Satisfaction' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', role: 'Client', text: 'Skilzavo made it so easy to find the perfect freelancer for my project. Highly recommended!' },
              { name: 'James K.', role: 'Freelancer', text: 'The platform is fantastic. The timeline visualizer helps me and my clients stay on track.' },
              { name: 'Emily R.', role: 'Client', text: 'Professional freelancers, easy communication, and great results. Love the chat feature!' },
            ].map((t) => (
              <div key={t.name} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
