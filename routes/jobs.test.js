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
    jobIds
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
        const resp = await request(app).get(`/jobs/${jobIds[0]}`);
        expect(resp.body).toEqual({
            job: {
                id: jobIds[0],
                title: "j1",
                salary: 123456,
                equity: '0.123',
                company: {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img",
                },
            },
        });
    });

    test("not found for no job with that id", async function () {
        const resp = await request(app).get(`/jobs/0`);
        expect(resp.statusCode).toEqual(404);
      });
});

/************************************** PATCH /jobs/:id */
describe("PATCH /jobs/:id", function() {
    test("works for admin", async function() {
        const resp = await request(app).patch(`/jobs/${jobIds[0]}`)
        .send({
            title: "new",
            salary: 2222,
        })
        .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "new",
                salary: 2222,
                equity: "0.123",
                companyHandle: "c1",
            },
        });
    });

    test("fails for users", async function() {
        const resp = await request(app).patch(`/jobs/${jobIds[0]}`)
        .send({
            title: "new",
            salary: 2222
        })
        .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);

    });

    test("not found error for no job", async function() {
        const resp = await request(app).patch(`/jobs/0`)
        .send({
            title: "new",
            salary: 2222
        })
        .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("bad request on company_handle change", async function() {
        const resp = await request(app).patch(`/jobs/${jobIds[0]}`)
        .send({
            companyHandle: "fail"
        })
        .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on improper data", async function() {
        const resp = await request(app).patch(`/jobs/${jobIds[0]}`)
        .send({
            salary: "fail"
        })
        .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function() {
    test("works for admin", async function() {
        const resp = await request(app).delete(`/jobs/${jobIds[0]}`)
                                        .set("authorization", `Bearer ${adminToken}`);
        
        expect(resp.body).toEqual({
            deleted: jobIds[0]
        });
    });

    test("fail for users", async function() {
        const resp = await request(app).delete(`/jobs/${jobIds[0]}`)
                                        .set("authorization", `Bearer ${u1Token}`);
        
        expect(resp.statusCode).toEqual(401);
    });

    test("fail for anon", async function() {
        const resp = await request(app).delete(`/jobs/${jobIds[0]}`)
        
        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such job", async function () {
        const resp = await request(app).delete(`/jobs/0`)
                                        .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });
});