import axios from "axios";

const loginWithToken = async (token: string) => {
  return axios({
    method: "get",
    url: process.env.REACT_APP_BACKEND_URL + "users/fetch",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      localStorage.setItem("user", response.data.token);
      return { status: "success", data: response.data.user };
    })
    .catch((error) => {
      console.log("error in axios jwt call", error);
      return { status: "error", data: error };
    });
};

const login = (data: { email: string; password: string }) => {};

export { loginWithToken };
