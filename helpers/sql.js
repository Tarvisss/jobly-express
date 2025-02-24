const { BadRequestError } = require("../expressError");

/** Generates a SQL string for a partial update query with values
 * 
 * generate the necessary parts of a SQL query for
 * updating speific fields in a database table based on the provided data.
 * It constucts the SET clause of the query dynamically, binding values
 * to parameters for secure sql execution.
 * 
 */

function sqlForPartialUpdate(dataToUpdate, jsFieldToSqlColumnMap) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    // jsToSql[colName] checks if there is a mapping for the current key, if not then the column remains the same
      `"${jsFieldToSqlColumnMap[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
