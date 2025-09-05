import React from 'react';
import { TrendingUp, Users, Wrench, ShoppingCart, Clock, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
  const getStats = () => {
    const repairs = JSON.parse(localStorage.getItem('pos_repairs') || '[]');
    const sales = JSON.parse(localStorage.getItem('pos_sales') || '[]');
    const inventory = JSON.parse(localStorage.getItem('pos_inventory') || '[]');
    const customers = JSON.parse(localStorage.getItem('pos_customers') || '[]');
    const dues = JSON.parse(localStorage.getItem('pos_dues') || '[]');

    const today = new Date().toDateString();
    const todayRepairs = repairs.filter((repair: any) => 
      new Date(repair.createdAt).toDateString() === today
    );
    const todaySales = sales.filter((sale: any) => 
      new Date(sale.createdAt).toDateString() === today
    );

    const totalRevenue = sales.reduce((sum: number, sale: any) => sum + sale.paidAmount, 0);
    const totalDues = dues.reduce((sum: number, due: any) => sum + due.dueAmount, 0);
    const pendingRepairs = repairs.filter((repair: any) => 
      repair.status === 'pending' || repair.status === 'in-progress'
    ).length;

    const lowStockItems = inventory.filter((item: any) => item.stock <= 5).length;

    return {
      todayRepairs: todayRepairs.length,
      todaySales: todaySales.length,
      totalCustomers: customers.length,
      totalRevenue,
      totalDues,
      pendingRepairs,
      lowStockItems,
      totalInventoryValue: inventory.reduce((sum: number, item: any) => 
        sum + (item.costPrice * item.stock), 0
      )
    };
  };

  const stats = getStats();

  const statCards = [
    {
      title: "Today's Repairs",
      value: stats.todayRepairs,
      icon: Wrench,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: "Today's Sales",
      value: stats.todaySales,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: "Pending Dues",
      value: `₹${stats.totalDues.toFixed(2)}`,
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: "Pending Repairs",
      value: stats.pendingRepairs,
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`${card.bgColor} p-6 rounded-lg border`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {(stats.lowStockItems > 0 || stats.totalDues > 0) && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Alerts & Notifications</h3>
          <div className="space-y-3">
            {stats.lowStockItems > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Low Stock Alert</p>
                  <p className="text-sm text-yellow-700">
                    {stats.lowStockItems} items are running low on stock
                  </p>
                </div>
              </div>
            )}
            {stats.totalDues > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Clock className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Outstanding Dues</p>
                  <p className="text-sm text-red-700">
                    Total pending dues: ₹{stats.totalDues.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {/* This would show recent repairs and sales */}
          <p className="text-gray-500 text-center py-4">
            Recent repairs and sales will appear here
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;