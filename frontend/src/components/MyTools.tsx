import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Wrench, AlertCircle } from 'lucide-react';
import { toolsAPI, requestsAPI } from '../services/api';
import { Tool, BorrowRequest } from '../types';

const MyTools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [borrowedCount, setBorrowedCount] = useState<number>(0);
  const [lentCount, setLentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingToolId, setEditingToolId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{ id: number, action: 'edit' | 'delete' } | null>(null);

  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    condition: '',
    is_available: true,
    image: null as File | null,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [myTools, borrowedRes, lentRes] = await Promise.all([
        toolsAPI.getMyTools(),
        requestsAPI.getMyBorrowedTools(),
        requestsAPI.getLentTools(),
      ]);

      setTools(myTools);
      setBorrowedCount(borrowedRes.results?.length || 0);
      setLentCount(lentRes.results?.length || 0);
    } catch (err: any) {
      setError('Failed to load your tools');
      console.error('My tools error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (tool: Tool) => {
    setShowConfirmModal({ id: tool.id, action: 'edit' });
  };

  const confirmEdit = (tool: Tool) => {
    setEditingToolId(tool.id);
    setEditFormData({
      name: tool.name,
      category: tool.category,
      condition: tool.condition,
      is_available: tool.is_available,
      image: null,
    });
    setShowConfirmModal(null);
  };

  const handleUpdate = async (toolId: number) => {
    try {
      const formData = new FormData();
      formData.append('name', editFormData.name);
      formData.append('category', editFormData.category);
      formData.append('condition', editFormData.condition);
      formData.append('is_available', String(editFormData.is_available));
      if (editFormData.image) {
        formData.append('image', editFormData.image);
      }

      const updatedTool = await toolsAPI.updateTool(toolId, formData);
      setTools((prev) =>
        prev.map((tool) => (tool.id === toolId ? updatedTool : tool))
      );
      setEditingToolId(null);
    } catch (err) {
      setError('Failed to update tool');
      console.error('Update tool error:', err);
    }
  };

  const handleDelete = (toolId: number) => {
    setShowConfirmModal({ id: toolId, action: 'delete' });
  };

  const confirmDelete = async (toolId: number) => {
    try {
      await toolsAPI.deleteTool(toolId);
      setTools((prev) => prev.filter((tool) => tool.id !== toolId));
      setShowConfirmModal(null);
    } catch (err: any) {
      setError('Failed to delete tool');
      console.error('Delete tool error:', err);
    }
  };

  const totalTools = tools.length;
  const availableTools = tools.filter(t => t.is_available).length;

  return (
    <div className="p-6">
      {/* Stat Cards */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Wrench className="h-6 w-6 text-primary-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">My Tools</h1>
          </div>
          <Link to="/add-tool" className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add New Tool
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Total Tools', count: totalTools, color: 'blue' },
            { label: 'Available', count: availableTools, color: 'green' },
            { label: 'Borrowed', count: borrowedCount, color: 'red' },
            { label: 'Lent', count: lentCount, color: 'purple' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-4 rounded-lg shadow flex items-center">
              <Wrench className={`h-6 w-6 text-${stat.color}-500 mr-3`} />
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-semibold text-gray-800">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Tool Cards */}
      {tools.length === 0 ? (
        <div className="text-center py-12">
          <Wrench className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tools yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first tool.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool.id} className="card hover:shadow-md transition-shadow p-4">
              {tool.image_url ? (
                <img src={tool.image_url} alt={tool.name} className="w-full h-48 object-cover rounded-lg mb-4" />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <Wrench className="h-12 w-12 text-gray-400" />
                </div>
              )}

              {editingToolId === tool.id ? (
                <>
                  <input
                    type="text"
                    className="input w-full mb-2"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                  <input
                    type="text"
                    className="input w-full mb-2"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  />
                  <input
                    type="text"
                    className="input w-full mb-2"
                    value={editFormData.condition}
                    onChange={(e) => setEditFormData({ ...editFormData, condition: e.target.value })}
                  />
                  <input
                    type="checkbox"
                    checked={editFormData.is_available}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, is_available: e.target.checked })
                    }
                    className="mb-2"
                  />
                  <input
                    type="file"
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, image: e.target.files?.[0] || null })
                    }
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(tool.id)} className="btn-primary text-sm">Save</button>
                    <button onClick={() => setEditingToolId(null)} className="text-sm text-gray-500 hover:underline">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
                  <p className="text-sm text-gray-600">Category: {tool.category}</p>
                  <p className="text-sm text-gray-600">Condition: {tool.condition}</p>
                  <p className="text-sm text-gray-600">
                    Status:{' '}
                    <span className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full ${
                      tool.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tool.is_available ? 'Available' : 'Borrowed'}
                    </span>
                  </p>
                  <div className="flex justify-between mt-4">
                    <button onClick={() => handleEditClick(tool)} className="text-primary-600 hover:text-primary-700 flex items-center">
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </button>
                    <button onClick={() => handleDelete(tool.id)} className="text-red-600 hover:text-red-700 flex items-center">
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">
              {showConfirmModal.action === 'delete'
                ? 'Confirm Deletion'
                : 'Confirm Edit'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to {showConfirmModal.action} this tool?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() => setShowConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() =>
                  showConfirmModal.action === 'delete'
                    ? confirmDelete(showConfirmModal.id)
                    : confirmEdit(tools.find((t) => t.id === showConfirmModal.id)!)
                }
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTools;
