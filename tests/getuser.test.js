const request = require("supertest");
const app = require("../src/server.js");
describe("GET all User ", () => {
  test("should return all User", async () => {
    return request(app)
      .get("/api/user/all-users")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  }, 10000);
});
