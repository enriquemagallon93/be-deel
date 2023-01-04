const request = require('supertest');
const app = require('../../app');
const jobs = require('../../data/jobs');
const { sequelize } = require('../../model');
const resetDatabase = require('../../tools/reset-database');

const getJobsEndpoint = (jobId, subpath = '') => `/jobs${jobId !== undefined ? `/${jobId}` : ''}${subpath}`;

const getExpectedJob = (job, jobId) => ({
    createdAt: expect.toBeString(),
    updatedAt: expect.toBeString(),
    id: jobId,
    paid: null,
    paymentDate: null,
    version: expect.toBeNumber(),
    ...job,
})

describe('Jobs API', () => {
    describe(`GET ${getJobsEndpoint(undefined, '/unpaid')}`, () => {
        it('it should return correct unpaid jobs', async () => {
            const endpoint = getJobsEndpoint(undefined, '/unpaid');
            const expectedBody1 = [getExpectedJob(jobs[1], 2)];
            const expectedBody2 = [
                getExpectedJob(jobs[2], 3),
                getExpectedJob(jobs[3], 4),
            ];
            const expectedBody3 = [];

            const res1 = await request(app).get(endpoint).set('profile_id', 1);
            const res2 = await request(app).get(endpoint).set('profile_id', 2);
            const res3 = await request(app).get(endpoint).set('profile_id', 3);

            expect(res1.statusCode).toBe(200);
            expect(res2.statusCode).toBe(200);
            expect(res3.statusCode).toBe(200);

            expect(res1.body).toEqual(expectedBody1);
            expect(res2.body).toEqual(expectedBody2);
            expect(res3.body).toEqual(expectedBody3);
        });
    });

    describe(`POST ${getJobsEndpoint(':id', '/pay')}`, () => {
        it('should return 404 if there is no pending to pay job with the provided id associated with an in progress contract of the current client', async () => {
            const jobId = 1;
            const profileId = 1;
            const endpoint = getJobsEndpoint(jobId, '/pay');

            const res = await request(app).post(endpoint).set('profile_id', profileId);

            expect(res.statusCode).toBe(404);
        });

        it(`should return 400 an a correct error message if the current client's balance is less that the jobs price`, async () => {
            const jobId = 5;
            const profileId = 4;
            const endpoint = getJobsEndpoint(jobId, '/pay');
            const expectedError = 'Insufficient client balance';

            const res = await request(app).post(endpoint).set('profile_id', profileId);

            expect(res.statusCode).toBe(400);
            expect(res.text).toBe(expectedError);
        });

        it('with correct data, it should return the correct data the first time and a 404 the second time', async () => {
            const jobId = 2;
            const profileId = 1;
            const endpoint = getJobsEndpoint(jobId, '/pay');
            const expectedResponse = {
                Contract: {
                    Client: {
                        balance: 949,
                        id: 1,
                        updatedAt: expect.toBeString(),
                        version: expect.toBeNumber()
                    },
                    Contractor: {
                        balance: 1415,
                        id: 6,
                        updatedAt: expect.toBeString(),
                        version: expect.toBeNumber()
                    },
                    id: 2,
                },
                id: 2,
                paid: true,
                paymentDate: expect.toBeString(),
                price: 201,
                updatedAt: expect.toBeString(),
                version: expect.toBeNumber()
            };

            const res1 = await request(app).post(endpoint).set('profile_id', profileId);;
            const res2 = await request(app).post(endpoint).set('profile_id', profileId);;

            expect(res1.statusCode).toBe(200);
            expect(res1.body).toEqual(expectedResponse);
            expect(res2.statusCode).toBe(404);
        });

        describe('When all the data is correct but the update transaction throw an error', () => {
            const jobId = 2;
            const profileId = 1;
            const endpoint = getJobsEndpoint(jobId, '/pay');
            let transaction;

            beforeAll(async () => {
                await resetDatabase();
                transaction = jest.spyOn(sequelize, 'transaction').mockImplementation(() => {
                    throw 'Test error';
                })
            });

            beforeEach(() => {
                transaction.mockClear();
            });

            afterAll(() => {
                transaction.mockRestore();
            });

            it('should return status code 500 and the correct error message', async () => {
                const expectedErrorMessage = JSON.stringify('Test error');

                const res = await request(app).post(endpoint).set('profile_id', profileId);

                expect(res.statusCode).toBe(500);
                expect(res.text).toBe(expectedErrorMessage);
            });
        });

        describe('Concurrency: When 2 calls to the same endpoint are made simultaneously', () => {
            beforeAll(async () => {
                await resetDatabase();
            });

            it('one response should be correct and the other should send a 500 error', async () => {
                const jobId = 2;
                const profileId = 1;
                const endpoint = getJobsEndpoint(jobId, '/pay');
                const successfulResponse = {
                    Contract: {
                        Client: {
                            balance: 949,
                            id: 1,
                            updatedAt: expect.toBeString(),
                            version: expect.toBeNumber()
                        },
                        Contractor: {
                            balance: 1415,
                            id: 6,
                            updatedAt: expect.toBeString(),
                            version: expect.toBeNumber()
                        },
                        id: 2,
                    },
                    id: 2,
                    paid: true,
                    paymentDate: expect.toBeString(),
                    price: 201,
                    updatedAt: expect.toBeString(),
                    version: expect.toBeNumber()
                };

                const errorResponse = {
                    name: 'SequelizeOptimisticLockError',
                    modelName: 'Job',
                    values: {
                        paid: true,
                        paymentDate: expect.toBeString(),
                        updatedAt: expect.toBeString(),
                        version: expect.toBeNumber()
                    },
                    where: { id: 2, version: expect.toBeNumber() }
                };

                const hasSuccessfulResponse = res => {
                    try {
                        expect(res.status).toBe(200);
                        expect(res.body).toEqual(successfulResponse);
                    } catch {
                        return false;
                    }
                    return true;
                }
    
                const hasErrorResponse = res => {
                    try {
                        expect(res.status).toBe(500);
                        expect(res.body).toEqual(errorResponse);
                    } catch {
                        return false;
                    }
                    return true;
                }

                const res1Call = request(app).post(endpoint).set('profile_id', profileId);;
                const res2Call = request(app).post(endpoint).set('profile_id', profileId);;

                const responses = (await Promise.allSettled([res1Call, res2Call])).map(({ value }) => value);

                expect(responses).toBeArrayOfSize(2);
                expect(responses).toSatisfyAny(hasSuccessfulResponse);
                expect(responses).toSatisfyAny(hasErrorResponse);
            });
        });
    });
});