const request = require("supertest");
const app = require("../src/server.js");

const updateuserId = "65dc8dfcd17f844cf0fdc40f";

describe("uppdate by id ", () => {
  test("should be delete user by id", async () => {
    return request(app).put(`/api/user/${updateuserId}`).send({
      firstname: "test update",
      lastname: "jest test library",
      email: "test@test.com",
      mobile: "0968917127",
    });
  }, 10000);
});
