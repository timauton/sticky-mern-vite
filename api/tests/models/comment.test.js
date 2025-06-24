require("../mongodb_helper");
const CommentsController = require ("../../models/commentModel");
const Meme = require ("../../models/meme");
const User = require ("../../models/user");

describe("Comment model", () => {
    let user, meme;
    beforeEach(async() => {
        await CommentsController.deleteMany({});
        await Meme.deleteMany({});
        await User.deleteMany({});

        user = await User.create({
            username: "testuser",
            email: "testuser@testemail.com",
            password: "testpassword"
        })

        meme = await Meme.create({
            img: "api/seeds/seedImages/cat_manager.webp",
            title: "test funny cat title",
            user: user._id,
        })
    });

    it("has a comment", () => {
        const comment = new CommentsController({
            comment: "This is a test comment for funny cats!",
            meme_id: meme._id,
            user_id: user._id
        })
        expect(comment.comment).toEqual("This is a test comment for funny cats!");
    });
    it("it is a valid comment", async () => {
        const comment = new CommentsController({
            comment: "This is a VALID test comment for funny cats!",
            meme_id: meme._id,
            user_id: user._id
        })
        await comment.save();

        const comments = await CommentsController.find();

        expect(comments[0].comment).toBe("This is a VALID test comment for funny cats!");
    });
})

