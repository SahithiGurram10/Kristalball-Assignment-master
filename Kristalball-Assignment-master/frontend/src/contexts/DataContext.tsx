import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Asset {
  id: string;
  type: string;
  name: string;
  quantity: number;
  base: string;
  status: 'Available' | 'Assigned' | 'In Transit' | 'Expended';
  assignedTo?: string;
  dateAdded: string;
}

export interface Purchase {
  id: string;
  assetType: string;
  assetName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  purchaseDate: string;
  supplier: string;
  receivingBase: string;
  purchaseOrderNumber?: string;
  notes?: string;
}

export interface Transfer {
  id: string;
  assetType: string;
  assetId: string;
  quantity: number;
  sourceBase: string;
  destinationBase: string;
  transferDate: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  reason: string;
  initiatedBy: string;
  notes?: string;
}

export interface Assignment {
  id: string;
  assetType: string;
  assetId: string;
  personnelId: string;
  personnelName: string;
  assignmentDate: string;
  base: string;
  purpose: string;
  expectedReturnDate?: string;
  status: 'Active' | 'Returned' | 'Expended';
}

export interface Expenditure {
  id: string;
  assetType: string;
  quantity: number;
  expenditureDate: string;
  base: string;
  reason: string;
  reportingPersonnel: string;
}

interface DataContextType {
  assets: Asset[];
  purchases: Purchase[];
  transfers: Transfer[];
  assignments: Assignment[];
  expenditures: Expenditure[];
  addPurchase: (purchase: Omit<Purchase, 'id'>) => void;
  addTransfer: (transfer: Omit<Transfer, 'id'>) => void;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  addExpenditure: (expenditure: Omit<Expenditure, 'id'>) => void;
  updateTransferStatus: (id: string, status: Transfer['status']) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([
    { id: 'A001', type: 'Vehicles', name: 'M1A2 Abrams Tank', quantity: 12, base: 'Fort Alpha', status: 'Available', dateAdded: '2024-01-15' },
    { id: 'A002', type: 'Small Arms', name: 'M4A1 Carbine', quantity: 150, base: 'Fort Alpha', status: 'Available', dateAdded: '2024-01-20' },
    { id: 'A003', type: 'Ammunition', name: '5.56mm NATO', quantity: 50000, base: 'Fort Alpha', status: 'Available', dateAdded: '2024-02-01' },
    { id: 'A004', type: 'Vehicles', name: 'HMMWV', quantity: 8, base: 'Fort Bravo', status: 'Available', dateAdded: '2024-01-10' },
    { id: 'A005', type: 'Communications', name: 'AN/PRC-152 Radio', quantity: 25, base: 'Fort Alpha', status: 'Available', dateAdded: '2024-01-25' },
    { id: 'A006', type: 'Heavy Weaponry', name: 'M240B Machine Gun', quantity: 18, base: 'Fort Bravo', status: 'Available', dateAdded: '2024-02-05' },
  ]);

  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: 'P001',
      assetType: 'Vehicles',
      assetName: 'M1A2 Abrams Tank',
      quantity: 2,
      unitCost: 8500000,
      totalCost: 17000000,
      purchaseDate: '2024-01-15',
      supplier: 'General Dynamics',
      receivingBase: 'Fort Alpha',
      purchaseOrderNumber: 'PO-2024-001',
      notes: 'Latest configuration upgrade'
    },
    {
      id: 'P002',
      assetType: 'Small Arms',
      assetName: 'M4A1 Carbine',
      quantity: 50,
      unitCost: 1200,
      totalCost: 60000,
      purchaseDate: '2024-01-20',
      supplier: 'Colt Defense',
      receivingBase: 'Fort Alpha',
      purchaseOrderNumber: 'PO-2024-002'
    }
  ]);

  const [transfers, setTransfers] = useState<Transfer[]>([
    {
      id: 'T001',
      assetType: 'Small Arms',
      assetId: 'A002',
      quantity: 25,
      sourceBase: 'Fort Alpha',
      destinationBase: 'Fort Bravo',
      transferDate: '2024-02-10',
      status: 'Completed',
      reason: 'Training Exercise',
      initiatedBy: 'Lieutenant Garcia',
      notes: 'For joint training operation'
    },
    {
      id: 'T002',
      assetType: 'Communications',
      assetId: 'A005',
      quantity: 10,
      sourceBase: 'Fort Alpha',
      destinationBase: 'Fort Charlie',
      transferDate: '2024-02-15',
      status: 'Pending',
      reason: 'Operational Deployment',
      initiatedBy: 'Major Davis'
    }
  ]);

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 'AS001',
      assetType: 'Small Arms',
      assetId: 'A002-001',
      personnelId: 'P001',
      personnelName: 'Sergeant Williams',
      assignmentDate: '2024-02-15',
      base: 'Fort Alpha',
      purpose: 'Security Detail',
      status: 'Active'
    },
    {
      id: 'AS002',
      assetType: 'Communications',
      assetId: 'A005-003',
      personnelId: 'P002',
      personnelName: 'Corporal Johnson',
      assignmentDate: '2024-02-18',
      base: 'Fort Alpha',
      purpose: 'Field Operations',
      status: 'Active'
    }
  ]);

  const [expenditures, setExpenditures] = useState<Expenditure[]>([
    {
      id: 'E001',
      assetType: 'Ammunition',
      quantity: 1000,
      expenditureDate: '2024-02-20',
      base: 'Fort Alpha',
      reason: 'Training Exercise',
      reportingPersonnel: 'Lieutenant Garcia'
    },
    {
      id: 'E002',
      assetType: 'Ammunition',
      quantity: 500,
      expenditureDate: '2024-02-22',
      base: 'Fort Bravo',
      reason: 'Live Fire Exercise',
      reportingPersonnel: 'Captain Smith'
    }
  ]);

  const addPurchase = (purchase: Omit<Purchase, 'id'>) => {
    const newPurchase = { ...purchase, id: `P${Date.now()}` };
    setPurchases(prev => [newPurchase, ...prev]);
    
    // Update asset inventory
    setAssets(prev => {
      const existingAsset = prev.find(a => 
        a.type === purchase.assetType && 
        a.name === purchase.assetName && 
        a.base === purchase.receivingBase
      );
      
      if (existingAsset) {
        return prev.map(a => 
          a.id === existingAsset.id 
            ? { ...a, quantity: a.quantity + purchase.quantity } 
            : a
        );
      } else {
        const newAsset: Asset = {
          id: `A${Date.now()}`,
          type: purchase.assetType,
          name: purchase.assetName,
          quantity: purchase.quantity,
          base: purchase.receivingBase,
          status: 'Available',
          dateAdded: purchase.purchaseDate
        };
        return [newAsset, ...prev];
      }
    });
  };

  const addTransfer = (transfer: Omit<Transfer, 'id'>) => {
    const newTransfer = { ...transfer, id: `T${Date.now()}` };
    setTransfers(prev => [newTransfer, ...prev]);
    
    // Update asset quantities for completed transfers
    if (transfer.status === 'Completed') {
      setAssets(prev => prev.map(asset => {
        if (asset.base === transfer.sourceBase && asset.type === transfer.assetType) {
          return { ...asset, quantity: Math.max(0, asset.quantity - transfer.quantity) };
        }
        if (asset.base === transfer.destinationBase && asset.type === transfer.assetType) {
          return { ...asset, quantity: asset.quantity + transfer.quantity };
        }
        return asset;
      }));
    }
  };

  const addAssignment = (assignment: Omit<Assignment, 'id'>) => {
    const newAssignment = { ...assignment, id: `AS${Date.now()}` };
    setAssignments(prev => [newAssignment, ...prev]);
    
    // Update asset status to assigned
    setAssets(prev => prev.map(asset => {
      if (asset.base === assignment.base && asset.type === assignment.assetType) {
        return { 
          ...asset, 
          status: 'Assigned',
          assignedTo: assignment.personnelName
        };
      }
      return asset;
    }));
  };

  const addExpenditure = (expenditure: Omit<Expenditure, 'id'>) => {
    const newExpenditure = { ...expenditure, id: `E${Date.now()}` };
    setExpenditures(prev => [newExpenditure, ...prev]);
    
    // Update asset quantities
    setAssets(prev => prev.map(asset => {
      if (asset.base === expenditure.base && asset.type === expenditure.assetType) {
        return { 
          ...asset, 
          quantity: Math.max(0, asset.quantity - expenditure.quantity)
        };
      }
      return asset;
    }));
  };

  const updateTransferStatus = (id: string, status: Transfer['status']) => {
    setTransfers(prev => prev.map(t => {
      if (t.id === id) {
        const updatedTransfer = { ...t, status };
        
        // If transfer is completed, update asset quantities
        if (status === 'Completed') {
          setAssets(prevAssets => prevAssets.map(asset => {
            if (asset.base === t.sourceBase && asset.type === t.assetType) {
              return { ...asset, quantity: Math.max(0, asset.quantity - t.quantity) };
            }
            if (asset.base === t.destinationBase && asset.type === t.assetType) {
              return { ...asset, quantity: asset.quantity + t.quantity };
            }
            return asset;
          }));
        }
        
        return updatedTransfer;
      }
      return t;
    }));
  };

  return (
    <DataContext.Provider value={{
      assets,
      purchases,
      transfers,
      assignments,
      expenditures,
      addPurchase,
      addTransfer,
      addAssignment,
      addExpenditure,
      updateTransferStatus
    }}>
      {children}
    </DataContext.Provider>
  );
};