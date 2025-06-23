const request = require("supertest");
const JWT = require("jsonwebtoken");

const app = require("../../app");
const User = require("../../models/user");
const Meme = require("../../models/meme");
const Rating = require("../../models/rating");
const fs = require('fs').promises;
const path = require('path');

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
            username: "testuser",
            email: "test@test.com",
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

    test("a meme has the correct image, title and tag", async () => {
        const meme = await makeTestMeme(1, "tag");

        const response = await request(app)
            .get("/memes")
            .set("Authorization", `Bearer ${token}`);

        expect(response.body.memes[0].img).toEqual(meme.img);
        expect(response.body.memes[0].title).toEqual(meme.title);
        expect(response.body.memes[0].tags).toEqual(meme.tags);
    });

    test("finds the right meme when searching by ID", async () => {
        const meme1 = await makeTestMeme(1);
        const meme2 = await makeTestMeme(2);

        const response = await request(app)
            .get("/memes/" + meme2.id)
            .set("Authorization", `Bearer ${token}`);

        expect(response.body.meme.title).toEqual(meme2.title);
    });

    test("populates the user's details when finding a meme", async () => {
        const meme1 = await makeTestMeme(1);

        const response = await request(app)
            .get("/memes/" + meme1.id)
            .set("Authorization", `Bearer ${token}`);

        expect(response.body.meme.user.email).toEqual("test@test.com");
    });

    test("returns 400 when searching for a meme that doens't exist", async () => {
        const response = await request(app)
            .get("/memes/1234567890abcdefg")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toEqual(400);
    });

    test("gets the next meme", async () => {

        // this is random, so we just keep looking for a particular meme somewhere in the
        // middle until we find it. It is exceptionally unlikely that we would not find it
        // in 100 attempts, but we cap it just in case

        const meme1 = makeTestMeme(1);
        const meme2 = makeTestMeme(2);
        const meme3 = makeTestMeme(3);
        const meme4 = makeTestMeme(4);
        const meme5 = makeTestMeme(5);

        let gotMeme3 = false;
        for (i = 0; i < 100; i++) {

            response = await request(app)
                .get("/memes/next")
                .set("Authorization", `Bearer ${token}`);

            if (response.body.meme.title === "My Fab Meme 3") {
                gotMeme3 = true;
                console.log("/memes/next test found the meme in " + (i+1) + " attempts");
                break;
            }
        }

        expect(gotMeme3).toEqual(true);
    });

    test("gets memes made by a user", async () => {

        const meme1 = makeTestMeme(1);
        const meme2 = makeTestMeme(2);
        const meme3 = makeTestMeme(3);

        const response = await request(app)
            .get("/memes/user/" + testUser._id)
            .set("Authorization", `Bearer ${token}`);

        expect(response.body.memes.length).toEqual(3);
    });

    test("gets memes a user has rated", async () => {

        const meme1 = await makeTestMeme(1);
        const meme2 = await makeTestMeme(2);
        const meme3 = await makeTestMeme(3);

        await Rating.deleteMany({});
        const rating1 = new Rating({
            meme: meme1._id,
            user: testUser._id,
            rating: 5
        });
        await rating1.save();

        const response = await request(app)
            .get("/memes/rated_by_user/" + testUser._id)
            .set("Authorization", `Bearer ${token}`);

        expect(response.body.memes.length).toEqual(1);
    });

    test("gets memes with a single tag", async () => {

        const meme1 = await makeTestMeme(1, ["tag1"]);
        const meme2 = await makeTestMeme(2, ["tag2"]);
        const meme3 = await makeTestMeme(3, ["tag3"]);

        const response = await request(app)
            .get("/memes/tagged/tag2")
            .set("Authorization", `Bearer ${token}`);

        expect(response.body.memes.length).toEqual(1);
    });

    test("gets memes with multiple single tag", async () => {

        const meme1 = await makeTestMeme(1, ["tag1", "tag2"]);
        const meme2 = await makeTestMeme(2, ["tag2", "tag3"]);
        const meme3 = await makeTestMeme(3, ["tag3", "tag4"]);
        const meme4 = await makeTestMeme(4, ["tag4", "tag5"]);

        const response = await request(app)
            .get("/memes/tagged/tag2,tag3")
            .set("Authorization", `Bearer ${token}`);

        expect(response.body.memes.length).toEqual(3);
    });

    test("retuns a 400 trying to find a meme that doesn't exist", async () => {
        const response = await request(app)
            .get("/memes/foo")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toEqual(400);
    });

    test("retuns a 400 trying to find memes for a user that doesn't exist", async () => {
        const response = await request(app)
            .get("/memes/user/1234556789abc")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toEqual(400);
    });

    test("retuns a 400 trying to find memes rated by a user that doesn't exist", async () => {
        const response = await request(app)
            .get("/memes/rated_by_user/1234556789abc")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toEqual(400);
    });

});

describe("POST, when token is present", () => {

    beforeAll(async () => {
        await User.deleteMany({});
        await Meme.deleteMany({});
        testUser = new User({
            username: "testuser",
            email: "test@test.com",
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
            .field("tags", "tag1, tag2")
            .attach("image", webpBuffer, "test-meme.webp")  // filename as third parameter

        const memes = await Meme.find();
        expect(memes[0].title).toEqual("My created meme");
        expect(memes[0].tags).toEqual(["tag1", "tag2"]);
        expect(response.status).toEqual(201);

        // tidy up after ourselves
        fs.rm(memes[0].img);

    });

    test("returns a 400 error if there is no image", async () => {

        const response = await request(app)
            .post("/memes")
            .set("Authorization", `Bearer ${token}`)
            .field("title", "My created meme")
            .field("tags", "")
            .field("user", testUser._id.toString())

        expect(response.status).toEqual(400);
    });

});

describe("DELETE, when token is present", () => {

    beforeAll(async () => {
        await User.deleteMany({});
        await Meme.deleteMany({});
        testUser = new User({
            username: "testuser",
            email: "test@test.com",
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

    test("returns a 401 error trying to delete another user's meme", async () => {

        const meme = await makeTestMeme();

        naughtyUser = new User({
            username: "naughtyuser",
            email: "naughty@test.com",
            password: "12345678",
        });
        await naughtyUser.save();
        naughtyToken = createToken(naughtyUser.id);

        const response = await request(app)
            .delete("/memes/" + meme.id)
            .set("Authorization", `Bearer ${naughtyToken}`)

        expect(response.status).toEqual(401);
    });

    test("gives a 200 response when deleting a meme", async () => {

        const webpBuffer = Buffer.from([
            0x52, 0x49, 0x46, 0x46, 0x26, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
            0x56, 0x50, 0x38, 0x20, 0x1A, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9D,
            0x01, 0x2A, 0x01, 0x00, 0x01, 0x00, 0x02, 0x00, 0x34, 0x25, 0xA4, 0x00,
            0x03, 0x70, 0x00, 0xFE, 0xFB, 0xFD, 0x50, 0x00
        ]);

        const createResponse = await request(app)
            .post("/memes")
            .set("Authorization", `Bearer ${token}`)
            .field("title", "My created meme")
            .field("user", testUser._id.toString())
            .field("tags", "")
            .attach("image", webpBuffer, "test-meme.webp")  // filename as third parameter

        const memes = await Meme.find();
        const meme = memes[0];

        const response = await request(app)
            .delete("/memes/" + meme.id)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toEqual(200);
    });

    test("deletes the meme from the database", async () => {

        const webpBuffer = Buffer.from([
            0x52, 0x49, 0x46, 0x46, 0x26, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
            0x56, 0x50, 0x38, 0x20, 0x1A, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9D,
            0x01, 0x2A, 0x01, 0x00, 0x01, 0x00, 0x02, 0x00, 0x34, 0x25, 0xA4, 0x00,
            0x03, 0x70, 0x00, 0xFE, 0xFB, 0xFD, 0x50, 0x00
        ]);

        const createResponse = await request(app)
            .post("/memes")
            .set("Authorization", `Bearer ${token}`)
            .field("title", "My created meme")
            .field("user", testUser._id.toString())
            .field("tags", "")
            .attach("image", webpBuffer, "test-meme.webp")  // filename as third parameter

        const memesBeforeDelete = await Meme.find();
        const meme = memesBeforeDelete[0];

        expect(memesBeforeDelete.length).toEqual(1);

        const response = await request(app)
            .delete("/memes/" + meme.id)
            .set("Authorization", `Bearer ${token}`)

        const memesAfterDelete = await Meme.find({});
        expect(memesAfterDelete.length).toEqual(0);

    });

    test("deletes the file when deleting a meme", async () => {

        // we need to make a real test image for this one

        await Meme.deleteMany({});

        const webpBuffer = Buffer.from([
            0x52, 0x49, 0x46, 0x46, 0x26, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
            0x56, 0x50, 0x38, 0x20, 0x1A, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9D,
            0x01, 0x2A, 0x01, 0x00, 0x01, 0x00, 0x02, 0x00, 0x34, 0x25, 0xA4, 0x00,
            0x03, 0x70, 0x00, 0xFE, 0xFB, 0xFD, 0x50, 0x00
        ]);

        const createResponse = await request(app)
            .post("/memes")
            .set("Authorization", `Bearer ${token}`)
            .field("title", "My created meme")
            .field("user", testUser._id.toString())
            .field("tags", "")
            .attach("image", webpBuffer, "test-meme.webp")  // filename as third parameter

        const memes = await Meme.find();
        const meme = memes[0];

        const response = await request(app)
            .delete("/memes/" + meme.id)
            .set("Authorization", `Bearer ${token}`)

        let fsError = false;
        try {
            stats = await fs.stat(meme.img);
        }
        catch (err) {
            if (err.code === "ENOENT") {
                fsError = true; // we should get an error when looking for the file
            }
        }

        expect(fsError).toEqual(true);

    });

    test("retuns a 400 trying to delete a meme that doesn't exist", async () => {

        const response = await request(app)
            .delete("/memes/12345678abc")
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toEqual(400);
    });

});

describe("GET, when token is missing", () => {

    test("retuns a 401 when not logged in", async () => {
        const response = await request(app).get("/memes/");

        expect(response.status).toEqual(401);
    });

});

const makeTestMeme = async ( suffix = "", tags = [ "tag" + suffix ] ) => {

    const meme = new Meme({
        img: "images/my_meme" + suffix + ".jpeg",
        title: "My Fab Meme " + suffix,
        user: testUser.id,
        created_at: testDate,
        tags: tags
    });
    await meme.save();
    return meme;
}