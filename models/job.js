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
     //****************Need to reformat this from company to jobs.*****************
    static async create({ title, salary, equity, companyHandle }) {
      const handleCheck = await db.query(
            `SELECT handle
            FROM companies
            WHERE handle = $1`,
          [companyHandle]);
      if (!handleCheck.rows[0]) throw new NotFoundError(`No company: ${companyHandle}`);

      const result = await db.query(
            `INSERT INTO jobs
             (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
          [
            title, 
            salary,
            equity,
            companyHandle,
          ],
      );
      const job = result.rows[0];

      //numeric was returning as a string. This fixes that
      const response = {
        ...job,
        equity: job.equity ? parseFloat(job.equity) : null
      };
      return response;
    }
  
    /** Find all companies.
     *
     * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
     * */
  
    /* static async findAll(filters = {}) {
      let query =
            `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
             FROM companies`;
      
      //pull our querie values
      const { minEmployees, maxEmployees, name } = filters;
  
      let values = [];
      let expressions = [];
  
      if (minEmployees !== undefined) {
        values.push(minEmployees);
        expressions.push(`num_employees >= $${values.length}`);
      }
      
      if (maxEmployees !== undefined) {
        values.push(maxEmployees);
        expressions.push(`num_employees <= $${values.length}`);
      }
  
      //push name into queries. set with surrounding % so the search will take any company matching the string in its name
      if (name) {
        values.push(`%${name}%`)
        expressions.push(`name ILIKE $${values.length}`);
      }
  
      if (expressions.length > 0) {
        query += " WHERE " + expressions.join(" AND ");
      }
  
  
      query += " ORDER BY name";
      console.log(query);
      const companiesRes = await db.query(query, values);
  
      return companiesRes.rows;
    } */
  
    /** Given a company handle, return data about company.
     *
     * Returns { handle, name, description, numEmployees, logoUrl, jobs }
     *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
     *
     * Throws NotFoundError if not found.
     **/
  
    /* static async get(handle) {
      const companyRes = await db.query(
            `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
             FROM companies
             WHERE handle = $1`,
          [handle]);
  
      const company = companyRes.rows[0];
  
      if (!company) throw new NotFoundError(`No company: ${handle}`);
  
      return company;
    } */
  
    /** Update company data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: {name, description, numEmployees, logoUrl}
     *
     * Returns {handle, name, description, numEmployees, logoUrl}
     *
     * Throws NotFoundError if not found.
     */
  
    /* static async update(handle, data) {
      const { setCols, values } = sqlForPartialUpdate(
          data,
          {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
          });
      const handleVarIdx = "$" + (values.length + 1);
  
      const querySql = `UPDATE companies 
                        SET ${setCols} 
                        WHERE handle = ${handleVarIdx} 
                        RETURNING handle, 
                                  name, 
                                  description, 
                                  num_employees AS "numEmployees", 
                                  logo_url AS "logoUrl"`;
      const result = await db.query(querySql, [...values, handle]);
      const company = result.rows[0];
  
      if (!company) throw new NotFoundError(`No company: ${handle}`);
  
      return company;
    } */
  
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