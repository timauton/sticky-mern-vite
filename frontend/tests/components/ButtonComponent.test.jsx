import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi} from "vitest";
import Button from "../../src/components/ButtonComponent";

describe("ButtonComponent", () => {
    test("Renders with correct buttonText", () => {
        render(<Button className="testButton" buttonText="Click me, I dare you"/>);

        const button = screen.getByRole("button", {name: "Click me, I dare you"});

        expect(button).toBeDefined();
        expect(button.textContent).toBe("Click me, I dare you");
        expect(button.className).toBe("testButton");
    });

    test("Renders an image prop", () => {
        render(<Button
            buttonText="Clickity pic"
            buttonImage="https://ichef.bbci.co.uk/news/480/cpsprodpb/b44e/live/6d3965d0-460e-11f0-8402-c958f7234d20.jpg.webp"
            imageTitle="Dinosaur"
            />);
        

        const img = screen.getByAltText("Dinosaur");

        expect(img).toBeDefined();
        expect(img.getAttribute("src")).toBe("https://ichef.bbci.co.uk/news/480/cpsprodpb/b44e/live/6d3965d0-460e-11f0-8402-c958f7234d20.jpg.webp");
        expect(img.getAttribute("aria-hidden")).toBe(null);
    });

    test("Handles an onClick", () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick} buttonText="Click me, I dare you" />);

        const button = screen.getByRole("button", {name: "Click me, I dare you"});
        fireEvent.click(button);

        expect(handleClick).toHaveBeenCalled();
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("Disabled button doesn't register clicks", () => {
        const handleClick = vi.fn();
        render(<Button
            onClick={handleClick}
            buttonText="Don't even think about it"
            disabled={true}
            />);

        const button = screen.getByRole("button", {name: "Don't even think about it"});
        fireEvent.click(button);

        expect(button).not.toBe(null);
        expect(button.disabled).toBe(true);
        expect(handleClick).not.toHaveBeenCalled();
    });

    test("Button type renders as button by default", () => {
        render(<Button buttonText="This is a button" />);

        const button = screen.getByRole("button", {name: "This is a button"});

        expect(button.type).toBe("button");
    })

    test("Button type able to be set differently", () => {
        render(<Button buttonText="This is a SUBMIT button" type="submit" />);

        const button = screen.getByRole("button", {name: "This is a SUBMIT button"});

        expect(button.type).toBe("submit");
    })

    test("ariaLabel renders correctly", () => {
        render(<Button buttonText="button text" ariaLabel="button text" />);

        const button = screen.getByRole("button", {name: "button text"});

        expect(button.getAttribute("aria-label")).toBe("button text");
    })

    test("All props can be passed correctly at once", () => {
        const handleClick = vi.fn();
        render(<Button
        className="navButton"
        onClick={handleClick}
        buttonText="full test"
        ariaLabel="full test label"
        />);

        const button = screen.getByRole("button", {name: "full test label"});
        fireEvent.click(button);

        expect(button.className).toBe("navButton");
        expect(button.textContent).toBe("full test");
        expect(handleClick).toHaveBeenCalledTimes(1);
        expect(button.type).toBe("button");
        expect(button.disabled).toBe(false);
        expect(button.getAttribute("aria-label")).toBe("full test label");
    });
});