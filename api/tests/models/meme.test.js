require("../mongodb_helper");

const User = require("../../models/user");
const Meme = require("../../models/meme");

const testDate = new Date("2025-01-01T01:01:01Z");
let testUser;

describe("Meme model", () => {
    beforeEach(async () => {
        await Meme.deleteMany({});
        testUser = new User({ email: "a@example.com", password: "password1" });
        await testUser.save();
    });

    it("has an image path", () => {
        const meme = new Meme({
            img: "images/my_meme.jpeg",
            title: "My Fab Meme",
            user: testUser.id,
            created_at: testDate
        });
        expect(meme.img).toEqual("images/my_meme.jpeg");
    });

    it("has a title", () => {
        const meme = new Meme({
            img: "images/my_meme.jpeg",
            title: "My Fab Meme",
            user: testUser.id,
            created_at: testDate
        });
        expect(meme.title).toEqual("My Fab Meme");
    });

    it("has a user", async () => {
        const meme = new Meme({
            img: "images/my_meme.jpeg",
            title: "My Fab Meme",
            user: testUser.id,
            created_at: testDate
        });
        await meme.save();
        expect(meme.user).toEqual(testUser._id);
    });

    it("has a created date", () => {
        const meme = new Meme({
            img: "images/my_meme.jpeg",
            title: "My Fab Meme",
            user: testUser.id,
            created_at: testDate
        });
        expect(meme.created_at).toEqual(testDate);
    });

    it("gives as empty list when there are no memes", async () => {
        const memes = await Meme.find();
        expect(memes).toEqual([]);
    });

    it("can save a meme", async () => {
        const meme = new Meme({
            img: "images/my_meme.jpeg",
            title: "My Fab Meme",
            user: testUser.id,
            created_at: testDate
        });

        await meme.save();
        const memes = await Meme.find();
        expect(memes[0].title).toEqual("My Fab Meme");
    });

    it("returns two memes after we add two memes", async () => {

        const meme1 = new Meme({
            img: "images/my_meme1.jpeg",
            title: "My First Fab Meme",
            user: testUser.id,
            created_at: testDate
        });
        await meme1.save();

        const meme2 = new Meme({
            img: "images/my_meme2.jpeg",
            title: "My Second Fab Meme",
            user: testUser.id,
            created_at: testDate
        });
        await meme2.save();

        const memes = await Meme.find();
        expect(memes.length).toEqual(2);
    });


});