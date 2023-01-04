const request = require('supertest');
const app = require('../../app');
const resetDatabase = require('../../tools/reset-database');

const getDepositEndpoint = (userId) => `/balances/deposit/${userId}`;

const getExpectedBalanceBody = (balance) => ({
    Contract: {
        Client: {
            balance,
            createdAt: expect.toBeString(),
            firstName: "Mr",
            id: 2,
            lastName: "Robot",
            profession: "Hacker",
            type: "client",
            updatedAt: expect.toBeString(),
            version: expect.toBeNumber()
        },
        id: 3,
    },
    id: 3,
    total_amount: 402,
});

describe(`POST "${getDepositEndpoint(':userId')}"`, () => {
    it('It should return 401 when trying to deposit into another user account', async () => {
        const userId = 2;
        const profileId = 1;
        const endpoint = getDepositEndpoint(userId);

        const res = await request(app).post(endpoint).set('profile_id', profileId);

        expect(res.statusCode).toEqual(401);
    });

    it('It should return 404 for any Contractor reaching the endpoint', async () => {
        const userId = 6;
        const profileId = 6;
        const endpoint = getDepositEndpoint(userId);

        const res = await request(app).post(endpoint).set('profile_id', profileId);

        expect(res.statusCode).toEqual(404);
    });

    it('Should return 400 and the correct error message when Client has not jobs to pay', async () => {
        const userId = 3;
        const profileId = 3;
        const endpoint = getDepositEndpoint(userId);

        const expectedError = `You are not able to deposit money in your balance because you don't have unpaid jobs`;

        const res = await request(app).post(endpoint).set('profile_id', profileId);

        expect(res.statusCode).toEqual(400);
        expect(res.text).toBe(expectedError);
    });

    it('Should return status code 200 and the updated balance after each call', async () => {
        const userId = 2;
        const profileId = 2;
        const endpoint = getDepositEndpoint(userId);

        const expectedBalance = getExpectedBalanceBody(331.61);

        const res = await request(app).post(endpoint).set('profile_id', profileId);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(expectedBalance);
    });

    describe('Concurrency: When 2 calls to the endpoint are made simultaneously', () => {
        beforeAll(async () => {
            await resetDatabase();
        });
        it('one call should be ok and the other one should send a 500 response', async () => {
            const userId = 2;
            const profileId = 2;
            const endpoint = getDepositEndpoint(userId);

            const successfulResponse = getExpectedBalanceBody(331.61);

            const errorResponse = {
                name: 'SequelizeOptimisticLockError',
                modelName: 'Profile',
                values: {
                    balance: 331.61,
                    updatedAt: expect.toBeString(),
                    version: expect.toBeNumber(),
                },
                where: { id: 2, version: 0 }
            }

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

            const res1Call = request(app).post(endpoint).set('profile_id', profileId);
            const res2Call = request(app).post(endpoint).set('profile_id', profileId);

            const responses = (await Promise.allSettled([res1Call, res2Call])).map(({ value }) => value);

            expect(responses).toBeArrayOfSize(2);
            expect(responses).toSatisfyAny(hasSuccessfulResponse);
            expect(responses).toSatisfyAny(hasErrorResponse);
        });
    })
});