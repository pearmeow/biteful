import { useParams, useLocation, Link } from 'react-router-dom';

const MenuUploader = () => {
    const { camis } = useParams();
    const { state } = useLocation();
    const { name, address, phone } = state || {};

    return (
        <div>
            <div>
                <h2>{name || 'Upload Menu'}</h2>
                {address && <p>{address}</p>}
                {phone && <p>{phone}</p>}
                <Link to={`/${camis}/menu`} state={state}>
                    Back to Menu
                </Link>
            </div>
            <div>
                <p>Upload functionality coming soon</p>
            </div>
        </div>
    );
};

export default MenuUploader;
