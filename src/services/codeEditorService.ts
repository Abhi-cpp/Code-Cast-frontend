import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

const runCode = async (
  code: string,
  input: string,
  language: string,
  userToken: string,
) => {
  return axios({
    url: process.env.REACT_APP_BACKEND_URL + "code/execute",
    method: "post",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    data: {
      code,
      input,
      language,
    },
  })
    .then((res) => {
      const result = res.data.output ? res.data.output : res.data.error;
      return { status: "success", result };
    })
    .catch((err) => {
      return { status: "error", result: err };
    });
};

export { runCode };
