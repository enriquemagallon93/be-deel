const express = require('express');
const {sequelize} = require('../model')
const { getProfile } = require('../middleware/getProfile');

const jobsRouter = express.Router();

jobsRouter.use(getProfile);

jobsRouter.get('/unpaid', async (req, res) =>{
    const {Contract, Job} = req.app.get('models')
    const { id: profileId } = req.profile;
    const jobs = await Job.findAll({
        include: {
            model: Contract,
            attributes: [],
            where: sequelize.and(
                { status: "in_progress" },
                sequelize.or({ContractorId: profileId },{ClientId: profileId})
            ),
        },
        where: {
            paid: sequelize.or(false, 0, null),
        }
    });
    if(!jobs) return res.status(404).end()
    res.json(jobs)
});

jobsRouter.post('/:job_id/pay', async (req, res) =>{
    const {Contract, Job, Profile} = req.app.get('models')
    const {job_id: jobId} = req.params;
    const { id: profileId } = req.profile;
    const jobToPay = await Job.findOne({
        attributes: ['id','price', 'paid'],
        include: {
            model: Contract,
            attributes: ['id'],
            where: sequelize.and(
                { status: "in_progress" },
                sequelize.or({ContractorId: profileId },{ClientId: profileId})
            ),
            include: [{
                attributes: ['id', 'balance'],
                model: Profile,
                as: 'Client',
                where: {
                    id: profileId,
                }
            }, {
                attributes: ['id', 'balance'],
                model: Profile,
                as: 'Contractor'
            }]
        },
        where: {
            id: jobId,
            paid: sequelize.or(false, 0, null),
        }
    });
    if(!jobToPay) return res.status(404).end();

    const {
        price: jobPrice,
        Contract: { Client: { balance: clientBalance }, Contractor: { balance: contractorBalance }}
    } = jobToPay;

    if (jobPrice > clientBalance) return res.status(400).end('Insufficient client balance');

    try {
        await sequelize.transaction(async (payTransaction) =>{
            await jobToPay.update({ paid: true, paymentDate: new Date() }, { transaction: payTransaction });
            await jobToPay.Contract.Client.update({ balance: clientBalance - jobPrice }, { transaction: payTransaction});
            await jobToPay.Contract.Contractor.update({ balance: contractorBalance + jobPrice }, {transaction: payTransaction});
        });
    } catch(err) {
        console.error(err);
        return res.status(500).end('Service is not working correctly. Retry it later!');
    }

    res.json(jobToPay)
});

module.exports = jobsRouter;
