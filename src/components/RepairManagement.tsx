import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, Printer } from 'lucide-react';
import PaymentModal from './PaymentModal';

interface Repair {
  id: string;
  customerName: string;
  customerPhone: string;
  deviceType: string;
  deviceModel: string;
  issue: string;
  estimatedCost: number;
  advanceAmount: number;
  dueAmount: number;
  status: 'pending' | 'in-progress' | 'completed' | 'delivered';
  createdAt: Date;
  notes: string;
  billNumber: string;
  paymentMethod?: string;
}

const RepairManagement: React.FC = () => {
  const [repairs, setRepairs] = useState<Repair[]>(() => {
    const saved = localStorage.getItem('pos_repairs');
    return saved ? JSON.parse(saved).map((repair: any) => ({
      ...repair,
      createdAt: new Date(repair.createdAt)
    })) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [editingCost, setEditingCost] = useState<string | null>(null);
  const [newCost, setNewCost] = useState<number>(0);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deviceType: '',
    deviceModel: '',
    issue: '',
    estimatedCost: 0,
    advanceAmount: 0,
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      deviceType: '',
      deviceModel: '',
      issue: '',
      estimatedCost: 0,
      advanceAmount: 0,
      notes: ''
    });
    setShowForm(false);
    setEditingRepair(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const billNumber = `REP-${Date.now()}`;
    const dueAmount = formData.estimatedCost - formData.advanceAmount;

    const repairData: Repair = {
      id: editingRepair?.id || Date.now().toString(),
      ...formData,
      dueAmount,
      status: editingRepair?.status || 'pending',
      createdAt: editingRepair?.createdAt || new Date(),
      billNumber: editingRepair?.billNumber || billNumber,
      paymentMethod: formData.advanceAmount > 0 ? 'cash' : undefined
    };

    let updatedRepairs;
    if (editingRepair) {
      updatedRepairs = repairs.map(repair => 
        repair.id === editingRepair.id ? repairData : repair
      );
    } else {
      updatedRepairs = [...repairs, repairData];
    }

    setRepairs(updatedRepairs);
    localStorage.setItem('pos_repairs', JSON.stringify(updatedRepairs));

    // Add to dues if there's a due amount and it's a new repair
    if (!editingRepair && dueAmount > 0) {
      const dues = JSON.parse(localStorage.getItem('pos_dues') || '[]');
      dues.push({
        id: repairData.id,
        customerName: repairData.customerName,
        customerPhone: repairData.customerPhone,
        originalAmount: repairData.estimatedCost,
        paidAmount: repairData.advanceAmount,
        dueAmount: repairData.dueAmount,
        type: 'repair',
        billNumber: repairData.billNumber,
        createdAt: repairData.createdAt,
        payments: repairData.advanceAmount > 0 ? [{
          date: new Date(),
          amount: repairData.advanceAmount,
          method: 'cash'
        }] : []
      });
      localStorage.setItem('pos_dues', JSON.stringify(dues));
    }

    if (!editingRepair) {
      printRepairBill(repairData);
    }

    resetForm();
  };

  const handleAdvancePayment = (method: string, amount: number) => {
    if (!selectedRepair) return;

    const updatedRepair = {
      ...selectedRepair,
      advanceAmount: selectedRepair.advanceAmount + amount,
      dueAmount: selectedRepair.dueAmount - amount,
      paymentMethod: method
    };

    const updatedRepairs = repairs.map(repair =>
      repair.id === selectedRepair.id ? updatedRepair : repair
    );

    setRepairs(updatedRepairs);
    localStorage.setItem('pos_repairs', JSON.stringify(updatedRepairs));

    // Update dues
    const dues = JSON.parse(localStorage.getItem('pos_dues') || '[]');
    const updatedDues = dues.map((due: any) => {
      if (due.id === selectedRepair.id) {
        return {
          ...due,
          paidAmount: due.paidAmount + amount,
          dueAmount: due.dueAmount - amount,
          payments: [
            ...due.payments,
            {
              date: new Date(),
              amount,
              method
            }
          ]
        };
      }
      return due;
    });
    localStorage.setItem('pos_dues', JSON.stringify(updatedDues));

    setSelectedRepair(null);
    setShowPaymentModal(false);
  };

  const handleCostEdit = (repairId: string, currentCost: number) => {
    setEditingCost(repairId);
    setNewCost(currentCost);
  };

  const saveCostEdit = (repairId: string) => {
    const updatedRepairs = repairs.map(repair => {
      if (repair.id === repairId) {
        const newDueAmount = newCost - repair.advanceAmount;
        return {
          ...repair,
          estimatedCost: newCost,
          dueAmount: Math.max(0, newDueAmount)
        };
      }
      return repair;
    });

    setRepairs(updatedRepairs);
    localStorage.setItem('pos_repairs', JSON.stringify(updatedRepairs));

    // Update dues if exists
    const dues = JSON.parse(localStorage.getItem('pos_dues') || '[]');
    const updatedDues = dues.map((due: any) => {
      if (due.id === repairId) {
        const newDueAmount = newCost - due.paidAmount;
        return {
          ...due,
          originalAmount: newCost,
          dueAmount: Math.max(0, newDueAmount)
        };
      }
      return due;
    });
    localStorage.setItem('pos_dues', JSON.stringify(updatedDues));

    setEditingCost(null);
  };

  const cancelCostEdit = () => {
    setEditingCost(null);
    setNewCost(0);
  };

  const printRepairBill = (repair: Repair) => {
    const settings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
    
    const printContent = `
      <div style="width: 58mm; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.2;">
        <div style="text-align: center; margin-bottom: 10px;">
          <strong>${settings.shopName || 'Mobile Repair Shop'}</strong><br>
          ${settings.address || ''}<br>
          ${settings.phone || ''}<br>
          ${settings.email || ''}
        </div>
        <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 10px 0;">
          <strong>REPAIR ESTIMATE</strong><br>
          Bill #: ${repair.billNumber}<br>
          Date: ${repair.createdAt.toLocaleDateString()} ${repair.createdAt.toLocaleTimeString()}
        </div>
        <div style="margin-bottom: 10px;">
          Customer: ${repair.customerName}<br>
          ${repair.customerPhone ? `Phone: ${repair.customerPhone}<br>` : ''}
          Device: ${repair.deviceType} ${repair.deviceModel}<br>
          Issue: ${repair.issue}
        </div>
        <div style="border-bottom: 1px dashed #000; margin-bottom: 10px; padding-bottom: 10px;">
          Estimated Cost: ₹${repair.estimatedCost.toFixed(2)}<br>
          Advance Paid: ₹${repair.advanceAmount.toFixed(2)}<br>
          <strong>Due Amount: ₹${repair.dueAmount.toFixed(2)}</strong>
        </div>
        <div style="margin-bottom: 10px;">
          Status: ${repair.status.toUpperCase()}<br>
          ${repair.notes ? `Notes: ${repair.notes}<br>` : ''}
        </div>
        <div style="text-align: center; border-top: 1px dashed #000; padding-top: 10px;">
          <small>Keep this receipt safe<br>
          ${settings.footer || 'Thank you for choosing us!'}</small>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const filteredRepairs = repairs.filter(repair =>
    repair.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repair.customerPhone.includes(searchTerm) ||
    repair.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repair.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repair.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Repair Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Repair
        </button>
      </div>

      {/* Repair Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingRepair ? 'Edit Repair' : 'New Repair Job'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Customer Name *"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            <input
              type="tel"
              placeholder="Customer Phone"
              value={formData.customerPhone}
              onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="text"
              placeholder="Device Type *"
              value={formData.deviceType}
              onChange={(e) => setFormData({...formData, deviceType: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            <input
              type="text"
              placeholder="Device Model *"
              value={formData.deviceModel}
              onChange={(e) => setFormData({...formData, deviceModel: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            <textarea
              placeholder="Issue Description *"
              value={formData.issue}
              onChange={(e) => setFormData({...formData, issue: e.target.value})}
              className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
              required
            />
            
            <input
              type="number"
              placeholder="Estimated Cost *"
              value={formData.estimatedCost || ''}
              onChange={(e) => setFormData({...formData, estimatedCost: Number(e.target.value)})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
            
            <input
              type="number"
              placeholder="Advance Amount"
              value={formData.advanceAmount || ''}
              onChange={(e) => setFormData({...formData, advanceAmount: Number(e.target.value)})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
              max={formData.estimatedCost}
            />
            
            <textarea
              placeholder="Notes (Optional)"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-16"
            />
            
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
                {editingRepair ? 'Update Repair' : 'Create Repair'}
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
            placeholder="Search repairs by customer, phone, device, or bill number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Repairs List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRepairs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No repairs found
                  </td>
                </tr>
              ) : (
                filteredRepairs.map((repair) => (
                  <tr key={repair.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {repair.customerName}
                        </div>
                        <div className="text-sm text-gray-500">{repair.customerPhone}</div>
                        <div className="text-xs text-gray-400">{repair.billNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{repair.deviceType}</div>
                      <div className="text-sm text-gray-500">{repair.deviceModel}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={repair.issue}>
                        {repair.issue}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {editingCost === repair.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={newCost}
                              onChange={(e) => setNewCost(Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                              step="0.01"
                            />
                            <button
                              onClick={() => saveCostEdit(repair.id)}
                              className="text-green-600 hover:text-green-800 text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelCostEdit}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>₹{repair.estimatedCost.toFixed(2)}</span>
                            <button
                              onClick={() => handleCostEdit(repair.id, repair.estimatedCost)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-green-600">Advance: ₹{repair.advanceAmount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        repair.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        repair.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        repair.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {repair.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        repair.dueAmount > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ₹{repair.dueAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => printRepairBill(repair)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Print Bill"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {repair.dueAmount > 0 && (
                        <button
                          onClick={() => {
                            setSelectedRepair(repair);
                            setShowPaymentModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Pay Due"
                        >
                          Pay Due
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingRepair(repair);
                          setFormData({
                            customerName: repair.customerName,
                            customerPhone: repair.customerPhone,
                            deviceType: repair.deviceType,
                            deviceModel: repair.deviceModel,
                            issue: repair.issue,
                            estimatedCost: repair.estimatedCost,
                            advanceAmount: repair.advanceAmount,
                            notes: repair.notes
                          });
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedRepair && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={selectedRepair.dueAmount}
          customerName={selectedRepair.customerName}
          onPayment={(method, amount) => handleAdvancePayment(method, amount)}
        />
      )}
    </div>
  );
};

export default RepairManagement;