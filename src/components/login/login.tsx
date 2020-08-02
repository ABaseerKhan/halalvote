import React, { useState } from 'react';
import { postData } from '../../https-client/post-data';
import { usersConfig } from '../../https-client/config';

// styles
import './login.css';

interface LoginComponentProps {
    removeModal: any,
    setUserDetails: any;
};
export const LoginComponent = (props: LoginComponentProps) => {
    const { removeModal, setUserDetails } = props;
    const [state, setState] = useState<{ isLogin: Boolean }>({
        isLogin: true
    });

    const setLogin = (isLogin: Boolean) => {
        setState({isLogin: isLogin});
    }
    
    const login = () => {
        const fetchData = async () => {
            const username = (document.getElementById("username-input") as HTMLInputElement).value
            const password = (document.getElementById("password-input") as HTMLInputElement).value

            const { status, data } = await postData({
                baseUrl: usersConfig.url,
                path: 'login',
                data: {
                    "username": username,
                    "password": password,
                },
                additionalHeaders: { }
            });

            if (status === 200) {
                const sessionToken = data;
                setUserDetails(username, sessionToken);
                removeModal();
            }
        }

        fetchData();
    }

    const registerUser = () => {
        const fetchData = async () => {
            const email = (document.getElementById("register-email-input") as HTMLInputElement).value
            const username = (document.getElementById("register-username-input") as HTMLInputElement).value
            const password = (document.getElementById("register-password-input") as HTMLInputElement).value

            const { status, data } = await postData({
                baseUrl: usersConfig.url,
                path: 'register-user',
                data: {
                    "email": email,
                    "username": username,
                    "password": password,
                },
                additionalHeaders: { }
            });

            if (status === 200 && username === data) {
                removeModal();
            }
        }

        fetchData();
    }

    return (
        <div>
        { state.isLogin ?
            <div className="login-body">
                <div className="login-section-text">Log In</div>
                <input id="username-input" className="login-input" type="text" placeholder="Username"/>
                <input id="password-input" className="login-input" type="text" placeholder="Password"/>
                <button className="login-submit-button" onClick={ () => { login() } }>Log In</button>
                <div className="login-switch-button" onClick={() => setLogin(false)}>New user? Create account here.</div>
            </div> :
            <div className="login-body">
                <div className="login-section-text">Register</div>
                <input id="register-email-input" className="login-input" type="text" placeholder="Email"/>
                <input id="register-username-input" className="login-input" type="text" placeholder="Username"/>
                <input id="register-password-input" className="login-input" type="text" placeholder="Password"/>
                <button className="login-submit-button" onClick={ () => { registerUser() } }>Register</button>
                <div className="login-switch-button" onClick={() => setLogin(true)}>Already have an account? Log in here.</div>
            </div> 
        }
        </div>
    );
}