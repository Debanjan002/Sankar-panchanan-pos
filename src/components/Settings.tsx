import React, { useState } from 'react';
import { Save, Download, Upload, FileText, Users, Wrench, ShoppingBag, AlertCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pos_settings');
    return saved ? JSON.parse(saved) : {
      shopName: 'Mobile Repair & Electronics',
      address: '123 Main Street, City',
      phone: '+91 9876543210',
      email: 'info@mobilerepair.com',
      footer: 'Thank you for your business!',
      printerWidth: '58mm',
      autoBackup: true
    };
  });

  const [activeTab, setActiveTab] = useState('shop');

  const handleSave = () => {
    localStorage.setItem('pos_settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const exportData = () => {
    const data = {
      customers: JSON.parse(localStorage.getItem('pos_customers') || '[]'),
      inventory: JSON.parse(localStorage.getItem('pos_inventory') || '[]'),
      repairs: JSON.parse(localStorage.getItem('pos_repairs') || '[]'),
      sales: JSON.parse(localStorage.getItem('pos_sales') || '[]'),
      dues: JSON.parse(localStorage.getItem('pos_dues') || '[]'),
      settings: JSON.parse(localStorage.getItem('pos_settings') || '{}')
    };

    // Convert to CSV format for each data type
    const csvData: { [key: string]: string } = {};

    // Customers CSV
    if (data.customers.length > 0) {
      const customerHeaders = Object.keys(data.customers[0]).join(',');
      const customerRows = data.customers.map((customer: any) => 
        Object.values(customer).map(value => `"${value}"`).join(',')
      ).join('\n');
      csvData.customers = customerHeaders + '\n' + customerRows;
    }

    // Inventory CSV
    if (data.inventory.length > 0) {
      const inventoryHeaders = Object.keys(data.inventory[0]).join(',');
      const inventoryRows = data.inventory.map((item: any) => 
        Object.values(item).map(value => `"${value}"`).join(',')
      ).join('\n');
      csvData.inventory = inventoryHeaders + '\n' + inventoryRows;
    }

    // Repairs CSV
    if (data.repairs.length > 0) {
      const repairHeaders = Object.keys(data.repairs[0]).join(',');
      const repairRows = data.repairs.map((repair: any) => 
        Object.values(repair).map(value => `"${value}"`).join(',')
      ).join('\n');
      csvData.repairs = repairHeaders + '\n' + repairRows;
    }

    // Sales CSV
    if (data.sales.length > 0) {
      const salesHeaders = 'id,billNumber,customerName,customerPhone,items,subtotal,discount,discountType,discountAmount,total,paymentMethod,paidAmount,dueAmount,createdAt';
      const salesRows = data.sales.map((sale: any) => {
        const items = JSON.stringify(sale.items).replace(/"/g, '""');
        return `"${sale.id}","${sale.billNumber}","${sale.customerName}","${sale.customerPhone}","${items}","${sale.subtotal}","${sale.discount || 0}","${sale.discountType || 'percentage'}","${sale.discountAmount || 0}","${sale.total}","${sale.paymentMethod}","${sale.paidAmount}","${sale.dueAmount}","${sale.createdAt}"`;
      }).join('\n');
      csvData.sales = salesHeaders + '\n' + salesRows;
    }

    // Dues CSV
    if (data.dues.length > 0) {
      const dueHeaders = 'id,customerName,customerPhone,originalAmount,paidAmount,dueAmount,type,billNumber,createdAt,payments';
      const dueRows = data.dues.map((due: any) => {
        const payments = JSON.stringify(due.payments).replace(/"/g, '""');
        return `"${due.id}","${due.customerName}","${due.customerPhone}","${due.originalAmount}","${due.paidAmount}","${due.dueAmount}","${due.type}","${due.billNumber}","${due.createdAt}","${payments}"`;
      }).join('\n');
      csvData.dues = dueHeaders + '\n' + dueRows;
    }

    // Users CSV
    if (data.users && data.users.length > 0) {
      const userHeaders = Object.keys(data.users[0]).join(',');
      const userRows = data.users.map((user: any) => 
        Object.values(user).map(value => `"${value}"`).join(',')
      ).join('\n');
      csvData.users = userHeaders + '\n' + userRows;
    }

    // Create and download ZIP-like structure with multiple CSV files
    const dataStr = JSON.stringify(csvData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pos_data_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate and import data
        let importedCount = 0;
        
        Object.keys(importedData).forEach(dataType => {
          if (['inventory', 'repairs', 'sales', 'dues', 'settings', 'users'].includes(dataType)) {
            localStorage.setItem(`pos_${dataType}`, JSON.stringify(importedData[dataType]));
            importedCount++;
          }
        });

        alert(`Data imported successfully! ${importedCount} data types imported.`);
        window.location.reload(); // Refresh to load new data
      } catch (error) {
        alert('Error importing data. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      ['pos_inventory', 'pos_repairs', 'pos_sales', 'pos_dues'].forEach(key => {
        localStorage.removeItem(key);
      });
      alert('All data cleared successfully!');
      window.location.reload();
    }
  };

  const getDataStats = () => {
    return {
      users: JSON.parse(localStorage.getItem('pos_users') || '[]').length,
      inventory: JSON.parse(localStorage.getItem('pos_inventory') || '[]').length,
      repairs: JSON.parse(localStorage.getItem('pos_repairs') || '[]').length,
      sales: JSON.parse(localStorage.getItem('pos_sales') || '[]').length,
      dues: JSON.parse(localStorage.getItem('pos_dues') || '[]').filter((due: any) => due.dueAmount > 0).length
    };
  };

  const stats = getDataStats();

  const tabs = [
    { id: 'shop', name: 'Shop Details', icon: FileText },
    { id: 'data', name: 'Data Management', icon: Download },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'shop' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    value={settings.shopName}
                    onChange={(e) => setSettings({...settings, shopName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Printer Width
                  </label>
                  <select
                    value={settings.printerWidth}
                    onChange={(e) => setSettings({...settings, printerWidth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="58mm">58mm Thermal</option>
                    <option value="80mm">80mm Thermal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Footer Message
                </label>
                <input
                  type="text"
                  value={settings.footer}
                  onChange={(e) => setSettings({...settings, footer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Data Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
                  <div className="text-sm text-gray-600">Users</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <ShoppingBag className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{stats.inventory}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <Wrench className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{stats.repairs}</div>
                  <div className="text-sm text-gray-600">Repairs</div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                  <FileText className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-emerald-600">{stats.sales}</div>
                  <div className="text-sm text-gray-600">Sales</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{stats.dues}</div>
                  <div className="text-sm text-gray-600">Pending Dues</div>
                </div>
              </div>

              {/* Export/Import Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Data Management</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Export Data</h4>
                    <p className="text-sm text-gray-600">
                      Download all your data including customers, inventory, repairs, sales, and dues as a backup file.
                    </p>
                    <button
                      onClick={exportData}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export All Data
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Import Data</h4>
                    <p className="text-sm text-gray-600">
                      Import previously exported data. This will replace existing data.
                    </p>
                    <label className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Import Data
                      <input
                        type="file"
                        accept=".json"
                        onChange={importData}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
                  <p className="text-sm text-red-600 mb-3">
                    Clear all data permanently. This action cannot be undone.
                  </p>
                  <button
                    onClick={clearAllData}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Clear All Data
                  </button>
                </div>
              </div>

              {/* Auto Backup Settings */}
              <div className="bg-white border border-gray-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Backup Settings</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoBackup"
                    checked={settings.autoBackup}
                    onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="autoBackup" className="text-sm text-gray-700">
                    Enable automatic daily data backup reminder
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;