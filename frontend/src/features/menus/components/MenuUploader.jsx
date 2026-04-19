import { useParams, Link } from 'react-router-dom';

const MenuUploader = () => {
    const { camis } = useParams();

    return (
        <div className="menu-page-container">
            <div className="menu-header">
                <h2>Upload Menu</h2>
                <p className="menu-subtext">Restaurant ID: {camis}</p>
                <Link to={`/menu/${camis}`} className="menu-back-link">
                    ← Back to Menu
                </Link>
            </div>
            <div className="menu-upload-area">
                <p>Upload functionality coming soon.</p>
            </div>
        </div>
    );
};

export default MenuUploader;
