import { useState, useEffect } from "react"
import Button from "./ButtonComponent"
import { getTags } from "../services/tagService"

export function TagFilter({ value, onTagChange }) {
    const [availableTags, setAvailableTags] = useState([])

    useEffect(() => {
        getTags()
            .then(setAvailableTags)
            .catch(console.error);
    }, [])

    const handleTagClick = (tag) => {
        let newTag;
        if (value.includes(tag)) {
            newTag = value.filter((t) => t !== tag);
        } else {
            newTag = [...value, tag];
        }
        onTagChange(newTag);
    }

    console.log(value) // check data being input
    return (
        <div className="tag-filter">
            <p>Add tags to filter</p>

            {availableTags.map((tag) => {
                const isSelected = value.includes(tag);
                return (
                    <Button
                        key={tag}
                        className="tag-button"
                        buttonText={tag}
                        onClick={() => handleTagClick(tag)}
                        style={{
                            backgroundColor: isSelected ? "#00ff00" : "#eee",
                        }} // styling included to give visual feedback, can be remove to apply css
                    />
                )
            })}
            <br />
            <Button
                className="clear-filter"
                buttonText="Clear filter"
                onClick={() => onTagChange([])}
            />
        </div>
    );
}
