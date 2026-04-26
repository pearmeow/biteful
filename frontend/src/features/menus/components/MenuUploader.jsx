import { useParams, useLocation, Link } from "react-router-dom";
import UploadMenu from "./UploadMenu";
import './menu.css';

const MenuUploader = () => {
  const { camis } = useParams();
  const { state } = useLocation();
  const { name, address, phone } = state || {};

  return (
    <div className="menu-page-container">
      <div className="menu-page-header">
        <span className="menu-page-label">Upload Menu</span>
        <h2 className="menu-page-title">{name || "Upload Menu"}</h2>
        {address && <p className="menu-page-meta">{address}</p>}
        {phone && <p className="menu-page-meta">{phone}</p>}
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to={`/${camis}/menu`} state={state} className="menu-page-link">
            ← Back to Menu
          </Link>
          <Link to="/map/restaurant" className="menu-page-link">
            ← Back to Restaurant Map
          </Link>
        </div>
      </div>
      <div className="menu-upload-section">
        <UploadMenu restaurantId={camis} restaurantState={state} />      </div>
    </div>
  );
};

export default MenuUploader;