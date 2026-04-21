const NewMenu = ({ restaurantId, menuData }) => {
    const items = [];
    for (const item of menuData["menu_items"]) {
        items.push(
            <p key={item["dish_name"]}>
                {item["dish_name"]}: {item["dish_price"]}
            </p>,
        );
    }
    return (
        <>
            <p>This is restaurant {restaurantId}</p>
            {menuData ? <p>There is data</p> : <p>There is no data...</p>}
            {items}
            <p>This is a work in progress</p>
        </>
    );
};

export default NewMenu;
