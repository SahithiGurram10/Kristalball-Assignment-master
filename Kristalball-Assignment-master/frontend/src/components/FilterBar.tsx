import React from 'react';
import { Calendar, MapPin, Package } from 'lucide-react';

export interface FilterState {
  dateRange: string;
  base: string;
  equipmentType: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const bases = ['All Bases', 'Fort Alpha', 'Fort Bravo', 'Fort Charlie', 'Fort Delta'];
  const equipmentTypes = ['All Types', 'Vehicles', 'Small Arms', 'Ammunition', 'Heavy Weaponry', 'Communications'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange('dateRange', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-gray-400" />
          <select
            value={filters.base}
            onChange={(e) => onFilterChange('base', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {bases.map(base => (
              <option key={base} value={base}>{base}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-gray-400" />
          <select
            value={filters.equipmentType}
            onChange={(e) => onFilterChange('equipmentType', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {equipmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;