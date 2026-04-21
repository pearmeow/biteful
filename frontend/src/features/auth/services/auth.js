import { drogonClient } from "../../../api/client";

const auth = {
  login: async (username, password) => {
    const options = {
      method: "POST",
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      // accepts cookies from response
      credentials: "include",
    };
    const data = await drogonClient("auth", options);
    localStorage.setItem("sessionId", data.id);
    localStorage.setItem("userId", data.userId);
    console.log(data);
    console.log("session id " + localStorage.getItem("sessionId"));
    console.log("userId " + localStorage.getItem("userId"));
    return data;
  },

  // clears cookie
  logout: async () => {
    if (localStorage.getItem("sessionId") === null) {
      return;
    }
    const options = {
      method: "DELETE",
      credentials: "include",
    };
    const data = await drogonClient(
      "auth/" + localStorage.getItem("sessionId"),
      options,
    );
    // sets it back to null for later checking
    localStorage.removeItem("sessionId");
    localStorage.removeItem("userId");
    return data;
  },
};

export default auth;
