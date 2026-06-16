import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderOverview from '../../components/provider/ProviderOverview';
import API from '../../utils/axios';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    API.get('/api/requests/provider').then((r) => setRequests(r.data)).catch(() => {});
    API.get('/api/projects/my').then((r) => setProjects(r.data)).catch(() => {});
  }, []);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activeProjects = projects.filter((p) => p.status !== 'completed');
  const completedProjects = projects.filter((p) => p.status === 'completed');
  const earnings = completedProjects.reduce((sum, p) => sum + (p.budget || 0), 0);

  return (
    <ProviderOverview
      earnings={earnings}
      activeProjectsCount={activeProjects.length}
      pendingRequestsCount={pendingRequests.length}
      completedProjectsCount={completedProjects.length}
      recentRequests={requests}
      activeProjects={activeProjects}
      onTabChange={(tab) => navigate(`/dashboard/${tab}`)}
    />
  );
};

export default DashboardOverview;
