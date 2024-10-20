const request = require("supertest");
const app = require("../src/server.js"); // Assuming your Express app is exported from server.js

describe("register user", () => {
  test("should be register user", async () => {
    return request(app)
      .post("/api/user/register")
      .send({
        firstname: "test",
        lastname: "unit",
        email: "test@example.com",
        mobile: "091343432",
        password: "12345",
      })
      .expect(200);
  }, 150000);
});
