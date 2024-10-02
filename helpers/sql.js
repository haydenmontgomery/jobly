const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/* Constructs a list of column assignments for the UPDATE
statement in PSQL.

dataToUpdate is the body of the request.

Example: {"firsName": "testUpdate", "email": "testUpdate@email.com"}
Any Object data can be used but this function is only called on company update or user update.

If called from users, jsToSQL is: {
          firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
        }

If caled from companies, jsToSQL is: {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        }

This is to conform to the psql schema which uses the values in "" above.

For the example above, this function would return setCols as a string:
'"first_name"=$1, "email"=$2'

and values as a list:
[ 'testUpdate', 'testUpdate@email.com' ]

*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
