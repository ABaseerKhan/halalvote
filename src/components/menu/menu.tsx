import React, { useState, useEffect, useCallback } from 'react';
import { ModalComponent } from '../modal/modal';
import { useMedia } from '../../hooks/useMedia';
import { useCookies } from 'react-cookie';
import { Portal } from '../../index';
import { 
    useHistory,
} from "react-router-dom";
import { useQuery } from '../../hooks/useQuery';

// type imports
import { ModalType, MenuLocation } from '../../types';

// styles
import './menu.css';

const menuId = "menu";
const menuButtonId = "menu-button";
const menuButtonInteriorId = "menu-button-interior";

interface MenuComponentProps {
    fetchTopics: any,
    showSpecificComment?: any,
};
interface MenuComponentState {
    menuLocation: MenuLocation, 
    addTopicDisplayed: boolean,
}
export const MenuComponent = (props: MenuComponentProps) => {
    const { fetchTopics } = props;
    const history = useHistory();
    const query = useQuery();
    const userProfile = query.get("userProfile") || undefined;
    const loginScreen = query.get("loginScreen") || undefined;
    // eslint-disable-next-line
    const [cookies, setCookie, removeCookie] = useCookies(['username', 'sessiontoken']);
    const { username } = cookies;

    const [state, setState] = useState<MenuComponentState>({
        menuLocation: MenuLocation.NONE,
        addTopicDisplayed: false,
    });

    const isMobile = useMedia(
        // Media queries
        ['(max-width: 600px)'],
        [true],
        // default value
        false
    );

    const menuWidth = isMobile ? 60 : 75;
    const menuWidthExpanded = isMobile ? 120 : 150;

    const menuHeight = menuWidth;
    const menuButtonWidth = menuWidth;
    const menuButtonInteriorPadding = menuWidth / 6;
    const menuButtonInteriorWidth = menuWidth - (menuButtonInteriorPadding * 4);
    const menuButtonWidthExpanded = menuButtonWidth;
    const menuButtonInteriorWidthExpanded = menuWidthExpanded - (menuButtonInteriorPadding * 4);
    const menuButtonInteriorMargin = (menuButtonWidth - menuButtonInteriorWidth - (menuButtonInteriorPadding * 2)) / 2;
    const menuButtonInteriorFontSize = menuWidth / 5;

    useEffect(() => {
        const menu = document.getElementById(menuId);
        const menuButton = document.getElementById(menuButtonId);
        const menuButtonInterior = document.getElementById(menuButtonInteriorId);

        if (menu && menuButton && menuButtonInterior && state.menuLocation !== MenuLocation.NONE) {
            if (usernameExists()) {
                menuButtonInterior.animate([
                    {width: menuButtonInteriorWidthExpanded + "px"}
                ], {
                    duration: 50,
                    fill: "forwards"
                });
                menuButton.animate([
                    {width: menuButtonWidthExpanded + "px"}
                ], {
                    duration: 50,
                    fill: "forwards"
                });
            }
            menu.animate([
                {height: 'unset', width: menuWidthExpanded + "px"}
            ], {
                duration: 50,
                fill: "forwards"
            });
        } // eslint-disable-next-line
    }, [state.menuLocation]);

    const updateUrl = useCallback((userProfile, loginScreen) => {
        if (userProfile) {
            if (query.has('userProfile')) {
                query.set('userProfile', userProfile);
            } else {
                query.append('userProfile', userProfile);
            };
        } else {
            if (query.has('userProfile')) {
                query.delete('userProfile');
            }
        }
        
        if (loginScreen) {
            if (query.has('loginScreen')) {
                query.set('loginScreen', 'login');
            } else {
                query.append('loginScreen', 'login');
            };
        } else {
            if (query.has('loginScreen')) {
                query.delete('loginScreen');
            }
        }

        history.push({
            search: "?" + query.toString()
        });
    }, [history, query]);

    const usernameExists = () => {
        return username && username !== "";
    }

    const setLoginDisplayed = (loginDisplayed: boolean) => {
        closeMenu({...state, menuLocation: MenuLocation.NONE}, () => {
            if (loginDisplayed) {
                updateUrl(undefined, 'login');
            } else {
                updateUrl(undefined, undefined);
            }
        });
    }

    const setAddTopicDisplayed = (addTopicDisplayed: boolean) => {
        closeMenu({...state, menuLocation: MenuLocation.NONE, addTopicDisplayed: addTopicDisplayed}, () => {});
    }

    const setAccountDisplayed = (accountDisplayed: boolean) => {
        closeMenu({...state, menuLocation: MenuLocation.NONE}, () => { 
            if (accountDisplayed) {
                updateUrl(username, undefined);
            } else {
                updateUrl(undefined, undefined);
            };
        });
    }

    const setMenuLocation = (menuLocation: MenuLocation) => {
        closeMenu({...state, menuLocation: menuLocation}, () => {});
    }

    const closeMenu = (state: MenuComponentState, onfinish: () => void) => {
        const menu = document.getElementById(menuId);
        const menuButton = document.getElementById(menuButtonId);
        const menuButtonInterior = document.getElementById(menuButtonInteriorId);

        if (menu && menuButton && menuButtonInterior && state.menuLocation === MenuLocation.NONE) {
            menuButtonInterior.animate([
                {width: menuButtonInteriorWidth + "px"}
            ], {
                duration: 50,
                fill: "forwards"
            });
            menuButton.animate([
                {width: menuButtonWidth + "px"}
            ], {
                duration: 50,
                fill: "forwards"
            });
            menu.animate([
                {height: menuHeight + "px", width: menuWidth + "px"}
            ], {
                duration: 50,
                fill: "forwards"
            }).onfinish = () => {
                setState(state);
                onfinish();
            }
            menu.style.animation = "pulse 3s infinite cubic-bezier(.16,-0.02,0,1.31)";
        } else {
            setState(state);
            onfinish();
        }
    }

    const menu = document.getElementById(menuId);
    const menuButton = document.getElementById(menuButtonId);
    const menuButtonInterior = document.getElementById(menuButtonInteriorId);

    const pressButton = () => {
        if (state.menuLocation === MenuLocation.NONE) {
            if (menuButton) {
                const rect = menuButton.getBoundingClientRect();
                let newMenuLocation = MenuLocation.NONE;

                if (rect.x > (window.innerWidth/2 - rect.width/2) && rect.y > (window.innerHeight/2 - rect.height/2)) {
                    newMenuLocation = MenuLocation.UPPER_LEFT;
                } else if (rect.x < (window.innerWidth/2 - rect.width/2) && rect.y > (window.innerHeight/2 - rect.height/2)) {
                    newMenuLocation = MenuLocation.UPPER_RIGHT;
                } else if (rect.x < (window.innerWidth/2 - rect.width/2) && rect.y < (window.innerHeight/2 - rect.height/2)) {
                    newMenuLocation = MenuLocation.BOTTOM_RIGHT;
                } else if (rect.x > (window.innerWidth/2 - rect.width/2) && rect.y < (window.innerHeight/2 - rect.height/2)) {
                    newMenuLocation = MenuLocation.BOTTOM_LEFT;
                }

                setMenuLocation(newMenuLocation);
            }
        } else {
            setMenuLocation(MenuLocation.NONE);
        }
    }

    const login = () => {
        if (usernameExists()) {
            closeMenu({...state, menuLocation: MenuLocation.NONE}, () => {
                removeCookie("username"); 
                removeCookie("sessiontoken");
            });
        } else {
            setLoginDisplayed(true);
        }
    }

    const boundVertical = (position: number, element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        return Math.min(window.innerHeight - rect.height, Math.max(position, 0));
    }

    const boundHorizontal = (position: number, element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        return Math.min(window.innerWidth - rect.width, Math.max(position, 0));
    }

    document.onclick = (event: MouseEvent) => {
        if (state.menuLocation !== MenuLocation.NONE) {
            const path = event.composedPath();
            let menuFound = false;
            for (let i in path) {
                if ((path[i] as HTMLElement).id === menuId) {
                    menuFound = true;
                }
            }
            if (!menuFound) setMenuLocation(MenuLocation.NONE);
        }
    }

    if (menu && menuButton && menuButtonInterior) {
        if (isMobile) {
            menuButton.ontouchmove = (event: TouchEvent) => {
                event.preventDefault();
                event.stopPropagation();
                const touchLocation = event.targetTouches[0];
                const yOffset = menuHeight / 2;
                const xOffset = (usernameExists() ? menuWidthExpanded : menuWidth) / 2;

                switch(state.menuLocation) {
                    case MenuLocation.UPPER_LEFT:
                        menu.style.top = "unset";
                        menu.style.right = boundHorizontal(Math.round(window.innerWidth - touchLocation.pageX - xOffset), menu) + "px";
                        menu.style.bottom = boundVertical(Math.round(window.innerHeight - touchLocation.pageY - yOffset), menu) + "px";
                        menu.style.left = "unset";
                        break;
                    case MenuLocation.UPPER_RIGHT:
                        menu.style.top = "unset";
                        menu.style.right = "unset";
                        menu.style.bottom = boundVertical(Math.round(window.innerHeight - touchLocation.pageY - yOffset), menu) + "px";
                        menu.style.left = boundHorizontal(touchLocation.pageX - xOffset, menu) + "px";
                        break;
                    case MenuLocation.BOTTOM_LEFT:
                        menu.style.top = boundVertical(touchLocation.pageY - yOffset, menu) + "px";
                        menu.style.right = boundHorizontal(Math.round(window.innerWidth - touchLocation.pageX - xOffset), menu) + "px";
                        menu.style.bottom = "unset";
                        menu.style.left = "unset";
                        break;
                    case MenuLocation.BOTTOM_RIGHT:
                        menu.style.top = boundVertical(touchLocation.pageY - yOffset, menu) + "px";
                        menu.style.right = "unset";
                        menu.style.bottom = "unset";
                        menu.style.left = boundHorizontal(touchLocation.pageX - xOffset, menu) + "px";
                        break;
                    case MenuLocation.NONE:
                        menu.style.top = "unset";
                        menu.style.right = boundHorizontal(Math.round(window.innerWidth - touchLocation.pageX - (menuWidth / 2)), menu) + "px";
                        menu.style.bottom = boundVertical(Math.round(window.innerHeight - touchLocation.pageY - yOffset), menu) + "px";
                        menu.style.left = "unset";
                        break;
                }
            }
        }

        const rect = menuButton.getBoundingClientRect();
        switch(state.menuLocation) {
            case MenuLocation.UPPER_LEFT:
                menu.style.top = "unset";
                menu.style.right = Math.round(window.innerWidth - rect.x - menuWidth) + "px";
                menu.style.bottom = Math.round(window.innerHeight - rect.y - menuHeight) + "px";
                menu.style.left = "unset";
                menu.style.animation = "unset";
                menuButton.style.top = "unset";
                menuButton.style.left = "unset";
                menuButton.style.bottom = "0";
                menuButton.style.right = "0";
                menuButtonInterior.style.top = "unset";
                menuButtonInterior.style.left = "unset";
                menuButtonInterior.style.bottom = "0";
                menuButtonInterior.style.right = "0";
                break;
            case MenuLocation.UPPER_RIGHT:
                menu.style.top = "unset";
                menu.style.right = "unset";
                menu.style.bottom = Math.round(window.innerHeight - rect.y - menuHeight) + "px";
                menu.style.left = rect.x + "px";
                menu.style.animation = "unset";
                menuButton.style.top = "unset";
                menuButton.style.right = "unset";
                menuButton.style.bottom = "0";
                menuButton.style.left = "0";
                menuButtonInterior.style.top = "unset";
                menuButtonInterior.style.right = "unset";
                menuButtonInterior.style.bottom = "0";
                menuButtonInterior.style.left = "0";
                break;
            case MenuLocation.BOTTOM_LEFT:
                menu.style.top = rect.y + "px";
                menu.style.right = Math.round(window.innerWidth - rect.x - menuWidth) + "px";
                menu.style.bottom = "unset";
                menu.style.left = "unset";
                menu.style.animation = "unset";
                menuButton.style.bottom = "unset";
                menuButton.style.left = "unset";
                menuButton.style.top = "0";
                menuButton.style.right = "0";
                menuButtonInterior.style.bottom = "unset";
                menuButtonInterior.style.left = "unset";
                menuButtonInterior.style.top = "0";
                menuButtonInterior.style.right = "0";
                break;
            case MenuLocation.BOTTOM_RIGHT:
                menu.style.top = rect.y + "px";
                menu.style.right = "unset";
                menu.style.bottom = "unset";
                menu.style.left = rect.x + "px";
                menu.style.animation = "unset";
                menuButton.style.bottom = "unset";
                menuButton.style.right = "unset";
                menuButton.style.top = "0";
                menuButton.style.left = "0";
                menuButtonInterior.style.bottom = "unset";
                menuButtonInterior.style.right = "unset";
                menuButtonInterior.style.top = "0";
                menuButtonInterior.style.left = "0";
                break;
            case MenuLocation.NONE:
                menu.style.top = "unset";
                menu.style.right = Math.round(window.innerWidth - rect.x - menuWidth) + "px";
                menu.style.bottom = Math.round(window.innerHeight - rect.y - menuHeight) + "px";
                menu.style.left = "unset";
                menuButton.style.top = "unset";
                menuButton.style.right = "unset";
                menuButton.style.bottom = "unset";
                menuButton.style.left = "unset";
                menuButtonInterior.style.top = "unset";
                menuButtonInterior.style.right = "unset";
                menuButtonInterior.style.bottom = "unset";
                menuButtonInterior.style.left = "unset";
                break;
        }
    }

    const listItemStyles = {
        fontSize: menuButtonInteriorFontSize + 4 + "px", 
        paddingTop: menuButtonInteriorFontSize + 4 + "px", 
        paddingBottom: menuButtonInteriorFontSize + 4 + "px"
    }

    return (
        <div id={menuId} className={menuId} style={{height: menuHeight + "px", width: menuWidth + "px", borderRadius: (menuHeight / 2) + "px"}}>
            { loginScreen &&
                <Portal><ModalComponent removeModal={() => setLoginDisplayed(false)} modalType={ModalType.LOGIN} fetchTopics={null}/></Portal>
            }
            { state.addTopicDisplayed &&
                <Portal><ModalComponent removeModal={() => setAddTopicDisplayed(false)} modalType={ModalType.ADD_TOPIC} fetchTopics={fetchTopics}/></Portal>
            }
            { userProfile &&
                <Portal><ModalComponent removeModal={() => setAccountDisplayed(false)} modalType={ModalType.ACCOUNT} fetchTopics={fetchTopics} showSpecificComment={props.showSpecificComment} accountUsername={userProfile}/></Portal>
            }
            {
                state.menuLocation !== MenuLocation.NONE && 
                    <ul className="menu-items-list" style={{padding: state.menuLocation === MenuLocation.UPPER_LEFT || state.menuLocation === MenuLocation.UPPER_RIGHT ? `${menuHeight / 3}px 0 ${menuHeight}px 0` : `${menuHeight}px 0 ${menuHeight / 3}px 0`}}>
                        <li className="menu-item" style={listItemStyles} onClick={() => {setAddTopicDisplayed(true)}}>Add Topic</li>
                        {usernameExists() && <li className="menu-item" style={listItemStyles} onClick={() => setAccountDisplayed(true)}>Account</li>}
                        <li className="menu-item" style={listItemStyles} onClick={login}>
                            { usernameExists() ? "Logout" : "Login" }
                        </li>
                    </ul>
            }
            <div id={menuButtonId} className={menuButtonId} onClick={pressButton} style={{height: menuButtonWidth + "px", width: menuButtonWidth + "px", borderRadius: (menuButtonWidth / 2) + "px"}}>
                <div id={menuButtonInteriorId} className={menuButtonInteriorId} style={{height: menuButtonInteriorWidth + "px", width: menuButtonInteriorWidth + "px", 
                    padding: menuButtonInteriorPadding + "px", borderRadius: (menuButtonInteriorWidth / 2) + menuButtonInteriorPadding + "px",
                    margin: menuButtonInteriorMargin + "px", fontSize: menuButtonInteriorFontSize + "px"}}>
                    { 
                        usernameExists() && 
                            <div className="menu-button-interior-text">
                                {
                                    state.menuLocation === MenuLocation.NONE ? 
                                        username.charAt(0) : 
                                        username
                                }
                            </div>
                    }
                </div>
            </div>
        </div>
    );
}
