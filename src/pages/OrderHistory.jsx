import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Loader2, Repeat, History, User, Building, LogOut, Heart, Package, Calendar, CreditCard, Eye, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/orders/UserOrders');
        // Map the API response to match component expectations
        const mappedOrders = Array.isArray(res.data) ? res.data.map(order => ({
          ...order,
          items: order.orderItems || [], // Map orderItems to items
          total: order.subtotal || 0,     // Map subtotal to total
          status: order.status || 'Processing' // Default status if not provided
        })) : [];
        setOrders(mappedOrders);
      } catch (err) {
        console.error('Failed to fetch orders', err);
        toast.error('Error loading orders.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await axios.get('/Authentication/user');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to fetch user info', err);
      }
    };

    fetchOrders();
    fetchUser();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const repeatOrder = async (order) => {
    try {
      const newItems = Array.isArray(order.items)
        ? order.items.map((item) => ({
            id: item.productsId,
            productName: item.productName,
            pictureUrl: item.pictureUrl,
            price: item.price,
            quantity: item.quantity
          }))
        : [];

      const basketId = localStorage.getItem('basketId') || Math.random().toString(36).slice(2);
      localStorage.setItem('basketId', basketId);

      const basketPayload = {
        id: basketId,
        items: newItems,
        paymentIntentId: '',
        deliveryMethodId: 0,
        clientSecret: '',
        shippingPrice: 0
      };

      await axios.post('/basket', basketPayload);
      toast.success('Order repeated successfully!');
      navigate('/cart');
    } catch (err) {
      console.error(err);
      toast.error('Failed to repeat order');
    }
  };

  const OrderModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="text-xl font-semibold">#{order.id}</p>
                </div>
                {order.status && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Order Date</p>
                  <p className="font-medium">{formatDate(order.orderDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Amount</p>
                  <p className="font-medium text-lg">${order.total?.toFixed(2) ?? '0.00'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Items Ordered</h3>
              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div key={item.productsId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {item.pictureUrl && (
                      <img
                        src={item.pictureUrl}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${item.price?.toFixed(2) ?? '0.00'}</p>
                      <p className="text-sm text-gray-500">each</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No items in this order.</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">${order.total?.toFixed(2) ?? '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account</h2>
            <nav className="space-y-2">
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/profile')}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/profile/favorites')}
              >
                <Heart className="w-4 h-4" />
                Favorites
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg bg-orange-50 text-orange-700 border border-orange-200"
                onClick={() => navigate('/profile/history')}
              >
                <Building className="w-4 h-4" />
                History
              </button>
              <hr className="my-4 border-gray-200" />
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => {
                  localStorage.removeItem('userInfo');
                  navigate('/login');
                }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <History className="w-8 h-8" />
                  Order History
                </h1>
                <p className="text-orange-100 mt-2">Track and manage your previous orders</p>
              </div>
              {user.name && (
                <div className="text-right">
                  <p className="text-orange-100 text-sm">Welcome back,</p>
                  <p className="font-semibold text-xl">{user.name}</p>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Loading your orders...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600">When you place your first order, it will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Spent</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ${orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Last Order</p>
                      <p className="text-lg font-bold text-gray-900">
                        {orders.length > 0 ? new Date(orders[0].orderDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders List */}
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold">
                          #{order.id.toString().slice(-3)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.orderDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">${order.total?.toFixed(2) ?? '0.00'}</p>
                          <p className="text-sm text-gray-500">Total</p>
                        </div>
                        {order.status && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-3 mb-4">
                          {order.items.slice(0, 4).map((item) => (
                            <div key={item.productsId} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 flex-1 min-w-[200px]">
                              {item.pictureUrl && (
                                <img
                                  src={item.pictureUrl}
                                  alt={item.productName}
                                  className="w-12 h-12 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price?.toFixed(2) ?? '0.00'}</p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-3 min-w-[100px]">
                              <span className="text-gray-600 font-medium">+{order.items.length - 4} more</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic mb-4">No items in this order.</p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => repeatOrder(order)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      >
                        <Repeat className="w-4 h-4" />
                        Repeat Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}