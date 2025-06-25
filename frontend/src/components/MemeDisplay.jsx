// import getMeme from "../services/memeSelector";
import  RatingBar  from "./RatingBar";
// import { useState } from "react";
import "../index.css";

const MemeDisplay = (props) => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    return (
        <div className="meme-container">
            <h1>{props.meme.title}</h1> {/* for visibility, pls do whatever you want with it */}
            <div className="image-container">
                <img src={`${backendURL}/${props.meme.img}`} className="responsive-image" alt={props.meme.title} />
            </div>
            <div className="rating-bar-div">
                <RatingBar meme_id={props.meme._id} />
            </div>
        </div>
    );
} 

export default MemeDisplay;