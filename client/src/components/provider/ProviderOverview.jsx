import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  Briefcase,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Inbox,
  Plus,
  TrendingUp,
  FolderKanban,
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ProviderOverview = ({
  earnings = 0,
  activeProjectsCount = 0,
  pendingRequestsCount = 0,
  completedProjectsCount = 0,
  recentRequests = [],
  activeProjects = [],
  onTabChange,
}) => {
  const { formatPrice, currency, convertPrice } = useCurrency();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleFont: { family: 'Inter', size: 12 },
        bodyFont: { family: 'Inter', size: 13 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => formatPrice(context.parsed.y),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'Inter', size: 12 },
          color: '#9CA3AF',
        },
      },
      y: {
        grid: {
          color: '#F3F4F6',
          drawBorder: false,
        },
        ticks: {
          font: { family: 'Inter', size: 12 },
          color: '#9CA3AF',
          callback: (value) => formatPrice(value),
        },
      },
    },
  };

  const stats = [
    { label: 'Total Earnings', value: formatPrice(earnings), icon: DollarSign, valueColor: 'text-white' },
    { label: 'Active Projects', value: activeProjectsCount, icon: Briefcase, valueColor: 'text-white' },
    { label: 'Pending Requests', value: pendingRequestsCount, icon: Clock, valueColor: 'text-white' },
    { label: 'Completed', value: completedProjectsCount, icon: TrendingUp, valueColor: 'text-white' },
  ];

  const hasEarnings = earnings > 0;
  const sampleChartData = hasEarnings
    ? { labels: weeklyLabels, datasets: [{ label: 'Earnings', data: [0, 0, 0, 0, 0, 0, 0], backgroundColor: '#0A7C72', borderRadius: 6, barThickness: 32 }] }
    : { labels: weeklyLabels, datasets: [{ label: 'Earnings', data: [0, 0, 0, 0, 0, 0, 0], backgroundColor: '#E5E7EB', borderRadius: 6, barThickness: 32 }] };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-primary rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/70 font-medium">{stat.label}</p>
                <div className="w-10 h-10 rounded-lg bg-primary-dark flex items-center justify-center">
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              <p className="font-heading text-2xl font-bold text-white mt-3">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-gray-900">Earnings Overview</h2>
          <span className="text-xs text-gray-400">Last 7 days</span>
        </div>
        <div className="h-56 sm:h-64 flex items-center justify-center">
          {hasEarnings ? (
            <Bar data={sampleChartData} options={chartOptions} />
          ) : (
            <div className="text-center text-gray-400">
              <DollarSign size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No earnings yet. Start accepting projects!</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-gray-900">Recent Requests</h2>
            <button
              onClick={() => onTabChange?.('requests')}
              className="text-primary text-sm font-medium hover:text-primary-dark flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          {recentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Inbox size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.slice(0, 4).map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {req.customer?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {req.customer?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {req.service?.title || 'Service Request'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    {req.budget && (
                      <span className="text-sm font-semibold text-gray-700">{formatPrice(req.budget)}</span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        req.status === 'pending'
                          ? 'bg-accent text-white'
                          : req.status === 'accepted'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-gray-900">Active Projects</h2>
            <button
              onClick={() => onTabChange?.('orders')}
              className="text-primary text-sm font-medium hover:text-primary-dark flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          {activeProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FolderKanban size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No active projects</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeProjects.slice(0, 3).map((proj) => (
                <div key={proj._id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{proj.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        Client: {proj.customer?.name || 'N/A'}
                      </p>
                    </div>
                    {proj.deadline && (
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {new Date(proj.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${proj.progress || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-xs text-gray-400">Progress</span>
                    <span className="text-xs font-medium text-primary">
                      {proj.progress || 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onTabChange?.('services')}
          className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add New Service
        </button>
        <button
          onClick={() => onTabChange?.('requests')}
          className="inline-flex items-center gap-2 border border-primary text-white/80 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
        >
          <FileText size={18} />
          View All Requests
        </button>
        <button
          onClick={() => onTabChange?.('profile')}
          className="inline-flex items-center gap-2 border border-primary text-white/80 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
        >
          <FileText size={18} />
          Manage Profile
        </button>
      </div>
    </div>
  );
};

export default ProviderOverview;
