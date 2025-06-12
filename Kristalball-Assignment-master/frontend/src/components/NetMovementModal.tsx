import React from 'react';
import { X, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';

interface MovementData {
  purchases: Array<{ id: string; item: string; quantity: number; date: string; cost: number }>;
  transfersIn: Array<{ id: string; item: string; quantity: number; date: string; from: string }>;
  transfersOut: Array<{ id: string; item: string; quantity: number; date: string; to: string }>;
}

interface NetMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MovementData;
}

const NetMovementModal: React.FC<NetMovementModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Net Movement Breakdown</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Purchases */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <ShoppingCart className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-green-900">Purchases</h3>
              </div>
              <div className="space-y-3">
                {data.purchases.map((purchase) => (
                  <div key={purchase.id} className="bg-white rounded p-3 shadow-sm">
                    <p className="font-medium text-gray-900 text-sm">{purchase.item}</p>
                    <p className="text-sm text-gray-600">Qty: {purchase.quantity.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{new Date(purchase.date).toLocaleDateString()}</p>
                    <p className="text-xs text-green-600 font-medium">${purchase.cost.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transfers In */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-blue-900">Transfers In</h3>
              </div>
              <div className="space-y-3">
                {data.transfersIn.map((transfer) => (
                  <div key={transfer.id} className="bg-white rounded p-3 shadow-sm">
                    <p className="font-medium text-gray-900 text-sm">{transfer.item}</p>
                    <p className="text-sm text-gray-600">Qty: {transfer.quantity.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">From: {transfer.from}</p>
                    <p className="text-xs text-gray-500">{new Date(transfer.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transfers Out */}
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="text-lg font-medium text-red-900">Transfers Out</h3>
              </div>
              <div className="space-y-3">
                {data.transfersOut.map((transfer) => (
                  <div key={transfer.id} className="bg-white rounded p-3 shadow-sm">
                    <p className="font-medium text-gray-900 text-sm">{transfer.item}</p>
                    <p className="text-sm text-gray-600">Qty: {transfer.quantity.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">To: {transfer.to}</p>
                    <p className="text-xs text-gray-500">{new Date(transfer.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetMovementModal;