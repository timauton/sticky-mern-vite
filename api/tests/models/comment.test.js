// require("../mongodb_helper");
// const Comment = require ("../../models/comment");
// const Meme = require ("../../models/meme");
// const User = require ("../../models/user");

// describe("Comment model", () => {
//     let meme;
//     let user;

//     beforeEach(async() => {
//         await Comment.deleteMany({});
//         await Meme.deleteMany({});
//         await User.deleteMany({});

//         user = await User.create({
//             username: "testuser",
//             email: "testuser@testemail.com",
//             password: "testpassword"
//         })

//         meme = await Meme.create({
//             img: "api/seeds/seedImages/cat_manager.webp",
//             title: "test funny cat title",
//             user: user._id,
//         })
//     });

//     it("has a comment", () => {
//         const newComment = new Comment({
//             comment: "This is a test comment for funny cats!",
//             meme_id: meme._id,
//             user_id: user._id
//         })
//         expect(newComment.comment).toEqual("This is a test comment for funny cats!");
//     });
//     it("it is a valid comment", async () => {
//         const validComment = new Comment({
//             comment: "This is a VALID test comment for funny cats!",
//             meme_id: meme._id,
//             user_id: user._id
//         })
//         await validComment.save();

//         const savedComment = await Comment.find();

//         expect(savedComment[0].comment).toBe("This is a VALID test comment for funny cats!");
//     });
// })

