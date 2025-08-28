import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  CreditCard
} from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from '../axiosConfig';

const timelineSteps = [
  { key: 'pending',    label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Processing',   icon: Package },
  { key: 'shipped',    label: 'Shipped',      icon: Truck },
  { key: 'delivered',  label: 'Delivered',    icon: CheckCircle },
];

export default function OrderTracking() {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    (async () => {
      if (!orderId) {
        setError('Order not found.');
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`/orders/${orderId}`, {
          responseType: 'text',
          headers: { Accept: 'text/plain' }
        });
        setOrder(JSON.parse(res.data));
      } catch {
        setError('Failed to load order. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  const getStatusIcon = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered':   return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'shipped':
      case 'in transit':  return <Truck className="w-6 h-6 text-blue-500" />;
      case 'processing':  return <Package className="w-6 h-6 text-orange-500" />;
      case 'pending':     return <Clock className="w-6 h-6 text-yellow-500" />;
      default:            return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColors = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered':   return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'shipped':
      case 'in transit':  return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'processing':  return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700';
      case 'pending':     return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      default:            return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    }
  };

  const getDeliveryMethodName = (o) => {
    if (o.deliveryWays) return o.deliveryWays;
    const map = {
      1: 'Standard Delivery',
      2: 'Express Delivery',
      3: 'Same-Day Delivery',
      4: 'Pickup'
    };
    return map[o.deliveryMethodId] || 'Standard Delivery';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="pt-20 px-4">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow border border-gray-200 dark:border-gray-800 text-center">
            <Package className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Oops!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/profile/history')}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeStep = Math.max(
    0,
    timelineSteps.findIndex(s => s.key === (order.status || '').toLowerCase())
  );
  const placedOn = new Date(order.orderDate).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  const deliveryFee = ((order.total ?? 0) - (order.subtotal ?? 0)).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="pt-24 sm:pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/profile/history')}
                className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border dark:border-gray-700 rounded-xl transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Tracking</h1>
                <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-1 mt-1">
                  <Calendar className="w-4 h-4" /> Placed on {placedOn}
                </p>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStatusColors(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="capitalize font-semibold">{order.status}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order Progress</h2>
            <div className="relative">
              <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div
                className="absolute top-5 left-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all"
                style={{ width: `${(activeStep / (timelineSteps.length - 1)) * 100}%` }}
              />
              <div className="relative flex justify-between">
                {timelineSteps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isActive = idx <= activeStep;
                  const isCurrent = idx === activeStep;
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition 
                          ${isActive ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 shadow' : 'bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700'}
                          ${isCurrent ? 'ring-4 ring-orange-200 dark:ring-orange-800/40' : ''}`}
                      >
                        <StepIcon className={`${isActive ? 'text-orange-600' : 'text-gray-400'} w-5 h-5`} />
                      </div>
                      <span className={`mt-2 text-xs text-center ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Shipping & Delivery */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" /> Shipping Address
              </h3>
              <address className="not-italic text-gray-700 dark:text-gray-300 text-sm space-y-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {order.shippingAddress.firstname} {order.shippingAddress.lastname}
                </div>
                <div>{order.shippingAddress.street}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.country}</div>
              </address>
            </div>
            {/* Delivery Method */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500" /> Delivery Method
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-2 text-sm">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {getDeliveryMethodName(order)}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Fee: {order.deliveryWay === 'FREE' ? 'FREE' : `$${deliveryFee}`}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" /> Items ({order.orderItems?.length || 0})
            </h3>
            {order.orderItems?.length > 0 ? (
              <div className="space-y-4">
                {order.orderItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow transition">
                    {item.pictureUrl && (
                      <img
                        src={item.pictureUrl}
                        alt={item.productName}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {item.productName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-12">No items found</p>
            )}
          </div>

          {/* Receipt */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-500" /> Receipt
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-medium">{order.deliveryWay === 'FREE' ? 'FREE' : `$${deliveryFee}`}</span>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-600 dark:text-orange-400">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
