/* istanbul ignore file */
const seed = require('../../scripts/seed');
const { sequelize } = require('../model');

const resetDatabase = async () => {
    try {
        await sequelize.drop({ force: true });
        await seed();
    } catch (err) {
        console.error(err);
    }
};

module.exports= resetDatabase;
