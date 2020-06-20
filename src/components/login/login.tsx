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

    const registerUser = () => {
        const fetchData = async () => {
            const email = (document.getElementById("register-email-input") as HTMLInputElement).value
            const username = (document.getElementById("register-username-input") as HTMLInputElement).value
            const password = (document.getElementById("register-password-input") as HTMLInputElement).value

            const fetchedUsername = await postData({
                baseUrl: usersConfig.url,
                path: 'register-user',
                data: {
                    "email": email,
                    "username": username,
                    "password": password,
                },
                additionalHeaders: { }
            });

            if (username == fetchedUsername) {
                displayLogin(false);
            }
        }

        fetchData();
    }

    return (
        <div>
            <div className='login-cover' onClick={ () => { displayLogin(false) } }></div>
            <div className='login-modal'>
                <div className='login-text'>Log In</div>
                <div>
                    <label>Username</label>
                    <input id="username-input" type="text" placeholder="Username"/>
                    <label>Password</label>
                    <input id="password-input" type="text" placeholder="Password"/>
                    <button className="login-submit-button" onClick={ () => { login() } }>Log In</button>
                </div>
                <div className="register-text">Register</div>
                <div>
                    <label>Email</label>
                    <input id="register-email-input" type="text" placeholder="Email"/>
                    <label>Username</label>
                    <input id="register-username-input" type="text" placeholder="Username"/>
                    <label>Password</label>
                    <input id="register-password-input" type="text" placeholder="Password"/>
                    <button className="login-submit-button" onClick={ () => { registerUser() } }>Register</button>
                </div>
            </div>
        </div>
    );
}