import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, User, Shield, Eye, EyeOff } from 'lucide-react';

interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'staff';
  createdAt: Date;
  lastLogin?: Date;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pos_users');
    return saved ? JSON.parse(saved).map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
    })) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'staff' as 'admin' | 'staff'
  });

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'staff'
    });
    setShowForm(false);
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if username already exists (except when editing)
    const existingUser = users.find(user => 
      user.username === formData.username && user.id !== editingUser?.id
    );
    
    if (existingUser) {
      alert('Username already exists!');
      return;
    }

    const userData: User = {
      id: editingUser?.id || Date.now().toString(),
      ...formData,
      createdAt: editingUser?.createdAt || new Date(),
      lastLogin: editingUser?.lastLogin
    };

    let updatedUsers;
    if (editingUser) {
      updatedUsers = users.map(user => 
        user.id === editingUser.id ? userData : user
      );
    } else {
      updatedUsers = [...users, userData];
    }

    setUsers(updatedUsers);
    localStorage.setItem('pos_users', JSON.stringify(updatedUsers));
    resetForm();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      role: user.role
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const currentUser = JSON.parse(localStorage.getItem('pos_current_user') || '{}');
    
    if (id === currentUser.id) {
      alert('You cannot delete your own account!');
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
      localStorage.setItem('pos_users', JSON.stringify(updatedUsers));
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-xl font-bold text-green-600">
                {users.filter(user => user.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Staff</p>
              <p className="text-xl font-bold text-purple-600">
                {users.filter(user => user.role === 'staff').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Username *"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            <input
              type="password"
              placeholder="Password *"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'staff'})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            
            <div></div>
            
            <div className="md:col-span-2 flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingUser ? 'Update User' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users by username or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 font-mono">
                          {showPasswords[user.id] ? user.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords[user.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;