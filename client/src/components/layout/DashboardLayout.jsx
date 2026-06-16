import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import ProviderSidebar from '../provider/ProviderSidebar';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.split('/').pop() || 'overview';

  const handleTabChange = (tab) => {
    navigate(`/dashboard/${tab}`);
  };

  return (
    <div className="min-h-screen bg-white flex">
      <ProviderSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 lg:ml-0 pb-20 lg:pb-0 relative">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
