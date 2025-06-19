# {{PROBLEM}} Rate My Memes

## 1. Describe the Problem
_Put or write the user story here. Add any clarifying notes you might have._

## User Stories

As a guest  
So that I can start using the platform  
I want to see clear options to sign up or log in on the homepage  

As a new user  
So that I can create an account  
I want to enter a username, email, and password and receive confirmation when it works  

As a returning user  
So that I can access my account  
I want to enter my login details and be securely authenticated  

As a logged-in user  
So that I can browse meme content  
I want to see memes in a grid or list with image, caption, creator, and rating  

As a meme viewer  
So that I can show appreciation for a meme  
I want to rate it, and ensure I can only rate once per meme

As a user  
So that I can engage more with specific meme content  
I want to click a meme to view it in detail, with full caption, ratings, and comments  

As a user 
So that I can share my humour with others  
I want to upload an image with a caption and have it appear in the main feed  

As a logged-in user  
So that I can see how my memes are doing  
I want to view my posted memes and how many ratings they’ve received  

As a user  
So that I can protect my account when I’m finished  
I want to log out and clear my session securely  

As a user  
So that I can join the conversation on a meme  
I want to type a comment below a post and see it added instantly  

As the author of a comment  
So that I can manage what I said  
I want to be able to edit or delete my own comments  

As an admin - extesion
So that I can manage the platform  
I want to view memes, users, ratings and reported content in a single dashboard  

As an admin - extension
So that I can maintain a safe environment  
I want to review flagged memes or comments and take action if needed  

As an admin - extension
So that I can control user access  
I want to view all registered users and promote, ban, or reinstate them  

As a meme owner  
So that I know when my meme content is appreciated  
I want to receive a notification each time someone rates my meme  

As a meme owner  
So that I’m aware of conversations around my post  
I want to get notified when someone comments on my meme  

As an admin - extension
So that I can act quickly on problematic content  
I want to be alerted when posts are flagged multiple times  

As a user  
So that I can see the most popular content  
I want to browse a trending page with the most rated memes 

As a regular guest 
So that I can discover standout content  
I want to see the top meme featured on the homepage each day  

As a user  
So that I can find the memes I’m interested in  
I want to search by caption, username, or tags and filter by popularity or tag

## 2. Design the Class Interface
_Include the name of the function, its parameters, return value, and side effects._

We are using Mongoose to define a User model.

## js
"""
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  }
});

"""
module.exports = mongoose.model("User", UserSchema);


"""
## Side effects: (state any side effects)
    This function doesn't print anything or have any other side-effects

    pass # Test-driving means _not_ writing any code here yet.
"""

"""
## Public Interface:
=> `new User({ username, email, password })` -> creates a user object  
=> `user.save()` -> saves the user to MongoDB  
=> `User.find()` -> finds all users  
=> Fails if `username` or `password` is missing  
"""

## 3. Tests examples
_Make a list of examples of what the function will take and return._
## js

# 1: Creates a user with username and password
const user = new User({ username: "bree123", password: "password" });
expect(user.username).toEqual("bree123");

# 2: Creates a user with optional email
const user = new User({
  username: "bree123",
  email: "breekal@email.com",
  password: "password"
});
expect(user.email).toEqual("breekal@email.com");

# 3: Returns all users (should be empty initially)
const users = await User.find();
expect(users).toEqual([]);

# 4: Saves a user and returns it
const user = new User({ username: "bree123", password: "password" });
await user.save();
const users = await User.find();
expect(users[0].username).toEqual("bree123");

# 5: Fails to save a user without username
const user = new User({ password: "password" });
await expect(user.save()).rejects.toThrow();


## 4. Implement the Behaviour

# Use the Test-Driven Development (TDD) process:

# Write a test 
   We will define how we expect the class or function to behave.

# Run the test
   It should fail initially because the feature hasn’t been implemented yet.

# Implement the minimum code  
   Write just enough logic to make the test pass.

# Run the test again 
   Confirm the test passes.

# Refactor 
    Clean up code without changing behaviour, improve naming, structure, or performance.

Repeat this cycle for each feature (comment creation, meme upload, rate functionality).
