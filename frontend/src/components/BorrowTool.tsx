import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { toolsAPI, requestsAPI } from '../services/api';
import { Tool } from '../types';

const BorrowTool = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const [tool, setTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState({
    reason: '',
    duration: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTool();
  }, [toolId]);

  const fetchTool = async () => {
    if (!toolId) return;
    
    try {
      setLoading(true);
      // Since we don't have a single tool endpoint, we'll get it from the tools list
      const response = await toolsAPI.getTools();
      const foundTool = response.results?.find(t => t.id === parseInt(toolId));
      
      if (foundTool) {
        setTool(foundTool);
      } else {
        setError('Tool not found');
      }
    } catch (err: any) {
      setError('Failed to load tool details');
      console.error('Tool fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool) return;

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await requestsAPI.createRequest({
        tool_id: tool.id,
        reason: formData.reason,
        duration: parseInt(formData.duration)
      });

      setSuccess('Borrow request submitted successfully!');
      
      // Navigate to my requests after a short delay
      setTimeout(() => {
        navigate('/my-requests');
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.non_field_errors?.[0] || 
                          Object.values(err.response?.data || {}).flat().join(', ') ||
                          'Failed to submit request. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tool not found</h3>
            <p className="mt-1 text-sm text-gray-500">The tool you're looking for doesn't exist or is no longer available.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Borrow Tool</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* Tool Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-4">
              {tool.image_url && (
                <img
                  src={tool.image_url}
                  alt={tool.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Category: {tool.category}</p>
                <p className="text-sm text-gray-600">Condition: {tool.condition}</p>
                <p className="text-sm text-gray-600">Owner: {tool.owner.username} ({tool.owner.email})</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="h-4 w-4 inline mr-1" />
                Reason for borrowing
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={4}
                required
                className="input-field"
                placeholder="Please describe why you need this tool and how you plan to use it..."
                value={formData.reason}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Duration (in days)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                min="1"
                max="30"
                required
                className="input-field"
                placeholder="Enter number of days"
                value={formData.duration}
                onChange={handleChange}
              />
              <p className="text-sm text-gray-500 mt-1">Maximum 30 days</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BorrowTool;