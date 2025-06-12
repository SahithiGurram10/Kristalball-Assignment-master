import React, { useState, useMemo } from 'react';
import { 
  Package, 
  TrendingUp, 
  Users, 
  Zap, 
  BarChart3 
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import FilterBar, { FilterState } from '../components/FilterBar';
import NetMovementModal from '../components/NetMovementModal';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { assets, purchases, transfers, assignments, expenditures } = useData();
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    dateRange: '30days',
    base: user?.base === 'All Bases' ? 'All Bases' : user?.base || 'All Bases',
    equipmentType: 'All Types'
  });
  const [showNetMovementModal, setShowNetMovementModal] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      if (filters.base !== 'All Bases' && asset.base !== filters.base) return false;
      if (filters.equipmentType !== 'All Types' && asset.type !== filters.equipmentType) return false;
      return true;
    });
  }, [assets, filters]);

  const metrics = useMemo(() => {
    const totalAssets = filteredAssets.reduce((sum, asset) => sum + asset.quantity, 0);
    const assignedAssets = assignments.filter(a => a.status === 'Active').length;
    const expendedAssets = expenditures.reduce((sum, exp) => sum + exp.quantity, 0);
    
    // Calculate net movement (simplified for demo)
    const recentPurchases = purchases.filter(p => {
      if (filters.base !== 'All Bases' && p.receivingBase !== filters.base) return false;
      return true;
    });
    const purchaseQuantity = recentPurchases.reduce((sum, p) => sum + p.quantity, 0);
    
    const transfersIn = transfers.filter(t => {
      if (filters.base !== 'All Bases' && t.destinationBase !== filters.base) return false;
      return t.status === 'Completed';
    });
    const transfersOut = transfers.filter(t => {
      if (filters.base !== 'All Bases' && t.sourceBase !== filters.base) return false;
      return t.status === 'Completed';
    });
    
    const transferInQuantity = transfersIn.reduce((sum, t) => sum + t.quantity, 0);
    const transferOutQuantity = transfersOut.reduce((sum, t) => sum + t.quantity, 0);
    
    const netMovement = purchaseQuantity + transferInQuantity - transferOutQuantity;

    return {
      totalAssets,
      assignedAssets,
      expendedAssets,
      netMovement,
      openingBalance: totalAssets - netMovement, // Simplified calculation
      closingBalance: totalAssets
    };
  }, [filteredAssets, assignments, expenditures, purchases, transfers, filters]);

  const netMovementData = {
    purchases: purchases.map(p => ({
      id: p.id,
      item: p.assetName,
      quantity: p.quantity,
      date: p.purchaseDate,
      cost: p.totalCost
    })),
    transfersIn: transfers.filter(t => t.status === 'Completed').map(t => ({
      id: t.id,
      item: t.assetType,
      quantity: t.quantity,
      date: t.transferDate,
      from: t.sourceBase
    })),
    transfersOut: transfers.filter(t => t.status === 'Completed').map(t => ({
      id: t.id,
      item: t.assetType,
      quantity: t.quantity,
      date: t.transferDate,
      to: t.destinationBase
    }))
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of military assets and operations</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <BarChart3 className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Opening Balance"
          value={metrics.openingBalance}
          icon={Package}
          color="blue"
          subtitle="Assets at period start"
        />
        <MetricCard
          title="Closing Balance"
          value={metrics.closingBalance}
          icon={Package}
          color="green"
          subtitle="Current total assets"
        />
        <MetricCard
          title="Net Movement"
          value={metrics.netMovement}
          icon={TrendingUp}
          color="purple"
          onClick={() => setShowNetMovementModal(true)}
          subtitle="Click for breakdown"
        />
        <MetricCard
          title="Assigned Assets"
          value={metrics.assignedAssets}
          icon={Users}
          color="yellow"
          subtitle="Currently deployed"
        />
        <MetricCard
          title="Expended Assets"
          value={metrics.expendedAssets}
          icon={Zap}
          color="red"
          subtitle="Used/consumed"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {transfers.slice(0, 5).map((transfer) => (
              <div key={transfer.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{transfer.assetType} Transfer</p>
                  <p className="text-sm text-gray-600">
                    {transfer.sourceBase} → {transfer.destinationBase}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Qty: {transfer.quantity}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    transfer.status === 'Completed' 
                      ? 'bg-green-100 text-green-800'
                      : transfer.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transfer.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Distribution</h3>
          <div className="space-y-4">
            {Object.entries(
              filteredAssets.reduce((acc, asset) => {
                acc[asset.type] = (acc[asset.type] || 0) + asset.quantity;
                return acc;
              }, {} as Record<string, number>)
            ).map(([type, quantity]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-900 font-medium">{type}</span>
                </div>
                <span className="text-gray-600 font-medium">{quantity.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NetMovementModal
        isOpen={showNetMovementModal}
        onClose={() => setShowNetMovementModal(false)}
        data={netMovementData}
      />
    </div>
  );
};

export default Dashboard;