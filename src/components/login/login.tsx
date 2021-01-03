import React, { useState, useEffect, useCallback } from 'react';
import { postData, getData } from '../../https-client/client';
import { usersConfig } from '../../https-client/config';
import { useCookies } from 'react-cookie';
import { css } from "@emotion/core";
import ClipLoader from "react-spinners/ClipLoader";
import { 
    useHistory,
} from "react-router-dom";
import { useQuery } from '../../hooks/useQuery';
import { ReactComponent as CheckIcon} from '../../icons/check-icon.svg'
import { ReactComponent as CrossIcon} from '../../icons/cross-icon.svg'

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
    FORGOT_PASSWORD_PAGE,
    LOADING_FORGOT_PASSWORD,
    FORGOT_PASSWORD_COMPLETE,
    CHANGE_PASSWORD_PAGE,
    LOADING_CHANGE_PASSWORD,
    CHANGE_PASSWORD_COMPLETE,
    CHANGE_PASSWORD_FAILURE,
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

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState<boolean>();
    const [isRegisterButtonDisabled, setIsRegisterButtonDisabled] = useState<boolean>();
    const [isForgotPasswordPageButtonDisabled, setIsForgotPasswordPageButtonDisabled] = useState<boolean>();
    const [isChangePasswordPageButtonDisabled, setIsChangePasswordPageButtonDisabled] = useState<boolean>();

    const [loginUsernameInput, setLoginUsernameInput] = useState<string>("");
    const [loginPasswordInput, setLoginPasswordInput] = useState<string>("");
    const [loginErrorMessage, setLoginErrorMessage] = useState<string>("");

    const [registerEmailInput, setRegisterEmailInput] = useState<string>("");
    const [registerUsernameInput, setRegisterUsernameInput] = useState<string>("");
    const [registerPasswordInput, setRegisterPasswordInput] = useState<string>("");
    const [registerPasswordRepeatInput, setRegisterPasswordRepeatInput] = useState<string>("");
    const [registerErrorMessage, setRegisterErrorMessage] = useState<string>("");

    const [forgotPasswordPageEmailInput, setForgotPasswordPageEmailInput] = useState<string>("");
    const [forgotPasswordPageErrorMessage, setForgotPasswordPageErrorMessage] = useState<string>("");

    const [changePasswordInput, setChangePasswordInput] = useState<string>("");
    const [changePasswordRepeatInput, setChangePasswordRepeatInput] = useState<string>("");
    const [changePasswordErrorMessage, setChangePasswordErrorMessage] = useState<string>("");

    const history = useHistory();
    const query = useQuery();

    const loginScreen = query.get("loginScreen") || undefined;
    const usernameParameter = query.get("username") || undefined;
    const activationValueParameter = query.get("activationValue") || undefined;
    const passwordResetTokenParameter = query.get("passwordResetToken") || undefined;

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
        case "forgotPage":
            loginScreenType = LoginScreenType.FORGOT_PASSWORD_PAGE;
            break;
        case "loadingForgotPage":
            loginScreenType = LoginScreenType.LOADING_FORGOT_PASSWORD;
            break;
        case "forgotPasswordComplete":
            loginScreenType = LoginScreenType.FORGOT_PASSWORD_COMPLETE;
            break;
        case "changePasswordPage":
            loginScreenType = LoginScreenType.CHANGE_PASSWORD_PAGE;
            break;
        case "loadingChangePassword":
            loginScreenType = LoginScreenType.LOADING_CHANGE_PASSWORD;
            break;
        case "changePasswordComplete":
            loginScreenType = LoginScreenType.CHANGE_PASSWORD_COMPLETE;
            break;
        case "changePasswordFailure":
            loginScreenType = LoginScreenType.CHANGE_PASSWORD_FAILURE;
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
        } else if (loginScreenType === LoginScreenType.LOADING_FORGOT_PASSWORD) {
            makeForgotPasswordCall();
        } else if (loginScreenType === LoginScreenType.LOADING_CHANGE_PASSWORD) {
            makeChangePasswordCall();
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginScreenType]);

    useEffect(() => {
        setIsLoginButtonDisabled(loginUsernameInput === "" || loginPasswordInput === ""); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginUsernameInput, loginPasswordInput]);

    useEffect(() => {
        setIsRegisterButtonDisabled(!validRegisterEmail() || registerUsernameInput === "" || !validRegisterPassword() || !registerPasswordsMatch()); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registerEmailInput, registerUsernameInput, registerPasswordInput, registerPasswordRepeatInput]);

    useEffect(() => {
        setIsForgotPasswordPageButtonDisabled(!validForgotPageEmail()); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forgotPasswordPageEmailInput]);

    useEffect(() => {
        setIsChangePasswordPageButtonDisabled(changePasswordInput === "" || !validChangePassword() || !changePasswordsMatch()); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [changePasswordInput, changePasswordRepeatInput]);

    const validEmail = (email: string) => {
        return /^.*@.*\.com$/.test(email);
    }

    const validPassword = (password: string) => {
        return password !== "";
    }

    const validRegisterEmail = () => {
        return validEmail(registerEmailInput);
    }

    const validRegisterPassword = () => {
        return validPassword(registerPasswordInput);
    }

    const registerPasswordsMatch = () => {
        return registerPasswordInput === registerPasswordRepeatInput;
    }

    const validForgotPageEmail = () => {
        return validEmail(forgotPasswordPageEmailInput);
    }

    const validChangePassword = () => {
        return validPassword(changePasswordInput);
    }

    const changePasswordsMatch = () => {
        return changePasswordInput === changePasswordRepeatInput;
    }

    const updateURL = useCallback((loginScreen) => {
        if (loginScreen) {
            if (query.has('loginScreen')) {
                query.set('loginScreen', loginScreen);

                if (loginScreen !== 'loadingActivation' && loginScreen !== 'loadingChangePassword' && loginScreen !== 'changePasswordPage') {
                    if (query.has('username')) {
                        query.delete('username');
                    }
                }
                
                if (loginScreen !== 'loadingActivation') {
                    if (query.has('activationValue')) {
                        query.delete('activationValue');
                    }
                }

                if (loginScreen !== 'loadingChangePassword' && loginScreen !== 'changePasswordPage') {
                    if (query.has('passwordResetToken')) {
                        query.delete('passwordResetToken');
                    }
                }
            } else {
                query.append('loginScreen', loginScreen);
            };
            history.replace({
                search: "?" + query.toString()
            });
        }
    }, [history, query]);

    const setLoginScreenType = (loginScreenType: LoginScreenType) => {
        setLoginErrorMessage("");
        setRegisterErrorMessage("");
        setForgotPasswordPageErrorMessage("");
        setChangePasswordErrorMessage("");

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
            case LoginScreenType.FORGOT_PASSWORD_PAGE:
                loginScreen = "forgotPage";
                break;
            case LoginScreenType.LOADING_FORGOT_PASSWORD:
                loginScreen = "loadingForgotPage";
                break;
            case LoginScreenType.FORGOT_PASSWORD_COMPLETE:
                loginScreen = "forgotPasswordComplete";
                break;
            case LoginScreenType.CHANGE_PASSWORD_PAGE:
                loginScreen = "changePasswordPage";
                break;
            case LoginScreenType.LOADING_CHANGE_PASSWORD:
                loginScreen = "loadingChangePassword";
                break;
            case LoginScreenType.CHANGE_PASSWORD_COMPLETE:
                loginScreen = "changePasswordComplete";
                break;
            case LoginScreenType.CHANGE_PASSWORD_FAILURE:
                loginScreen = "changePasswordFailure";
                break;
            default:
                loginScreen = "login";
        }

        updateURL(loginScreen);
    }
    
    const login = () => {
        setLoginScreenType(LoginScreenType.LOADING_LOGIN);
    }

    const makeLoginCall = () => {
        const fetchData = async () => {
            const { status, data } = await postData({
                baseUrl: usersConfig.url,
                path: 'login',
                data: {
                    "username": loginUsernameInput,
                    "password": loginPasswordInput,
                },
                additionalHeaders: { }
            });

            if (status === 200) {
                const sessionToken = data;
                setCookie('username', loginUsernameInput, { path: '/' });
                setCookie('sessiontoken', sessionToken, { path: '/ '});
                if(props.onLogin) props.onLogin('username', 'sessiontoken');
                closeModal();
            } else {
                setLoginScreenType(LoginScreenType.LOGIN);
                setLoginErrorMessage(data.message);
            }
        }

        fetchData();
    }

    const registerUser = () => {
        setLoginScreenType(LoginScreenType.LOADING_REGISTER);
    }

    const makeRegisterCall = () => {
        const fetchData = async () => {
            const { status, data } = await postData({
                baseUrl: usersConfig.url,
                path: 'register-user',
                data: {
                    "email": registerEmailInput,
                    "username": registerUsernameInput,
                    "password": registerPasswordInput,
                },
                additionalHeaders: { }
            });

            if (status === 200 && registerUsernameInput === data) {
                setLoginScreenType(LoginScreenType.REGISTER_COMPLETE);
            } else {
                setLoginScreenType(LoginScreenType.REGISTER);
                setRegisterErrorMessage(data.message);
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
                setLoginScreenType(LoginScreenType.ACTIVATION_COMPLETE);
            } else {
                setLoginScreenType(LoginScreenType.ACTIVATION_FAILURE);
            }
        }

        makeCall();
    }

    const forgotPassword = () => {
        setLoginScreenType(LoginScreenType.LOADING_FORGOT_PASSWORD);
    }

    const makeForgotPasswordCall = () => {
        const makeCall = async () => {
            const { status, data } = await getData({ 
                baseUrl: usersConfig.url,
                path: 'send-forgot-password-email',
                queryParams: {
                    "email": forgotPasswordPageEmailInput
                },
                additionalHeaders: {},
            });

            if (status === 200) {
                setLoginScreenType(LoginScreenType.FORGOT_PASSWORD_COMPLETE);
            } else {
                setLoginScreenType(LoginScreenType.FORGOT_PASSWORD_PAGE);
                setForgotPasswordPageErrorMessage(data.message);
            }
        }

        makeCall();
    }

    const changePassword = () => {
        setLoginScreenType(LoginScreenType.LOADING_CHANGE_PASSWORD);
    }

    const makeChangePasswordCall = () => {
        const fetchData = async () => {
            const { status } = await postData({
                baseUrl: usersConfig.url,
                path: 'change-password',
                data: {
                    "username": usernameParameter,
                    "newPassword": changePasswordInput,
                    "resetToken": passwordResetTokenParameter
                },
                additionalHeaders: { }
            });

            if (status === 200) {
                setLoginScreenType(LoginScreenType.CHANGE_PASSWORD_COMPLETE);
            } else {
                setLoginScreenType(LoginScreenType.CHANGE_PASSWORD_FAILURE);
            }
        }

        fetchData();
    }

    const handleLoginKeyPress = (event: any) => {
        if (!isLoginButtonDisabled && event.charCode === 13) {
            login();
        }
    }

    const handleRegisterKeyPress = (event: any) => {
        if (!isRegisterButtonDisabled && event.charCode === 13) {
            registerUser();
        }
    }

    const handleForgotPasswordPageKeyPress = (event: any) => {
        if (!isForgotPasswordPageButtonDisabled && event.charCode === 13) {
            forgotPassword();
        }
    }

    const handleChangePasswordPageKeyPress = (event: any) => {
        if (!isChangePasswordPageButtonDisabled && event.charCode === 13) {
            changePassword();
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
                loginScreenType === LoginScreenType.LOADING_LOGIN || loginScreenType === LoginScreenType.LOADING_REGISTER || loginScreenType === LoginScreenType.LOADING_ACTIVATION || loginScreenType === LoginScreenType.LOADING_FORGOT_PASSWORD || loginScreenType === LoginScreenType.LOADING_CHANGE_PASSWORD ?
                <div>
                    <ClipLoader css={loaderCssOverride} size={50} color={"var(--light-neutral-color)"} />
                </div> :
                loginScreenType === LoginScreenType.REGISTER_COMPLETE ?
                <div className="login-body">
                    <div className="login-section-text">Thanks for registering with Halal Vote!</div>
                    <div className="login-section-text">Check your email to activate your account.</div>
                    <div className="login-section-text">Click <span className="login-link" onClick={() => setLoginScreenType(LoginScreenType.LOGIN)}>here</span> to login.</div>
                </div> :
                loginScreenType === LoginScreenType.ACTIVATION_COMPLETE ?
                <div className="login-body">
                    <div className="login-section-text">Successfully actived account!</div>
                    <div className="login-section-text">Click <span className="login-link" onClick={() => setLoginScreenType(LoginScreenType.LOGIN)}>here</span> to login.</div>
                </div> :
                loginScreenType === LoginScreenType.ACTIVATION_FAILURE ?
                <div className="login-body">
                    <div className="login-section-text">Failed to activate account.</div>
                </div> :
                loginScreenType === LoginScreenType.CHANGE_PASSWORD_COMPLETE ?
                <div className="login-body">
                    <div className="login-section-text">Successfully changed password!</div>
                    <div className="login-section-text">Click <span className="login-link" onClick={() => setLoginScreenType(LoginScreenType.LOGIN)}>here</span> to login.</div>
                </div> :
                loginScreenType === LoginScreenType.CHANGE_PASSWORD_FAILURE ?
                <div className="login-body">
                    <div className="login-section-text">Failed to change password.</div>
                </div> :
                loginScreenType === LoginScreenType.FORGOT_PASSWORD_COMPLETE ?
                <div className="login-body">
                    <div className="login-section-text">Check your email to change password.</div>
                    <div className="login-section-text">Click <span className="login-link" onClick={() => setLoginScreenType(LoginScreenType.LOGIN)}>here</span> to login.</div>
                </div> :
                loginScreenType === LoginScreenType.LOGIN ?
                <div className="login-body">
                    <div className="login-section-text">Log In</div>
                    <input id="username-input" className="login-input" type="text" placeholder="Username" value={loginUsernameInput} onChange={e => setLoginUsernameInput(e.target.value)} onKeyPress={(event: any) => handleLoginKeyPress(event)}/>
                    <input id="password-input" className="login-input" type="password" placeholder="Password" value={loginPasswordInput} onChange={e => setLoginPasswordInput(e.target.value)} onKeyPress={(event: any) => handleLoginKeyPress(event)}/>
                    {
                        loginErrorMessage && <div className="login-error-message">{loginErrorMessage}</div>
                    }
                    <button id="login-submit-button" className={`button ${isLoginButtonDisabled && "disabled-button"}`} onClick={ () => { login() } } disabled={isLoginButtonDisabled}>Log In</button>
                    <div className="login-switch-buttons-container">
                        <div className="login-switch-button" onClick={() => setLoginScreenType(LoginScreenType.REGISTER)}>Create account</div>
                        <div className="login-switch-button" onClick={() => setLoginScreenType(LoginScreenType.FORGOT_PASSWORD_PAGE)}>Forgot username<br/>or password?</div>
                    </div>
                </div> :
                loginScreenType === LoginScreenType.REGISTER ?
                <div className="login-body">
                    <div className="login-section-text">Register</div>
                    <input id="register-username-input" className="login-input" type="text" placeholder="Username" value={registerUsernameInput} onChange={e => setRegisterUsernameInput(e.target.value)} onKeyPress={(event: any) => handleRegisterKeyPress(event)}/>
                    <div className="login-input-container">
                        <input id="register-email-input" className="login-input" type="text" placeholder="Email" value={registerEmailInput} onChange={e => setRegisterEmailInput(e.target.value)} onKeyPress={(event: any) => handleRegisterKeyPress(event)}/>
                        {
                            registerEmailInput !== "" &&
                            <div className="login-input-error">
                                {
                                    validRegisterEmail() ?
                                    <CheckIcon style={{color: "green"}} /> :
                                    <CrossIcon style={{color: "red"}} />
                                }
                            </div>
                        }
                    </div>
                    <div className="login-input-container">
                        <input id="register-password-input" className="login-input" type="password" placeholder="Password" value={registerPasswordInput} onChange={e => setRegisterPasswordInput(e.target.value)} onKeyPress={(event: any) => handleRegisterKeyPress(event)}/>
                        {
                            registerPasswordInput !== "" &&
                            <div className="login-input-error">
                                {
                                    validRegisterPassword() ?
                                    <CheckIcon style={{color: "green"}} /> :
                                    <CrossIcon style={{color: "red"}} />
                                }
                            </div>
                        }
                    </div>
                    <div className="login-input-container">
                        <input id="register-password-repeat-input" className="login-input" type="password" placeholder="Retype Password" value={registerPasswordRepeatInput} onChange={e => setRegisterPasswordRepeatInput(e.target.value)} onKeyPress={(event: any) => handleRegisterKeyPress(event)}/>
                        {
                            registerPasswordRepeatInput !== "" &&
                            <div className="login-input-error">
                                {
                                    registerPasswordsMatch() ?
                                    <CheckIcon style={{color: "green"}} /> :
                                    <CrossIcon style={{color: "red"}} />
                                }
                            </div>
                        }
                    </div>
                    {
                        registerErrorMessage && <div className="login-error-message">{registerErrorMessage}</div>
                    }
                    <button id="register-submit-button" className={`button ${isRegisterButtonDisabled && "disabled-button"}`} onClick={ () => { registerUser() } } disabled={isRegisterButtonDisabled}>Register</button>
                    <div className="login-switch-button" onClick={() => setLoginScreenType(LoginScreenType.LOGIN)}>Already have an account?<br/>Log in here.</div>
                </div> :
                loginScreenType === LoginScreenType.FORGOT_PASSWORD_PAGE ?
                <div className="login-body">
                    <div className="login-section-text">Enter email to change password</div>
                    <div className="login-input-container">
                        <input id="forgot-page-email-input" className="login-input" type="text" placeholder="Email" value={forgotPasswordPageEmailInput} onChange={e => setForgotPasswordPageEmailInput(e.target.value)} onKeyPress={(event: any) => handleForgotPasswordPageKeyPress(event)}/>
                        {
                            forgotPasswordPageEmailInput !== "" &&
                            <div className="login-input-error">
                                {
                                    validForgotPageEmail() ?
                                    <CheckIcon style={{color: "green"}} /> :
                                    <CrossIcon style={{color: "red"}} />
                                }
                            </div>
                        }
                    </div>
                    {
                        forgotPasswordPageErrorMessage && <div className="login-error-message">{forgotPasswordPageErrorMessage}</div>
                    }
                    <button id="login-submit-button" className={`button ${isForgotPasswordPageButtonDisabled && "disabled-button"}`} onClick={ () => { forgotPassword() } } disabled={isForgotPasswordPageButtonDisabled}>Submit</button>
                    <div className="login-switch-button" onClick={() => setLoginScreenType(LoginScreenType.LOGIN)}>Login</div>
                </div> :
                <div className="login-body">
                    <div className="login-section-text">{`Change Password for ${usernameParameter}`}</div>
                    <div className="login-input-container">
                        <input id="change-password-input" className="login-input" type="password" placeholder="New Password" value={changePasswordInput} onChange={e => setChangePasswordInput(e.target.value)} onKeyPress={(event: any) => handleChangePasswordPageKeyPress(event)}/>
                        {
                            changePasswordInput !== "" &&
                            <div className="login-input-error">
                                {
                                    validChangePassword() ?
                                    <CheckIcon style={{color: "green"}} /> :
                                    <CrossIcon style={{color: "red"}} />
                                }
                            </div>
                        }
                    </div>
                    <div className="login-input-container">
                        <input id="change-password-repeat-input" className="login-input" type="password" placeholder="Retype New Password" value={changePasswordRepeatInput} onChange={e => setChangePasswordRepeatInput(e.target.value)} onKeyPress={(event: any) => handleChangePasswordPageKeyPress(event)}/>
                        {
                            changePasswordRepeatInput !== "" &&
                            <div className="login-input-error">
                                {
                                    changePasswordsMatch() ?
                                    <CheckIcon style={{color: "green"}} /> :
                                    <CrossIcon style={{color: "red"}} />
                                }
                            </div>
                        }
                    </div>
                    {
                        changePasswordErrorMessage && <div className="login-error-message">{changePasswordErrorMessage}</div>
                    }
                    <button id="register-submit-button" className={`button ${isChangePasswordPageButtonDisabled && "disabled-button"}`} onClick={ () => { changePassword() } } disabled={isChangePasswordPageButtonDisabled}>Submit</button>
                    <div className="login-switch-button" onClick={() => setLoginScreenType(LoginScreenType.LOGIN)}>Login</div>
                </div>
            }
        </div>
    );
}