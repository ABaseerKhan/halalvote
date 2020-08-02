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

    const getUsernameInput = (): HTMLInputElement => {
        return document.getElementById("username-input") as HTMLInputElement;
    }

    const getPasswordInput = (): HTMLInputElement => {
        return document.getElementById("password-input") as HTMLInputElement;
    }

    const getRegisterEmailInput = (): HTMLInputElement => {
        return document.getElementById("register-email-input") as HTMLInputElement;
    }

    const getRegisterUsernameInput = (): HTMLInputElement => {
        return document.getElementById("register-username-input") as HTMLInputElement;
    }

    const getRegisterPasswordInput = (): HTMLInputElement => {
        return document.getElementById("register-password-input") as HTMLInputElement;
    }

    const getLoginSubmitButton = (): HTMLButtonElement => {
        return document.getElementById("login-submit-button") as HTMLButtonElement;
    }

    const getRegisterSubmitButton = (): HTMLButtonElement => {
        return document.getElementById("register-submit-button") as HTMLButtonElement;
    }

    const clearInputs = () => {
        const usernameInput = getUsernameInput();
        const passwordInput = getPasswordInput();
        const registerEmailInput = getRegisterEmailInput();
        const registerUsernameInput = getRegisterUsernameInput();
        const registerPasswordInput = getRegisterPasswordInput();

        if (usernameInput) {usernameInput.value = ""};
        if (passwordInput) {passwordInput.value = ""};
        if (registerEmailInput) {registerEmailInput.value = ""};
        if (registerUsernameInput) {registerUsernameInput.value = ""};
        if (registerPasswordInput) {registerPasswordInput.value = ""};
    }

    const setLogin = (isLogin: Boolean) => {
        clearInputs();
        setState({isLogin: isLogin});
    }
    
    const login = () => {
        const fetchData = async () => {
            const usernameInput = getUsernameInput();
            const passwordInput = getPasswordInput();

            if (usernameInput && passwordInput) {
                const { status, data } = await postData({
                    baseUrl: usersConfig.url,
                    path: 'login',
                    data: {
                        "username": usernameInput.value,
                        "password": passwordInput.value,
                    },
                    additionalHeaders: { }
                });

                if (status === 200) {
                    const sessionToken = data;
                    setUserDetails(usernameInput.value, sessionToken);
                    removeModal();
                }
            }
        }

        fetchData();
    }

    const registerUser = () => {
        const fetchData = async () => {
            const emailInput = getRegisterEmailInput();
            const usernameInput = getRegisterUsernameInput();
            const passwordInput = getRegisterPasswordInput();

            if (emailInput && usernameInput && passwordInput) {
                const { status, data } = await postData({
                    baseUrl: usersConfig.url,
                    path: 'register-user',
                    data: {
                        "email": emailInput.value,
                        "username": usernameInput.value,
                        "password": passwordInput.value,
                    },
                    additionalHeaders: { }
                });

                if (status === 200 && usernameInput.value === data) {
                    removeModal();
                }
            }
        }

        fetchData();
    }

    const checkLoginInputs = () => {
        const usernameInput = getUsernameInput();
        const passwordInput = getPasswordInput();
        const submitButton = getLoginSubmitButton();

        if (usernameInput && passwordInput && submitButton) {
            if (usernameInput.value === "" || passwordInput.value === "") {
                submitButton.disabled = true;
                submitButton.classList.add("disabled-button");
            } else {
                submitButton.disabled = false;
                submitButton.classList.remove("disabled-button");
            }
        }
    }

    const checkRegisterInputs = () => {
        const emailInput = getRegisterEmailInput();
        const usernameInput = getRegisterUsernameInput();
        const passwordInput = getRegisterPasswordInput();
        const submitButton = getRegisterSubmitButton();

        if (emailInput && usernameInput && passwordInput && submitButton) {
            if (emailInput.value === "" || usernameInput.value === "" || passwordInput.value === "") {
                submitButton.disabled = true;
                submitButton.classList.add("disabled-button");
            } else {
                submitButton.disabled = false;
                submitButton.classList.remove("disabled-button");
            }
        }
    }

    return (
        <div>
        { state.isLogin ?
            <div className="login-body">
                <div className="login-section-text">Log In</div>
                <input id="username-input" className="login-input" type="text" placeholder="Username" onChange={checkLoginInputs}/>
                <input id="password-input" className="login-input" type="password" placeholder="Password" onChange={checkLoginInputs}/>
                <button id="login-submit-button" className="login-submit-button disabled-button" onClick={ () => { login() } } disabled={true}>Log In</button>
                <div className="login-switch-button" onClick={() => setLogin(false)}>New user? Create account here.</div>
            </div> :
            <div className="login-body">
                <div className="login-section-text">Register</div>
                <input id="register-email-input" className="login-input" type="text" placeholder="Email" onChange={checkRegisterInputs}/>
                <input id="register-username-input" className="login-input" type="text" placeholder="Username" onChange={checkRegisterInputs}/>
                <input id="register-password-input" className="login-input" type="password" placeholder="Password" onChange={checkRegisterInputs}/>
                <button id="register-submit-button" className="login-submit-button disabled-button" onClick={ () => { registerUser() } } disabled={true}>Register</button>
                <div className="login-switch-button" onClick={() => setLogin(true)}>Already have an account? Log in here.</div>
            </div> 
        }
        </div>
    );
}