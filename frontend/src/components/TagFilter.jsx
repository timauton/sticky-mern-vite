import { useState } from "react";

export function TagFilter() {
    const [tags, setTags] = useState("")

    function handleTagsChange(event) {
        setTags(event.target.value)
    }
    return (
        <form className="tagSearch">
            <input id="tagInput" type="text" value={tags} onChange={handleTagsChange} placeholder="filter memes by tags" />
        </form>
    );
}
