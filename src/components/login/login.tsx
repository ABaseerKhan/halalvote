import React from 'react';
import { postData } from '../../https-client/post-data';
import { usersConfig } from '../../https-client/config';

// type imports

// styles
import './login.css';

interface LoginComponentProps {
    displayLogin: any;
    setUserDetails: any;
};
export const LoginComponent = (props: LoginComponentProps) => {
    const { displayLogin, setUserDetails } = props;

    const login = () => {
        const fetchData = async () => {
            const username = (document.getElementById("username-input") as HTMLInputElement).value
            const password = (document.getElementById("password-input") as HTMLInputElement).value

            const sessiontoken = await postData({
                baseUrl: usersConfig.url,
                path: 'login',
                data: {
                    "username": username,
                    "password": password,
                },
                additionalHeaders: { }
            });

            setUserDetails(username, sessiontoken);
        }

        fetchData();
    }

    return (
        <div>
            <div className='login-cover' onClick={ () => { displayLogin(false) } }></div>
            <div className='login-modal'>
                <div className='login-text'>Log In</div>
                <div className="input-text-container">
                    <input id="username-input" type="text" placeholder="Username"/>
                    <input id="password-input" type="text" placeholder="Password"/>
                    <button onClick={ () => { login() } }>Log In</button>
                </div>
            </div>
        </div>
    );
}