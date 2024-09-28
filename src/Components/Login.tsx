import React, { useEffect, useState, useContext } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import RoomData from "./RoomData.tsx";
import { DataContext } from "./DataContext.tsx";
import Loader from "./Loader.tsx";
import { ToastContainer, toast } from "react-toastify";
import { loginWithToken } from "../services/authService.ts";

const clientId = process.env.REACT_APP_CLIENT_ID || "";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useContext(DataContext);

  const loadingStart = () => {
    setIsLoading(true);
  };
  const loadingStop = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("user");
    if (token) {
      loadingStart();
      loginWithToken(token).then((response) => {
        loadingStop();
        if (response.status === "success") {
          setUser(response.data);
        } else {
          setUser(null);
          console.log("error in axios jwt call", response.data);
        }
      });
    }
  }, []);

  const onSuccess = (credentialResponse) => {
    loadingStart();
    axios({
      method: "post",
      url: process.env.REACT_APP_BACKEND_URL + "users/login",
      data: credentialResponse,
    })
      .then((response) => {
        setUser(response.data.user);
        loadingStop();
        localStorage.setItem("user", response.data.token);
      })
      .catch((error) => {
        loadingStop();
        console.log("error in axios login call", error);
      });
  };

  const goToLogin = (): void => {
    document.getElementById("login-form")?.classList.add("active");
    document.getElementById("register-form")?.classList.remove("active");
    const errorMessage = document.getElementById("error-message p");
    if (errorMessage) {
      errorMessage.innerHTML = "";
    }
    document.getElementById("error-message")?.classList.remove("active");
  };

  const goToRegister = (): void => {
    document.getElementById("login-form")?.classList.remove("active");
    document.getElementById("register-form")?.classList.add("active");
    const errorMessage = document.getElementById("error-message p");
    if (errorMessage) {
      errorMessage.innerHTML = "";
    }
    document.getElementById("error-message")?.classList.remove("active");
  };

  const registerUser = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const passwordSame =
      (
        document
          .getElementById("register-form")
          ?.querySelector("#password") as HTMLInputElement
      )?.value ===
      (
        document
          .getElementById("register-form")
          ?.querySelector("#passwordConfirm") as HTMLInputElement
      )?.value;
    if (passwordSame) {
      const data = {
        name: (
          document
            .getElementById("register-form")
            ?.querySelector("#name") as HTMLInputElement
        )?.value,
        email: (
          document
            .getElementById("register-form")
            ?.querySelector("#email") as HTMLInputElement
        )?.value,
        password: (
          document
            .getElementById("register-form")
            ?.querySelector("#password") as HTMLInputElement
        )?.value,
      };

      if (data.name === "" || data.email === "" || data.password === "") {
        showError("Please fill all the fields");
        return;
      }
      const url = process.env.REACT_APP_BACKEND_URL + "users/register";
      axios
        .post(url, data)
        .then((response) => {
          setUser(response.data.user);
          localStorage.setItem("user", response.data.token);
        })
        .catch((error) => {
          showError(error.response.data.error);
        });
    } else {
      showError("Passwords do not match");
    }
  };

  const loginUser = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const data = {
      email: (
        document
          .getElementById("login-form")
          ?.querySelector("#email") as HTMLInputElement
      )?.value,
      password: (
        document
          .getElementById("login-form")
          ?.querySelector("#password") as HTMLInputElement
      )?.value,
    };

    if (data.email === "" || data.password === "") {
      showError("Please fill all the fields");
      return;
    }

    axios
      .post(process.env.REACT_APP_BACKEND_URL + "users/login", data)
      .then((response) => {
        setUser(response.data.user);
        localStorage.setItem("user", response.data.token);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          showError("Invalid  Credentials");
        }
      });
  };

  const showError = (message: string): void => {
    toast.error(message);
    const box = document.querySelector(".login-register");
    box?.classList.add("error");
    setTimeout(() => {
      box?.classList.remove("error");
    }, 500);

    const errorMessage = document.querySelector(
      ".login-register #error-message",
    );
    const errorBox = errorMessage?.children[0];
    if (errorBox) errorBox.innerHTML = message;
    errorMessage?.classList.add("active");

    setTimeout(() => {
      errorMessage?.classList.remove("active");
    }, 2500);
  };

  return isLoading === true ? (
    <Loader />
  ) : user == null ? (
    <>
      <div className="login-register">
        <div id="logo-login">
          <img src="./app-logo.png" alt="logo" />
          <img src="./app-logo-light.png" alt="logo-light" />
        </div>
        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              onSuccess(credentialResponse);
            }}
            onError={() => {
              console.log("Login Failed");
            }}
            useOneTap
          />
        </GoogleOAuthProvider>

        <div id="login-form" className="active">
          <h1>Login</h1>
          <form onSubmit={loginUser}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" />
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" />
            <input type="submit" value="Submit" />
          </form>
          <p>
            New User? <a onClick={goToRegister}>Register</a>
          </p>
        </div>
        <div id="register-form">
          <h1>Register</h1>
          <form onSubmit={registerUser}>
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" />
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" />
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" />
            <label htmlFor="password">Confirm Password</label>
            <input type="password" id="passwordConfirm" name="password" />
            <input type="submit" value="Submit" />
          </form>
          <p>
            Already have an account? <a onClick={goToLogin}>Login</a>
          </p>
        </div>
        <div id="error-message" className="error">
          <p></p>
        </div>
      </div>
      <ToastContainer autoClose={2000} />
    </>
  ) : (
    <>
      <RoomData />
      <ToastContainer autoClose={2000} />
    </>
  );
};

export default Login;
