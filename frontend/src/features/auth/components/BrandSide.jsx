import logoImg from "../../../assets/biteful_logo.png";

const BrandSide = () => (
    <div className="brand-side"> {/* left side (with logo) */}
        <img
            src={logoImg}
            alt="Biteful Logo"
            className="brand-logo"
        />
        <h1>Biteful</h1>
        {/* i cant think of a slogan */}
        <div className="slogan-badge">
            FIND FOOD AND BE HAPPY!
        </div>
        {/* feature boxes */}
        <div className="features-container">
            <div className="feature-box">
            <div className="feature-icon">⚲</div>
            <div className="feature-text">
                <strong>Find Food Spots</strong>
                <p>Discover local food pantries and restaurants</p>
            </div>
            </div>

            <div className="feature-box">
            <div className="feature-icon">𐂐𓇋</div>
            <div className="feature-text">
                <strong>Be Healthy</strong>
                <p>Get warned if a restaurant tends to be unhealthy</p>
            </div>
            </div>

            <div className="feature-box">
            <div className="feature-icon">🕊</div>
            <div className="feature-text">
                <strong>Grow and Learn</strong>
                <p>Your pigeon friend changes alongside your decisions</p>
            </div>
            </div>
        </div>
    </div>
);

export default BrandSide;