"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {

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
    let job = result.rows[0];
    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

  static async findAll(filters = {}) {
    const { title, minSalary, companyHandle, equity} = filters;
    
    // Base query to select job data
    let query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle AS "companyHandle",
                        c.name AS "companyName"
                 FROM jobs j
                 LEFT JOIN companies AS c ON c.handle = j.company_handle`;
    
    // Array to hold query parameters
    let queryParams = [];
    
    // Array to hold conditions for filtering
    let whereClauses = [];
    
    // If title filter is provided, add a case-insensitive search for the title
    if (title) {
      whereClauses.push(`title ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${title}%`);
    }
    if (companyHandle) {
        whereClauses.push(`company_handle ILIKE $${queryParams.length + 1}`);
        queryParams.push(`%${companyHandle}%`);
    }
    if (equity === true) {
      whereClauses.push(`equity > 0`);
    }
    // If minSalary filter is provided, add condition for jobs with at least 'minSalary' salary
    if (minSalary) {
      whereClauses.push(`salary >= $${queryParams.length + 1}`);
      queryParams.push(minSalary);
    }
    
    // If any filters are applied, add WHERE clause and join conditions with AND
    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    // Order results by job title
    query += " ORDER BY title ";

    // Execute the query and return the results
    const jobs = await db.query(query, queryParams);

    return jobs.rows;
  }

  /** Given a job id, return data about the job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if job not found.
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
      [id]
    );
  
    const foundJob = jobRes.rows[0];
  
    if (!foundJob) throw new NotFoundError(`No job: ${id}`);
  
    const companiesRes = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
       FROM companies
       WHERE handle = $1`, [foundJob.companyHandle]
    );
  
    delete foundJob.companyHandle;
    foundJob.company = companiesRes.rows[0];
  
    return foundJob;
  }
  

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if job not found.
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

    if (!job) throw new NotFoundError(`job not found: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`job not found: ${id}`);
    
  }
 
}


module.exports = Job;
