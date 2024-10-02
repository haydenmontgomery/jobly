const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("Process user values", function () {
    const data = {
        "firstName": "testFirst",
        "lastName": "testLast",
        "password": "hashedPassword",
        "email": "test@email.com"
    }
    const jsToSql = {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin",
      }
    test("Full data request change on user", function () {
        const { setCols, values } = sqlForPartialUpdate(data, jsToSql);
        expect(values[0]).toEqual('testFirst');
        expect(values[3]).toEqual('test@email.com');
        expect(values.length).toBe(4);
        expect(setCols).toMatch('"first_name"=$1, "last_name"=$2, "password"=$3, "email"=$4');
    });
});

describe("Process company values", function () {
    const data = { 
        "handle": "test", 
        "name": "testCompany", 
        "description": "testDescription", 
        "numEmployees": 1234, 
        "logoUrl": "testurl.com" 
    }
    const jsToSql = {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
    }

    test("Full data request change on user", function () {
        const { setCols, values } = sqlForPartialUpdate(data, jsToSql);
        expect(values[0]).toEqual('test');
        expect(values[4]).toEqual('testurl.com');
        expect(values.length).toBe(5);
        expect(setCols).toMatch('"handle"=$1, "name"=$2, "description"=$3, "num_employees"=$4, "logo_url"=$5');
    });
});