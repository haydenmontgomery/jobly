"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    jobIds
  } = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "new", 
        salary: 1000, 
        equity: 0.01, 
        companyHandle: "c1" 
    };  
  
    test("works", async function () {
      let job = await Job.create(newJob);
  
      expect(job).toEqual(
        {
            id: expect.any(Number),
            title: "new", 
            salary: 1000, 
            equity: '0.01', 
            companyHandle: "c1"
        },
      );
    });
});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
      let jobs = await Job.findAll();
      expect(jobs).toEqual([
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
      ]);
    });

    test("works: with filter", async function () {
        const queryParams = { title: 'j1', minSalary: 100000, hasEquity: true }
        let jobs = await Job.findAll(queryParams);
        expect(jobs).toEqual([
            {
                title: "j1",
                salary: 123456,
                id: expect.any(Number),
                equity: '0.123',
                companyHandle: "c1",
                companyName: "C1",
            }
        ]);
    });    
});

/************************************** get:id */

describe("get", function () {
    test("works", async function () {
        let job = await Job.get(`${jobIds[0]}`);
        expect(job).toEqual({
              title: "j1",
              salary: 123456,
              id: jobIds[0],
              equity: '0.123',
              company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
              }
        });
    });

    test("not found if no such job", async function () {
        try {
          await Job.get(0);
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
      });
});

describe("update", function () {
  let updateData = {
    title: "New",
    salary: 500,
    equity: "0.5",
  };
  test("works", async function () {
    let job = await Job.update(jobIds[0], updateData);
    expect(job).toEqual({
      id: jobIds[0],
      companyHandle: "c1",
      ...updateData,
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, {
        title: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(jobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(jobIds[0]);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=$1", [jobIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
