const request = require('supertest');
const app = require('../../app');

const bestProfessionEndpoint = '/admin/best-profession';
const bestClientsEndpoint = '/admin/best-clients';

describe('Admin API', () => {
    describe(`GET "${bestProfessionEndpoint}"`, () => {
        it('with no date range', async () => {
            const expectedBestProfessions = [
                { profession: "Programmer", total_amount: 2683 },
                { profession: "Musician", total_amount: 221 },
                { profession: "Fighter", total_amount: 200 }
            ];

            const res = await request(app).get(bestProfessionEndpoint)
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(expectedBestProfessions);
        });

        it('with an start date', async () => {
            const expectedBestProfessions = [
                { profession: "Programmer", total_amount: 2562 },
                { profession: "Musician", total_amount: 200 },
                { profession: "Fighter", total_amount: 200 }
            ];
            const professionsWithInitialDateEndpoint = `${bestProfessionEndpoint}?start=8-15-2020`;

            const res = await request(app).get(professionsWithInitialDateEndpoint)
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(expectedBestProfessions);
        });

        it('with an end date', async () => {
            const expectedBestProfessions = [
                { profession: "Programmer", total_amount: 2683 },
                { profession: "Musician", total_amount: 21 },
                { profession: "Fighter", total_amount: null }
            ];
            const professionsWithInitialDateEndpoint = `${bestProfessionEndpoint}?end=8-17-2020`;

            const res = await request(app).get(professionsWithInitialDateEndpoint)
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(expectedBestProfessions);
        });

        it('with an start and an end date', async () => {
            const expectedBestProfessions = [
                { profession: "Programmer", total_amount: 2562 },
                { profession: "Musician", total_amount: null },
                { profession: "Fighter", total_amount: null }
            ];
            const professionsWithInitialDateEndpoint = `${bestProfessionEndpoint}?start=8-15-2020&end=8-17-2020`;

            const res = await request(app).get(professionsWithInitialDateEndpoint)
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(expectedBestProfessions);
        });
    });

    describe(`GET "${bestClientsEndpoint}"`, () => {
        it('with no date range', async () => {
            const expectedBestClients = [
                {
                    fullName: "Ash Kethcum",
                    id: 4,
                    paid: 2020,
                } ,{
                    fullName: "Harry Potter",
                    id: 1,
                    paid: 442,
                }
            ];

            const res = await request(app).get(bestClientsEndpoint)
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(expectedBestClients);
        });

        it('with an start date', async () => {
            const expectedBestClients = [
                {
                    fullName: "Ash Kethcum",
                    id: 4,
                    paid: 2020,
                } ,{
                    fullName: "Harry Potter",
                    id: 1,
                    paid: 421,
                }
            ];
            const clientsWithInitialDateEndpoint = `${bestClientsEndpoint}?start=8-15-2020`;

            const res = await request(app).get(clientsWithInitialDateEndpoint)
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(expectedBestClients);
        });

        it('with an end date', async () => {
            const expectedBestClients = [
                {
                    fullName: "Ash Kethcum",
                    id: 4,
                    paid: 2020,
                } ,{
                    fullName: "Mr Robot",
                    id: 2,
                    paid: 442,
                }
            ];
            const clientsWithInitialDateEndpoint = `${bestClientsEndpoint}?end=8-17-2020`;

            const res = await request(app).get(clientsWithInitialDateEndpoint)
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(expectedBestClients);
        });

        it('with an start and an end date', async () => {
            const expectedBestClients = [
                {
                    fullName: "Ash Kethcum",
                    id: 4,
                    paid: 2020,
                } ,{
                    fullName: "Mr Robot",
                    id: 2,
                    paid: 321,
                }
            ];
            const clientsWithInitialDateEndpoint = `${bestClientsEndpoint}?start=8-15-2020&end=8-17-2020`;

            const res = await request(app).get(clientsWithInitialDateEndpoint)
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(expectedBestClients);
        });
    });
});