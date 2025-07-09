// src/components/LentTools.tsx
import React, { useEffect, useState } from 'react';
import { requestsAPI } from '../services/api';
import { BorrowRequest } from '../types';
import { Loader2, AlertCircle } from 'lucide-react';

const LentTools: React.FC = () => {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLentTools = async () => {
      try {
        const response = await requestsAPI.getLentTools();
        const approvedOnly = (response.results || []).filter(r => r.status === 'approved');
        setRequests(approvedOnly);
      } catch (err) {
        setError('Failed to load lent tools');
      } finally {
        setLoading(false);
      }
    };
    fetchLentTools();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lent Tools</h1>

      {error && (
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle className="w-5 h-5 mr-2" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center text-gray-500">
          <Loader2 className="animate-spin w-5 h-5 mr-2" />
          Loading...
        </div>
      ) : requests.length === 0 ? (
        <p>No tools have been lent out yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Tool Name</th>
                <th className="px-6 py-3">Borrower</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Return Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {req.tool.image_url ? (
                      <img
                        src={req.tool.image_url}
                        alt={req.tool.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 italic">No image</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{req.tool.name}</td>
                  <td className="px-6 py-4">
                    {req.borrower.username}<br />
                    <span className="text-gray-500 text-xs">{req.borrower.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(req.status)}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">{req.duration} day{req.duration > 1 ? 's' : ''}</td>
                  <td className="px-6 py-4">{new Date(req.return_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LentTools;
