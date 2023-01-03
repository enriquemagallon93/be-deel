const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const app = express();
const {
    contractsRouter,
    jobsRouter,
    balancesRouter,
    adminRouter
} = require('./routes');

app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

app.use('/contracts', contractsRouter);
app.use('/jobs', jobsRouter);
app.use('/balances', balancesRouter)
app.use('/admin', adminRouter);

module.exports = app;
