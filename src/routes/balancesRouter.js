const express = require('express');
const Sequelize = require('sequelize');
const {sequelize} = require('../model')
const { getProfile } = require('../middleware/getProfile');

const balancesRouter = express.Router();

balancesRouter.use(getProfile);

balancesRouter.post('/deposit/:userId', getProfile, async (req, res) => {
    const { Profile, Contract, Job } = req.app.get('models');
    const user = req.profile;
    const userId = Number.parseInt(req.params.userId);

    if (user.id !== userId) return res.status(401).end();

    if(user.type !== 'client') return res.status(404).end();

    const [jobToPay] = await Job.findAll({
        where: {
            paid: {
                [Sequelize.Op.or]: [false, null, 0],
            }
        },
        include: {
            model: Contract,
            attributes: ['id'],
            where: {
                status: 'in_progress'
            },
            include: {
                attribute:['id', 'balance'],
                model: Profile,
                as: 'Client',
                where: {
                    id: userId,
                    type: 'client',
                }
            }
        },
        attributes: ['id',[sequelize.fn('SUM', sequelize.col('price')), 'total_amount']],
        subQuery: false,
    });

    const jobPlainData = jobToPay ? jobToPay.get({plain: true}) : undefined;

    if (!jobPlainData || !jobPlainData.total_amount) return res.status(400).end(`You are not able to deposit money in your balance because you don't have unpaid jobs`)

    const {
        total_amount: clientAmountToPay,
        Contract: { Client: { balance: clientBalance}}
    } = jobToPay.get({ plain: true });

    const amountToDeposit = Number.parseFloat(( clientAmountToPay / 4).toFixed(2))

    jobToPay.Contract.Client.update({ balance: clientBalance + amountToDeposit})

    res.json(jobToPay);
});

module.exports = balancesRouter;
