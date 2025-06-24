const Button = ({
    className, // for css
    onClick,
    buttonText,
    buttonImage, // file path
    imageTitle, // to serve as alt text
    ariaHidden, // set to true if image is purely decorative
    disabled,
    type="button", // by default, but can be overridden
    ariaLabel,
    style 
}) => {
return (
    <button
        className={className}
        onClick={onClick}
        disabled={disabled}
        type={type}
        aria-label={ariaLabel}
        style={style} 
    >
        {buttonImage && 
        <img
            src={buttonImage}
            alt={imageTitle || ""}
            aria-hidden={ariaHidden}
        />} 
        {buttonText}
    </button>
    ); // buttonImage conditionally renders
};

export default Button;