import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart, Trash2, Search } from 'lucide-react';
import PaymentModal from './PaymentModal';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Sale {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  paidAmount: number;
  dueAmount: number;
  createdAt: Date;
}

const POSSystem: React.FC = () => {
  const [inventory] = useState(() => {
    const saved = localStorage.getItem('pos_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const filteredProducts = inventory.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: item.price * (item.quantity + 1) }
            : item
        ));
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, {
          id: product.id,
          name: product.name,
          price: product.sellingPrice,
          quantity: 1,
          total: product.sellingPrice
        }]);
      }
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      const product = inventory.find((p: any) => p.id === id);
      if (product && newQuantity <= product.stock) {
        setCart(cart.map(item =>
          item.id === id
            ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
            : item
        ));
      }
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discount) / 100 
    : Math.min(discount, subtotal);
  const total = subtotal - discountAmount;

  const handlePayment = (method: string, paidAmount: number, isDue: boolean) => {
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    const billNumber = `SALE-${Date.now()}`;
    const dueAmount = total - paidAmount;

    const sale: Sale = {
      id: Date.now().toString(),
      billNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: [...cart],
      subtotal,
      discount,
      discountType,
      discountAmount,
      total,
      paymentMethod: method,
      paidAmount,
      dueAmount,
      createdAt: new Date()
    };

    // Save sale
    const sales = JSON.parse(localStorage.getItem('pos_sales') || '[]');
    sales.push(sale);
    localStorage.setItem('pos_sales', JSON.stringify(sales));

    // Update inventory
    const updatedInventory = inventory.map((product: any) => {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        return { ...product, stock: product.stock - cartItem.quantity };
      }
      return product;
    });
    localStorage.setItem('pos_inventory', JSON.stringify(updatedInventory));

    // Add to dues if there's a due amount
    if (dueAmount > 0) {
      const dues = JSON.parse(localStorage.getItem('pos_dues') || '[]');
      dues.push({
        id: sale.id,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        originalAmount: sale.total,
        paidAmount: sale.paidAmount,
        dueAmount: sale.dueAmount,
        type: 'sale',
        billNumber: sale.billNumber,
        createdAt: sale.createdAt,
        payments: paidAmount > 0 ? [{
          date: new Date(),
          amount: paidAmount,
          method
        }] : []
      });
      localStorage.setItem('pos_dues', JSON.stringify(dues));
    }

    // Print bill
    printBill(sale);

    // Reset form
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setShowPaymentModal(false);
  };

  const printBill = (sale: Sale) => {
    const settings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
    
    const printContent = `
      <div style="width: 58mm; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.2;">
        <div style="text-align: center; margin-bottom: 10px;">
          <strong>${settings.shopName || 'Electronics Store'}</strong><br>
          ${settings.address || ''}<br>
          ${settings.phone || ''}<br>
          ${settings.email || ''}
        </div>
        <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 10px 0;">
          <strong>SALES RECEIPT</strong><br>
          Bill #: ${sale.billNumber}<br>
          Date: ${sale.createdAt.toLocaleDateString()} ${sale.createdAt.toLocaleTimeString()}
        </div>
        <div style="margin-bottom: 10px;">
          Customer: ${sale.customerName}<br>
          ${sale.customerPhone ? `Phone: ${sale.customerPhone}<br>` : ''}
        </div>
        <div style="border-bottom: 1px dashed #000; margin-bottom: 10px;">
          ${sale.items.map(item => `
            ${item.name}<br>
            ${item.quantity} x ₹${item.price.toFixed(2)} = ₹${item.total.toFixed(2)}<br>
          `).join('')}
        </div>
        <div style="margin-bottom: 10px;">
          Subtotal: ₹${sale.subtotal.toFixed(2)}<br>
          ${sale.discountAmount > 0 ? `Discount (${sale.discountType === 'percentage' ? sale.discount + '%' : '₹' + sale.discount}): -₹${sale.discountAmount.toFixed(2)}<br>` : ''}
          <strong>Total: ₹${sale.total.toFixed(2)}</strong><br>
          Paid (${sale.paymentMethod.toUpperCase()}): ₹${sale.paidAmount.toFixed(2)}<br>
          ${sale.dueAmount > 0 ? `<strong>Due: ₹${sale.dueAmount.toFixed(2)}</strong><br>` : ''}
        </div>
        <div style="text-align: center; border-top: 1px dashed #000; padding-top: 10px;">
          <small>Thank you for your business!<br>
          ${settings.footer || 'Visit again soon!'}</small>
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Products</h3>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredProducts.map((product: any) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:border-blue-500 ${
                  product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-600">{product.category}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg font-bold text-blue-600">
                    ₹{product.sellingPrice.toFixed(2)}
                  </span>
                  <span className={`text-sm ${product.stock <= 5 ? 'text-red-600' : 'text-gray-500'}`}>
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Cart ({cart.length})</h3>
          </div>

          {/* Customer Details */}
          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Customer Name *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Customer Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Discount Section */}
            <div className="border-t pt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max={discountType === 'percentage' ? 100 : subtotal}
                />
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">₹</option>
                </select>
              </div>
              {discount > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  Discount: -₹{discountAmount.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Cart is empty</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discountType === 'percentage' ? discount + '%' : '₹' + discount}):</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={!customerName.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Proceed to Payment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={total}
        customerName={customerName}
        onPayment={handlePayment}
      />
    </div>
  );
};

export default POSSystem;