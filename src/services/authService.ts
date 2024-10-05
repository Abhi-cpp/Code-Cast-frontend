import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

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

const loginUser = async (data: { email: string; password: string }) => {
  return axios
    .post(process.env.REACT_APP_BACKEND_URL + "users/login", data)
    .then((response) => {
      return {
        status: "success",
        data: response.data.user,
        token: response.data.token,
      };
    })
    .catch((error) => {
      return {
        status: "error",
        data: error,
        token: null,
      };
    });
};

const googleLogin = async (data: any) => {
  return axios({
    method: "post",
    url: process.env.REACT_APP_BACKEND_URL + "users/login",
    data: data,
  })
    .then((response) => {
      return {
        status: "success",
        data: response.data.user,
        token: response.data.token,
      };
    })
    .catch((error) => {
      return {
        status: "error",
        data: error,
        token: null,
      };
    });
};

const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  return axios
    .post(process.env.REACT_APP_BACKEND_URL + "users/register", data)
    .then((response) => {
      return {
        status: "success",
        data: response.data.user,
        token: response.data.token,
      };
    })
    .catch((error) => {
      return {
        status: "error",
        data: error,
        token: null,
      };
    });
};

export { loginWithToken, loginUser, googleLogin, registerUser };
