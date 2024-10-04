"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
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
            equity: 0.01, 
            companyHandle: "c1"
        },
      );
    });

    test("not found with incorrect handle", async function () {
        try {
          await Job.create({
            title: "new", 
            salary: 1000, 
            equity: 0.01, 
            companyHandle: "missing" 
        });
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
      });
});