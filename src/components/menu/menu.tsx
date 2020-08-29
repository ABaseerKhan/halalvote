import React, { useState, useEffect } from 'react';
import { ModalComponent } from '../modal/modal';
import { useMedia } from '../../hooks/useMedia';
import { useCookies } from 'react-cookie';
import { Portal } from '../../index';

// type imports
import { ModalType, MenuLocation } from '../../types';

// styles
import './menu.css';

interface MenuComponentProps {
    fetchTopics: any
};
interface MenuComponentState {
    menuLocation: MenuLocation, 
    loginDisplayed: boolean, 
    addTopicDisplayed: boolean
}
export const MenuComponent = (props: MenuComponentProps) => {
    const { fetchTopics } = props;
    // eslint-disable-next-line
    const [cookies, setCookie, removeCookie] = useCookies(['username', 'sessiontoken']);
    const { username } = cookies;

    const [state, setState] = useState<MenuComponentState>({
        menuLocation: MenuLocation.NONE,
        loginDisplayed: false,
        addTopicDisplayed: false
    });

    const isMobile = useMedia(
        // Media queries
        ['(max-width: 600px)'],
        [true],
        // default value
        false
    );

    const menuHeight = 72;
    const menuWidth = 72;
    const menuHeightExpanded = 200;
    const menuWidthExpanded = 150;
    const menuButtonWidth = 40;
    const menuButtonInteriorWidth = 24;
    const menuButtonWidthExpanded = 118;
    const menuButtonInteriorWidthExpanded = 102;

    const menuId = "menu";
    const menuButtonId = "menu-button";
    const menuButtonInteriorId = "menu-button-interior";

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
                {height: menuHeightExpanded + "px", width: menuWidthExpanded + "px"}
            ], {
                duration: 50,
                fill: "forwards"
            });
        } // eslint-disable-next-line
    }, [state.menuLocation]);

    const usernameExists = () => {
        return username && username !== "";
    }

    const setLoginDisplayed = (loginDisplayed: boolean) => {
        closeMenu({...state, menuLocation: MenuLocation.NONE, loginDisplayed: loginDisplayed}, () => {});
    }

    const setAddTopicDisplayed = (addTopicDisplayed: boolean) => {
        closeMenu({...state, menuLocation: MenuLocation.NONE, addTopicDisplayed: addTopicDisplayed}, () => {});
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

    if (menu && menuButton) {
        if (isMobile) {
            menuButton.ontouchmove = (event: TouchEvent) => {
                event.preventDefault();
                const touchLocation = event.targetTouches[0];
                const yOffset = menuHeight / 2;
                const xOffset = (usernameExists() ? menuWidthExpanded : menuWidth) / 2;

                switch(state.menuLocation) {
                    case MenuLocation.UPPER_LEFT:
                        menu.style.top = "";
                        menu.style.right = Math.round(window.innerWidth - touchLocation.pageX - xOffset) + "px";
                        menu.style.bottom = Math.round(window.innerHeight - touchLocation.pageY - yOffset) + "px";
                        menu.style.left = "";
                        break;
                    case MenuLocation.UPPER_RIGHT:
                        menu.style.top = "";
                        menu.style.right = "";
                        menu.style.bottom = Math.round(window.innerHeight - touchLocation.pageY - yOffset) + "px";
                        menu.style.left = touchLocation.pageX - xOffset + "px";
                        break;
                    case MenuLocation.BOTTOM_LEFT:
                        menu.style.top = touchLocation.pageY - yOffset + "px";
                        menu.style.right = Math.round(window.innerWidth - touchLocation.pageX - xOffset) + "px";
                        menu.style.bottom = "";
                        menu.style.left = "";
                        break;
                    case MenuLocation.BOTTOM_RIGHT:
                        menu.style.top = touchLocation.pageY - yOffset + "px";
                        menu.style.right = "";
                        menu.style.bottom = "";
                        menu.style.left = touchLocation.pageX - xOffset + "px";
                        break;
                    case MenuLocation.NONE:
                        menu.style.top = "";
                        menu.style.right = Math.round(window.innerWidth - touchLocation.pageX - (menuWidth / 2)) + "px";
                        menu.style.bottom = Math.round(window.innerHeight - touchLocation.pageY - yOffset) + "px";
                        menu.style.left = "";
                        break;
                }
            }
        } else {
            menuButton.classList.add("menu-button-computer");
        }

        const rect = menuButton.getBoundingClientRect();
        switch(state.menuLocation) {
            case MenuLocation.UPPER_LEFT:
                menu.style.top = "";
                menu.style.right = Math.round(window.innerWidth - rect.x - menuWidth) + "px";
                menu.style.bottom = Math.round(window.innerHeight - rect.y - menuHeight) + "px";
                menu.style.left = "";
                menu.style.animation = "unset";
                menuButton.style.bottom = "0";
                menuButton.style.right = "0";
                break;
            case MenuLocation.UPPER_RIGHT:
                menu.style.top = "";
                menu.style.right = "";
                menu.style.bottom = Math.round(window.innerHeight - rect.y - menuHeight) + "px";
                menu.style.left = rect.x + "px";
                menu.style.animation = "unset";
                menuButton.style.bottom = "0";
                menuButton.style.left = "0";
                break;
            case MenuLocation.BOTTOM_LEFT:
                menu.style.top = rect.y + "px";
                menu.style.right = Math.round(window.innerWidth - rect.x - menuWidth) + "px";
                menu.style.bottom = "";
                menu.style.left = "";
                menu.style.animation = "unset";
                menuButton.style.top = "0";
                menuButton.style.right = "0";
                break;
            case MenuLocation.BOTTOM_RIGHT:
                menu.style.top = rect.y + "px";
                menu.style.right = "";
                menu.style.bottom = "";
                menu.style.left = rect.x + "px";
                menu.style.animation = "unset";
                menuButton.style.top = "0";
                menuButton.style.left = "0";
                break;
            case MenuLocation.NONE:
                menu.style.top = "";
                menu.style.right = Math.round(window.innerWidth - rect.x - menuWidth) + "px";
                menu.style.bottom = Math.round(window.innerHeight - rect.y - menuHeight) + "px";
                menu.style.left = "";
                menuButton.style.top = "";
                menuButton.style.right = "";
                menuButton.style.bottom = "";
                menuButton.style.left = "";
                break;
        }
    }

    return (
        <div id={menuId} className={menuId}>
            { state.loginDisplayed &&
                <Portal><ModalComponent removeModal={() => setLoginDisplayed(false)} modalType={ModalType.LOGIN} fetchTopics={null} topicTitle={null}/></Portal>
            }
            { state.addTopicDisplayed &&
                <Portal><ModalComponent removeModal={() => setAddTopicDisplayed(false)} modalType={ModalType.ADD_ITEM} fetchTopics={fetchTopics} topicTitle={null}/></Portal>
            }
            {
                state.menuLocation !== MenuLocation.NONE && 
                    <ul className="menu-items-list">
                        <li className="menu-item" style={{marginTop: state.menuLocation === MenuLocation.BOTTOM_LEFT || state.menuLocation === MenuLocation.BOTTOM_RIGHT ? "75px" : "30px"}} onClick={login}>
                            { usernameExists() ? "Logout" : "Login" }
                        </li>
                        <li className="menu-item" onClick={() => {setAddTopicDisplayed(true)}}>Add Topic</li>
                    </ul>
            }
            <div id={menuButtonId} className={menuButtonId} onClick={pressButton}>
                <div id={menuButtonInteriorId} className={menuButtonInteriorId}>
                    { 
                        usernameExists() && state.menuLocation === MenuLocation.NONE ? username.charAt(0) : username
                    }
                </div>
            </div>
        </div>
    );
}