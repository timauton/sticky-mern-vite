process.env.JWT_SECRET = "supersecret";

const JWT = require("jsonwebtoken");
const request = require("supertest");
const app = require("../../app");
const User = require("../../models/user");

const Meme = require("../../models/meme");
const Rating = require("../../models/rating");

require("../mongodb_helper");

const secret = process.env.JWT_SECRET

function createToken(userId) {
  return JWT.sign(
    {
      sub: userId,
      iat: Math.floor(Date.now() / 1000) - 5 * 60,
      exp: Math.floor(Date.now() / 1000) + 10 * 60,
    },
    secret
  );
}

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

  describe("GET /users/:user_id/activity", () => {
      beforeEach(async () => {
      // Clean up
      await User.deleteMany({});
      await Meme.deleteMany({});
      await Rating.deleteMany({});
      
      // Create test user
      testUser = new User({
        username: 'activityuser',
        email: 'activity@test.com',
        password: '12345678'
      });
      await testUser.save();
      token = createToken(testUser._id);
      
      // Create one other user
      const creator = new User({username: 'creator', email: 'creator@test.com', password: '12345678'});
      await creator.save();
      
      // === JANUARY: 1 meme created, 1 rating made ===
      const janMeme = new Meme({
        title: "January Meme",
        img: "jan.jpg",
        user: testUser._id,
        created_at: new Date('2025-01-15'),
        tags: ["january"]
      });
      await janMeme.save();
      
      const otherMeme = new Meme({
        title: "Other Meme",
        img: "other.jpg",
        user: creator._id,
        created_at: new Date('2025-01-01'),
        tags: ["other"]
      });
      await otherMeme.save();
      
      const janRating = new Rating({
        meme: otherMeme._id,
        user: testUser._id,
        rating: 4,
        createdAt: new Date('2025-01-20')
      });
      await janRating.save();
      
      // === FEBRUARY: 0 memes created, 2 ratings made ===
      const otherMeme2 = new Meme({
        title: "Other Meme 2",
        img: "other2.jpg",
        user: creator._id,
        created_at: new Date('2025-02-01'),
        tags: ["other"]
      });
      await otherMeme2.save();
      
      const febRating1 = new Rating({
        meme: otherMeme2._id,
        user: testUser._id,
        rating: 3,
        createdAt: new Date('2025-02-10')
      });
      const febRating2 = new Rating({
        meme: janMeme._id, // Rating their own meme
        user: testUser._id,
        rating: 5,
        createdAt: new Date('2025-02-15')
      });
      await febRating1.save();
      await febRating2.save();
    });

    it("returns user activity data grouped by month", async () => {
      const response = await request(app)
        .get(`/users/${testUser._id}/activity`)
        .set("Authorization", `Bearer ${token}`);
        
      expect(response.status).toEqual(200);
      expect(response.body.chartData).toEqual([
        { period: "2025-01", memesCreated: 1, memesRated: 1 },
        { period: "2025-02", memesCreated: 0, memesRated: 2 }
      ]);
    });

    it("returns 400 error when aggregation fails", async () => {
      // Mock the Meme.aggregate to throw an error
      const mockError = new Error("Database connection lost");
      jest.spyOn(Meme, 'aggregate').mockRejectedValueOnce(mockError);
      
      const response = await request(app)
        .get(`/users/${testUser._id}/activity`)
        .set("Authorization", `Bearer ${token}`);
        
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Error finding user activity");
      expect(response.body.token).toBeDefined(); // Should still return a token
      
      // Restore the original function
      Meme.aggregate.mockRestore();
    });
  })
});
