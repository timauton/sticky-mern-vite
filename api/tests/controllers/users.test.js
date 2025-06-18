process.env.JWT_SECRET = "supersecret";

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

  describe("User CRUD routes", () => {
    let authenticationToken, userId;

    beforeEach(async () => {
      const res = await request(app)
        .post("/users/registerUser")
        .send({
          username: "bree123",
          email: "breekal@email.com", 
          password: "password"
        });

      const login = await request(app)
        .post("/users/login")
        .send({ 
          username: "bree123",
          password: "password"
        })
      
      authenticationToken = login.body.token;
      userId = res.body.user.id;
    });

    test("GET /users returns all users", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${authenticationToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some(user => user.username === "bree123")).toBe(true);
    });

    test("GET /users/:id returns a user by ID", async () => {
      const response = await request(app)
        .get(`/users/${userId}`)
        .set("Authorization", `Bearer ${authenticationToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.username).toBe("bree123");
    });

    test("PUT /users/:id updates a user's username", async () => {
      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Authorization", `Bearer ${authenticationToken}`)
        .send({ username: "breekal" });

      expect(response.statusCode).toBe(200);
      expect(response.body.user.username).toBe("breekal");
      expect(response.body.message).toBe("User updated");
    });

    test("DELETE /users/:id removes a user", async () => {
      const deleteResponse = await request(app)
        .delete(`/users/${userId}`)
        .set("Authorization", `Bearer ${authenticationToken}`);

      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.body.message).toBe("User deleted");

      const checkDeletedUser = await request(app)
        .get(`/users/${userId}`)
        .set("Authorization", `Bearer ${authenticationToken}`);

      expect(checkDeletedUser.statusCode).toBe(404);
    });
  });

  describe("Token-protected user routes", () => {
    let authenticationToken, userId;

    beforeEach(async () => {
      await User.deleteMany({});

      await request(app)
        .post("/users/registerUser")
        .send({
          username: "bree123",
          email: "breekal@email.com",
          password: "password"
        });

      const login = await request(app)
        .post("/users/login")
        .send({
          username: "bree123",
          password: "password"
        });

      if (!login.body.user) {
        console.error("Login failed:", login.body);
        throw new Error("Login did not return a user");
      }

      authenticationToken = login.body.token;
      userId = login.body.user.id;
    });

    test("GET /users require a token and returns users", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${authenticationToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test("GET /users/:id requires a token and returns the user", async () => {
      const response = await request(app)
        .get(`/users/${userId}`)
        .set("Authorization", `Bearer ${authenticationToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.username).toBe("bree123");
    });

    test("PUT /users/:id updates username with token", async () => {
      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Authorization", `Bearer ${authenticationToken}`)
        .send({ username: "bree123" });

      expect(response.statusCode).toBe(200);
      expect(response.body.user.username).toBe("bree123");
    });

    test("DELETE /users/:id deletes the user with token", async () => {
      const response = await request(app)
        .delete(`/users/${userId}`)
        .set("Authorization", `Bearer ${authenticationToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("User deleted");
    });

  });  

});
