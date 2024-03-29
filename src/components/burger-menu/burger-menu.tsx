
import { slide as Menu } from 'react-burger-menu'
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ModalComponent } from '../modal/modal';
import { useCookies } from 'react-cookie';
import { Portal } from '../../index';
import { useHistory,} from "react-router-dom";
import { useQuery } from '../../hooks/useQuery';
import { isMobile, replaceHistory } from '../../utils';
import HomeIcon from '@material-ui/icons/Home';
import AddIcon from '@material-ui/icons/Add';
import ContactMailIcon from '@material-ui/icons/ContactMail';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import InfoIcon from '@material-ui/icons/Info';
import InputIcon from '@material-ui/icons/Input';
import PersonIcon from '@material-ui/icons/Person';
import LockIcon from '@material-ui/icons/Lock';

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

    const menuBottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (menuBottomRef?.current) {
            menuBottomRef.current.classList.remove("bm-item");
        }
    }, [])

    useEffect(() => {
        if (query.has('loginScreen')) {
            state.modalItemSelected !== ModalType.LOGIN && setState({...state, modalItemSelected: ModalType.LOGIN});
        } else if (query.has('userProfile')) {
            state.modalItemSelected !== ModalType.PROFILE && setState({...state, modalItemSelected: ModalType.PROFILE});
        } else if (query.has('contactUs')) {
            state.modalItemSelected !== ModalType.CONTACT && setState({...state, modalItemSelected: ModalType.CONTACT});
        } else if (query.has('about')) {
            state.modalItemSelected !== ModalType.ABOUT && setState({...state, modalItemSelected: ModalType.ABOUT});
        } else if (query.has('dataPolicy')) {
            state.modalItemSelected !== ModalType.DATA_POLICY && setState({...state, modalItemSelected: ModalType.DATA_POLICY});
        } else if (state.modalItemSelected === ModalType.LOGIN || state.modalItemSelected === ModalType.PROFILE || state.modalItemSelected === ModalType.CONTACT || state.modalItemSelected === ModalType.DATA_POLICY || state.modalItemSelected === ModalType.ABOUT) {
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
            case ModalType.ABOUT:
                if (additionalQuery) {
                    if (query.has('about')) {
                        query.set('about', additionalQuery);
                    } else {
                        query.append('about', additionalQuery);
                    }
                } else {
                    if (query.has('about')) {
                        query.delete('about');
                    }
                }
                break;
            case ModalType.DATA_POLICY:
                if (additionalQuery) {
                    if (query.has('dataPolicy')) {
                        query.set('dataPolicy', additionalQuery);
                    } else {
                        query.append('dataPolicy', additionalQuery);
                    };
                } else {
                    if (query.has('dataPolicy')) {
                        query.delete('dataPolicy');
                    }
                }
                break;
            default:
                return;
        }

        replaceHistory(history, query);
    }, [history, query]);

    const goHome = () => {
        history.replace('/');
        history.go(0);
        setMenuOpenState(false);
    }

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
                <li className="menu-item" onClick={goHome}><HomeIcon style={{marginRight: "10px"}}/> Home</li>
                <li className="menu-item" style={{ borderBottom: '1px solid gray' }} onClick={() => { setMenuOpenState(false); setAddTopicDisplayed(true); }}><AddIcon style={{marginRight: "10px"}}/> Add topic</li>
                <li className="menu-item" onClick={() => { setMenuOpenState(false); updateUrl(ModalType.CONTACT, "shown"); }}><ContactMailIcon style={{marginRight: "10px"}}/> Contact us</li>
                <li className="menu-item" onClick={() => { setMenuOpenState(false); updateUrl(ModalType.ABOUT, "shown"); }}><InfoIcon style={{marginRight: "10px"}} /> About</li>
                <li className="menu-item" style={{ borderBottom: '1px solid gray' }} onClick={() => { setMenuOpenState(false); updateUrl(ModalType.DATA_POLICY, "shown"); }}><LockIcon style={{marginRight: "10px"}}/>Data policy</li>
                <div ref={menuBottomRef} className="menu-item-bottom-section">
                    {usernameExists() && <div className={"bm-item menu-item"} onClick={() => { setMenuOpenState(false); updateUrl(ModalType.PROFILE, username); }}><PersonIcon style={{marginRight: "10px"}}/> {username}</div>}
                    {usernameExists() && <li className="bm-item menu-item" onClick={() => { setMenuOpenState(false); setAccountDisplayed(true); }}><AccountBoxIcon style={{marginRight: "10px"}}/>Account</li>}
                    <li className="bm-item menu-item" onClick={login}>{ usernameExists() ? <ExitToAppIcon style={{marginRight: "10px"}}/> : <InputIcon style={{marginRight: "10px"}}/> }  { usernameExists() ? "Logout" : "Login" }</li>
                </div>
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
                state.modalItemSelected === ModalType.CONTACT ?
                    <Portal><ModalComponent removeModal={() => updateUrl(ModalType.CONTACT, undefined)} modalType={ModalType.CONTACT}/></Portal> :
                state.modalItemSelected === ModalType.ABOUT ?
                    <Portal><ModalComponent removeModal={() => updateUrl(ModalType.ABOUT, undefined)} modalType={ModalType.ABOUT}/></Portal> :
                state.modalItemSelected === ModalType.DATA_POLICY &&
                    <Portal><ModalComponent removeModal={() => updateUrl(ModalType.DATA_POLICY, undefined)} modalType={ModalType.DATA_POLICY}/></Portal>
            }
        </>
    );
}