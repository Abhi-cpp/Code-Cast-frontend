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
                <GoogleOAuthProvider clientId={clientId}>
                    <GoogleLogin
                        onSuccess={credentialResponse => {
                            onSuccess(credentialResponse);
                        }}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                        useOneTap
                    />
                </GoogleOAuthProvider>
            ) : (
                <RoomData />


            ))
    );

}

export default Login;