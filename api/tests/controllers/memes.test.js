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
        await User.deleteMany({});
        await Meme.deleteMany({});
        testUser = new User({
            username: "test@test.com",
            password: "12345678",
        });
        await testUser.save();
        token = createToken(testUser.id);
    });

    afterEach(async () => {
        await Meme.deleteMany({});
    });

    afterAll(async () => {
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

    test("returns two memes when there are two memes", async () => {
        const meme1 = await makeTestMeme(1);
        const meme2 = await makeTestMeme(2);

        const response = await request(app)
            .get("/memes")
            .set("Authorization", `Bearer ${token}`);

        expect(response.body.memes.length).toEqual(2);
    });

    test("a meme has the correct image and title", async () => {
        const meme = await makeTestMeme();

        const response = await request(app)
            .get("/memes")
            .set("Authorization", `Bearer ${token}`);

        expect(response.body.memes[0].img).toEqual(meme.img);
        expect(response.body.memes[0].title).toEqual(meme.title);
    });

    test("finds the right meme when searching by ID", async () => {
        const meme1 = await makeTestMeme(1);
        const meme2 = await makeTestMeme(2);

        const response = await request(app)
            .get("/memes/id/" + meme2.id)
            .set("Authorization", `Bearer ${token}`);

        expect(response.body.meme.title).toEqual(meme2.title);
    });

    test("populates the user's details when finding a meme", async () => {
        const meme1 = await makeTestMeme(1);

        const response = await request(app)
            .get("/memes/id/" + meme1.id)
            .set("Authorization", `Bearer ${token}`);

        expect(response.body.meme.user.username).toEqual("test@test.com");
    });

    test("returns 400 when searching for a meme that doens't exist", async () => {
        const response = await request(app)
            .get("/memes/id/1234567890abcdefg")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toEqual(400);
    });
});

describe("POST, when token is present", () => {

    beforeAll(async () => {
        await User.deleteMany({});
        await Meme.deleteMany({});
        testUser = new User({
            username: "test@test.com",
            password: "12345678",
        });
        await testUser.save();
        token = createToken(testUser.id);
    });

    afterEach(async () => {
        await Meme.deleteMany({});
    });

    afterAll(async () => {
        await Meme.deleteMany({});
    });

    test("creates a meme correctly", async () => {

        const webpBuffer = Buffer.from([
            0x52, 0x49, 0x46, 0x46, 0x26, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
            0x56, 0x50, 0x38, 0x20, 0x1A, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9D,
            0x01, 0x2A, 0x01, 0x00, 0x01, 0x00, 0x02, 0x00, 0x34, 0x25, 0xA4, 0x00,
            0x03, 0x70, 0x00, 0xFE, 0xFB, 0xFD, 0x50, 0x00
        ]);

        const response = await request(app)
            .post("/memes")
            .set("Authorization", `Bearer ${token}`)
            .field("title", "My created meme")
            .field("user", testUser._id.toString())
            .attach("image", webpBuffer, "test-meme.webp")  // filename as third parameter

        const memes = await Meme.find();
        expect(memes[0].title).toEqual("My created meme");
        expect(response.status).toEqual(201);
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