import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi} from "vitest";
import { TagFilter } from "../../src/components/TagFilter";
import * as tagService from "../../src/services/tagService";

describe("TagFilter", () => {
    const mockTags = ["one", "two", "three"];
    beforeEach(() => {
        vi.resetAllMocks();
    })

    test("Renders the static text", () =>{
        render(<TagFilter value={[]} onChange={vi.fn()}/>);
        expect(document.body.innerHTML).toContain('Add tags to filter');
    });

    test("fetches and renders tags", async () => {
        vi.spyOn(tagService, "getTags").mockResolvedValue(mockTags);

        render(<TagFilter value={[]} onTagChange={vi.fn()} />)

        for (const tag of mockTags) {
            const el = await screen.findByText(tag)
            expect(el).not.toBeNull()
        }
    })

    test("adds tag to list on button click", async () => {
        vi.spyOn(tagService, "getTags").mockResolvedValue(["one"])

        const onTagChange = vi.fn()
        render(<TagFilter value={[]} onTagChange={onTagChange} />)

        const tagButton = await screen.findByText("one")
        fireEvent.click(tagButton)

        expect(onTagChange).toHaveBeenCalled(["one"])
    })


    test("pressing a button again removes the tag", async () => {
        vi.spyOn(tagService, "getTags").mockResolvedValue(["one", "two"])

        const onTagChange = vi.fn()
        render(<TagFilter value={["one"]} onTagChange={onTagChange} />)

        const clearButton = await screen.findByText("Clear filter")

        fireEvent.click(clearButton)
        expect(onTagChange).toHaveBeenCalled([])
    })
})