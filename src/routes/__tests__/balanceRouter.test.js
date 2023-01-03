const request = require('supertest');
const app = require('../../app');

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

        let expectedBalance = getExpectedBalanceBody(331.61);

        const res = await request(app).post(endpoint).set('profile_id', profileId);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(expectedBalance);
    });
});