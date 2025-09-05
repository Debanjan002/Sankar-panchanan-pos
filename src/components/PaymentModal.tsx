import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Banknote, Clock } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPayment: (method: string, amount: number, isDue: boolean) => void;
  customerName: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  onPayment,
  customerName
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('cash');
  const [paidAmount, setPaidAmount] = useState<number>(amount);
  const [isDuePayment, setIsDuePayment] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePayment = () => {
    onPayment(selectedMethod, paidAmount, isDuePayment);
    onClose();
  };

  const dueAmount = amount - paidAmount;

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: Banknote },
    { id: 'card', name: 'Card', icon: CreditCard },
    { id: 'upi', name: 'UPI', icon: Smartphone },
    { id: 'due', name: 'Due', icon: Clock },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Payment</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Customer: {customerName}</p>
            <p className="text-2xl font-bold text-blue-600">₹{amount.toFixed(2)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount
            </label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              max={amount}
              min={0}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {dueAmount > 0 && (
              <p className="text-sm text-amber-600 mt-1">
                Due Amount: ₹{dueAmount.toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => {
                      setSelectedMethod(method.id);
                      if (method.id === 'due') {
                        setPaidAmount(0);
                        setIsDuePayment(true);
                      } else {
                        setIsDuePayment(false);
                        if (paidAmount === 0) setPaidAmount(amount);
                      }
                    }}
                    className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{method.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {selectedMethod === 'due' ? 'Add to Due' : 'Process Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;