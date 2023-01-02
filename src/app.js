const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const app = express();
const Sequelize = require('sequelize');
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id',getProfile ,async (req, res) =>{
    const {Contract} = req.app.get('models')
    const {id} = req.params
    const { id: profileId } = req.profile;
    const contract = await Contract.findOne({
        where: sequelize.and({
            id,
        }, sequelize.or({ContractorId: profileId },{ClientId: profileId}))
    })
    if(!contract) return res.status(404).end()
    res.json(contract)
})

app.get('/contracts',getProfile ,async (req, res) =>{
    const {Contract} = req.app.get('models')
    const { id: profileId } = req.profile;
    const contracts = await Contract.findAll({
        where: sequelize.and({
            status: "in_progress",
        },
        sequelize.or({ContractorId: profileId },{ClientId: profileId})
        ) 
    })
    if(!contracts) return res.status(404).end()
    res.json(contracts)
});

app.get('/jobs/unpaid',getProfile ,async (req, res) =>{
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

app.post('/jobs/:job_id/pay', getProfile ,async (req, res) =>{
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

app.get('/admin/best-profession', async (req, res) => {
    const {Profile, Contract, Job} = req.app.get('models');

    const { start, end } = req.query;


    const professions = await Profile.findAll({
        where: {
            type: 'contractor',
        },
        include: {
            model: Contract,
            as: 'Contractor',
            include: {
                model: Job,
                where: {
                    paid: true,
                    ...((start || end) ? {
                        paymentDate: {
                            ...(start ? { [Sequelize.Op.gte]: new Date(start) } : {} ),
                            ...(end ? { [Sequelize.Op.lte]: new Date(end) } : {} ),
                        }
                    } : {})
                },
                attributes: [],
            },
            attributes: [],
        },
        attributes: ['profession', [sequelize.fn('SUM', Sequelize.col('price')), 'total_amount']],
        group:['profession'],
        order: [['total_amount', 'desc']]
    });

    res.json(professions);
});

app.get('/admin/best-clients', async (req, res) => {
    const {Profile, Contract, Job} = req.app.get('models');

    const { start, end, limit = 2 } = req.query;


    const professions = await Profile.findAll({
        where: {
            type: 'client',
        },
        include: {
            model: Contract,
            as: 'Client',
            include: {
                model: Job,
                where: {
                    paid: true,
                    ...((start || end) ? {
                        paymentDate: {
                            ...(start ? { [Sequelize.Op.gte]: new Date(start) } : {} ),
                            ...(end ? { [Sequelize.Op.lte]: new Date(end) } : {} ),
                        }
                    } : {})
                },
                attributes: [],
            },
            attributes: [],
        },
        attributes: ['id', [sequelize.literal("firstName || ' ' || lastName"), 'fullName'], [sequelize.fn('SUM', Sequelize.col('price')), 'paid']],
        group:['Profile.id'],
        order: [['paid', 'desc']],
        limit,
        subQuery: false,
    });

    res.json(professions);
});

module.exports = app;
