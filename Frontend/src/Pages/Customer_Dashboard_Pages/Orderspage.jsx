import React, { useState } from 'react';
import { Truck, CheckCircle, Clock, ChefHat, Package } from 'lucide-react';

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 mt-1">Track and manage your food orders</p>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-gray-100 p-1 rounded-xl inline-flex mb-8">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'active'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Active Orders (1)
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'past'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Past Orders (1)
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-6 mb-10">
        {activeTab === 'active' ? (
          // Active Order Card
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {/* Header Row */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900">South Indian Express</h3>
                <p className="text-gray-500 text-sm">Order #02</p>
              </div>
              <span className="flex items-center gap-1.5 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                <CheckCircle size={12} /> Confirmed
              </span>
            </div>

            {/* Items List */}
            <div className="mb-6">
              <p className="text-gray-500 text-sm mb-2">Items</p>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 pl-1">
                <li>Idli Sambhar</li>
                <li>Coconut Chutney</li>
                <li>Filter Coffee</li>
              </ul>
            </div>

            {/* Date & Delivery Info */}
            <div className="flex flex-col sm:flex-row gap-8 mb-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-gray-400 text-xs mb-1">Order Date</p>
                <p className="font-semibold text-gray-900">4 Jan 2026</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Delivery Type</p>
                <div className="flex items-center gap-2 font-semibold text-gray-900">
                  <Truck size={16} className="text-orange-600" />
                  Delivery
                </div>
              </div>
            </div>

            {/* Footer Row */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-orange-600">₹100</p>
              </div>
              <button className="bg-[#EA580C] hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                View Details
              </button>
            </div>
          </div>
        ) : (
           // Placeholder for Past Orders (Can add similar card here later)
           <div className="text-center py-10 text-gray-500">No past orders found.</div>
        )}
      </div>

      {/* Status Guide Footer */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">Order Status Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="flex items-center gap-3">
            <span className="bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full min-w-[80px] text-center">
              Pending
            </span>
            <span className="text-gray-600 text-sm">Order placed, awaiting confirmation</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full min-w-[80px] text-center">
              Confirmed
            </span>
            <span className="text-gray-600 text-sm">Order confirmed by vendor</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full min-w-[80px] text-center">
              Preparing
            </span>
            <span className="text-gray-600 text-sm">Your meal is being prepared</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full min-w-[80px] text-center">
              Delivered
            </span>
            <span className="text-gray-600 text-sm">Order successfully delivered</span>
          </div>

        </div>
      </div>
    </>
  );
};

export default OrdersPage;