/* istanbul ignore file */

const Sequelize = require('sequelize');

const { DB_STORAGE = './database.sqlite3', NODE_ENV } = process.env;

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_STORAGE,
  logging: NODE_ENV !== 'test'
});

class Profile extends Sequelize.Model { }
Profile.init(
  {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    version: {
      allowNull: false,
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 0
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false
    },
    balance: {
      type: Sequelize.DECIMAL(12, 2)
    },
    type: {
      type: Sequelize.ENUM('client', 'contractor')
    }
  },
  {
    sequelize,
    modelName: 'Profile',
    version: true,
  }
);

class Contract extends Sequelize.Model { }
Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    version: {
      allowNull: false,
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: Sequelize.ENUM('new', 'in_progress', 'terminated')
    }
  },
  {
    sequelize,
    modelName: 'Contract',
    version: true,
  }
);

class Job extends Sequelize.Model { }
Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    version: {
      allowNull: false,
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 0
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false
    },
    paid: {
      type: Sequelize.BOOLEAN,
      default: false
    },
    paymentDate: {
      type: Sequelize.DATE
    }
  },
  {
    sequelize,
    modelName: 'Job',
    version: true,
  }
);

Profile.hasMany(Contract, { as: 'Contractor', foreignKey: 'ContractorId' })
Contract.belongsTo(Profile, { as: 'Contractor' })
Profile.hasMany(Contract, { as: 'Client', foreignKey: 'ClientId' })
Contract.belongsTo(Profile, { as: 'Client' })
Contract.hasMany(Job)
Job.belongsTo(Contract)

module.exports = {
  sequelize,
  Profile,
  Contract,
  Job
};
