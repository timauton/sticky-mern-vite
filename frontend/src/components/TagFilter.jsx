// import { useState } from "react";

export function TagFilter({ value, onTagChange }) {

    console.log(value) // check data being input
    return (
        <form className="tagSearch">
            <input
            id="tagInput"
            type="text"
            value={value}
            onChange={(e) => onTagChange(e.target.value)}
            placeholder="filter memes by tags" />
        </form>
    );
}
