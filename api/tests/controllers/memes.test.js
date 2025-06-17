const request = require("supertest");
const JWT = require("jsonwebtoken");

const app = require("../../app");
const User = require("../../models/user");
const Meme = require("../../models/meme");

require("../mongodb_helper");

const secret = process.env.JWT_SECRET;

function createToken(userId) {
  return JWT.sign(
    {
      sub: userId,
      // Backdate this token of 5 minutes
      iat: Math.floor(Date.now() / 1000) - 5 * 60,
      // Set the JWT token to expire in 10 minutes
      exp: Math.floor(Date.now() / 1000) + 10 * 60,
    },
    secret
  );
}

let token;
let testUser;
const testDate = new Date("2025-01-01T01:01:01Z");

describe("GET, when token is present", () => {

    beforeAll(async () => {
        testUser = new User({
            email: "test@test.com",
            password: "12345678",
        });
        await testUser.save();
        await Meme.deleteMany({});
        token = createToken(testUser.id);
    });

    afterEach(async () => {
        await User.deleteMany({});
        await Meme.deleteMany({});
    });

    test("the response code is 200", async () => {
        const meme = await makeTestMeme();

        const response = await request(app)
            .get("/memes")
            .set("Authorization", `Bearer ${token}`);
        
        expect(response.status).toEqual(200);
    });

    test("returns an empty list when there are no memes", async () => {
        const response = await request(app)
            .get("/memes")
            .set("Authorization", `Bearer ${token}`);
        
        expect(response.body.memes).toEqual([]);
    });

    test("returns one meme when there is one meme", async () => {
        const meme = await makeTestMeme();

        const response = await request(app)
            .get("/memes")
            .set("Authorization", `Bearer ${token}`);

        expect(response.body.memes.length).toEqual(1);
    });

    test("has the correct image and title", async () => {
        const meme = await makeTestMeme();

        const response = await request(app)
            .get("/memes")
            .set("Authorization", `Bearer ${token}`);

        expect(response.body.memes[0].img).toEqual(meme.img);
        expect(response.body.memes[0].title).toEqual(meme.title);
    });

    test("returns two memes when there are two memes", async () => {
        const meme1 = await makeTestMeme(1);
        const meme2 = await makeTestMeme(2);

        const response = await request(app)
            .get("/memes")
            .set("Authorization", `Bearer ${token}`);

        expect(response.body.memes.length).toEqual(2);
    });

});

const makeTestMeme = async ( suffix = "" ) => {
    const meme = new Meme({
        img: "images/my_meme" + suffix + ".jpeg",
        title: "My Fab Meme " + suffix,
        user: testUser.id,
        created_at: testDate
    });
    await meme.save();
    return meme;
}