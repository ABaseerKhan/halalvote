
import { slide as Menu } from 'react-burger-menu'
import React, { useCallback, useEffect, useState } from 'react';
import { ModalComponent } from '../modal/modal';
import { useCookies } from 'react-cookie';
import { Portal } from '../../index';
import { 
    useHistory,
} from "react-router-dom";
import { useQuery } from '../../hooks/useQuery';
import { isMobile, replaceHistory } from '../../utils';

// type imports
import { ModalType } from '../../types';

import './burger-menu.css';

interface BurgerMenuComponentProps {
    fetchTopics: any,
};
interface BurgerMenuComponentState {
    modalItemSelected: ModalType | undefined
};
export const BurgerMenuComponent = (props: BurgerMenuComponentProps) => {
    const { fetchTopics } = props;

    const history = useHistory();
    const query = useQuery();
    const userProfile = query.get("userProfile") || undefined;

    // eslint-disable-next-line
    const [cookies, setCookie, removeCookie] = useCookies(['username', 'sessiontoken']);
    const { username } = cookies;

    const [menuOpenState, setMenuOpenState] = useState(false);
    const [state, setState] = useState<BurgerMenuComponentState>({
        modalItemSelected: undefined,
    });

    useEffect(() => {
        if (query.has('loginScreen')) {
            state.modalItemSelected !== ModalType.LOGIN && setState({...state, modalItemSelected: ModalType.LOGIN});
        } else if (query.has('userProfile')) {
            state.modalItemSelected !== ModalType.PROFILE && setState({...state, modalItemSelected: ModalType.PROFILE});
        } else if (query.has('contactUs')) {
            state.modalItemSelected !== ModalType.CONTACT && setState({...state, modalItemSelected: ModalType.CONTACT});
        } else if (state.modalItemSelected === ModalType.LOGIN || state.modalItemSelected === ModalType.PROFILE || state.modalItemSelected === ModalType.CONTACT) {
            setState({...state, modalItemSelected: undefined});
        } // eslint-disable-next-line
    }, [history, query]);

    const updateUrl = useCallback((menuItem: ModalType, additionalQuery: string | undefined) => {
        switch (menuItem) {
            case ModalType.LOGIN:
                if (additionalQuery) {
                    if (query.has('loginScreen')) {
                        query.set('loginScreen', additionalQuery);
                    } else {
                        query.append('loginScreen', additionalQuery);
                    };
                } else {
                    if (query.has('loginScreen')) {
                        query.delete('loginScreen');
                    }
                    if (query.has('username')) {
                        query.delete('username');
                    }
                    if (query.has('activationValue')) {
                        query.delete('activationValue');
                    }
                }
                break;
            case ModalType.PROFILE:
                if (additionalQuery) {
                    if (query.has('userProfile')) {
                        query.set('userProfile', additionalQuery);
                    } else {
                        query.append('userProfile', additionalQuery);
                    };
                } else {
                    if (query.has('userProfile')) {
                        query.delete('userProfile');
                    }
                }
                break;
            case ModalType.CONTACT:
                if (additionalQuery) {
                    if (query.has('contactUs')) {
                        query.set('contactUs', additionalQuery);
                    } else {
                        query.append('contactUs', additionalQuery);
                    };
                } else {
                    if (query.has('contactUs')) {
                        query.delete('contactUs');
                    }
                }
                break;
            default:
                return;
        }

        replaceHistory(history, query);
    }, [history, query]);

    const usernameExists = () => {
        return username && username !== "";
    }

    const setLoginDisplayed = (loginDisplayed: boolean) => {
        if (loginDisplayed) {
            updateUrl(ModalType.LOGIN, 'login');
        } else {
            updateUrl(ModalType.LOGIN, undefined);
        }
    }

    const setAddTopicDisplayed = (addTopicDisplayed: boolean) => {
        setState(prevState => ({ ...prevState, modalItemSelected: addTopicDisplayed ? ModalType.ADD_TOPIC : undefined }));
    }

    const setAccountDisplayed = (accountDisplayed: boolean) => {
        setState(prevState => ({ ...prevState, modalItemSelected: accountDisplayed ? ModalType.ACCOUNT : undefined }));
    }

    const login = () => {
        if (usernameExists()) {
            removeCookie("username"); 
            removeCookie("sessiontoken");
        } else {
            setLoginDisplayed(true);
        }
        setMenuOpenState(false);
    }

    return (
        <>
            <Menu 
                itemListElement="div"
                width={isMobile ? 200 : 300}
                isOpen={menuOpenState}
                onStateChange={(newState) => setMenuOpenState(newState.isOpen)}
            >
                <li className="menu-item" onClick={() => { setMenuOpenState(false); updateUrl(ModalType.CONTACT, "shown"); }}>Contact us</li>
                <li onClick={() => { setMenuOpenState(false); setAddTopicDisplayed(true); }}>Add topic</li>
                {usernameExists() && <li className="menu-item" onClick={() => { setMenuOpenState(false); setAccountDisplayed(true); }}>Account</li>}
                <li className="menu-item" onClick={login}>{ usernameExists() ? "Logout" : "Login" }</li>
                {usernameExists() && <div className={"username-tile"} onClick={() => { setMenuOpenState(false); updateUrl(ModalType.PROFILE, username); }}>{username}</div>}
            </Menu>
            {
                state.modalItemSelected ===  ModalType.LOGIN ?
                    <Portal><ModalComponent removeModal={() => setLoginDisplayed(false)} modalType={ModalType.LOGIN}/></Portal> :
                state.modalItemSelected ===  ModalType.ADD_TOPIC ?
                    <Portal><ModalComponent removeModal={() => setAddTopicDisplayed(false)} modalType={ModalType.ADD_TOPIC} fetchTopics={fetchTopics}/></Portal> :
                state.modalItemSelected === ModalType.PROFILE ?
                    <Portal><ModalComponent removeModal={() => updateUrl(ModalType.PROFILE, undefined)} modalType={ModalType.PROFILE} fetchTopics={fetchTopics} accountUsername={userProfile}/></Portal> :
                state.modalItemSelected ===  ModalType.ACCOUNT ?
                    <Portal><ModalComponent removeModal={() => setAccountDisplayed(false)} modalType={ModalType.ACCOUNT}/></Portal> :
                state.modalItemSelected === ModalType.CONTACT &&
                    <Portal><ModalComponent removeModal={() => updateUrl(ModalType.CONTACT, undefined)} modalType={ModalType.CONTACT}/></Portal>
            }
        </>
    );
}