require("../mongodb_helper");
const User = require("../../models/user");

describe("User model", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("has a username", () => {
    const user = new User({
      username: "bree123",
      password: "password",
    });
    expect(user.username).toEqual("bree123");
  });

  it("has a password", () => {
    const user = new User({
      username: "bree123",
      password: "password",
    });
    expect(user.password).toEqual("password");
  });

  it("can optionally have an email", () => {
    const user = new User({
      username: "bree123",
      email: "breekal@email.com",
      password: "password",
    });
    expect(user.email).toEqual("breekal@email.com");
  });

  it("can list all users", async () => {
    const users = await User.find();
    expect(users).toEqual([]);
  });

  it("can save a user with all required fields", async () => {
    const user = new User({
      username: "bree123",
      password: "password",
    });

    await user.save();
    const users = await User.find();

    expect(users[0].username).toEqual("bree123");
    expect(users[0].password).toEqual("password");
  });

  it("does not save a user without a username", async () => {
    const user = new User({
      password: "password",
    });

    let e;
    try {
      await user.save();
    } catch (error) {
      e = error;
    }

    expect(e.errors.username).toBeDefined();
  });

  it("does not save a user without a password", async () => {
    const user = new User({
      username: "bree123",
    });

    let e;
    try {
      await user.save();
    } catch (error) {
      e = error;
    }

    expect(e.errors.password).toBeDefined();
  });
});
