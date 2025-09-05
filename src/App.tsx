import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Wrench, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings as SettingsIcon, 
  LogOut,
  Clock,
  Menu,
  X
} from 'lucide-react';

// Components
import Dashboard from './components/Dashboard';
import RepairManagement from './components/RepairManagement';
import POSSystem from './components/POSSystem';
import InventoryManagement from './components/InventoryManagement';
import UserManagement from './components/UserManagement';
import DueManagement from './components/DueManagement';
import Settings from './components/Settings';
import Login from './components/Login';

function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('pos_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('pos_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pos_current_user');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'repairs', name: 'Repairs', icon: Wrench },
    { id: 'pos', name: 'POS System', icon: ShoppingCart },
    { id: 'inventory', name: 'Inventory', icon: Package },
    ...(currentUser.role === 'admin' ? [{ id: 'users', name: 'User Management', icon: Users }] : []),
    { id: 'dues', name: 'Due Management', icon: Clock },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'repairs':
        return <RepairManagement />;
      case 'pos':
        return <POSSystem />;
      case 'inventory':
        return <InventoryManagement />;
      case 'users':
        return currentUser.role === 'admin' ? <UserManagement /> : <Dashboard />;
      case 'dues':
        return <DueManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition duration-200 ease-in-out lg:static lg:inset-0 z-50 w-64 bg-gray-900 text-white flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h1 className="text-xl font-bold">POS System</h1>
            <p className="text-sm text-gray-400">Mobile & Electronics</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {currentUser.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{currentUser.username}</p>
              <p className="text-xs text-gray-400">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800 capitalize">
                {activeTab === 'pos' ? 'Point of Sale' : activeTab.replace('-', ' ')}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back</p>
                <p className="font-medium text-gray-900">{currentUser.username}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;