const express = require('express');
const Sequelize = require('sequelize');
const { sequelize } = require('../model')

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

module.exports = adminRouter;
