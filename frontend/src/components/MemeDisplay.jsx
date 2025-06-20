// import getMeme from "../services/memeSelector";
import { RatingBar } from "./RatingBar";
// import { useState } from "react";

const MemeDisplay = (props) => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    return (
        <div className="meme-container">
            <div className="image-container">Title: {props.meme.title}
                <img src={`${backendURL}/${props.meme.img}`} className="responsive-image" alt={props.meme.title} />
            </div>
            <div className="rating-bar-div">
                <RatingBar />
            </div>
        </div>
    );
} 

export default MemeDisplay;