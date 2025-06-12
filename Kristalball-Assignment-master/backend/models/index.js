'use strict';
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Initialize sequelize connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

// Define models

const Users = sequelize.define('Users', {
  user_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  username: { type: DataTypes.STRING, unique: true },
  password_hash: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  full_name: DataTypes.STRING,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, { tableName: 'users', timestamps: false });

const Roles = sequelize.define('Roles', {
  role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  role_name: { type: DataTypes.STRING, unique: true },
  description: DataTypes.TEXT
}, { tableName: 'roles', timestamps: false });

const UserRoles = sequelize.define('UserRoles', {
  user_id: { type: DataTypes.UUID, primaryKey: true },
  role_id: { type: DataTypes.INTEGER, primaryKey: true }
}, { tableName: 'user_roles', timestamps: false });

const Bases = sequelize.define('Bases', {
  base_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  base_name: { type: DataTypes.STRING, unique: true },
  location: DataTypes.STRING,
  description: DataTypes.TEXT
}, { tableName: 'bases', timestamps: false });

const UserBases = sequelize.define('UserBases', {
  user_id: { type: DataTypes.UUID, primaryKey: true },
  base_id: { type: DataTypes.UUID, primaryKey: true }
}, { tableName: 'user_bases', timestamps: false });

const EquipmentTypes = sequelize.define('EquipmentTypes', {
  equipment_type_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  type_name: { type: DataTypes.STRING, unique: true },
  category: DataTypes.STRING,
  description: DataTypes.TEXT
}, { tableName: 'equipment_types', timestamps: false });

const Assets = sequelize.define('Assets', {
  asset_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  equipment_type_id: DataTypes.UUID,
  model_name: DataTypes.STRING,
  serial_number: { type: DataTypes.STRING, unique: true },
  current_base_id: DataTypes.UUID,
  quantity: DataTypes.INTEGER,
  status: DataTypes.STRING,
  last_updated_at: DataTypes.DATE,
  is_fungible: DataTypes.BOOLEAN,
  current_balance: DataTypes.INTEGER
}, { tableName: 'assets', timestamps: false });

const Purchases = sequelize.define('Purchases', {
  purchase_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  asset_id: DataTypes.UUID,
  quantity: DataTypes.INTEGER,
  unit_cost: DataTypes.DECIMAL,
  total_cost: DataTypes.DECIMAL,
  purchase_date: DataTypes.DATE,
  supplier_info: DataTypes.STRING,
  receiving_base_id: DataTypes.UUID,
  purchase_order_number: { type: DataTypes.STRING, unique: true },
  recorded_by_user_id: DataTypes.UUID,
  created_at: DataTypes.DATE
}, { tableName: 'purchases', timestamps: false });

const Transfers = sequelize.define('Transfers', {
  transfer_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  asset_id: DataTypes.UUID,
  asset_serial_number: DataTypes.STRING,
  quantity: DataTypes.INTEGER,
  source_base_id: DataTypes.UUID,
  destination_base_id: DataTypes.UUID,
  transfer_date: DataTypes.DATE,
  reason: DataTypes.TEXT,
  status: DataTypes.STRING,
  initiated_by_user_id: DataTypes.UUID,
  received_by_user_id: DataTypes.UUID,
  created_at: DataTypes.DATE,
  completed_at: DataTypes.DATE
}, { tableName: 'transfers', timestamps: false });

const Assignments = sequelize.define('Assignments', {
  assignment_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  asset_id: DataTypes.UUID,
  assigned_to_user_id: DataTypes.UUID,
  assignment_date: DataTypes.DATE,
  base_of_assignment_id: DataTypes.UUID,
  purpose: DataTypes.TEXT,
  expected_return_date: DataTypes.DATE,
  returned_date: DataTypes.DATE,
  is_active: DataTypes.BOOLEAN,
  recorded_by_user_id: DataTypes.UUID,
  created_at: DataTypes.DATE
}, { tableName: 'assignments', timestamps: false });

const Expenditures = sequelize.define('Expenditures', {
  expenditure_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  asset_id: DataTypes.UUID,
  quantity_expended: DataTypes.INTEGER,
  expenditure_date: DataTypes.DATE,
  base_id: DataTypes.UUID,
  reason: DataTypes.TEXT,
  reported_by_user_id: DataTypes.UUID,
  created_at: DataTypes.DATE
}, { tableName: 'expenditures', timestamps: false });

const AuditLogs = sequelize.define('AuditLogs', {
  log_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  timestamp: DataTypes.DATE,
  user_id: DataTypes.UUID,
  action: DataTypes.STRING,
  details: DataTypes.JSONB,
  ip_address: DataTypes.STRING,
  status: DataTypes.STRING
}, { tableName: 'audit_logs', timestamps: false });

// Set up Associations

Users.belongsToMany(Roles, { through: UserRoles, foreignKey: 'user_id' });
Roles.belongsToMany(Users, { through: UserRoles, foreignKey: 'role_id' });

Users.belongsToMany(Bases, { through: UserBases, foreignKey: 'user_id' });
Bases.belongsToMany(Users, { through: UserBases, foreignKey: 'base_id' });

Assets.belongsTo(EquipmentTypes, { foreignKey: 'equipment_type_id' });
Assets.belongsTo(Bases, { foreignKey: 'current_base_id' });

Purchases.belongsTo(Assets, { foreignKey: 'asset_id' });
Purchases.belongsTo(Bases, { foreignKey: 'receiving_base_id' });
Purchases.belongsTo(Users, { foreignKey: 'recorded_by_user_id' });

Transfers.belongsTo(Assets, { foreignKey: 'asset_id' });
Transfers.belongsTo(Bases, { as: 'SourceBase', foreignKey: 'source_base_id' });
Transfers.belongsTo(Bases, { as: 'DestinationBase', foreignKey: 'destination_base_id' });
Transfers.belongsTo(Users, { as: 'Initiator', foreignKey: 'initiated_by_user_id' });
Transfers.belongsTo(Users, { as: 'Receiver', foreignKey: 'received_by_user_id' });

Assignments.belongsTo(Assets, { foreignKey: 'asset_id' });
Assignments.belongsTo(Users, { as: 'Assignee', foreignKey: 'assigned_to_user_id' });
Assignments.belongsTo(Bases, { foreignKey: 'base_of_assignment_id' });
Assignments.belongsTo(Users, { as: 'Recorder', foreignKey: 'recorded_by_user_id' });

Expenditures.belongsTo(Assets, { foreignKey: 'asset_id' });
Expenditures.belongsTo(Bases, { foreignKey: 'base_id' });
Expenditures.belongsTo(Users, { as: 'Reporter', foreignKey: 'reported_by_user_id' });

AuditLogs.belongsTo(Users, { foreignKey: 'user_id' });

// Export models

module.exports = {
  sequelize,
  Users,
  Roles,
  UserRoles,
  Bases,
  UserBases,
  EquipmentTypes,
  Assets,
  Purchases,
  Transfers,
  Assignments,
  Expenditures,
  AuditLogs
};
