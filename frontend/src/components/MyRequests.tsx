import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';
import { requestsAPI } from '../services/api';
import { BorrowRequest } from '../types';
import { useNotifications } from '../contexts/NotificationContext';

const MyRequests = () => {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { refreshNotifications } = useNotifications();

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const response = await requestsAPI.getMyRequests();
      setRequests(response.results || []);
      // Refresh notifications when viewing requests
      refreshNotifications();
    } catch (err: any) {
      setError('Failed to load your requests');
      console.error('My requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'returned':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isNewUpdate = (request: BorrowRequest) => {
    return !request.borrower_notified && (request.status === 'approved' || request.status === 'rejected');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Send className="h-6 w-6 text-primary-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <Send className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No requests yet</h3>
          <p className="mt-1 text-sm text-gray-500">Start by browsing available tools in the dashboard.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className={`card ${
                isNewUpdate(request) ? 'ring-2 ring-primary-200 bg-primary-50' : ''
              }`}
            >
              {isNewUpdate(request) && (
                <div className="mb-4 flex items-center text-primary-600 text-sm font-medium">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  New Update!
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{request.tool.name}</h3>
                    <div className="ml-3 flex items-center">
                      {getStatusIcon(request.status)}
                      <span className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    {request.is_overdue && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Overdue
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Owner:</strong> {request.tool.owner.username} ({request.tool.owner.email})</p>
                      <p><strong>Duration:</strong> {request.duration} day{request.duration > 1 ? 's' : ''}</p>
                      <p><strong>Request Date:</strong> {new Date(request.created_at).toLocaleDateString()}</p>
                      {request.return_date && (
                        <p><strong>Return Date:</strong> {new Date(request.return_date).toLocaleDateString()}</p>
                      )}
                    </div>
                    
                    <div>
                      <p><strong>Reason:</strong></p>
                      <p className="mt-1 text-gray-700">{request.reason}</p>
                    </div>
                  </div>
                </div>
                
                {request.tool.image_url && (
                  <img
                    src={request.tool.image_url}
                    alt={request.tool.name}
                    className="w-16 h-16 rounded-lg object-cover ml-4"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;