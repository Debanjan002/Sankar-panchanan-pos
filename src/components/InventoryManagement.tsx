import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  supplier: string;
  createdAt: Date;
}

const InventoryManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pos_inventory');
    return saved ? JSON.parse(saved).map((product: any) => ({
      ...product,
      createdAt: new Date(product.createdAt)
    })) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 5,
    supplier: ''
  });

  const categories = [
    'Mobile Phones',
    'Phone Cases',
    'Screen Protectors',
    'Chargers',
    'Cables',
    'Headphones',
    'Power Banks',
    'Memory Cards',
    'Speakers',
    'Accessories',
    'Repair Parts',
    'Tools'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      costPrice: 0,
      sellingPrice: 0,
      stock: 0,
      minStock: 5,
      supplier: ''
    });
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      ...formData,
      createdAt: editingProduct?.createdAt || new Date()
    };

    let updatedProducts;
    if (editingProduct) {
      updatedProducts = products.map(product => 
        product.id === editingProduct.id ? productData : product
      );
    } else {
      updatedProducts = [...products, productData];
    }

    setProducts(updatedProducts);
    localStorage.setItem('pos_inventory', JSON.stringify(updatedProducts));
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      minStock: product.minStock,
      supplier: product.supplier
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem('pos_inventory', JSON.stringify(updatedProducts));
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(product => product.stock <= product.minStock);
  const totalInventoryValue = products.reduce((sum, product) => sum + (product.costPrice * product.stock), 0);
  const totalSellingValue = products.reduce((sum, product) => sum + (product.sellingPrice * product.stock), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-xl font-bold text-red-600">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">₹</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Inventory Value</p>
              <p className="text-xl font-bold text-green-600">₹{totalInventoryValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 font-bold">₹</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Selling Value</p>
              <p className="text-xl font-bold text-emerald-600">₹{totalSellingValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-red-800">Low Stock Alert</h3>
          </div>
          <p className="text-sm text-red-700 mb-3">
            The following products are running low on stock:
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.map(product => (
              <span key={product.id} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                {product.name} ({product.stock} left)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Product Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category *</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <input
              type="number"
              placeholder="Cost Price *"
              value={formData.costPrice || ''}
              onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
            
            <input
              type="number"
              placeholder="Selling Price *"
              value={formData.sellingPrice || ''}
              onChange={(e) => setFormData({...formData, sellingPrice: Number(e.target.value)})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
            
            <input
              type="number"
              placeholder="Current Stock *"
              value={formData.stock || ''}
              onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
            />
            
            <input
              type="number"
              placeholder="Minimum Stock Level"
              value={formData.minStock || ''}
              onChange={(e) => setFormData({...formData, minStock: Number(e.target.value)})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            
            <input
              type="text"
              placeholder="Supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Selling Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const margin = ((product.sellingPrice - product.costPrice) / product.costPrice * 100);
                  const isLowStock = product.stock <= product.minStock;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">{product.supplier}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{product.costPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{product.sellingPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            isLowStock ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {product.stock}
                          </span>
                          {isLowStock && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {product.minStock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          margin > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Inventory Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Cost Value</p>
            <p className="text-xl font-bold text-blue-600">₹{totalInventoryValue.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Selling Value</p>
            <p className="text-xl font-bold text-green-600">₹{totalSellingValue.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Potential Profit</p>
            <p className="text-xl font-bold text-emerald-600">
              ₹{(totalSellingValue - totalInventoryValue).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;