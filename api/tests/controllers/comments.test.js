require("../mongodb_helper");

const request = require("supertest");
const app = require("../../app");
const User = require("../../models/user");
const Meme = require("../../models/meme");
const Comment = require("../../models/comment")

describe("/comments", () => {
  let authToken, memeId, userId;

  beforeEach(async () => {
    await User.deleteMany({});
    await Meme.deleteMany({});
    await Comment.deleteMany({})

    await request(app)
      .post("/users/registerUser")
      .send({
        username: "tibi",
        email: "minitibi@mail.com",
        password: "hungariansausage"
      });

    const user = await User.findOne({ username: "tibi" });
    userId = user._id;

    const userLogin = await request(app)
      .post("/users/login")
      .send({
        username: "tibi",
        password: "hungariansausage"
      });

    authToken = userLogin.body.token;

    const meme = await Meme.create({
      title: "Test Meme",
      img: "uploads/test.png",
      user: userId
    });

    memeId = meme._id;
  });

  test("POST /comments creates a comment", async () => {
    const response = await request(app)
      .post("/comments")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        comment: "This is funny!",
        meme_id: memeId
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.newComment.comment).toBe("This is funny!");
  });

  test("GET /comments returns all comments", async () => {
    await Comment.create({
      comment: "Happy memes!",
      meme_id: memeId,
      user_id: userId
    });

    const response = await request(app)
      .get("/comments")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("GET /comments/meme/:meme_id returns comments for meme", async () => {
    await Comment.create({
      comment: "Nice cat!",
      meme_id: memeId,
      user_id: userId
    });

    const response = await request(app)
      .get(`/comments/meme/${memeId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body[0].comment).toBe("Nice cat!");
  });

  test("PUT /comments/:id updates a comment", async () => {
    const comment = await Comment.create({
      comment: "Fix this text",
      meme_id: memeId,
      user_id: userId
    });

    const response = await request(app)
      .put(`/comments/${comment._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ comment: "🚀 Fixed Comment! 🚀" })

    expect(response.statusCode).toBe(200);
    expect(response.body.comment.comment).toBe("🚀 Fixed Comment! 🚀");
  });

  test("DELETE /comments/:id deletes a comment", async () => {
    const comment = await Comment.create({
      comment: "To be deleted",
      meme_id: memeId,
      user_id: userId
    });

    const response = await request(app)
      .delete(`/comments/${comment._id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("💅 Comment deleted 💅");
  });

  test("GET /comments/:id returns a comment by ID", async () => {
    const newComment = await Comment.create({
      comment: "By ID test",
      meme_id: memeId,
      user_id: userId
    });

    const response = await request(app)
      .get(`/comments/${newComment._id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.comment).toBe("By ID test");
  });   

});
