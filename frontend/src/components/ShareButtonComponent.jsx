// In ShareButtonComponent.jsx
import { useEffect, useState, useRef } from "react";
import { generateShareableUrl } from "../utils/shareUtils";

const ShareButton = ({ meme }) => {
    const [showCopied, setShowCopied] = useState(false);
    const [isDialogueOpen, setIsDialogueOpen] = useState(false);

    const shareDialogue = useRef();

    const handleShareClick = async (event) => {
        event.stopPropagation(); // Prevent the click from bubbling up
        setIsDialogueOpen(true);
    };
    // useEffect for click outside and keyboard to get rid of open dialogue
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareDialogue.current && !shareDialogue.current.contains(event.target)) {
                setIsDialogueOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isDialogueOpen) {
                setIsDialogueOpen(false);
            }
        };

        if (isDialogueOpen) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDialogueOpen]);

    // useEffect for focus management of dialogue (accessibility)
    useEffect(() => {
        if (isDialogueOpen && shareDialogue.current) {
            shareDialogue.current.focus();
        }
    }, [isDialogueOpen]);

    const handleCopyClick = async() => {
        const shareableUrl = generateShareableUrl(meme);
        
        try {
            await navigator.clipboard.writeText(shareableUrl);
            setShowCopied(true);
            
            // Close dialog AND hide message after 2 seconds
            setTimeout(() => {
                setShowCopied(false);
                setIsDialogueOpen(false); // Close dialog at the same time
            }, 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    // Social sharing
    const handleWhatsAppShare = () => {
        const shareableUrl = generateShareableUrl(meme);
        const text = `Check out this meme: ${shareableUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        setIsDialogueOpen(false);
    };

    const handleFacebookShare = () => {
        const shareableUrl = generateShareableUrl(meme);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`, '_blank');
        setIsDialogueOpen(false);
    };

    const handleTwitterShare = () => {
        const shareableUrl = generateShareableUrl(meme);
        const text = `Check out this hilarious meme! ${shareableUrl}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
        setIsDialogueOpen(false);
    };

    return (
        <div className="share-button-container">
            <button 
                type="button" 
                className="share-fab-button"
                onClick={handleShareClick}
                data-testid="share-button"
                aria-label="Share this meme">
                <svg xmlns="http://www.w3.org/2000/svg" 
                    x="0px" y="0px" 
                    width="64" height="64" 
                    viewBox="0 0 64 64">
                    <path d="M 9 9 L 9 14 L 9 54 L 51 54 L 56 54 L 55 42 L 51 42 L 51 49.095703 L 13 50 L 13.900391 14 L 21 14 L 21 10 L 9 9 z M 44 9 L 44 17.072266 C 29.919275 17.731863 19 23.439669 19 44 L 23 44 C 23 32.732824 29.174448 25.875825 44 25.080078 L 44 33 L 56 20.5 L 44 9 z"></path>
                </svg>
            </button>
            {isDialogueOpen && (
                <div className="share-dialogue-overlay">
                    <div 
                        className="rating-bar-container share-dialogue" 
                        data-testid="share-dialogue"
                        ref={shareDialogue}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="share-dialogue-header">
                            <h3>Share This Meme</h3>
                            <button 
                                className="share-close-button"
                                onClick={() => setIsDialogueOpen(false)}
                                aria-label="Close">
                                <img width="25" height="25" src="https://img.icons8.com/material-sharp/30/close-window.png" alt="close-window"/>
                            </button>
                        </div>
                        
                        <div className="share-dialogue-content">
                            <div className="share-options-grid">
                                <button 
                                    className="share-option-button"
                                    onClick={handleCopyClick}
                                    aria-label="Copy to clipboard">
                                    <img width="30" height="30" src="https://img.icons8.com/glyph-neue/30/copy.png" alt="copy"/>
                                </button>
                                
                                <button 
                                    className="share-option-button whatsapp"
                                    onClick={handleWhatsAppShare}
                                    aria-label="Share on WhatsApp">
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                        x="0px" y="0px" 
                                        width="35" height="35" 
                                        viewBox="0 0 24 24">
                                        <path d="M19.077,4.928C17.191,3.041,14.683,2.001,12.011,2c-5.506,0-9.987,4.479-9.989,9.985 c-0.001,1.76,0.459,3.478,1.333,4.992L2,22l5.233-1.237c1.459,0.796,3.101,1.215,4.773,1.216h0.004 c5.505,0,9.986-4.48,9.989-9.985C22.001,9.325,20.963,6.816,19.077,4.928z M16.898,15.554c-0.208,0.583-1.227,1.145-1.685,1.186 c-0.458,0.042-0.887,0.207-2.995-0.624c-2.537-1-4.139-3.601-4.263-3.767c-0.125-0.167-1.019-1.353-1.019-2.581 S7.581,7.936,7.81,7.687c0.229-0.25,0.499-0.312,0.666-0.312c0.166,0,0.333,0,0.478,0.006c0.178,0.007,0.375,0.016,0.562,0.431 c0.222,0.494,0.707,1.728,0.769,1.853s0.104,0.271,0.021,0.437s-0.125,0.27-0.249,0.416c-0.125,0.146-0.262,0.325-0.374,0.437 c-0.125,0.124-0.255,0.26-0.11,0.509c0.146,0.25,0.646,1.067,1.388,1.728c0.954,0.85,1.757,1.113,2.007,1.239 c0.25,0.125,0.395,0.104,0.541-0.063c0.146-0.166,0.624-0.728,0.79-0.978s0.333-0.208,0.562-0.125s1.456,0.687,1.705,0.812 c0.25,0.125,0.416,0.187,0.478,0.291C17.106,14.471,17.106,14.971,16.898,15.554z"></path>
                                    </svg>
                                </button>
                                
                                <button 
                                    className="share-option-button facebook"
                                    onClick={handleFacebookShare}
                                    aria-label="Share on Facebook">
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                        x="0px" y="0px" 
                                        width="40" height="40" 
                                        viewBox="0 0 24 24"> 
                                        <path d="M21,3H3v18h9.621v-6.961h-2.343v-2.725h2.343V9.309c0-2.324,1.421-3.591,3.495-3.591c0.699-0.002,1.397,0.034,2.092,0.105 v2.43h-1.428c-1.13,0-1.35,0.534-1.35,1.322v1.735h2.7l-0.351,2.725h-2.365V21H21V3z"></path> </svg>
                                </button>
                                
                                <button 
                                    className="share-option-button twitter"
                                    onClick={handleTwitterShare}
                                    aria-label="Share on Twitter">
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                        x="0px" y="0px" 
                                        width="50" height="50" 
                                        viewBox="0 0 64 64">
                                        <path d="M61.932,15.439c-2.099,0.93-4.356,1.55-6.737,1.843c2.421-1.437,4.283-3.729,5.157-6.437	c-2.265,1.328-4.774,2.303-7.444,2.817C50.776,11.402,47.735,10,44.366,10c-6.472,0-11.717,5.2-11.717,11.611	c0,0.907,0.106,1.791,0.306,2.649c-9.736-0.489-18.371-5.117-24.148-12.141c-1.015,1.716-1.586,3.726-1.586,5.847	c0,4.031,2.064,7.579,5.211,9.67c-1.921-0.059-3.729-0.593-5.312-1.45c0,0.035,0,0.087,0,0.136c0,5.633,4.04,10.323,9.395,11.391	c-0.979,0.268-2.013,0.417-3.079,0.417c-0.757,0-1.494-0.086-2.208-0.214c1.491,4.603,5.817,7.968,10.942,8.067	c-4.01,3.109-9.06,4.971-14.552,4.971c-0.949,0-1.876-0.054-2.793-0.165C10.012,54.074,16.173,56,22.786,56	c21.549,0,33.337-17.696,33.337-33.047c0-0.503-0.016-1.004-0.04-1.499C58.384,19.83,60.366,17.78,61.932,15.439"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            {showCopied && <span className="copy-feedback">✅ Copied!</span>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShareButton; 