import { getTags } from "../../src/services/tagService";
import { vi, test, expect } from "vitest";

describe("getTags", () => {
    const mockTags = ["funny", "sad", "weird"];

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("returns tags on successful fetch", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            status: 200,
            json: async () => ({ tags: mockTags }),
        });

        const result = await getTags();
        expect(result).toEqual(mockTags);
    });

    test("throws an error on non-200 response", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            status: 500,
            json: async () => ({}),
        });

        await expect(getTags()).rejects.toThrow("Failed to fetch tags");
    });

    test("calls the correct URL", async () => {
        const fakeFetch = vi.fn().mockResolvedValue({
            status: 200,
            json: async () => ({ tags: [] }),
        });

        global.fetch = fakeFetch;

        await getTags();
        expect(fakeFetch).toHaveBeenCalledWith(`${import.meta.env.VITE_BACKEND_URL}/memes/tags`);
    });
});