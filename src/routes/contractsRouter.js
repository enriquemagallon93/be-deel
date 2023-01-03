const express = require('express');
const { sequelize } = require('../model')
const { getProfile } = require('../middleware/getProfile');

const contractsRouter = express.Router();

contractsRouter.use(getProfile);

/**
 * @returns In progress contracts that belong to the current Profile
 */
contractsRouter.get('/', async (req, res) => {
    const { Contract } = req.app.get('models')
    const { id: profileId } = req.profile;
    const contracts = await Contract.findAll({
        where: sequelize.and({
            status: "in_progress",
        },
            sequelize.or({ ContractorId: profileId }, { ClientId: profileId })
        )
    })
    res.json(contracts)
});

/**
 * @returns contract by id that belong to the current Profile
 */
contractsRouter.get('/:id', async (req, res) => {
    const { Contract } = req.app.get('models')
    const { id } = req.params
    const { id: profileId } = req.profile;
    const contract = await Contract.findOne({
        where: sequelize.and({
            id,
        }, sequelize.or({ ContractorId: profileId }, { ClientId: profileId }))
    })
    if (!contract) return res.status(404).end()
    res.json(contract)
});

module.exports = contractsRouter;
