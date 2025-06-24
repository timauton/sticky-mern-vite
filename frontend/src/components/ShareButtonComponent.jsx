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

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (shareDialogue.current && !shareDialogue.current.contains(event.target)) {
                    setIsDialogueOpen(false);
                }
            };

            if (isDialogueOpen) {
                document.addEventListener('click', handleClickOutside);
            }

            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }, [isDialogueOpen]);

        const handleCopyClick = async() => {
            const shareableUrl = generateShareableUrl(meme);
            
            try {
                await navigator.clipboard.writeText(shareableUrl);
                setShowCopied(true);
                // Hide message after 2 seconds
                setTimeout(() => setShowCopied(false), 2000);
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
            }
        }

        return (
            <div>
                <button type="button" name="share" onClick={handleShareClick}>
                    Share
                </button>
                {isDialogueOpen && (
                    <div className="share-dialogue" data-testid="share-dialogue" ref={shareDialogue}>
                        <div className="clipboard">
                            <button type="button" name="copy" onClick={handleCopyClick}>Copy to clipboard</button>
                            {showCopied && <span className="copy-feedback">✅Copied!</span>}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default ShareButton; 