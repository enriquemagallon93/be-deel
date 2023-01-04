const request = require('supertest');
const app = require('../../app');
const contracts = require('../../data/contracts');

const getContractsEndpoint = (userId) => `/contracts${userId !== undefined ? `/${userId}` : ''}`;

const getExpectedContract = contract => ({
    ...contract,
    createdAt: expect.toBeString(),
    updatedAt: expect.toBeString(),
    version: expect.toBeNumber(),
});

describe('Contracts API', () => {
    describe(`GET ${getContractsEndpoint()}`, () => {
        it('with no profile_id header, should return 401', async () => {
            const endpoint = getContractsEndpoint();
            
            const res = await request(app).get(endpoint);

            expect(res.status).toBe(401);
        });

        it('with correct profile_id headers, it should return correct contracts', async () => {
            const endpoint = getContractsEndpoint();
            const expectedBody1 = [getExpectedContract(contracts[1])];
            const expectedBody2 = [
                getExpectedContract(contracts[1]),
                getExpectedContract(contracts[2]),
                getExpectedContract(contracts[7])
            ];
            const expectedBody3 = [];

            const res1 = await request(app).get(endpoint).set('profile_id', 1);
            const res2 = await request(app).get(endpoint).set('profile_id', 6);
            const res3 = await request(app).get(endpoint).set('profile_id', 5);

            expect(res1.statusCode).toBe(200);
            expect(res2.statusCode).toBe(200);
            expect(res3.statusCode).toBe(200);

            expect(res1.body).toEqual(expectedBody1);
            expect(res2.body).toEqual(expectedBody2);
            expect(res3.body).toEqual(expectedBody3);
        });
    });

    describe(`GET ${getContractsEndpoint(':id')}`, () => {
        it('when contract id belongs to the profile_id, it should return the correct contract info', async () => {
            const contractId = 1;
            const profileId = 1;
            const endpoint = getContractsEndpoint(contractId);
            const expectedContract = getExpectedContract(contracts[0]);
            
            const res = await request(app).get(endpoint).set('profile_id', profileId);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(expectedContract);
        });

        it('when contract id does not belong to the profile_id, it should return a 404 status code', async () => {
            const contractId = 3;
            const profileId = 1;
            const endpoint = getContractsEndpoint(contractId);
            
            const res = await request(app).get(endpoint).set('profile_id', profileId);

            expect(res.status).toBe(404);
        });
    });
});