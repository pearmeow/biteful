import { useParams, Link } from 'react-router-dom';

const MenuViewer = () => {
    const { camis } = useParams();

    return (
        <div className="menu-page-container">
            <div className="menu-header">
                <h2>Restaurant Menu</h2>
                <p className="menu-subtext">Restaurant ID: {camis}</p>
                <Link to={`/menu/${camis}/upload`} className="menu-upload-link">
                    Upload Menu
                </Link>
            </div>
            <div className="menu-content">
                <p>No menu available yet.</p>
            </div>
        </div>
    );
};

export default MenuViewer;
