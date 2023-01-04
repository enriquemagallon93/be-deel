const express = require('express');
const Sequelize = require('sequelize');
const { sequelize } = require('../model');
const resetDatabase = require('../tools/reset-database');

const adminRouter = express.Router();

adminRouter.get('/best-profession', async (req, res) => {
    const { Profile, Contract, Job } = req.app.get('models');

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
                            ...(start ? { [Sequelize.Op.gte]: new Date(start) } : {}),
                            ...(end ? { [Sequelize.Op.lte]: new Date(end) } : {}),
                        }
                    } : {})
                },
                attributes: [],
            },
            attributes: [],
        },
        attributes: ['profession', [sequelize.fn('SUM', Sequelize.col('price')), 'total_amount']],
        group: ['profession'],
        order: [['total_amount', 'desc']]
    });

    res.json(professions);
});

adminRouter.get('/best-clients', async (req, res) => {
    const { Profile, Contract, Job } = req.app.get('models');

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
                            ...(start ? { [Sequelize.Op.gte]: new Date(start) } : {}),
                            ...(end ? { [Sequelize.Op.lte]: new Date(end) } : {}),
                        }
                    } : {})
                },
                attributes: [],
            },
            attributes: [],
        },
        attributes: ['id', [sequelize.literal("firstName || ' ' || lastName"), 'fullName'], [sequelize.fn('SUM', Sequelize.col('price')), 'paid']],
        group: ['Profile.id'],
        order: [['paid', 'desc']],
        limit,
        subQuery: false,
    });

    res.json(professions);
});

adminRouter.get('/profiles',
    /* istanbul ignore next */
    async (req, res) => {
        const { Profile } = req.app.get('models');

        const profiles = await Profile.findAll({
            attributes: ['id', [sequelize.literal("firstName || ' ' || lastName"), 'fullName'], 'profession', 'balance', 'type'],
        });

        res.json(profiles);
    }
);

adminRouter.post('/reset-db',
    /* istanbul ignore next */
    async (_req, res) => {
        await resetDatabase();

        res.status(200).end();
    }
);

module.exports = adminRouter;
