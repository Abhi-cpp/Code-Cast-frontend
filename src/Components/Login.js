import { useEffect, useState, useContext } from "react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import RoomData from './RoomData';
import { DataContext } from "./DataContext";
import ClockLoader from "react-spinners/ClockLoader";


const clientId = process.env.REACT_APP_CLIENT_ID;
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

const override = {
    display: 'block',
    margin: '0 auto',
    borderColor: 'red',
};

function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const { user, setUser } = useContext(DataContext);

    function loadingStart() {
        setIsLoading(true);
    }
    function loadingStop() {
        setIsLoading(false);
    }

    useEffect(() => {

        const token = localStorage.getItem('user');
        if (token) {
            loadingStart();
            axios({
                method: 'get',
                url: process.env.REACT_APP_USERS_JWT,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then((response) => {
                loadingStop();
                localStorage.setItem('user', response.data.token);
                setUser(response.data.user);
            }).catch((error) => {
                loadingStop();
                setUser(null);
                console.log("error in axios jwt call", error);
            });
        } else {
            const boxes = document.querySelectorAll("#login-form form label");
            boxes.forEach((box) => {
                console.log(box.textContent);
                box.innerHTML = box.textContent
                    .split("")
                    .map((letter, index) => `<span style="transition-delay : ${index * 0.1}s">${letter}</span>`)
                    .join("");
                console.log(box.textContent, box.innerHTML);
            });

            const inputs = document.querySelectorAll("#login-form form input:not([type='submit])");
            inputs.forEach(input => {
                input.addEventListener("focus", () => {
                    input.previousElementSibling.classList.add("active");
                });

                input.addEventListener("blur", () => {
                    if (input.value === "") {
                        input.previousElementSibling.classList.remove("active");
                    }
                });
            })

            // const text = box.textContent;
            // box.innerHTML = text
            //   .split("")
            //   .map((letter) => `<span>letter</span>`)
            //   .join("");

            // const letters = document.querySelectorAll(".welcome span");
            // const spaces = [...letters].filter((letter) => letter.innerHTML === " ");
            // spaces.forEach((space) => {
            //   space.innerHTML = "&nbsp";
            // });
        }

    }, []);



    const onSuccess = (credentialResponse) => {
        console.log(credentialResponse)
        loadingStart();
        axios({
            method: 'post',
            url: process.env.REACT_APP_USERS_LOGIN,
            data: credentialResponse

        }).then((response) => {
            setUser(response.data.user);
            loadingStop();
            localStorage.setItem('user', response.data.token);
        }).catch((error) => {
            loadingStop();
            console.log("error in axios login call", error);
        });
    }
    return (
        isLoading === true ? (<ClockLoader color="#36D7B7"
            size={150}
            cssOverride={override}
        />) : (
            user == null ? (
                <div id="login-form">
                    <h1>Code Cast</h1>
                    <form>
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" />
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" />
                        <input type="submit" value="Submit" />
                    </form>
                    <GoogleOAuthProvider clientId={clientId}>
                        <GoogleLogin id="googlelogin"
                            onSuccess={credentialResponse => {
                                onSuccess(credentialResponse);
                            }}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                            useOneTap
                        />
                    </GoogleOAuthProvider>
                </div>

            ) : (
                <RoomData />
            ))
    );

}

export default Login;