import { drogonClient } from "../../../api/client";

const NewMenu = ({ restaurantId, items, setItems }) => {
  let itemNum = 0;
  let displayedContent = [];
  for (const item of items) {
    let currInd = itemNum;
    let onChange = (event) => {
      let name = event.target.name;
      let newItems = items.map((value, index) => {
        if (index === currInd) {
          value[name] = event.target.value;
        }
        return value;
      });
      setItems(newItems);
    };
    displayedContent.push(
      // make each of these an input with default inputs as the text
      // put that stuff in fooditem
      <div key={itemNum}>
        <label>
          Menu Section
          <input
            name={"menu_section"}
            defaultValue={item["menu_section"]}
            onChange={onChange}
          />
        </label>
        <label>
          Dish Name
          <input
            name={"dish_name"}
            defaultValue={item["dish_name"]}
            onChange={onChange}
          />
        </label>
        <label>
          Dish Description
          <input
            name={"dish_description"}
            defaultValue={item["dish_description"]}
            onChange={onChange}
          />
        </label>
        <label>
          Price
          <input
            name={"dish_price"}
            defaultValue={item["dish_price"]}
            onChange={onChange}
          />
        </label>
      </div>,
    );
    ++itemNum;
  }
  const onSubmit = async (e) => {
    e.preventDefault();
    // make a new menu
    const menuResp = await drogonClient("menu", {
      method: "POST",
      body: JSON.stringify({
        restaurantId: restaurantId,
      }),
      credentials: "include",
    });
    console.log("menu resp");
    console.log(menuResp);

    // submit new items with the new menu
    for (const item of items) {
      const foodItemResp = await drogonClient("foodItems", {
        method: "POST",
        body: JSON.stringify({ ...item, menu_id: menuResp.id }),
      });
      console.log("food resp");
      console.log(foodItemResp);
    }
  };
  return (
    <>
      <p>This is restaurant {restaurantId}</p>
      {items ? <p>There is data</p> : <p>There is no data...</p>}
      <form onSubmit={onSubmit}>
        {displayedContent}
        <button type="submit">Finalize Menu</button>
      </form>
      <p>This is a work in progress</p>
    </>
  );
};

export default NewMenu;
