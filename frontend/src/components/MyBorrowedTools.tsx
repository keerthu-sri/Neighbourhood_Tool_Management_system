// src/components/MyBorrowedTools.tsx
import React, { useEffect, useState } from 'react';
import { BorrowRequest } from '../types';
import { requestsAPI } from '../services/api';
import { PackageCheck, Loader2, AlertCircle, Clock } from 'lucide-react';

const MyBorrowedTools = () => {
  const [tools, setTools] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await requestsAPI.getMyBorrowedTools();
        const approvedTools = (response.results || []).filter(t => t.status === 'approved');
        setTools(approvedTools);
      } catch (err) {
        setError('Failed to fetch borrowed tools');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const isOverdue = (returnDate: string) => {
    const today = new Date();
    const due = new Date(returnDate);
    return due < today;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center text-gray-500">
        <Loader2 className="animate-spin w-5 h-5 mr-2" />
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <PackageCheck className="mr-2" /> Borrowed Tools
      </h2>

      {error && (
        <div className="text-red-600 flex items-center mb-4">
          <AlertCircle className="w-5 h-5 mr-2" /> {error}
        </div>
      )}

      {tools.length === 0 ? (
        <p className="text-gray-600">No borrowed tools.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const overdue = tool.return_date && isOverdue(tool.return_date);

            return (
              <div
                key={tool.id}
                className="card relative shadow-lg border border-gray-200 rounded-lg p-4 bg-white"
              >
                {overdue && (
                  <div className="absolute top-2 right-2 flex items-center bg-red-100 text-red-700 px-2 py-1 text-xs font-semibold rounded-full">
                    <Clock className="w-4 h-4 mr-1" />
                    Overdue
                  </div>
                )}

                <div className="flex items-center mb-3">
                  {tool.tool.image_url ? (
                    <img
                      src={tool.tool.image_url}
                      alt={tool.tool.name}
                      className="w-16 h-16 rounded-lg object-cover mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4 text-gray-500 text-sm">
                      No Image
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{tool.tool.name}</h3>
                    <p className="text-sm text-gray-600">Owner: {tool.tool.owner.username}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Borrowed on:</strong> {new Date(tool.created_at).toLocaleDateString()}</p>
                  <p><strong>Return by:</strong> {tool.return_date ? new Date(tool.return_date).toLocaleDateString() : 'N/A'}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(tool.status)}`}>
                      {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBorrowedTools;
