const request = require("supertest");
const app = require("../src/server.js");

let userId = "653a2c5ed8ff1b5f94c14b82";
describe("Delete User by id", () => {
  test("should be delet user by id", async () => {
    return request(app).delete(`/api/user/${userId}`).expect(200);
  }, 10000);
});
