const mongoose = require("mongoose");
const { connectDB } = require("../db/db");

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close(true);
});
