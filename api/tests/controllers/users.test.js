const request = require("supertest");

const app = require("../../app");
const User = require("../../models/user");

require("../mongodb_helper");

describe("/users", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST, when username, email and password are provided", () => {
    test("the response code is 201", async () => {
      const response = await request(app)
        .post("/users/registerUser")
        .send({ 
          username: "bree123",
          email: "breekal@email.com", 
          password: "password" });

      expect(response.statusCode).toBe(201);
    });

    test("a user is created", async () => {
      await request(app)
        .post("/users/registerUser")
        .send({ 
          username: "timking",
          email: "timking@email.com", 
          password: "12345678" });

      const users = await User.find();
      expect(users[0].username).toBe("timking")
      expect(users[0].email).toBe("timking@email.com");
    });
  });

  describe("when username already exists", () => {
    test("responds with 400 and does not create a duplicate user", async () => {
      await User.create({
        username: "peternik",
        email: "perternik@email.com",
        password: "peterpan",
      });

      const response = await request(app)
        .post("/users/registerUser")
        .send({
          username: "peternik",
          email: "peternic@email.com",
          password: "peterpan",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toEqual("User has an account");

        const users = await User.find();
        expect(users.length).toEqual(1);
    });
  });

  describe("POST, when password is missing", () => {
    test("response code is 400", async () => {
      const response = await request(app)
        .post("/users/registerUser")
        .send({ 
          username: "sarahjan",
          email: "sarahjan@email.com",
        });

      expect(response.statusCode).toBe(400);
    });

    test("does not create a user", async () => {
      await request(app)
        .post("/users/registerUser")
        .send({ 
          username: "sarahjan",
          email: "sarahjan@email.com",
        });

      const users = await User.find();
      expect(users.length).toEqual(0);
    });
  });

  describe("POST /users/login", () => {
    beforeEach(async () => {
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash("password", 8);
      await User.create({
        username: "bree123",
        email: "breekal@email.com",
        password: hashedPassword,
      });
    });

    test("responds with 200 and returns token if login details are correct", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({
          username: "bree123",
          password: "password",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe("bree123");
    });

    test("responds with 400 if username is wrong", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({
          username: "trudiesmith", 
          password: "password123", });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid username or password");
    });

    test("responds with 400 if password is wrong", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({
          username: "trudiesmith",
          password: "password123456", });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid username or password");
    });

    test("responds with 400 if email is wrong", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({
          email: "bree@email.com",
          password: "password123", });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid username or password");
    });
  });

});
