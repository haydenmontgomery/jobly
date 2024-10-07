"use strict";

/** Routes for jobs.. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, authenticateJWT, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobSearchSchema = require("../schemas/jobSearch.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: Admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.create(req.body);
      return res.status(201).json({ job });
    } catch (err) {
      return next(err);
    }
  });

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, company_handle }, ...] }
 *
 *  searchFilters (all optional):
 * - minSalary
 * - hasEquity (true returns only jobs with equity > 0, other values ignored)
 * - title (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    const queryParams = req.query;
    //Set our values from strings to integers and compare.
    if (queryParams.minSalary !== undefined) {
      queryParams.minSalary = +queryParams.minSalary;
    }
    queryParams.hasEquity = queryParams.hasEquity === "true";
  
    try {
      const validator = jsonschema.validate(queryParams, jobSearchSchema);
      console.log(validator)
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      const jobs = await Job.findAll(queryParams);
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
});

/** GET /:id  =>  { id }
 *
 *  Job is { id, title, salary, equity, company_handle }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
    try {
      const job = await Job.get(req.params.id);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });

/** PATCH /:id  =>  { id }
 *
 *  Can patch { title, salary, equity }
 *  Job returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: Admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;