"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs */

class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { title, salary, equity, companyHandle }
     *
     * Returns { id, title, salary, equity, companyHandle }
     *
     * Throws NotFoundError if the company handle does not exist in db.
     * */

    static async create(data) {
      /* const handleCheck = await db.query(
            `SELECT handle
            FROM companies
            WHERE handle = $1`,
          [companyHandle]);
      if (!handleCheck.rows[0]) throw new NotFoundError(`No company: ${companyHandle}`); */

      const result = await db.query(
            `INSERT INTO jobs
             (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
          [
            data.title, 
            data.salary,
            data.equity,
            data.companyHandle,
          ]);
      let job = result.rows[0];

      return job;
    }
  
    /** Find all jobs.
     *
     * 
     *  searchFilters (all optional):
     * - minSalary
     * - hasEquity (true returns only jobs with equity > 0, other values ignored)
     * - title (will find case-insensitive, partial matches)
     * 
     * Returns [{ id, title, salary, equity, companyHandle }, ...]
     * */
  
    static async findAll(filters = {}) {
      let query =
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle",
                    c.name As "companyName"
             FROM jobs
             LEFT JOIN companies AS c ON c.handle = company_handle
             `;
      
      //pull our querie values
      const { minSalary, hasEquity, title } = filters;
  
      let values = [];
      let expressions = [];
      
      if (minSalary !== undefined) {
        values.push(minSalary);
        expressions.push(`salary >= $${values.length}`);
      }
      
      if (hasEquity === true) {
        expressions.push(`equity > 0`);
      }

      //push title into queries. set with surrounding % so the search will take any company matching the string in its name
      if (title !== undefined) {
        values.push(`%${title}%`)
        expressions.push(`title ILIKE $${values.length}`);
      }

      if (expressions.length > 0) {
        query += " WHERE " + expressions.join(" AND ");
      }
  
  
      query += " ORDER BY title";
      console.log(query);
      const jobsRes = await db.query(query, values);
      
      return jobsRes.rows;
    }
  
    /** Given a job id, return job info.
     *
     * Returns { id, title, salary, equity, companyHandle }
     *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
     *
     * Throws NotFoundError if not found.
     **/
  
    static async get(id) {
      const jobRes = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
             FROM jobs
             WHERE id = $1`,
          [id]);
  
      const job = jobRes.rows[0];
  
      if (!job) throw new NotFoundError(`No id: ${id}`);
  
      const companiesRes = await db.query(
        `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
         FROM companies
         WHERE handle = $1`, [job.companyHandle]);

      delete job.companyHandle;
      job.company = companiesRes.rows[0]
      return job;
    }
  
    /** Update company data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: { title, salary, equity}
     *
     * Returns { id, title, salary, equity, companyHandle }
     *
     * Throws NotFoundError if not found.
     */
  
    static async update(id, data) {
      const { setCols, values } = sqlForPartialUpdate(
          data,
          {});
      const idVarIdx = "$" + (values.length + 1);
  
      const querySql = `UPDATE jobs 
                        SET ${setCols} 
                        WHERE id = ${idVarIdx} 
                        RETURNING id, 
                                  title, 
                                  salary, 
                                  equity, 
                                  company_handle AS "companyHandle"`;
      const result = await db.query(querySql, [...values, id]);
      const job = result.rows[0];
  
      if (!job) throw new NotFoundError(`No job: ${id}`);
  
      return job;
    }
  
    /** Delete given company from database; returns undefined.
     *
     * Throws NotFoundError if company not found.
     **/
  
    /* static async remove(handle) {
      const result = await db.query(
            `DELETE
             FROM companies
             WHERE handle = $1
             RETURNING handle`,
          [handle]);
      const company = result.rows[0];
  
      if (!company) throw new NotFoundError(`No company: ${handle}`);
    } */
  }
  
  
module.exports = Job;