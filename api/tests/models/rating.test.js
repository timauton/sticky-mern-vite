require("../mongodb_helper");
const Rating = require("../../models/rating");
const mongoose = require('mongoose');

describe("Rating model", () => {
    afterEach(async () => {
        await Rating.deleteMany({});
    });

    it("has a meme id", () => {
        const memeId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
        
        const mockRating = new Rating({
            meme: memeId,
            user: userId,
            rating: 3,
        });
    
    expect(mockRating.meme).toEqual(memeId);
    });

    it("has a user id", () => {
        const memeId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
        
        const mockRating = new Rating({
            meme: memeId,
            user: userId,
            rating: 3,
        });
        
        expect(mockRating.user).toEqual(userId);
    });

    it("has a rating", () => {
        const memeId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
        
        const mockRating = new Rating({
            meme: memeId,
            user: userId,
            rating: 3,
        });
        
    expect(mockRating.rating).toEqual(3);
    });

    it("can save a rating to the database", async () => {
        const memeId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
    
        const rating = new Rating({
            meme: memeId,
            user: userId,
            rating: 4,
        });
    
        await rating.save();
        
        const savedRating = await Rating.findOne({ meme: memeId });
        expect(savedRating.user).toEqual(userId);
        expect(savedRating.rating).toEqual(4);
    });

    it("has timestamps when saved", async () => {
        const memeId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
        
        const rating = new Rating({
            meme: memeId,
            user: userId,
            rating: 4,
        });
        
        await rating.save();
        
        expect(rating.createdAt).toBeDefined();
        expect(rating.updatedAt).toBeDefined();
        expect(rating.createdAt).toBeInstanceOf(Date);
        expect(rating.updatedAt).toBeInstanceOf(Date);
    });

    it("rejects rating > 5", async () => {
        
        const memeId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
        
        const invalidRating = new Rating({
            meme: memeId,
            user: userId,
            rating: 6, // Invalid - too high
        });
        
        await expect(invalidRating.save()).rejects.toThrow();
    });

    it("rejects rating < 0", async () => {
        
        const memeId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
        
        const invalidRating = new Rating({
            meme: memeId,
            user: userId,
            rating: 0, // Invalid - too low
        });
        
        await expect(invalidRating.save()).rejects.toThrow();
    });

    it("requires all fields", async () => {
        const rating = new Rating({
        // Missing required id fields
            rating: 3,
        });

        await expect(rating.save()).rejects.toThrow();
    });

    it("prevents duplicate ratings from same user on same meme", async () => {
    const memeId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    
    // Create first rating
    const firstRating = new Rating({
        meme: memeId,
        user: userId,
        rating: 3,
    });
    
    await firstRating.save();
    
    // Try to create second rating with same user and meme
    const duplicateRating = new Rating({
        meme: memeId,
        user: userId,
        rating: 5, // Different rating value, but same user/meme
    });
    
    await expect(duplicateRating.save()).rejects.toThrow(/duplicate key/);
    });

    it("allows same user to rate different memes", async () => {
        const memeId1 = new mongoose.Types.ObjectId();
        const memeId2 = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
        
        const rating1 = new Rating({
            meme: memeId1,  
            user: userId,   
            rating: 3,
        });
        
        // Different meme id
        const rating2 = new Rating({
            meme: memeId2,  
            user: userId,   
            rating: 5,
        });
        
        await rating1.save();
        await rating2.save(); // Should not throw
        
        // Both should be saved
        const savedRatings = await Rating.find({ user: userId }); 
        expect(savedRatings).toHaveLength(2);
    });

    it("allows different users to rate same meme", async () => {
        const memeId = new mongoose.Types.ObjectId();
        const userId1 = new mongoose.Types.ObjectId();
        const userId2 = new mongoose.Types.ObjectId();
        
        const rating1 = new Rating({
            meme: memeId,   
            user: userId1,  
            rating: 3,
        });
        
        // Different user but same meme id
        const rating2 = new Rating({
            meme: memeId,   
            user: userId2,  
            rating: 5,
        });
        
        await rating1.save();
        await rating2.save(); 
        
        // Expect both ratings to have been saved
        const savedRatings = await Rating.find({ meme: memeId }); 
        expect(savedRatings).toHaveLength(2);
    });
});