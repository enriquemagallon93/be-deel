const { Profile, Contract, Job } = require('../src/model');

const clients = require('../src/data/clients');
const contractors = require('../src/data/contractors');
const contracts = require('../src/data/contracts');
const jobs = require('../src/data/jobs');

async function seed() {
    // create tables
    await Profile.sync({ force: true });
    await Contract.sync({ force: true });
    await Job.sync({ force: true });
    //insert data
    await Promise.all([
        ...clients.map(client => Profile.create(client)),
        ...contractors.map(contractor => Profile.create(contractor)),
        ...contracts.map(contract => Contract.create(contract)),
        ...jobs.map(job => Job.create(job)),
    ]);
}

module.exports = seed;