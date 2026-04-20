import { useParams, useLocation, Link } from 'react-router-dom';

const MenuViewer = () => {
    const { camis } = useParams();
    const { state } = useLocation();
    const { name, address, phone } = state || {};

    return (
        <div>
            <div>
                <h2>{name || 'Restaurant Menu'}</h2>
                {address && <p>{address}</p>}
                {phone && <p>{phone}</p>}
                <Link to={`/${camis}/menu/upload`} state={state}>
                    Upload Menu
                </Link>
            </div>
            <div>
                <p>No menu available yet</p>
            </div>
        </div>
    );
};

export default MenuViewer;
