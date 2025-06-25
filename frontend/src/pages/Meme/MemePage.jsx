import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import getMeme from "../../services/memeSelector"
import ShareButton from "../../components/ShareButtonComponent";
import RatingBar from "../../components/RatingBar"
import Button from "../../components/ButtonComponent";
import { Login } from "../../components/Login";
import { Signup } from "../../components/Signup";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MemePage = () => {
    const params = useParams();
    const navigate = useNavigate();
    const memeId = params.meme_id;
    
    // Existing state
    const [meme, setMeme] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Navigation state for unauthenticated users
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);

    // Existing fetch logic
    useEffect(() => {
        const fetchMeme = async () => {
            const token = localStorage.getItem("token");
            setIsAuthenticated(!!token);
            try {
                const data = await getMeme(null, token, memeId);
                setMeme(data.meme);
            } catch (error) {
                console.error("Error fetching meme:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMeme();
    }, [memeId]);

    // Navigation handlers - simplified
    const handleLoginClick = () => {
        setShowLogin((prev) => !prev);
        setShowSignup(false);
    };

    const handleSignupClick = () => {
        setShowSignup((prev) => !prev);
        setShowLogin(false);
    };

    const handleSignupSuccess = () => {
        setShowSignup(false);
        // Removed auto-open login - let user decide
    };

    const handleLoginSuccess = () => {
        setShowLogin(false);
    
        // Force re-check of localStorage
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
        
        console.log("Login success - staying on meme page!"); // Debug log
    };

    // Loading and error states
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!meme) {
        return <div>Meme not found</div>;
    }

    return (
    <>
        <div className="background-image"></div>
        <div className="background-area">
            <div className="view">
                {/* Navigation based on auth status */}
                {isAuthenticated ? (
                    // Logged in navigation
                    <div className="top-banner">
                        <Button
                            className="homepage-nav-button"
                            buttonText="More Memes"
                            onClick={() => navigate("/")}
                        />
                    </div>
                ) : (
                    // Logged out navigation (same as HomePage)
                    <div className="signup-and-login">
                        <Button 
                            className="signup-button" 
                            buttonText={"Sign Up"} 
                            onClick={handleSignupClick}
                        />
                        {showSignup && (
                            <div className="signup-container">
                                <Signup onSignupSuccess={handleSignupSuccess}/>
                            </div>
                        )}
                        {showLogin && (
                            <div className="login-container">
                                <Login onLoginSuccess={handleLoginSuccess}/>
                            </div>
                        )}
                        <Button 
                            className="login-button" 
                            buttonText={"Login"} 
                            onClick={handleLoginClick}
                        />
                    </div>
                )}

                <div className="title">Sticky Memes</div>
                
                {/* Meme content */}
                <div className="image-container">
                    <img src={`${BACKEND_URL}/${meme.img}`} className="responsive-image" alt={meme.title} />
                </div>
                
                {/* Conditional content based on auth - tags moved here */}
                {isAuthenticated ? (
                    <>
                        {/* Tags only for authenticated users */}
                        <div className="meme-page-tags">
                            <p className="meme-page-tags-title">Tagged:
                                {Array.isArray(meme.tags) && meme.tags.map((tag, index) => {
                                    return <span className="meme-page-tag" key={index}>{tag} </span>
                                })}
                            </p>
                        </div>
                        
                        <div className="rating-bar-div">
                            <RatingBar meme_id={meme._id} />
                        </div>
                        <ShareButton meme={meme} />
                    </>
                ) : (
                    <div className="rating-bar-div">
                        <div className="rating-bar-container login-prompt-bar">
                            <div className="login-prompt-content">
                                <p>
                                    <button 
                                        className="link-button" 
                                        onClick={handleLoginClick}
                                        data-testid="login-prompt">
                                        Log in
                                    </button>
                                    {" or "}
                                    <button 
                                        className="link-button" 
                                        onClick={handleSignupClick}
                                        data-testid="signup-prompt">
                                        sign up
                                    </button>
                                    {" to rate and share memes!"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </>
    );
};

export default MemePage;