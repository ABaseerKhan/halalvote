import React from 'react';
import { postData } from '../../https-client/post-data';
import { usersConfig } from '../../https-client/config';

// type imports
import { ModalType } from '../../types';

// styles
import './login.css';

interface LoginComponentProps {
    displayModal: any;
    setUserDetails: any;
};
export const LoginComponent = (props: LoginComponentProps) => {
    const { displayModal, setUserDetails } = props;

    const login = () => {
        const fetchData = async () => {
            const username = (document.getElementById("username-input") as HTMLInputElement).value
            const password = (document.getElementById("password-input") as HTMLInputElement).value

            const { data } = await postData({
                baseUrl: usersConfig.url,
                path: 'login',
                data: {
                    "username": username,
                    "password": password,
                },
                additionalHeaders: { }
            });
            const sessionToken = data;
            
            setUserDetails(username, sessionToken);
        }

        fetchData();
    }

    const registerUser = () => {
        const fetchData = async () => {
            const email = (document.getElementById("register-email-input") as HTMLInputElement).value
            const username = (document.getElementById("register-username-input") as HTMLInputElement).value
            const password = (document.getElementById("register-password-input") as HTMLInputElement).value

            const { data } = await postData({
                baseUrl: usersConfig.url,
                path: 'register-user',
                data: {
                    "email": email,
                    "username": username,
                    "password": password,
                },
                additionalHeaders: { }
            });

            if (username == data) {
                displayModal(ModalType.NONE);
            }
        }

        fetchData();
    }

    return (
        <table className="login-body">
            <tbody>
                <tr>
                    <div className="login-section-text">Log In</div>
                </tr>
                <tr>
                    <div className="login-label-text">Username</div>
                </tr>
                <tr>
                    <input id="username-input" type="text" placeholder="Username"/>
                </tr>
                <tr>
                    <div className="login-label-text">Password</div>
                </tr>
                <tr>
                    <input id="password-input" type="text" placeholder="Password"/>
                </tr>
                <tr>
                    <button className="login-submit-button" onClick={ () => { login() } }>Log In</button>
                </tr>
                <tr>
                    <div className="login-section-text">Register</div>
                </tr>
                <tr>
                    <div className="login-label-text">Email</div>
                </tr>
                <tr>
                    <input id="register-email-input" type="text" placeholder="Email"/>
                </tr>
                <tr>
                    <div className="login-label-text">Username</div>
                </tr>
                <tr>
                    <input id="register-username-input" type="text" placeholder="Username"/>
                </tr>
                <tr>
                    <div className="login-label-text">Password</div>
                </tr>
                <tr>
                    <input id="register-password-input" type="text" placeholder="Password"/>
                </tr>
                <tr>
                    <button className="login-submit-button" onClick={ () => { registerUser() } }>Register</button>
                </tr>
            </tbody>
        </table>
    );
}