import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { BrandingSettings } from './BrandingSettings';
import { ShiftManagement } from './ShiftManagement';
import { RoomManagement } from './RoomManagement';
import { TableManagement } from './TableManagement';
import { 
  Users, 
  Settings, 
  Shield, 
  Clock, 
  Bed, 
  UtensilsCrossed, 
  Building,
  Globe,
  Bell,
  Database,
  FileText,
  BarChart3,
  UserPlus,
  UserMinus,
  UserCheck,
  Key,
  RefreshCw,
  Lock,
  Languages
} from 'lucide-react';

export function AdminModule() {
  const { users, addUser, updateUser, toggleUserStatus } = useAuth();
  const { branding } = useBranding();
  
  const [activeSection, setActiveSection] = useState<
    'users' | 'branding' | 'shifts' | 'rooms' | 'tables' | 'security' | 'system' | 'reports'
  >('users');

  const renderSection = () => {
    switch (activeSection) {
      case 'branding':
        return <BrandingSettings />;
      case 'shifts':
        return <ShiftManagement />;
      case 'rooms':
        return <RoomManagement />;
      case 'tables':
        return <TableManagement />;
      case 'users':
      default:
        return (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-2">Manage staff accounts, roles, and permissions</p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <UserPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">{user.name.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                            {user.role.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.department || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                            Edit
                          </button>
                          <button 
                            onClick={() => toggleUserStatus(user.id)}
                            className={user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Admin Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Administration</h2>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveSection('users')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === 'users' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              <span>User Management</span>
            </button>
            
            <button
              onClick={() => setActiveSection('branding')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === 'branding' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Building className="w-5 h-5 flex-shrink-0" />
              <span>Hotel Branding</span>
            </button>
            
            <button
              onClick={() => setActiveSection('shifts')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === 'shifts' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Clock className="w-5 h-5 flex-shrink-0" />
              <span>Shift Management</span>
            </button>
            
            <button
              onClick={() => setActiveSection('rooms')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === 'rooms' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Bed className="w-5 h-5 flex-shrink-0" />
              <span>Room Management</span>
            </button>
            
            <button
              onClick={() => setActiveSection('tables')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === 'tables' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <UtensilsCrossed className="w-5 h-5 flex-shrink-0" />
              <span>Table Management</span>
            </button>
            
            <button
              onClick={() => setActiveSection('security')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === 'security' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span>Security Settings</span>
            </button>
            
            <button
              onClick={() => setActiveSection('system')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === 'system' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span>System Settings</span>
            </button>
            
            <button
              onClick={() => setActiveSection('reports')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === 'reports' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              <span>Reports & Analytics</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {renderSection()}
      </div>
    </div>
  );
}