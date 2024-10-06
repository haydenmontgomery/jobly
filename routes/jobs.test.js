"use strict";

const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    adminToken,
} = require("./_testCommon");
const Job = require("../models/job.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */
describe("POST /jobs", function () {
    test("ok for admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "new", 
                salary: 100, 
                equity: '0.123', 
                companyHandle: "c1" 
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                title: "new", 
                id: expect.any(Number),
                salary: 100, 
                equity: '0.123', 
                companyHandle: "c1",
            }
        });
    });

    test("fail for users", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "new", 
                salary: 100, 
                equity: '0.123', 
                companyHandle: "c1" 
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "new", 
                salary: "boooo000", 
                equity: '0.01', 
                companyHandle: "missing"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with missing title", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
              salary: 1000,
              companyHandle: "c1"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with missing data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
              companyHandle: 123,
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** GET /jobs */
describe("GET /jobs", function () {
    test("ok for anon", async function () {
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        title: "j1",
                        salary: 123456,
                        id: expect.any(Number),
                        equity: '0.123',
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                    {
                        title: "j2",
                        salary: 654321,
                        id: expect.any(Number),
                        equity: '0',
                        companyHandle: "c2",
                        companyName: "C2",
                    },
                    {
                        title: "j3",
                        salary: null,
                        id: expect.any(Number),
                        equity: null,
                        companyHandle: "c3",
                        companyName: "C3",
                    },
                ],
        });
    });

    test("ok for filter", async function () {
        const resp = await request(app).get("/jobs?title=j1&minSalary=100000&hasEquity=true");
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        title: "j1",
                        salary: 123456,
                        id: expect.any(Number),
                        equity: '0.123',
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                ],
        });
    });

    test("ok for two filters", async function () {
        const resp = await request(app).get("/jobs?minSalary=10000&hasEquity=false");
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        title: "j1",
                        salary: 123456,
                        id: expect.any(Number),
                        equity: '0.123',
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                    {
                        title: "j2",
                        salary: 654321,
                        id: expect.any(Number),
                        equity: '0',
                        companyHandle: "c2",
                        companyName: "C2",
                    },
                ],
        });
    });
});

/************************************** GET /jobs/:id */
describe("GET /jobs/:id", function () {
    test("works for anon", async function () {
      const resp = await request(app).get(`/jobs/c1`);
      expect(resp.body).toEqual({
        job: {
            title: "j1",
            salary: 123456,
            id: expect.any(Number),
            equity: '0.123',
            companyHandle: "c1",
            companyName: "C1",
        }
        },
      });
    });

/************************************** PATCH /jobs/:id */


/************************************** DELETE /jobs/:id */