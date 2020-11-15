import React, { useState, useEffect, useRef, useCallback } from 'react';
import { postData, getData } from '../../https-client/client';
import { usersConfig } from '../../https-client/config';
import { useCookies } from 'react-cookie';
import { css } from "@emotion/core";
import ClipLoader from "react-spinners/ClipLoader";
import { 
    useHistory,
} from "react-router-dom";
import { useQuery } from '../../hooks/useQuery';

// styles
import './login.css';

export enum LoginScreenType {
    LOGIN,
    REGISTER,
    REGISTER_COMPLETE,
    ACTIVATION_COMPLETE,
    ACTIVATION_FAILURE,
    LOADING_LOGIN,
    LOADING_REGISTER,
    LOADING_ACTIVATION,
    NONE
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
        isLoginButtonDisabled: boolean, 
        isRegisterButtonDisabled: boolean }>({
        isLoginButtonDisabled: true,
        isRegisterButtonDisabled: true
    });

    let emailInput = useRef<string | undefined>(undefined);
    let usernameInput = useRef<string | undefined>(undefined);
    let passwordInput = useRef<string | undefined>(undefined);
    let errorMessage = useRef<string | undefined>(undefined);

    const history = useHistory();
    const query = useQuery();

    const loginScreen = query.get("loginScreen") || undefined;
    const usernameParameter = query.get("username") || undefined;
    const activationValueParameter = query.get("activationValue") || undefined;

    let loginScreenType: LoginScreenType;
    switch(loginScreen) {
        case "login":
            loginScreenType = LoginScreenType.LOGIN;
            break;
        case "register":
            loginScreenType = LoginScreenType.REGISTER;
            break;
        case "registerComplete":
            loginScreenType = LoginScreenType.REGISTER_COMPLETE;
            break;
        case "activationComplete":
            loginScreenType = LoginScreenType.ACTIVATION_COMPLETE;
            break;
        case "activationFailure":
            loginScreenType = LoginScreenType.ACTIVATION_FAILURE;
            break;
        case "loadingLogin":
            loginScreenType = LoginScreenType.LOADING_LOGIN;
            break;
        case "loadingRegister":
            loginScreenType = LoginScreenType.LOADING_REGISTER;
            break;
        case "loadingActivation":
            loginScreenType = LoginScreenType.LOADING_ACTIVATION;
            break;
        default:
            loginScreenType = LoginScreenType.NONE;
    };

    useEffect(() => {
        if (loginScreenType === LoginScreenType.LOADING_LOGIN) {
            makeLoginCall();
        } else if (loginScreenType === LoginScreenType.LOADING_REGISTER) {
            makeRegisterCall();
        } else if (loginScreenType === LoginScreenType.LOADING_ACTIVATION) {
            makeActivationCall();
        } else if (loginScreenType === LoginScreenType.LOGIN || loginScreenType === LoginScreenType.REGISTER) {
            const usernameInputElement = getUsernameInput();
            const passwordInputElement = getPasswordInput();
            
            if (usernameInputElement && passwordInputElement) {
                usernameInputElement.value = usernameInput.current ? usernameInput.current : "";
                passwordInputElement.value = passwordInput.current ? passwordInput.current : "";
            }

            if (loginScreenType === LoginScreenType.REGISTER) {
                const emailInputElement = getRegisterEmailInput();

                if (emailInputElement) {
                    emailInputElement.value = emailInput.current ? emailInput.current : "";
                }
            }
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginScreenType]);

    const updateURL = useCallback((loginScreen) => {
        if (loginScreen) {
            if (query.has('loginScreen')) {
                query.set('loginScreen', loginScreen);
                
                if (loginScreen !== 'loadingActivation') {
                    if (query.has('username')) {
                        query.delete('username');
                    }
                    if (query.has('activationValue')) {
                        query.delete('activationValue');
                    }
                }
            } else {
                query.append('loginScreen', loginScreen);
            };
            history.push({
                search: "?" + query.toString()
            });
        }
    }, [history, query]);

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
        if (options.hasOwnProperty("usernameInput")) {
            usernameInput.current = options.usernameInput;
        }
        if (options.hasOwnProperty("passwordInput")) {
            passwordInput.current = options.passwordInput;
        }
        if (options.hasOwnProperty("emailInput")) {
            emailInput.current = options.emailInput;
        }
        if (options.hasOwnProperty("errorMessage")) {
            errorMessage.current = options.errorMessage;
        } else {
            errorMessage.current = undefined;
        }

        let loginScreen: string;
        switch(loginScreenType) {
            case LoginScreenType.LOGIN:
                loginScreen = "login";
                break;
            case LoginScreenType.REGISTER:
                loginScreen = "register";
                break;
            case LoginScreenType.REGISTER_COMPLETE:
                loginScreen = "registerComplete";
                break;
            case LoginScreenType.ACTIVATION_COMPLETE:
                loginScreen = "activationComplete";
                break;
            case LoginScreenType.ACTIVATION_FAILURE:
                loginScreen = "activationFailure";
                break;
            case LoginScreenType.LOADING_LOGIN:
                loginScreen = "loadingLogin";
                break;
            case LoginScreenType.LOADING_REGISTER:
                loginScreen = "loadingRegister";
                break;
            case LoginScreenType.LOADING_ACTIVATION:
                loginScreen = "loadingActivation";
                break;
            default:
                loginScreen = "login";
        }

        updateURL(loginScreen);
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
                    "username": usernameInput.current,
                    "password": passwordInput.current,
                },
                additionalHeaders: { }
            });

            if (status === 200) {
                const sessionToken = data;
                setCookie('username', usernameInput.current, { path: '/' });
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
            if (emailInput.current && usernameInput.current && passwordInput.current) {
                const { status, data } = await postData({
                    baseUrl: usersConfig.url,
                    path: 'register-user',
                    data: {
                        "email": emailInput.current,
                        "username": usernameInput.current,
                        "password": passwordInput.current,
                    },
                    additionalHeaders: { }
                });

                if (status === 200 && usernameInput.current === data) {
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

    const makeActivationCall = () => {
        const makeCall = async () => {
            const { status } = await getData({ 
                baseUrl: usersConfig.url,
                path: 'activate-user',
                queryParams: {
                    "username": usernameParameter,
                    "value": activationValueParameter
                },
                additionalHeaders: {},
            });

            if (status === 200) {
                setLoginScreenType(LoginScreenType.ACTIVATION_COMPLETE, {});
            } else {
                setLoginScreenType(LoginScreenType.ACTIVATION_FAILURE, {});
            }
        }

        makeCall();
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
                loginScreenType === LoginScreenType.LOADING_LOGIN || loginScreenType === LoginScreenType.LOADING_REGISTER || loginScreenType === LoginScreenType.LOADING_ACTIVATION ?
                <div>
                    <ClipLoader css={loaderCssOverride} size={50} color={"var(--light-neutral-color)"} />
                </div> :
                loginScreenType === LoginScreenType.REGISTER_COMPLETE ?
                <div className="login-body">
                    <div className="login-section-text">Thanks for registering with Halal Vote!</div>
                    <div className="login-section-text">Check your email to activate your account.</div>
                </div> :
                loginScreenType === LoginScreenType.ACTIVATION_COMPLETE ?
                <div className="login-body">
                    <div className="login-section-text">Successfully actived account!</div>
                    <div className="login-section-text">Click <span className="activation-complete-login-link" onClick={() => setLoginScreenType(LoginScreenType.LOGIN, {})}>here</span> to login.</div>
                </div> :
                loginScreenType === LoginScreenType.ACTIVATION_FAILURE ?
                <div className="login-body">
                    <div className="login-section-text">Failed to activate account.</div>
                </div> :
                loginScreenType === LoginScreenType.LOGIN ?
                <div className="login-body">
                    <div className="login-section-text">Log In</div>
                    <input id="username-input" className="login-input" type="text" placeholder="Username" onChange={checkLoginInputs} onKeyPress={(event: any) => handleLoginKeyPress(event)}/>
                    <input id="password-input" className="login-input" type="password" placeholder="Password" onChange={checkLoginInputs} onKeyPress={(event: any) => handleLoginKeyPress(event)}/>
                    {
                        errorMessage.current && <div className="login-error-message">{errorMessage.current}</div>
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
                        errorMessage.current && <div className="login-error-message">{errorMessage.current}</div>
                    }
                    <button id="register-submit-button" className="button disabled-button" onClick={ () => { registerUser() } } disabled={state.isRegisterButtonDisabled}>Register</button>
                    <div className="login-switch-button" onClick={() => setLoginScreenType(LoginScreenType.LOGIN, {})}>Have an account?<br/>Log in here.</div>
                </div>
            }
        </div>
    );
}