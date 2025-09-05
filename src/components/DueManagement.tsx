import React, { useState } from 'react';
import { Clock, CreditCard, Search, Eye } from 'lucide-react';
import PaymentModal from './PaymentModal';

interface Due {
  id: string;
  customerName: string;
  customerPhone: string;
  originalAmount: number;
  paidAmount: number;
  dueAmount: number;
  type: 'repair' | 'sale';
  billNumber: string;
  createdAt: Date;
  payments: {
    date: Date;
    amount: number;
    method: string;
  }[];
}

const DueManagement: React.FC = () => {
  const [dues, setDues] = useState<Due[]>(() => {
    const saved = localStorage.getItem('pos_dues');
    return saved ? JSON.parse(saved).map((due: any) => ({
      ...due,
      createdAt: new Date(due.createdAt),
      payments: due.payments.map((payment: any) => ({
        ...payment,
        date: new Date(payment.date)
      }))
    })) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDue, setSelectedDue] = useState<Due | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState<string | null>(null);

  const filteredDues = dues.filter(due =>
    due.dueAmount > 0 && (
      due.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      due.customerPhone.includes(searchTerm) ||
      due.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDuePayment = (method: string, amount: number) => {
    if (!selectedDue) return;

    const paymentAmount = Math.min(amount, selectedDue.dueAmount);
    const updatedDue = {
      ...selectedDue,
      paidAmount: selectedDue.paidAmount + paymentAmount,
      dueAmount: selectedDue.dueAmount - paymentAmount,
      payments: [
        ...selectedDue.payments,
        {
          date: new Date(),
          amount: paymentAmount,
          method
        }
      ]
    };

    const updatedDues = dues.map(due =>
      due.id === selectedDue.id ? updatedDue : due
    );

    setDues(updatedDues);
    localStorage.setItem('pos_dues', JSON.stringify(updatedDues));
    setSelectedDue(null);
  };

  const totalDueAmount = dues.reduce((sum, due) => sum + due.dueAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Due Management</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Outstanding</p>
          <p className="text-2xl font-bold text-red-600">₹{totalDueAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer name, phone, or bill number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No dues found
                  </td>
                </tr>
              ) : (
                filteredDues.map((due) => (
                  <tr key={due.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {due.customerName}
                        </div>
                        <div className="text-sm text-gray-500">{due.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {due.billNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        due.type === 'repair'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {due.type === 'repair' ? 'Repair' : 'Sale'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{due.originalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      ₹{due.paidAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      ₹{due.dueAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {due.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDue(due);
                          setShowPaymentModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Pay Due
                      </button>
                      <button
                        onClick={() => setShowPaymentHistory(showPaymentHistory === due.id ? null : due.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Payment History */}
        {showPaymentHistory && (
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Payment History</h4>
            {dues.find(due => due.id === showPaymentHistory)?.payments.map((payment, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <div>
                  <span className="text-sm font-medium">{payment.method.toUpperCase()}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {payment.date.toLocaleDateString()} {payment.date.toLocaleTimeString()}
                  </span>
                </div>
                <span className="text-sm font-medium text-green-600">
                  ₹{payment.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedDue && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={selectedDue.dueAmount}
          customerName={selectedDue.customerName}
          onPayment={(method, amount) => handleDuePayment(method, amount)}
        />
      )}
    </div>
  );
};

export default DueManagement;