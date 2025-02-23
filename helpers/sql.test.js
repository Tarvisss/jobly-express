
const { sqlForPartialUpdate } = require("./sql");


describe("testing SQLFPU Function", function() {
    test("update single field", function () {
        const updateFields = { firstName: "Aliya" };
        const fieldToColumnMapping = { firstName: "first_name" };
        const result = sqlForPartialUpdate(updateFields, fieldToColumnMapping);

        expect(result).toEqual({
            setCols: "\"first_name\"=$1",
            values: ["Aliya"],
        });
    });
})