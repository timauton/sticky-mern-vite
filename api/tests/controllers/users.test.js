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

  describe("GET /users/:user_id/tag-rankings", () => {
    let testUser;
    let otherUser1;
    let otherUser2;
    let token;

    beforeEach(async () => {
      // Clean up
      await User.deleteMany({});
      await Meme.deleteMany({});
      await Rating.deleteMany({});
      
      // Create test users
      testUser = new User({
        username: 'testuser',
        email: 'test@test.com',
        password: '12345678'
      });
      
      otherUser1 = new User({
        username: 'competitor1',
        email: 'comp1@test.com',
        password: '12345678'
      });
      
      otherUser2 = new User({
        username: 'competitor2',
        email: 'comp2@test.com',
        password: '12345678'
      });
      
      await testUser.save();
      await otherUser1.save();
      await otherUser2.save();
      
      token = createToken(testUser._id);
      
      // === CATS TAG COMPETITION ===
      // testUser: 2 memes, ratings [4,5] = 4.5 avg (rank 2)
      const testUserCatMeme1 = new Meme({
        title: "Test Cat 1", img: "cat1.jpg", user: testUser._id,
        created_at: new Date(), tags: ["cats"]
      });
      const testUserCatMeme2 = new Meme({
        title: "Test Cat 2", img: "cat2.jpg", user: testUser._id,
        created_at: new Date(), tags: ["cats"]
      });
      await testUserCatMeme1.save();
      await testUserCatMeme2.save();
      
      // otherUser1: 1 meme, rating [5] = 5.0 avg (rank 1)
      const other1CatMeme = new Meme({
        title: "Other Cat 1", img: "ocat1.jpg", user: otherUser1._id,
        created_at: new Date(), tags: ["cats"]
      });
      await other1CatMeme.save();
      
      // otherUser2: 1 meme, rating [3] = 3.0 avg (rank 3)
      const other2CatMeme = new Meme({
        title: "Other Cat 2", img: "ocat2.jpg", user: otherUser2._id,
        created_at: new Date(), tags: ["cats"]
      });
      await other2CatMeme.save();
      
      // Create ratings for cats memes
      await new Rating({ meme: testUserCatMeme1._id, user: otherUser1._id, rating: 4 }).save();
      await new Rating({ meme: testUserCatMeme2._id, user: otherUser2._id, rating: 5 }).save();
      await new Rating({ meme: other1CatMeme._id, user: testUser._id, rating: 5 }).save();
      await new Rating({ meme: other2CatMeme._id, user: testUser._id, rating: 3 }).save();
      
      // === DOGS TAG COMPETITION ===
      // testUser: 1 meme, rating [5] = 5.0 avg (rank 1)
      const testUserDogMeme = new Meme({
        title: "Test Dog 1", img: "dog1.jpg", user: testUser._id,
        created_at: new Date(), tags: ["dogs"]
      });
      await testUserDogMeme.save();
      
      // otherUser1: 1 meme, rating [4] = 4.0 avg (rank 2)
      const other1DogMeme = new Meme({
        title: "Other Dog 1", img: "odog1.jpg", user: otherUser1._id,
        created_at: new Date(), tags: ["dogs"]
      });
      await other1DogMeme.save();
      
      // Create ratings for dogs memes
      await new Rating({ meme: testUserDogMeme._id, user: otherUser1._id, rating: 5 }).save();
      await new Rating({ meme: other1DogMeme._id, user: testUser._id, rating: 4 }).save();
    });

    it("returns user's ranking for each tag they've used", async () => {
      const response = await request(app)
        .get(`/users/${testUser._id}/tag-rankings`)
        .set("Authorization", `Bearer ${token}`);
        
      expect(response.status).toEqual(200);
      // Check overall stats
      expect(response.body.userOverallStats).toEqual({
        totalMemes: 3,  // 2 cats + 1 dog
        overallAvgRating: 4.7,  // (4.5*2 + 5.0*1) / 3 = 4.67 ≈ 4.7
        totalRatingsReceived: 3  // 3 ratings total
      });
      
      // Check tag rankings
      expect(response.body.tagRankings).toHaveLength(2);
      
      const catsRanking = response.body.tagRankings.find(r => r.tag === "cats");
      const dogsRanking = response.body.tagRankings.find(r => r.tag === "dogs");
      
      expect(catsRanking).toEqual({
        tag: "cats",
        userRank: 2,
        totalUsers: 3,
        userAvgRating: 4.5,
        userMemeCount: 2
      });
      
      expect(dogsRanking).toEqual({
        tag: "dogs", 
        userRank: 1,
        totalUsers: 2,
        userAvgRating: 5.0,
        userMemeCount: 1
      });
    });

    it("handles user with no memes", async () => {
      const emptyUser = new User({username: 'empty', email: 'empty@test.com', password: '12345678'});
      await emptyUser.save();
      
      const response = await request(app)
        .get(`/users/${emptyUser._id}/tag-rankings`)
        .set("Authorization", `Bearer ${token}`);
        
      expect(response.status).toEqual(200);
      expect(response.body.userOverallStats).toEqual({
        totalMemes: 0,
        overallAvgRating: 0,
        totalRatingsReceived: 0
      });
      expect(response.body.tagRankings).toEqual([]);
    });

    it("returns 400 error when aggregation fails", async () => {
      const mockError = new Error("Database connection lost");
      jest.spyOn(Meme, 'aggregate').mockRejectedValueOnce(mockError);
      
      const response = await request(app)
        .get(`/users/${testUser._id}/tag-rankings`)
        .set("Authorization", `Bearer ${token}`);
        
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Error finding user tag rankings");
      
      Meme.aggregate.mockRestore();
    });
  });

  describe("GET /users/:user_id/tag-rankings/:tag", () => {
    let testUser;
    let testToken;

    beforeEach(async () => {
      // Clean up
      await User.deleteMany({});
      await Meme.deleteMany({});
      await Rating.deleteMany({});
      
      // Create test users (reusing same setup for consistency)
      testUser = new User({
        username: 'testuser',
        email: 'test@test.com',
        password: '12345678'
      });
      
      const otherUser1 = new User({
        username: 'competitor1',
        email: 'comp1@test.com',
        password: '12345678'
      });
      
      const otherUser2 = new User({
        username: 'competitor2',
        email: 'comp2@test.com',
        password: '12345678'
      });
      
      await testUser.save();
      await otherUser1.save();
      await otherUser2.save();
      
      testToken = createToken(testUser._id);
      
      // Create cats competition data
      const testUserCatMeme1 = new Meme({
        title: "Test Cat 1", img: "cat1.jpg", user: testUser._id,
        created_at: new Date(), tags: ["cats"]
      });
      const testUserCatMeme2 = new Meme({
        title: "Test Cat 2", img: "cat2.jpg", user: testUser._id,
        created_at: new Date(), tags: ["cats"]
      });
      await testUserCatMeme1.save();
      await testUserCatMeme2.save();
      
      const other1CatMeme = new Meme({
        title: "Other Cat 1", img: "ocat1.jpg", user: otherUser1._id,
        created_at: new Date(), tags: ["cats"]
      });
      await other1CatMeme.save();
      
      const other2CatMeme = new Meme({
        title: "Other Cat 2", img: "ocat2.jpg", user: otherUser2._id,
        created_at: new Date(), tags: ["cats"]
      });
      await other2CatMeme.save();
      
      // Create ratings for cats memes
      await new Rating({ meme: testUserCatMeme1._id, user: otherUser1._id, rating: 4 }).save();
      await new Rating({ meme: testUserCatMeme2._id, user: otherUser2._id, rating: 5 }).save();
      await new Rating({ meme: other1CatMeme._id, user: testUser._id, rating: 5 }).save();
      await new Rating({ meme: other2CatMeme._id, user: testUser._id, rating: 3 }).save();
    });

    it("returns detailed leaderboard for specific tag", async () => {
      const response = await request(app)
        .get(`/users/${testUser._id}/tag-rankings/cats`)
        .set("Authorization", `Bearer ${testToken}`);
      
      expect(response.status).toEqual(200);
      expect(response.body.tag).toEqual("cats");
      expect(response.body.leaderboard).toHaveLength(3);
      
      // Check top user
      expect(response.body.leaderboard[0]).toEqual({
        rank: 1, username: "competitor1", avgRating: 5, memeCount: 1
      });
      
      // Check that our test user is in the leaderboard
      expect(response.body.leaderboard[1]).toEqual({
        rank: 2, username: "testuser", avgRating: 4.5, memeCount: 2
      });
    });

    it("returns 400 error when tag leaderboard aggregation fails", async () => {
      const mockError = new Error("Database connection lost");
      jest.spyOn(Meme, 'aggregate').mockRejectedValueOnce(mockError);
      
      const response = await request(app)
        .get(`/users/${testUser._id}/tag-rankings/cats`)
        .set("Authorization", `Bearer ${testToken}`);
        
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Error finding tag leaderboard");
      
      Meme.aggregate.mockRestore();
    });
  });

    describe("GET /users/:user_id/overall-leaderboard", () => {
    let testUser;
    let testToken;

    beforeEach(async () => {
      // Clean up
      await User.deleteMany({});
      await Meme.deleteMany({});
      await Rating.deleteMany({});
      
      // Create test users
      testUser = new User({
        username: 'testuser',
        email: 'test@test.com', 
        password: '12345678'
      });
      
      const topUser = new User({
        username: 'topuser',
        email: 'top@test.com',
        password: '12345678'
      });
      
      const bottomUser = new User({
        username: 'bottomuser', 
        email: 'bottom@test.com',
        password: '12345678'
      });
      
      await testUser.save();
      await topUser.save();
      await bottomUser.save();
      
      testToken = createToken(testUser._id);
      
      // === TOP USER: 1 meme with 5.0 average (rank 1) ===
      const topUserMeme = new Meme({
        title: "Top Meme", img: "top.jpg", user: topUser._id,
        created_at: new Date(), tags: ["top"]
      });
      await topUserMeme.save();
      
      // Rating: [5] = 5.0 average
      await new Rating({ meme: topUserMeme._id, user: testUser._id, rating: 5 }).save();
      
      // === TEST USER: 2 memes with 4.5 overall average (rank 2) ===
      const testUserMeme1 = new Meme({
        title: "Test Meme 1", img: "test1.jpg", user: testUser._id,
        created_at: new Date(), tags: ["test"]
      });
      const testUserMeme2 = new Meme({
        title: "Test Meme 2", img: "test2.jpg", user: testUser._id,
        created_at: new Date(), tags: ["test"]
      });
      await testUserMeme1.save();
      await testUserMeme2.save();
      
      // Ratings: [4] and [5] = 4.5 overall average
      await new Rating({ meme: testUserMeme1._id, user: topUser._id, rating: 4 }).save();
      await new Rating({ meme: testUserMeme2._id, user: bottomUser._id, rating: 5 }).save();
      
      // === BOTTOM USER: 1 meme with 3.0 average (rank 3) ===
      const bottomUserMeme = new Meme({
        title: "Bottom Meme", img: "bottom.jpg", user: bottomUser._id,
        created_at: new Date(), tags: ["bottom"]
      });
      await bottomUserMeme.save();
      
      // Rating: [3] = 3.0 average
      await new Rating({ meme: bottomUserMeme._id, user: testUser._id, rating: 3 }).save();
    });

    it("returns overall leaderboard across all users", async () => {
      const response = await request(app)
        .get(`/users/${testUser._id}/overall-leaderboard`)
        .set("Authorization", `Bearer ${testToken}`);
        
      expect(response.status).toEqual(200);
      expect(response.body.leaderboard).toHaveLength(3);
      
      // Check ranking order (highest overall average first)
      expect(response.body.leaderboard[0]).toEqual({
        rank: 1, username: "topuser", avgRating: 5.0, totalMemes: 1, totalRatings: 1
      });
      
      expect(response.body.leaderboard[1]).toEqual({
        rank: 2, username: "testuser", avgRating: 4.5, totalMemes: 2, totalRatings: 2
      });
      
      expect(response.body.leaderboard[2]).toEqual({
        rank: 3, username: "bottomuser", avgRating: 3.0, totalMemes: 1, totalRatings: 1
      });
      
      // Check user stats
      expect(response.body.userStats).toEqual({
        rank: 2, username: "testuser", avgRating: 4.5, totalMemes: 2, totalRatings: 2
      });
    });

    it("returns 400 error when overall leaderboard aggregation fails", async () => {
      const mockError = new Error("Database connection lost");
      jest.spyOn(Meme, 'aggregate').mockRejectedValueOnce(mockError);
      
      const response = await request(app)
        .get(`/users/${testUser._id}/overall-leaderboard`)
        .set("Authorization", `Bearer ${testToken}`);
        
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Error finding overall leaderboard");
      
      Meme.aggregate.mockRestore();
    });
  });
});

