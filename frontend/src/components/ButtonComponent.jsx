const Button = ({
    className,
    onClick,
    buttonText,
    disabled,
    type="button",
    ariaLabel
}) => {
return (
    <button
        className={className}
        onClick={onClick}
        disabled={disabled}
        type={type}
        aria-label={ariaLabel}
    >
        {buttonText}
    </button>
    );
};

export default Button;