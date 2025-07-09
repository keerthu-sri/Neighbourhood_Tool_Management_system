import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Users,
  Wrench as Tool,
  TrendingUp,
  AlertCircle,
  Menu,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toolsAPI, requestsAPI } from '../services/api';
import { Tool as ToolType, Stats } from '../types';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tools, setTools] = useState<ToolType[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true); // toggle sidebar (visual only)

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [toolsResponse, toolStats, requestStats] = await Promise.all([
        toolsAPI.getTools(),
        toolsAPI.getToolStats(),
        requestsAPI.getRequestStats(),
      ]);

      setTools(toolsResponse.results || []);
      setStats({ ...toolStats, ...requestStats });
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowTool = (toolId: number) => {
    navigate(`/borrow-tool/${toolId}`);
  };

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsCards = [
    {
      icon: Tool,
      label: 'Total Tools',
      value: stats.total_tools || 0,
      color: 'bg-blue-500',
    },
    {
      icon: Users,
      label: 'Total Users',
      value: stats.total_users || 0,
      color: 'bg-green-500',
    },
    {
      icon: TrendingUp,
      label: 'Total Borrowings',
      value: stats.total_borrowed || 0,
      color: 'bg-purple-500',
    },
    {
      icon: Eye,
      label: 'Total Lent',
      value: stats.total_lent || 0,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-6">
      {/* Toggle Sidebar Icon (for small screens) */}
      <div className="lg:hidden mb-4">
        <button
          className="text-gray-700 hover:text-gray-900 flex items-center gap-2"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <Menu className="h-6 w-6" />
          <span className="text-sm">Menu</span>
        </button>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
        <p className="text-primary-100">
          Your neighborhood tool sharing community has{' '}
          {stats.available_tools || 0} tools available for borrowing.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`p-2 ${stat.color} rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Search Tools */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Available Tools from Community</h2>
        <input
          type="text"
          placeholder="Search tools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Tools Table */}
      <div className="card">
        {filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <Tool className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tools available</h3>
            <p className="mt-1 text-sm text-gray-500">Try changing your search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tool Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                      {tool.image_url && (
                        <img src={tool.image_url} alt={tool.name} className="h-10 w-10 rounded-lg object-cover mr-3" />
                      )}
                      <span className="text-sm font-medium text-gray-900">{tool.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{tool.category}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {tool.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {tool.owner.username} ({tool.owner.email})
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleBorrowTool(tool.id)} className="btn-primary">
                        Borrow
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
