import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  Briefcase,
  Images,
  MessageSquare,
  UserCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import useAuth from '../../hooks/useAuth';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'requests', label: 'Requests', icon: ClipboardList },
  { id: 'orders', label: 'Manage Orders', icon: ShoppingBag },
  { id: 'services', label: 'My Services', icon: Briefcase },
  { id: 'portfolio', label: 'Portfolio', icon: Images },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: UserCircle },
];

const routeMap = {
  overview: '/dashboard/overview',
  requests: '/dashboard/requests',
  orders: '/dashboard/orders',
  services: '/dashboard/services',
  portfolio: '/dashboard/portfolio',
  messages: '/dashboard/messages',
  profile: '/dashboard/profile',
};

const ProviderSidebar = ({ activeTab: propActiveTab, onTabChange }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeTab = useMemo(() => {
    if (propActiveTab) return propActiveTab;
    return location.pathname.split('/').pop() || 'overview';
  }, [propActiveTab, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTabClick = (id) => {
    if (onTabChange) {
      onTabChange(id);
    } else {
      navigate(routeMap[id] || `/dashboard/${id}`);
    }
    setMobileOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md border border-gray-100"
      >
        {mobileOpen ? <X size={20} className="text-gray-700" /> : <Menu size={20} className="text-gray-700" />}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4 lg:mt-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary border-l-2 border-primary'
                    : 'text-gray-700 hover:bg-primary-50 hover:text-gray-900 border-l-2 border-transparent'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-primary' : 'text-gray-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 flex justify-around py-2 px-2 overflow-x-auto">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all flex-shrink-0 ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <Icon size={18} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default ProviderSidebar;
