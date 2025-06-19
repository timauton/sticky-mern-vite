const request = require("supertest");
const JWT = require("jsonwebtoken");
const app = require("../../app");
const Rating = require("../../models/rating");
const User = require("../../models/user");
const Meme = require("../../models/meme")
const mongoose = require('mongoose')
const secret = process.env.JWT_SECRET;

require("../mongodb_helper");

// Helper functions
function createToken(userId) {
    return JWT.sign(
    {
        sub: userId,
        // Backdate token of 5 mins
        iat: Math.floor(Date.now() / 1000) - 5 * 60, 
        // Set the JWT token to expire in 10 mins
        exp: Math.floor(Date.now() / 1000) + 10 * 60,
    },
    secret
    );
}

// Create a rating
const createRating = (memeId, rating, token) => 
  request(app)
    .post("/ratings")
    .set("Authorization", `Bearer ${token}`)
    .send({ meme: memeId, rating: rating});

// Create multiple ratings for same meme by different users
// Usage: await createMultipleRatings(memeId, [2, 4, 6]);
const createMultipleRatings = async (memeId, ratings) => {
  const users = [];
  
  for (let i = 0; i < ratings.length; i++) {
    const user = new User({
      username: `testUser${i}`,
      email: `test${i}@example.com`,
      password: "password123"
    });
    await user.save();
    users.push(user);
    
    const token = createToken(user._id);
    await createRating(memeId, ratings[i], token);
  }
  
  return users;
};

let token;
let userId;
let memeId;

describe("/ratings", () => {
  // Before tests, CREATE a user, CREATE a meme, DELETE any ratings from prev tests & CREATE token.
  beforeAll(async () => {
    // Clean up before starting
    await User.deleteMany({});
    await Meme.deleteMany({});
    await Rating.deleteMany({});
    
    const user = new User({
      username: "testUser", 
      email: "testUser@example.com",
      password: "Passw0rd123"
    });
    await user.save();
    userId = user._id;

    const meme = new Meme({
      title: "my test meme",
      img: "meme.jpeg", 
      user: userId,
    });
    await meme.save();
    memeId = meme._id;

    token = createToken(user.id);
  });

  // Clean up after ALL tests
  afterAll(async () => {
    await User.deleteMany({});
    await Meme.deleteMany({});
    await Rating.deleteMany({});
  });

  // Clean ratings between individual tests
  afterEach(async () => {
    await Rating.deleteMany({});
    await User.deleteMany({});
    jest.restoreAllMocks();
  });

  describe("POST, when a valid token is present", () => {
    it("responds with a 201", async () => {
      const response = await createRating(memeId, 3, token);
      expect(response.status).toEqual(201);
    });

    it("creates a new rating", async () => {
      await createRating(memeId, 3, token);
      
      const ratings = await Rating.find();
      expect(ratings.length).toEqual(1);
      expect(ratings[0].rating).toEqual(3);  
    });

    it("returns a new token", async () => {
      const response = await createRating(memeId, 4, token);

      const newToken = response.body.token;
      const newTokenDecoded = JWT.decode(newToken, process.env.JWT_SECRET);
      const oldTokenDecoded = JWT.decode(token, process.env.JWT_SECRET)
      
      // iat stands for issued at
      expect(newTokenDecoded.iat > oldTokenDecoded.iat).toEqual(true);
    })
  });

  describe("POST, when a token is missing", () => {
    it("responds with a 401", async () => {
      const response = await request(app)
        .post("/ratings")
        .send({
          meme: memeId,
          user: userId,
          rating: 4,
        });

      expect (response.status).toEqual(401);
    });

    it("doesn't create a rating without token", async () => {
      const response = await request(app)
        .post("/ratings")
        .send({
          meme: memeId,
          user: userId,
          rating: 4
        })

      const ratings = await Rating.find();
      expect(ratings.length).toEqual(0);
    })

    it("doesn't return a token if post without a token", async () => {
      const response = await request(app)
        .post("/ratings")
        .send({
          meme: memeId,
          user: userId,
          rating: 4
        })

      expect(response.body.token).toEqual(undefined);
    })
  });

  describe('POST, users can update their rating', () => {
    it('allows user to update rating for same meme', async () => {
      const response1 = await createRating(memeId, 3, token);

      expect (response1.status).toEqual(201); // Created
      const ratings = await Rating.find();
      expect(ratings.length).toEqual(1);
      expect(ratings[0].rating).toEqual(3); 

      const response2 = await createRating(memeId, 5, token);
      expect (response2.status).toEqual(200); // Updated

      // Length of ratings should remain 1 but rating value should be updated
      const ratings2 = await Rating.find();
      expect(ratings2.length).toEqual(1);
      expect(ratings2[0].rating).toEqual(5); 
    });

    // Checks to see user can't game ratings by sending a POST via curl
    it('stops user sending duplicate ratings by bypassing upsert', async () => {
      // Create first rating normally through API
      await createRating(memeId, 3, token);

      // Try to bypass upsert by directly creating model instance
      const duplicateRating = new Rating({
        meme: memeId,
        user: userId,  
        rating: 5
      });

      // This should fail due to unique index
      await expect(duplicateRating.save()).rejects.toThrow(/duplicate key/);
    });
  });

  describe('POST, handles errors gracefully', () => {
    it('returns 400 when rating value is invalid', async () => {
      const response = await request(app)
        .post("/ratings")
        .set("Authorization", `Bearer ${token}`)
        .send({
          meme: memeId,
          rating: 6 // Invalid - too high
        });
      
      expect(response.status).toEqual(400);
      expect(response.body.error).toEqual("Invalid data");
    })

    it("returns 400 for missing rating", async () => {
      const response = await request(app)
        .post("/ratings")
        .set("Authorization", `Bearer ${token}`)
        .send({
          meme: memeId
          // Missing rating
        });
      expect(response.status).toEqual(400);
    });

    it("returns 400 for missing meme ID", async () => {
    const response = await request(app)
      .post("/ratings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        rating: 3
        // Missing meme
      });
    
    expect(response.status).toEqual(400);
    })

    it("returns 500 when database operation fails unexpectedly", async () => {
      // Mock findOneAndUpdate to throw an unexpected error
      const mockError = new Error("Database connection lost");
      jest.spyOn(Rating, 'findOneAndUpdate').mockRejectedValueOnce(mockError);
      
      const response = await createRating(memeId, 3, token);
      
      expect(response.status).toEqual(500);
      expect(response.body.error).toEqual("Internal server error");
      
      // Restore the original method
      Rating.findOneAndUpdate.mockRestore();
    });

    it("returns 409 when rating already exists", async () => {
      const duplicateError = new Error("Duplicate key error");
      duplicateError.code = 11000;
      
      jest.spyOn(Rating, 'findOneAndUpdate').mockRejectedValueOnce(duplicateError);
      
      const response = await createRating(memeId, 2, token);
      
      expect(response.status).toEqual(409);
      expect(response.body.error).toEqual('Rating already exists');
      
      Rating.findOneAndUpdate.mockRestore();  
    })
  });
  
  describe("DELETE, removes a rating", () => {
    it("deletes a rating", async () => {
      await createRating(memeId, 1, token);

      const ratingBeforeDeletion = await Rating.find();
      expect(ratingBeforeDeletion.length).toEqual(1);
      
      await request(app)
        .delete(`/ratings/${ratingBeforeDeletion[0]._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating_id: ratingBeforeDeletion[0]._id
        })

      const ratingAfterDeletion = await Rating.find();
      expect(ratingAfterDeletion.length).toEqual(0);
    });

    it("doesn't delete if userId doesn't match logged in user", async () => {
      await createRating(memeId, 3, token);

      const ratingBeforeDeletion = await Rating.find();
      expect(ratingBeforeDeletion.length).toEqual(1);

      // Create a second user and token
      const otherUser = new User({
        username: "otherUser",
        email: "other@example.com", 
        password: "Passw0rd123"
      });
      await otherUser.save();
      const otherToken = createToken(otherUser._id);

      // Try to delete with other user's token
      const response = await request(app)
        .delete(`/ratings/${ratingBeforeDeletion[0]._id}`) // Added missing slash
        .set("Authorization", `Bearer ${otherToken}`);     // Valid token

      expect(response.status).toEqual(403);
      expect(response.body.error).toEqual("Cannot delete another user's rating")
      
      const ratingAfterDeletion = await Rating.find();
      expect(ratingAfterDeletion.length).toEqual(1);
    })

    it("raises error if ratingId doesn't exist", async () => {
      await createRating(memeId, 1, token);
      
      const ratingBeforeDeletion = await Rating.find();
      expect(ratingBeforeDeletion.length).toEqual(1);

      // Try to delete a post that doesn't exist
      const nonExistentRatingId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/ratings/${nonExistentRatingId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(404);
      expect(response.body.error).toEqual("Rating not found");

      const ratingAfterDeletion = await Rating.find();
      expect(ratingAfterDeletion.length).toEqual(1);
    })

    it("returns 500 if delete operation fails unexpectedly", async () => {
      await createRating(memeId, 1, token);
      
      const ratingBeforeDeletion = await Rating.find()
      expect(ratingBeforeDeletion.length).toEqual(1);

      const mockError = new Error("Database connection lost");
      jest.spyOn(Rating, 'deleteOne').mockRejectedValueOnce(mockError);

      const response = await request(app)
        .delete(`/ratings/${ratingBeforeDeletion[0]._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating_id: ratingBeforeDeletion[0]._id
        });
      
      expect(response.status).toEqual(500);
      expect(response.body.error).toEqual("Unable to delete rating")
    })
  });

  describe("GET, user's current rating", () => {
    it("returns user's rating of a meme", async () => {
      await createRating(memeId, 5, token);

      const response = await request(app)
        .get(`/ratings/meme/${memeId}/current`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toEqual(200);
      expect(response.body.rating).toEqual(5);
      expect(response.body.token).toBeDefined();
    })

    it("returns null when the user hasn't rated", async () => {
      const response = await request(app)
        .get(`/ratings/meme/${memeId}/current`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.body.rating).toEqual(null);
    })

    it("returns 500 error getting user rating hits an unexpected error", async () => {
      await createRating(memeId, 5, token);
      
      const mockError = new Error("Database connection lost");
      jest.spyOn(Rating, 'findOne').mockRejectedValueOnce(mockError);

      const errorResponse = await request(app)
        .get(`/ratings/meme/${memeId}/current`)
        .set("Authorization", `Bearer ${token}`)
      
      expect(errorResponse.status).toEqual(500);
      expect(errorResponse.body.error).toEqual("Unable to get rating")
    })

    it("returns error for invalid meme ID format", async() => {
      const response = await request(app)
        .get( "/ratings/meme/not-an-object-id/current")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toEqual(400);
      expect(response.body.error).toEqual("Invalid meme ID format"); 
    })

    it("returns 401 error if no token is provided", async () => {
      const response = await request(app)
        .get(`/ratings/meme/${memeId}/current`)

      expect(response.status).toEqual(401);
    })
  });
  describe("GET, a meme's stats", () => {
    it("returns an average for a meme", async () => {
      await createMultipleRatings(memeId, [1, 2, 3]);

      const response = await request(app)
        .get(`/ratings/meme/${memeId}/stats`)
        .set('Authorization', `Bearer ${token}`)
      
      expect(response.status).toEqual(200);
      expect(response.body.averageRating).toEqual(2);
    }); 

    it("returns a breakdown of rating for a meme", async() => {
      await createMultipleRatings(memeId, [1, 2, 2, 4, 4, 3, 3, 3, 4, 4]);
      
      const response = await request(app)
        .get(`/ratings/meme/${memeId}/stats`)
        .set('Authorization', `Bearer ${token}`)
      
      expect(response.status).toEqual(200);
      expect(response.body.ratingBreakdown).toEqual({
        "5": 0,
        "4": 4,
        "3": 3,
        "2": 2,
        "1": 1
        }
      )
    })

    it("returns a total # of ratings for a meme", async() => {
      await createMultipleRatings(memeId, [1, 2, 2, 4, 4, 3, 3, 3, 4, 4]);
      
      const response = await request(app)
        .get(`/ratings/meme/${memeId}/stats`)
        .set('Authorization', `Bearer ${token}`)
      
      expect(response.status).toEqual(200);
      expect(response.body.totalRatings).toEqual(10);
    })

    it("returns 400 error if memeId is invalid", async () => {
      const response = await request(app)
        .get(`/ratings/meme/not-a-meme-id/stats`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toEqual(400);
      expect(response.body.error).toEqual("Invalid meme ID format");
    })

    it("can't view stats without an Auth token", async () => {
      const response = await request(app)
        .get(`/ratings/meme/${memeId}/stats`)
      
      expect(response.status).toEqual(401)
    })

    it("returns 500 error for an unexpected error", async () => {
      const mockError = new Error("Database connection lost");
      jest.spyOn(Rating, 'aggregate').mockRejectedValueOnce(mockError);

      const response = await request(app)
        .get(`/ratings/meme/${memeId}/stats`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toEqual(500);
    })

    it("returns zeros when meme has no ratings", async () => {
      const response = await request(app)
        .get(`/ratings/meme/${memeId}/stats`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.body).toEqual({
        averageRating: 0,
        totalRatings: 0,
        ratingBreakdown: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 }
      });
    });
  });
});