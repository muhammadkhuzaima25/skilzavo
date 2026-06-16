import { useState, useEffect } from 'react';
import API from '../utils/axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    API.get('/api/auth/users').then((r) => setUsers(r.data)).catch(() => {});
    API.get('/api/services').then((r) => setServices(r.data)).catch(() => {});
    API.get('/api/projects/all').then((r) => setProjects(r.data)).catch(() => {});
  }, []);

  const customers = users.filter((u) => u.role === 'customer');
  const providers = users.filter((u) => u.role === 'provider');
  const completedProjects = projects.filter((p) => p.status === 'completed');

  const stats = [
    { label: 'Total Users', value: users.length, color: 'text-primary' },
    { label: 'Customers', value: customers.length, color: 'text-green-600' },
    { label: 'Providers', value: providers.length, color: 'text-primary-dark' },
    { label: 'Total Services', value: services.length, color: 'text-primary' },
    { label: 'Total Projects', value: projects.length, color: 'text-accent' },
    { label: 'Completed', value: completedProjects.length, color: 'text-green-600' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={`font-heading text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-heading font-semibold text-lg text-gray-800 mb-4">Recent Users</h2>
            <div className="space-y-2">
              {users.slice(0, 10).map((u) => (
                <div key={u._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary font-bold text-xs">
                      {u.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${
                    u.role === 'provider' ? 'bg-primary-dark' : u.role === 'admin' ? 'bg-red-500' : 'bg-primary'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-heading font-semibold text-lg text-gray-800 mb-4">Recent Projects</h2>
            <div className="space-y-2">
              {projects.slice(0, 10).map((p) => (
                <div key={p._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-400">
                      {p.customer?.name || 'N/A'} &rarr; {p.provider?.name || 'N/A'}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${
                    p.status === 'completed' ? 'bg-green-600' : p.status === 'in-progress' ? 'bg-primary' : 'bg-gray-400'
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
