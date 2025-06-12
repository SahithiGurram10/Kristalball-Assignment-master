import React, { useState } from 'react';
import { Plus, Search, User, Package, Zap, CheckCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const Assignments: React.FC = () => {
  const { assignments, expenditures, assets, addAssignment, addExpenditure } = useData();
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'assignments' | 'expenditures'>('assignments');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showExpendForm, setShowExpendForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState('');
  
  const [assignmentFormData, setAssignmentFormData] = useState({
    assetType: '',
    assetId: '',
    personnelId: '',
    personnelName: '',
    base: user?.base === 'All Bases' ? '' : user?.base || '',
    purpose: '',
    expectedReturnDate: ''
  });

  const [expenditureFormData, setExpenditureFormData] = useState({
    assetType: '',
    quantity: '',
    base: user?.base === 'All Bases' ? '' : user?.base || '',
    reason: '',
    reportingPersonnel: user?.name || ''
  });

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assignment = {
      assetType: assignmentFormData.assetType,
      assetId: assignmentFormData.assetId,
      personnelId: assignmentFormData.personnelId,
      personnelName: assignmentFormData.personnelName,
      assignmentDate: new Date().toISOString().split('T')[0],
      base: assignmentFormData.base,
      purpose: assignmentFormData.purpose,
      expectedReturnDate: assignmentFormData.expectedReturnDate || undefined,
      status: 'Active' as const
    };

    addAssignment(assignment);
    setShowAssignForm(false);
    setShowSuccess('assignment');
    
    // Reset form
    setAssignmentFormData({
      assetType: '',
      assetId: '',
      personnelId: '',
      personnelName: '',
      base: user?.base === 'All Bases' ? '' : user?.base || '',
      purpose: '',
      expectedReturnDate: ''
    });

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const handleExpenditureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expenditure = {
      assetType: expenditureFormData.assetType,
      quantity: parseInt(expenditureFormData.quantity),
      expenditureDate: new Date().toISOString().split('T')[0],
      base: expenditureFormData.base,
      reason: expenditureFormData.reason,
      reportingPersonnel: expenditureFormData.reportingPersonnel
    };

    addExpenditure(expenditure);
    setShowExpendForm(false);
    setShowSuccess('expenditure');
    
    // Reset form
    setExpenditureFormData({
      assetType: '',
      quantity: '',
      base: user?.base === 'All Bases' ? '' : user?.base || '',
      reason: '',
      reportingPersonnel: user?.name || ''
    });

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.assetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.personnelName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBase = user?.base === 'All Bases' || assignment.base === user?.base;
    return matchesSearch && matchesBase;
  });

  const filteredExpenditures = expenditures.filter(expenditure => {
    const matchesSearch = expenditure.assetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expenditure.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBase = user?.base === 'All Bases' || expenditure.base === user?.base;
    return matchesSearch && matchesBase;
  });

  const equipmentTypes = [...new Set(assets.map(asset => asset.type))];
  const bases = ['Fort Alpha', 'Fort Bravo', 'Fort Charlie', 'Fort Delta'];

  return (
    <div className="space-y-6">
      {/* Success Messages */}
      {showSuccess === 'assignment' && (
        <div className="fixed top-4 right-4 z-50 flex items-center p-4 bg-green-50 border border-green-200 rounded-lg shadow-lg">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">Asset assigned successfully!</span>
        </div>
      )}
      {showSuccess === 'expenditure' && (
        <div className="fixed top-4 right-4 z-50 flex items-center p-4 bg-green-50 border border-green-200 rounded-lg shadow-lg">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">Expenditure reported successfully!</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments & Expenditures</h1>
          <p className="text-gray-600 mt-1">Manage personnel assignments and asset usage</p>
        </div>
        <div className="flex space-x-3">
          {hasPermission('create_assignment') && (
            <button
              onClick={() => setShowAssignForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <User className="h-4 w-4 mr-2" />
              Assign Asset
            </button>
          )}
          {hasPermission('create_expenditure') && (
            <button
              onClick={() => setShowExpendForm(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Zap className="h-4 w-4 mr-2" />
              Report Expenditure
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'assignments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Assignments ({filteredAssignments.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('expenditures')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'expenditures'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Expenditures ({filteredExpenditures.length})
              </div>
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Assignment Form */}
      {showAssignForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Assign Asset to Personnel</h2>
          <form onSubmit={handleAssignmentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Type *
              </label>
              <select
                value={assignmentFormData.assetType}
                onChange={(e) => setAssignmentFormData({...assignmentFormData, assetType: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select equipment type</option>
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset ID *
              </label>
              <input
                type="text"
                value={assignmentFormData.assetId}
                onChange={(e) => setAssignmentFormData({...assignmentFormData, assetId: e.target.value})}
                required
                placeholder="Enter asset ID or serial number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personnel ID *
              </label>
              <input
                type="text"
                value={assignmentFormData.personnelId}
                onChange={(e) => setAssignmentFormData({...assignmentFormData, personnelId: e.target.value})}
                required
                placeholder="Enter personnel ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personnel Name *
              </label>
              <input
                type="text"
                value={assignmentFormData.personnelName}
                onChange={(e) => setAssignmentFormData({...assignmentFormData, personnelName: e.target.value})}
                required
                placeholder="Enter full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base *
              </label>
              <select
                value={assignmentFormData.base}
                onChange={(e) => setAssignmentFormData({...assignmentFormData, base: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select base</option>
                {bases.map(base => (
                  <option key={base} value={base}>{base}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose *
              </label>
              <input
                type="text"
                value={assignmentFormData.purpose}
                onChange={(e) => setAssignmentFormData({...assignmentFormData, purpose: e.target.value})}
                required
                placeholder="e.g., Security Detail, Training"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Return Date
              </label>
              <input
                type="date"
                value={assignmentFormData.expectedReturnDate}
                onChange={(e) => setAssignmentFormData({...assignmentFormData, expectedReturnDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAssignForm(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Assign Asset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenditure Form */}
      {showExpendForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Asset Expenditure</h2>
          <form onSubmit={handleExpenditureSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Type *
              </label>
              <select
                value={expenditureFormData.assetType}
                onChange={(e) => setExpenditureFormData({...expenditureFormData, assetType: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select equipment type</option>
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Expended *
              </label>
              <input
                type="number"
                value={expenditureFormData.quantity}
                onChange={(e) => setExpenditureFormData({...expenditureFormData, quantity: e.target.value})}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base *
              </label>
              <select
                value={expenditureFormData.base}
                onChange={(e) => setExpenditureFormData({...expenditureFormData, base: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select base</option>
                {bases.map(base => (
                  <option key={base} value={base}>{base}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Expenditure *
              </label>
              <input
                type="text"
                value={expenditureFormData.reason}
                onChange={(e) => setExpenditureFormData({...expenditureFormData, reason: e.target.value})}
                required
                placeholder="e.g., Training Exercise, Combat Operation"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reporting Personnel *
              </label>
              <input
                type="text"
                value={expenditureFormData.reportingPersonnel}
                onChange={(e) => setExpenditureFormData({...expenditureFormData, reportingPersonnel: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowExpendForm(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Report Expenditure
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content based on active tab */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === 'assignments' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Personnel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{assignment.assetType}</div>
                        <div className="text-sm text-gray-500">ID: {assignment.assetId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{assignment.personnelName}</div>
                        <div className="text-sm text-gray-500">ID: {assignment.personnelId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.base}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(assignment.assignmentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        assignment.status === 'Active' 
                          ? 'bg-green-100 text-green-800'
                          : assignment.status === 'Returned'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenditures.map((expenditure) => (
                  <tr key={expenditure.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expenditure.assetType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expenditure.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expenditure.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expenditure.base}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expenditure.expenditureDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expenditure.reportingPersonnel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;