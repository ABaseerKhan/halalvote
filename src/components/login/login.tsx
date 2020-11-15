import React, { useState, useEffect } from 'react';
import { postData } from '../../https-client/client';
import { usersConfig } from '../../https-client/config';
import { useCookies } from 'react-cookie';
import { css } from "@emotion/core";
import ClipLoader from "react-spinners/ClipLoader";

// styles
import './login.css';

enum LoginScreenType {
    LOGIN,
    REGISTER,
    REGISTER_COMPLETE,
    LOADING_LOGIN,
    LOADING_REGISTER
}

interface LoginComponentProps {
    closeModal: any,
    onLogin?: any,
};

export const LoginComponent = (props: LoginComponentProps) => {
    const { closeModal } = props;
    // eslint-disable-next-line
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const [state, setState] = useState<{
        loginScreenType: LoginScreenType, 
        isLoginButtonDisabled: boolean, 
        isRegisterButtonDisabled: boolean, 
        emailInput: string | undefined,
        usernameInput: string | undefined,
        passwordInput: string | undefined,
        errorMessage: string | undefined }>({
        loginScreenType: LoginScreenType.LOGIN,
        isLoginButtonDisabled: true,
        isRegisterButtonDisabled: true,
        emailInput: undefined,
        usernameInput: undefined,
        passwordInput: undefined,
        errorMessage: undefined
    });

    useEffect(() => {
        if (state.loginScreenType === LoginScreenType.LOADING_LOGIN) {
            makeLoginCall();
        } else if (state.loginScreenType === LoginScreenType.LOADING_REGISTER) {
            makeRegisterCall();
        } else if (state.loginScreenType === LoginScreenType.LOGIN || state.loginScreenType === LoginScreenType.REGISTER) {
            const usernameInput = getUsernameInput();
            const passwordInput = getPasswordInput();
            
            if (usernameInput && passwordInput) {
                usernameInput.value = state.usernameInput ? state.usernameInput : "";
                passwordInput.value = state.passwordInput ? state.passwordInput : "";
            }

            if (state.loginScreenType === LoginScreenType.REGISTER) {
                const emailInput = getRegisterEmailInput();

                if (emailInput) {
                    emailInput.value = emailInput.value ? emailInput.value : "";
                }
            }
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.loginScreenType]);

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

    const setLoginScreenType = (loginScreenType: LoginScreenType, options: any) => {
        clearInputs();
        const newState = {...state, loginScreenType: loginScreenType};
        if (options.hasOwnProperty("usernameInput")) {
            newState.usernameInput = options.usernameInput;
        }
        if (options.hasOwnProperty("passwordInput")) {
            newState.passwordInput = options.passwordInput;
        }
        if (options.hasOwnProperty("emailInput")) {
            newState.emailInput = options.emailInput;
        }
        if (options.hasOwnProperty("errorMessage")) {
            newState.errorMessage = options.errorMessage;
        } else {
            newState.errorMessage = undefined;
        }
        setState(newState);
    }
    
    const login = () => {
        const usernameInput = getUsernameInput();
        const passwordInput = getPasswordInput();
        
        if (usernameInput && passwordInput) {
            setLoginScreenType(LoginScreenType.LOADING_LOGIN, {
                usernameInput: usernameInput.value, 
                passwordInput: passwordInput.value
            });
        }
    }

    const makeLoginCall = () => {
        const fetchData = async () => {
            const { status, data } = await postData({
                baseUrl: usersConfig.url,
                path: 'login',
                data: {
                    "username": state.usernameInput,
                    "password": state.passwordInput,
                },
                additionalHeaders: { }
            });

            if (status === 200) {
                const sessionToken = data;
                setCookie('username', state.usernameInput, { path: '/' });
                setCookie('sessiontoken', sessionToken, { path: '/ '});
                if(props.onLogin) props.onLogin('username', 'sessiontoken');
                closeModal();
            } else {
                setLoginScreenType(LoginScreenType.LOGIN, {
                    errorMessage: data.message
                });
            }
        }

        fetchData();
    }

    const registerUser = () => {
        const emailInput = getRegisterEmailInput();
        const usernameInput = getRegisterUsernameInput();
        const passwordInput = getRegisterPasswordInput();

        if (emailInput && usernameInput && passwordInput) {
            setLoginScreenType(LoginScreenType.LOADING_REGISTER, {
                emailInput: emailInput.value,
                usernameInput: usernameInput.value, 
                passwordInput: passwordInput.value
            });
        }
    }

    const makeRegisterCall = () => {
        const fetchData = async () => {
            if (state.emailInput && state.usernameInput && state.passwordInput) {
                const { status, data } = await postData({
                    baseUrl: usersConfig.url,
                    path: 'register-user',
                    data: {
                        "email": state.emailInput,
                        "username": state.usernameInput,
                        "password": state.passwordInput,
                    },
                    additionalHeaders: { }
                });

                if (status === 200 && state.usernameInput === data) {
                    setLoginScreenType(LoginScreenType.REGISTER_COMPLETE, {});
                } else {
                    setLoginScreenType(LoginScreenType.REGISTER, {
                        errorMessage: data.message
                    });
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

    const loaderCssOverride = css`
        position: absolute;
        top: calc(50% - 25px);
        left: calc(50% - 25px);
    `;

    return (
        <div>
            {
                state.loginScreenType === LoginScreenType.LOADING_LOGIN || state.loginScreenType === LoginScreenType.LOADING_REGISTER ?
                <div>
                    <ClipLoader css={loaderCssOverride} size={50} color={"var(--light-neutral-color)"} />
                </div> :
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
                    {
                        state.errorMessage && <div className="login-error-message">{state.errorMessage}</div>
                    }
                    <button id="login-submit-button" className="button disabled-button" onClick={ () => { login() } } disabled={state.isLoginButtonDisabled}>Log In</button>
                    <div className="login-switch-button" onClick={() => setLoginScreenType(LoginScreenType.REGISTER, {})}>New user?<br/>Create account</div>
                </div> :
                <div className="login-body">
                    <div className="login-section-text">Register</div>
                    <input id="register-email-input" className="login-input" type="text" placeholder="Email" onChange={checkRegisterInputs} onKeyPress={(event: any) => handleRegisterKeyPress(event)}/>
                    <input id="register-username-input" className="login-input" type="text" placeholder="Username" onChange={checkRegisterInputs} onKeyPress={(event: any) => handleRegisterKeyPress(event)}/>
                    <input id="register-password-input" className="login-input" type="password" placeholder="Password" onChange={checkRegisterInputs} onKeyPress={(event: any) => handleRegisterKeyPress(event)}/>
                    {
                        state.errorMessage && <div className="login-error-message">{state.errorMessage}</div>
                    }
                    <button id="register-submit-button" className="button disabled-button" onClick={ () => { registerUser() } } disabled={state.isRegisterButtonDisabled}>Register</button>
                    <div className="login-switch-button" onClick={() => setLoginScreenType(LoginScreenType.LOGIN, {})}>Have an account?<br/>Log in here.</div>
                </div>
            }
        </div>
    );
}