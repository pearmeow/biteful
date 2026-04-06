

const AUTH_CONTENT = {
    "/login": {
        header: "WELCOME BACK!",
        sub: "Ready to continue your journey?"
    },
    "/signup": {
        header: "JOIN BITEFUL!",
        sub: "Start your adventure with us today!"
    }
};

const AuthFormSide = ({ pathname, children }) => {
    const content = AUTH_CONTENT[pathname] || AUTH_CONTENT["/login"];

    return (
        <div className="form-side">
            <div className="auth-card">
                <div className="form-header-section">
                    <h2 className="auth-header">{content.header}</h2>
                    <p className="auth-subtitle">{content.sub}</p>
                </div>
                {children}
            </div>
        </div>
    );
};

export default AuthFormSide;