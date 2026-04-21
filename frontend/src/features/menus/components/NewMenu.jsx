const NewMenu = ({ restaurantId, menuData }) => {
    return (
        <>
            <p>This is restaurant {restaurantId}</p>
            {menuData ? <p>There is data</p> : <p>There is no data...</p>}
            <p>This is a work in progress</p>
        </>
    );
};

export default NewMenu;
