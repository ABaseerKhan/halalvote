import React, { useState } from 'react';
import { postData } from '../../https-client/client';
import { usersConfig } from '../../https-client/config';
import { useCookies } from 'react-cookie';

// styles
import './login.css';

enum LoginScreenType {
    LOGIN,
    REGISTER,
    REGISTER_COMPLETE
}

interface LoginComponentProps {
    closeModal: any,
    onLogin?: any,
};

export const LoginComponent = (props: LoginComponentProps) => {
    const { closeModal } = props;
    // eslint-disable-next-line
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const [state, setState] = useState<{ loginScreenType: LoginScreenType, isLoginButtonDisabled: boolean, isRegisterButtonDisabled: boolean }>({
        loginScreenType: LoginScreenType.LOGIN,
        isLoginButtonDisabled: true,
        isRegisterButtonDisabled: true
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

        setState({...state, isLoginButtonDisabled: false, isRegisterButtonDisabled: false});
    }

    const setLoginScreenType = (loginScreenType: LoginScreenType) => {
        clearInputs();
        setState({...state, loginScreenType: loginScreenType});
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
                    setCookie('username', usernameInput.value, { path: '/' });
                    setCookie('sessiontoken', sessionToken, { path: '/ '});
                    if(props.onLogin) props.onLogin('username', 'sessiontoken');
                    closeModal();
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
                    setLoginScreenType(LoginScreenType.REGISTER_COMPLETE);
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
                submitButton.classList.add("disabled-button");
                setState({...state, isLoginButtonDisabled: true});
            } else {
                submitButton.classList.remove("disabled-button");
                setState({...state, isLoginButtonDisabled: false});
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
                submitButton.classList.add("disabled-button");
                setState({...state, isRegisterButtonDisabled: true});
            } else {
                submitButton.classList.remove("disabled-button");
                setState({...state, isRegisterButtonDisabled: false});
            }
        }
    }

    const handleLoginKeyPress = (event: any) => {
        if (!state.isLoginButtonDisabled && event.charCode === 13) {
            login();
        }
    }

    const handleRegisterKeyPress = (event: any) => {
        if (!state.isRegisterButtonDisabled && event.charCode === 13) {
            registerUser();
        }
    }

    return (
        <div>
            {
                state.loginScreenType === LoginScreenType.REGISTER_COMPLETE ?
                <div className="login-body">
                    <div className="login-section-text">Thanks for registering with Halal Vote!</div>
                    <div className="login-section-text">Check your email to activate your account.</div>
                </div> :
                state.loginScreenType === LoginScreenType.LOGIN ?
                <div className="login-body">
                    <div className="login-section-text">Log In</div>
                    <input id="username-input" className="login-input" type="text" placeholder="Username" onChange={checkLoginInputs} onKeyPress={(event: any) => handleLoginKeyPress(event)}/>
                    <input id="password-input" className="login-input" type="password" placeholder="Password" onChange={checkLoginInputs} onKeyPress={(event: any) => handleLoginKeyPress(event)}/>
                    <button id="login-submit-button" className="button disabled-button" onClick={ () => { login() } } disabled={state.isLoginButtonDisabled}>Log In</button>
                    <div className="login-switch-button" onClick={() => setLoginScreenType(LoginScreenType.REGISTER)}>New user?<br/>Create account</div>
                </div> :
                <div className="login-body">
                    <div className="login-section-text">Register</div>
                    <input id="register-email-input" className="login-input" type="text" placeholder="Email" onChange={checkRegisterInputs} onKeyPress={(event: any) => handleRegisterKeyPress(event)}/>
                    <input id="register-username-input" className="login-input" type="text" placeholder="Username" onChange={checkRegisterInputs} onKeyPress={(event: any) => handleRegisterKeyPress(event)}/>
                    <input id="register-password-input" className="login-input" type="password" placeholder="Password" onChange={checkRegisterInputs} onKeyPress={(event: any) => handleRegisterKeyPress(event)}/>
                    <button id="register-submit-button" className="button disabled-button" onClick={ () => { registerUser() } } disabled={state.isRegisterButtonDisabled}>Register</button>
                    <div className="login-switch-button" onClick={() => setLoginScreenType(LoginScreenType.LOGIN)}>Have an account?<br/>Log in here.</div>
                </div>
            }
        </div>
    );
}