const Button = ({ children, loading, ...props }) => (
    <button
        className={`btn-primary ${loading ? "btn-loading" : ""}`}
        {...props}
    >
        {loading ? "Please wait..." : children}
    </button>
);

export default Button;

