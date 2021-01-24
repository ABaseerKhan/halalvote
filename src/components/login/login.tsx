import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    RESET_PASSWORD_PAGE,
    LOADING_RESET_PASSWORD,
    RESET_PASSWORD_COMPLETE,
    RESET_PASSWORD_FAILURE,
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
    const [isResetPasswordPageButtonDisabled, setIsResetPasswordPageButtonDisabled] = useState<boolean>();

    const [loginUsernameInput, setLoginUsernameInput] = useState<string>("");
    const [loginPasswordInput, setLoginPasswordInput] = useState<string>("");
    const [loginErrorMessage, setLoginErrorMessage] = useState<string>("");

    const [registerEmailInput, setRegisterEmailInput] = useState<string>("");
    const [registerEmailInputAvailable, setRegisterEmailInputAvailable] = useState<boolean | undefined>(undefined);
    const [registerUsernameInput, setRegisterUsernameInput] = useState<string>("");
    const [registerUsernameInputAvailable, setRegisterUsernameInputAvailable] = useState<boolean | undefined>(undefined);
    const [registerPasswordInput, setRegisterPasswordInput] = useState<string>("");
    const [registerPasswordRepeatInput, setRegisterPasswordRepeatInput] = useState<string>("");
    const [registerErrorMessage, setRegisterErrorMessage] = useState<string>("");

    const [forgotPasswordPageEmailInput, setForgotPasswordPageEmailInput] = useState<string>("");
    const [forgotPasswordPageErrorMessage, setForgotPasswordPageErrorMessage] = useState<string>("");

    const [resetPasswordInput, setResetPasswordInput] = useState<string>("");
    const [resetPasswordRepeatInput, setResetPasswordRepeatInput] = useState<string>("");
    const [resetPasswordErrorMessage, setResetPasswordErrorMessage] = useState<string>("");

    const history = useHistory();
    const query = useQuery();

    const loginScreen = query.get("loginScreen") || undefined;
    const usernameParameter = query.get("username") || undefined;
    const activationValueParameter = query.get("activationValue") || undefined;
    const passwordResetTokenParameter = query.get("passwordResetToken") || undefined;

    const checkEmailAvailableTimeout = useRef<any>(undefined);
    const checkUsernameAvailableTimeout = useRef<any>(undefined);

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
        case "resetPasswordPage":
            loginScreenType = LoginScreenType.RESET_PASSWORD_PAGE;
            break;
        case "loadingResetPassword":
            loginScreenType = LoginScreenType.LOADING_RESET_PASSWORD;
            break;
        case "resetPasswordComplete":
            loginScreenType = LoginScreenType.RESET_PASSWORD_COMPLETE;
            break;
        case "resetPasswordFailure":
            loginScreenType = LoginScreenType.RESET_PASSWORD_FAILURE;
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
        } else if (loginScreenType === LoginScreenType.LOADING_RESET_PASSWORD) {
            makeResetPasswordCall();
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginScreenType]);

    useEffect(() => {
        setIsLoginButtonDisabled(loginUsernameInput === "" || loginPasswordInput === ""); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginUsernameInput, loginPasswordInput]);

    useEffect(() => {
        setIsRegisterButtonDisabled(!validRegisterEmail() || registerUsernameInput === "" || !validRegisterPassword() || !registerPasswordsMatch()); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registerEmailInput, registerUsernameInput, registerPasswordInput, registerPasswordRepeatInput]);

    useEffect(() => {
        if (checkUsernameAvailableTimeout.current !== undefined) {
            clearTimeout(checkUsernameAvailableTimeout.current);
        }
        if (registerUsernameInput !== "") {
            checkUsernameAvailableTimeout.current = setTimeout(() => {
                makeUsernameAvailableCall();
            }, 500);
        } else {
            setRegisterUsernameInputAvailable(undefined);
        }
    }, [registerUsernameInput]);

    useEffect(() => {
        if (checkEmailAvailableTimeout.current !== undefined) {
            clearTimeout(checkEmailAvailableTimeout.current);
        }
        if (registerEmailInput !== "") {
            checkEmailAvailableTimeout.current = setTimeout(() => {
                makeEmailAvailableCall();
            }, 500);
        } else {
            setRegisterEmailInputAvailable(undefined);
        }
    }, [registerEmailInput]);

    useEffect(() => {
        setIsForgotPasswordPageButtonDisabled(!validForgotPageEmail()); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forgotPasswordPageEmailInput]);

    useEffect(() => {
        setIsResetPasswordPageButtonDisabled(resetPasswordInput === "" || !validResetPassword() || !resetPasswordsMatch()); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetPasswordInput, resetPasswordRepeatInput]);

    const validEmail = (email: string) => {
        return /^.+@.*\.com$/.test(email);
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

    const validResetPassword = () => {
        return validPassword(resetPasswordInput);
    }

    const resetPasswordsMatch = () => {
        return resetPasswordInput === resetPasswordRepeatInput;
    }

    const updateURL = useCallback((loginScreen) => {
        if (loginScreen) {
            if (query.has('loginScreen')) {
                query.set('loginScreen', loginScreen);

                if (loginScreen !== 'loadingActivation' && loginScreen !== 'loadingResetPassword' && loginScreen !== 'resetPasswordPage') {
                    if (query.has('username')) {
                        query.delete('username');
                    }
                }
                
                if (loginScreen !== 'loadingActivation') {
                    if (query.has('activationValue')) {
                        query.delete('activationValue');
                    }
                }

                if (loginScreen !== 'loadingResetPassword' && loginScreen !== 'resetPasswordPage') {
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
        setResetPasswordErrorMessage("");

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
            case LoginScreenType.RESET_PASSWORD_PAGE:
                loginScreen = "resetPasswordPage";
                break;
            case LoginScreenType.LOADING_RESET_PASSWORD:
                loginScreen = "loadingResetPassword";
                break;
            case LoginScreenType.RESET_PASSWORD_COMPLETE:
                loginScreen = "resetPasswordComplete";
                break;
            case LoginScreenType.RESET_PASSWORD_FAILURE:
                loginScreen = "resetPasswordFailure";
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

    const resetPassword = () => {
        setLoginScreenType(LoginScreenType.LOADING_RESET_PASSWORD);
    }

    const makeResetPasswordCall = () => {
        const fetchData = async () => {
            const { status } = await postData({
                baseUrl: usersConfig.url,
                path: 'reset-password',
                data: {
                    "username": usernameParameter,
                    "newPassword": resetPasswordInput,
                    "resetToken": passwordResetTokenParameter
                },
                additionalHeaders: { }
            });

            if (status === 200) {
                setLoginScreenType(LoginScreenType.RESET_PASSWORD_COMPLETE);
            } else {
                setLoginScreenType(LoginScreenType.RESET_PASSWORD_FAILURE);
            }
        }

        fetchData();
    }

    const makeUsernameAvailableCall = () => {
        const makeCall = async () => {
            const { status, data } = await getData({ 
                baseUrl: usersConfig.url,
                path: 'username-available',
                queryParams: {
                    "username": registerUsernameInput
                },
                additionalHeaders: {},
            });

            if (status === 200) {
                setRegisterUsernameInputAvailable(data["available"]);
            } else {
                setRegisterUsernameInputAvailable(undefined);
            }
        }

        makeCall();
    }

    const makeEmailAvailableCall = () => {
        const makeCall = async () => {
            const { status, data } = await getData({ 
                baseUrl: usersConfig.url,
                path: 'email-available',
                queryParams: {
                    "email": registerEmailInput
                },
                additionalHeaders: {},
            });

            if (status === 200) {
                setRegisterEmailInputAvailable(data["available"]);
            } else {
                setRegisterEmailInputAvailable(undefined);
            }
        }

        makeCall();
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

    const handleResetPasswordPageKeyPress = (event: any) => {
        if (!isResetPasswordPageButtonDisabled && event.charCode === 13) {
            resetPassword();
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
                loginScreenType === LoginScreenType.LOADING_LOGIN || loginScreenType === LoginScreenType.LOADING_REGISTER || loginScreenType === LoginScreenType.LOADING_ACTIVATION || loginScreenType === LoginScreenType.LOADING_FORGOT_PASSWORD || loginScreenType === LoginScreenType.LOADING_RESET_PASSWORD ?
                <div>
                    <ClipLoader css={loaderCssOverride} size={50} color={"var(--light-neutral-color)"} />
                </div> :
                loginScreenType === LoginScreenType.REGISTER_COMPLETE ?
                <div className="login-body">
                    <div className="login-section-text">Successfully created account for Halal Vote!</div>
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
                loginScreenType === LoginScreenType.RESET_PASSWORD_COMPLETE ?
                <div className="login-body">
                    <div className="login-section-text">Successfully reset password!</div>
                    <div className="login-section-text">Click <span className="login-link" onClick={() => setLoginScreenType(LoginScreenType.LOGIN)}>here</span> to login.</div>
                </div> :
                loginScreenType === LoginScreenType.RESET_PASSWORD_FAILURE ?
                <div className="login-body">
                    <div className="login-section-text">Failed to reset password.</div>
                </div> :
                loginScreenType === LoginScreenType.FORGOT_PASSWORD_COMPLETE ?
                <div className="login-body">
                    <div className="login-section-text">Check your email to reset password.</div>
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
                    <div className="login-section-text">Create Account</div>
                    <div className="login-input-container">
                        <input id="register-username-input" className="login-input" type="text" placeholder="Username" value={registerUsernameInput} onChange={e => setRegisterUsernameInput(e.target.value)} onKeyPress={(event: any) => handleRegisterKeyPress(event)}/>
                        {
                            registerUsernameInputAvailable !== undefined &&
                            <div className="login-input-error">
                                {
                                    registerUsernameInputAvailable ?
                                    <CheckIcon style={{color: "green"}} /> :
                                    <CrossIcon style={{color: "red"}} />
                                }
                            </div>
                        }
                    </div>
                    <div className="login-input-container">
                        <input id="register-email-input" className="login-input" type="text" placeholder="Email" value={registerEmailInput} onChange={e => setRegisterEmailInput(e.target.value)} onKeyPress={(event: any) => handleRegisterKeyPress(event)}/>
                        {
                            registerEmailInput !== "" && registerEmailInputAvailable !== undefined &&
                            <div className="login-input-error">
                                {
                                    validRegisterEmail() && registerEmailInputAvailable ?
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
                    <button id="register-submit-button" className={`button ${isRegisterButtonDisabled && "disabled-button"}`} onClick={ () => { registerUser() } } disabled={isRegisterButtonDisabled}>Submit</button>
                    <div className="login-switch-button" onClick={() => setLoginScreenType(LoginScreenType.LOGIN)}>Already have an account?<br/>Log in here.</div>
                </div> :
                loginScreenType === LoginScreenType.FORGOT_PASSWORD_PAGE ?
                <div className="login-body">
                    <div className="login-section-text">Enter email to reset password</div>
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
                    <div className="login-section-text">{`Reset Password for ${usernameParameter}`}</div>
                    <div className="login-input-container">
                        <input className="login-input" type="password" placeholder="New Password" value={resetPasswordInput} onChange={e => setResetPasswordInput(e.target.value)} onKeyPress={(event: any) => handleResetPasswordPageKeyPress(event)}/>
                        {
                            resetPasswordInput !== "" &&
                            <div className="login-input-error">
                                {
                                    validResetPassword() ?
                                    <CheckIcon style={{color: "green"}} /> :
                                    <CrossIcon style={{color: "red"}} />
                                }
                            </div>
                        }
                    </div>
                    <div className="login-input-container">
                        <input className="login-input" type="password" placeholder="Retype New Password" value={resetPasswordRepeatInput} onChange={e => setResetPasswordRepeatInput(e.target.value)} onKeyPress={(event: any) => handleResetPasswordPageKeyPress(event)}/>
                        {
                            resetPasswordRepeatInput !== "" &&
                            <div className="login-input-error">
                                {
                                    resetPasswordsMatch() ?
                                    <CheckIcon style={{color: "green"}} /> :
                                    <CrossIcon style={{color: "red"}} />
                                }
                            </div>
                        }
                    </div>
                    {
                        resetPasswordErrorMessage && <div className="login-error-message">{resetPasswordErrorMessage}</div>
                    }
                    <button id="register-submit-button" className={`button ${isResetPasswordPageButtonDisabled && "disabled-button"}`} onClick={ () => { resetPassword() } } disabled={isResetPasswordPageButtonDisabled}>Submit</button>
                    <div className="login-switch-button" onClick={() => setLoginScreenType(LoginScreenType.LOGIN)}>Login</div>
                </div>
            }
        </div>
    );
}