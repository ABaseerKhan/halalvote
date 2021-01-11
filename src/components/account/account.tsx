import React, { useEffect, useState } from 'react';
import { vhToPixels } from '../../utils';
import { modalHeightVh } from '../..';
import { useCookies } from 'react-cookie';
import { ReactComponent as LeftArrowSVG } from "../../icons/left-arrow.svg";
import { ReactComponent as CheckIcon} from '../../icons/check-icon.svg'
import { ReactComponent as CrossIcon} from '../../icons/cross-icon.svg'
import { css } from "@emotion/core";
import ClipLoader from "react-spinners/ClipLoader";
import { postData } from '../../https-client/client';
import { usersConfig } from '../../https-client/config';

// styles
import './account.css';

enum AccountPage {
    OPTIONS,
    LOADING_CHANGE_PASSWORD,
    CHANGE_PASSWORD,
    LOADING_DELETE_ACCOUNT,
    DELETE_ACCOUNT
}

interface AccountPageProps {
    closeModal: any,
}

interface ChangePasswordState {
    currentPassword: string,
    newPassword: string,
    repeatNewPassword: string,
    isChangePasswordSubmitButtonDisabled: boolean,
    changePasswordErrorMessage: string
}

export const AccountComponent = (props: AccountPageProps) => {

    const {closeModal} = props;

    const [accountPage, setAccountPage] = useState<AccountPage>(AccountPage.OPTIONS);

    const [changePasswordState, setChangePasswordState] = useState<ChangePasswordState>({
        currentPassword: "",
        newPassword: "",
        repeatNewPassword: "",
        isChangePasswordSubmitButtonDisabled: true,
        changePasswordErrorMessage: ""
    });
    const {currentPassword, newPassword, repeatNewPassword, isChangePasswordSubmitButtonDisabled, changePasswordErrorMessage} = changePasswordState;

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
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountPage]);

    const setCurrentPasswordInput = (currentPassword: string) => {
        setChangePasswordState({...changePasswordState, currentPassword: currentPassword});
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
                    "currentPassword": currentPassword,
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

    const handleChangePasswordPageKeyPress = (event: any) => {
        if (!isChangePasswordSubmitButtonDisabled && event.charCode === 13) {
            changePassword();
        }
    }

    const cancelAccountAction = () => {
        setChangePasswordState({
            currentPassword: "",
            newPassword: "",
            repeatNewPassword: "",
            isChangePasswordSubmitButtonDisabled: true,
            changePasswordErrorMessage: ""
        });
        setAccountPage(AccountPage.OPTIONS);
    }

    const loaderCssOverride = css`
        position: absolute;
        top: calc(50% - 25px);
        left: calc(50% - 25px);
    `;

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
                                <input className="change-password-input" type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPasswordInput(e.target.value)} onKeyPress={e => handleChangePasswordPageKeyPress(e)}/>
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
                        accountPage === AccountPage.DELETE_ACCOUNT &&
                        <div>Are you sure you want to delete Account? Your username will no longer be available.</div>
                    }
                </div>
            }
        </div>
    );
}