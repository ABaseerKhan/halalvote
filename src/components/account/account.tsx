import React, { useContext, useEffect, useState } from 'react';
import { vhToPixels } from '../../utils';
import { modalHeightVh } from '../..';
import { useCookies } from 'react-cookie';
import { ReactComponent as LeftArrowSVG } from "../../icons/left-arrow.svg";
import { ReactComponent as CheckIcon} from '../../icons/check-icon.svg'
import { ReactComponent as CrossIcon} from '../../icons/cross-icon.svg'
import ClipLoader from "react-spinners/ClipLoader";
import { postData } from '../../https-client/client';
import { usersConfig } from '../../https-client/config';

// styles
import './account.css';
import { loaderCssOverride } from '../topic-media/topic-media';
import { closeModalContext } from '../modal/modal';

enum AccountPage {
    OPTIONS,
    LOADING_CHANGE_PASSWORD,
    CHANGE_PASSWORD,
    LOADING_DELETE_ACCOUNT,
    DELETE_ACCOUNT,
    DELETE_ACCOUNT_FAILURE
}

interface AccountPageProps {
}

interface ChangePasswordState {
    changePasswordCurrent: string,
    newPassword: string,
    repeatNewPassword: string,
    isChangePasswordSubmitButtonDisabled: boolean,
    changePasswordErrorMessage: string
}

export const AccountComponent = (props: AccountPageProps) => {
    const { closeModal } = useContext(closeModalContext);

    const [accountPage, setAccountPage] = useState<AccountPage>(AccountPage.OPTIONS);

    const [changePasswordState, setChangePasswordState] = useState<ChangePasswordState>({
        changePasswordCurrent: "",
        newPassword: "",
        repeatNewPassword: "",
        isChangePasswordSubmitButtonDisabled: true,
        changePasswordErrorMessage: ""
    });
    const {changePasswordCurrent, newPassword, repeatNewPassword, isChangePasswordSubmitButtonDisabled, changePasswordErrorMessage} = changePasswordState;

    const [deleteAccountCurrentPasswordInput, setDeleteAccountCurrentPasswordInput] = useState<string>("");
    

    // eslint-disable-next-line
    const [cookies, setCookie, removeCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    useEffect(() => {
        const changePasswordSubmitButtonDisabled = !validNewPassword() || !changePasswordsMatch();
        changePasswordSubmitButtonDisabled !== isChangePasswordSubmitButtonDisabled && setChangePasswordState({
            ...changePasswordState,
            isChangePasswordSubmitButtonDisabled: changePasswordSubmitButtonDisabled
        }); // eslint-disable-next-line
    }, [changePasswordState]);

    useEffect(() => {
        if (accountPage === AccountPage.LOADING_CHANGE_PASSWORD) {
            makeChangePasswordCall();
        } else if (accountPage === AccountPage.LOADING_DELETE_ACCOUNT) {
            makeDeleteAccountCall();
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountPage]);

    const setChangePasswordCurrentInput = (changePasswordCurrent: string) => {
        setChangePasswordState({...changePasswordState, changePasswordCurrent: changePasswordCurrent});
    }

    const setNewPasswordInput = (newPassword: string) => {
        setChangePasswordState({...changePasswordState, newPassword: newPassword});
    }

    const setRepeatNewPasswordInput = (repeatNewPassword: string) => {
        setChangePasswordState({...changePasswordState, repeatNewPassword: repeatNewPassword});
    }

    const validNewPassword = () => {
        return newPassword !== "";
    }

    const changePasswordsMatch = () => {
        return newPassword === repeatNewPassword;
    }

    const changePassword = () => {
        setAccountPage(AccountPage.LOADING_CHANGE_PASSWORD);
    }

    const makeChangePasswordCall = () => {
        const fetchData = async () => {
            const { status, data } = await postData({
                baseUrl: usersConfig.url,
                path: 'change-password',
                data: {
                    "username": username,
                    "currentPassword": changePasswordCurrent,
                    "newPassword": newPassword
                },
                additionalHeaders: { 
                    sessionToken: sessiontoken
                }
            });

            if (status === 200) {
                removeCookie("username"); 
                removeCookie("sessiontoken");
                closeModal();
            } else {
                setAccountPage(AccountPage.CHANGE_PASSWORD);
                setChangePasswordState({
                    ...changePasswordState,
                    changePasswordErrorMessage: data.message
                })
            }
        }

        fetchData();
    }

    const deleteAccount = () => {
        setAccountPage(AccountPage.LOADING_DELETE_ACCOUNT);
    }

    const makeDeleteAccountCall = () => {
        const fetchData = async () => {
            const { status } = await postData({
                baseUrl: usersConfig.url,
                path: 'delete-account',
                data: {
                    "username": username,
                    "password": deleteAccountCurrentPasswordInput
                },
                additionalHeaders: { 
                    sessionToken: sessiontoken
                }
            });

            if (status === 200) {
                removeCookie("username"); 
                removeCookie("sessiontoken");
                closeModal();
            } else {
                setDeleteAccountCurrentPasswordInput("");
                setAccountPage(AccountPage.DELETE_ACCOUNT_FAILURE);
            }
        }

        fetchData();
    }

    const handleChangePasswordPageKeyPress = (event: any) => {
        if (!isChangePasswordSubmitButtonDisabled && event.charCode === 13) {
            changePassword();
        }
    }

    const cancelAccountAction = () => {
        setChangePasswordState({
            changePasswordCurrent: "",
            newPassword: "",
            repeatNewPassword: "",
            isChangePasswordSubmitButtonDisabled: true,
            changePasswordErrorMessage: ""
        });
        setAccountPage(AccountPage.OPTIONS);
    }


    return (
        <div className="account-container" style={{ height: `${vhToPixels(modalHeightVh)}px`}}>
            {
                accountPage === AccountPage.LOADING_CHANGE_PASSWORD || accountPage === AccountPage.LOADING_DELETE_ACCOUNT ?
                    <div>
                        <ClipLoader css={loaderCssOverride} size={50} color={"var(--light-neutral-color)"} />
                    </div> :
                <div>
                    <div className="account-title">{`${username}`}</div>
                    {
                        accountPage !== AccountPage.OPTIONS &&
                            <LeftArrowSVG className='cancel-account-action' onClick={cancelAccountAction}/>
                    }
                    {
                        accountPage === AccountPage.OPTIONS ?
                            <div>
                                <button className="button" onClick={() => setAccountPage(AccountPage.CHANGE_PASSWORD)}>Change Password</button>
                                <button className="button caution-button" onClick={() => setAccountPage(AccountPage.DELETE_ACCOUNT)}>Delete Account</button>
                            </div> :
                        accountPage === AccountPage.CHANGE_PASSWORD ?
                            <div className="change-password-container">
                                <input className="change-password-input" type="password" placeholder="Current Password" value={changePasswordCurrent} onChange={e => setChangePasswordCurrentInput(e.target.value)} onKeyPress={e => handleChangePasswordPageKeyPress(e)}/>
                                <div className="change-password-input-container">
                                    <input className="change-password-input" type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPasswordInput(e.target.value)} onKeyPress={e => handleChangePasswordPageKeyPress(e)}/>
                                    {
                                        newPassword !== "" &&
                                        <div className="change-password-input-error">
                                            {
                                                validNewPassword() ?
                                                <CheckIcon style={{color: "green"}} /> :
                                                <CrossIcon style={{color: "red"}} />
                                            }
                                        </div>
                                    }
                                </div>
                                <div className="change-password-input-container">
                                    <input className="change-password-input" type="password" placeholder="Repeat Password" value={repeatNewPassword} onChange={e => setRepeatNewPasswordInput(e.target.value)} onKeyPress={e => handleChangePasswordPageKeyPress(e)}/>
                                    {
                                        repeatNewPassword !== "" &&
                                        <div className="change-password-input-error">
                                            {
                                                changePasswordsMatch() ?
                                                <CheckIcon style={{color: "green"}} /> :
                                                <CrossIcon style={{color: "red"}} />
                                            }
                                        </div>
                                    }
                                </div>
                                {
                                    changePasswordErrorMessage && <div className="change-password-error-message">{changePasswordErrorMessage}</div>
                                }
                                <button className={`button ${isChangePasswordSubmitButtonDisabled && "disabled-button"}`} onClick={ () => { changePassword() } } disabled={isChangePasswordSubmitButtonDisabled}>Change Password</button>
                            </div> :
                        accountPage === AccountPage.DELETE_ACCOUNT ?
                        <div>
                            <div className="delete-account-message">Are you sure you want to delete your account? Your email and username will no longer be available.</div>
                            <div className="delete-account-message">Type in your password to delete account.</div>
                            <input className="change-password-input" type="password" placeholder="Password" value={deleteAccountCurrentPasswordInput} onChange={e => setDeleteAccountCurrentPasswordInput(e.target.value)}/>
                            <button className={`button ${deleteAccountCurrentPasswordInput === "" ? "disabled-button" : "caution-button"}`} onClick={ () => { deleteAccount() } } disabled={deleteAccountCurrentPasswordInput === ""}>Delete Account</button>
                        </div> :
                        accountPage === AccountPage.DELETE_ACCOUNT_FAILURE &&
                        <div>
                            <div className="delete-account-message">There was an error deleting your account.</div>
                        </div>                        
                    }
                </div>
            }
        </div>
    );
}