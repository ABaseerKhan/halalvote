import React, { useState, useEffect } from 'react';
import { ReactComponent as MenuButtonSVG } from '../../icons/menu-button.svg';
import { ModalComponent } from '../modal/modal';
import { useMedia } from '../../hooks/useMedia';
import { useCookies } from 'react-cookie';

// type imports
import { ModalType, MenuLocation } from '../../types';

// styles
import './menu.css';

interface MenuComponentProps {
    fetchItems: any
};
interface MenuComponentState {
    menuLocation: MenuLocation, 
    loginDisplayed: boolean, 
    addItemDisplayed: boolean
}
export const MenuComponent = (props: MenuComponentProps) => {
    const { fetchItems } = props;
    // eslint-disable-next-line
    const [cookies, setCookie, removeCookie] = useCookies(['username', 'sessiontoken']);
    const { username } = cookies;

    const [state, setState] = useState<MenuComponentState>({
        menuLocation: MenuLocation.NONE,
        loginDisplayed: false,
        addItemDisplayed: false
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

    const menuId = "menu";
    const menuButtonId = "menu-button";

    useEffect(() => {
        const menu = document.getElementById(menuId);
        if (menu && state.menuLocation !== MenuLocation.NONE) {
            menu.animate([
                {height: menuHeightExpanded + "px", width: menuWidthExpanded + "px"}
            ], {
                duration: 50,
                fill: "forwards"
            });
        }
    }, [state.menuLocation]);

    const setLoginDisplayed = (loginDisplayed: boolean) => {
        closeMenu({...state, menuLocation: MenuLocation.NONE, loginDisplayed: loginDisplayed});
    }

    const setAddItemDisplayed = (addItemDisplayed: boolean) => {
        closeMenu({...state, menuLocation: MenuLocation.NONE, addItemDisplayed: addItemDisplayed});
    }

    const setMenuLocation = (menuLocation: MenuLocation) => {
        closeMenu({...state, menuLocation: menuLocation});
    }

    const closeMenu = (state: MenuComponentState) => {
        const menu = document.getElementById(menuId);
        if (menu && state.menuLocation === MenuLocation.NONE) {
            menu.animate([
                {height: menuHeight + "px", width: menuWidth + "px"}
            ], {
                duration: 50,
                fill: "forwards"
            }).onfinish = () => {
                setState(state);
            }
        } else {
            setState(state);
        }
    }

    const menu = document.getElementById(menuId);
    const menuButton = document.getElementById(menuButtonId);

    const pressButton = () => {
        if (state.menuLocation === MenuLocation.NONE) {
            if (menuButton) {
                const rect = menuButton.getBoundingClientRect();
                let newMenuLocation = MenuLocation.NONE;

                if (rect.x > (window.innerWidth - rect.x) && rect.y > (window.innerHeight - rect.y)) {
                    newMenuLocation = MenuLocation.UPPER_LEFT;
                } else if (rect.x < (window.innerWidth - rect.x) && rect.y > (window.innerHeight - rect.y)) {
                    newMenuLocation = MenuLocation.UPPER_RIGHT;
                } else if (rect.x < (window.innerWidth - rect.x) && rect.y < (window.innerHeight - rect.y)) {
                    newMenuLocation = MenuLocation.BOTTOM_RIGHT;
                } else if (rect.x > (window.innerWidth - rect.x) && rect.y < (window.innerHeight - rect.y)) {
                    newMenuLocation = MenuLocation.BOTTOM_LEFT;
                }

                setMenuLocation(newMenuLocation);
            }
        } else {
            setMenuLocation(MenuLocation.NONE);
        }
    }

    const login = () => {
        if (username && username !== "") {
            removeCookie("username"); 
            removeCookie("sessiontoken");
            setMenuLocation(MenuLocation.NONE);
        } else {
            setLoginDisplayed(true);
        }
    }

    if (menu && menuButton) {
        if (isMobile) {
            menuButton.ontouchmove = (event: any) => {
                event.preventDefault();
                const touchLocation = event.targetTouches[0];
                const yOffset = state.menuLocation === MenuLocation.BOTTOM_LEFT || state.menuLocation === MenuLocation.BOTTOM_RIGHT ? menuHeightExpanded - (menuHeight / 2) : (menuHeight / 2);
                const xOffset = state.menuLocation === MenuLocation.UPPER_RIGHT || state.menuLocation === MenuLocation.BOTTOM_RIGHT ? menuWidthExpanded - (menuWidth / 2) : (menuWidth / 2);

                menu.style.bottom = Math.round(window.innerHeight - touchLocation.pageY - yOffset) + "px";
                menu.style.right = Math.round(window.innerWidth - touchLocation.pageX - xOffset) + "px";
            }
        } else {
            menuButton.classList.add("menu-button-computer");
        }

        const rect = menuButton.getBoundingClientRect();
        switch(state.menuLocation) {
            case MenuLocation.UPPER_LEFT:
                menu.style.top = "";
                menu.style.bottom = Math.round(window.innerHeight - rect.y - menuHeight) + "px";
                menu.style.right = Math.round(window.innerWidth - rect.x - menuWidth) + "px";
                menu.style.left = "";
                menuButton.style.bottom = "0";
                menuButton.style.right = "0";
                break;
            case MenuLocation.UPPER_RIGHT:
                menu.style.top = "";
                menu.style.bottom = Math.round(window.innerHeight - rect.y - menuHeight) + "px";
                menu.style.right = "";
                menu.style.left = rect.x + "px";
                menuButton.style.bottom = "0";
                menuButton.style.left = "0";
                break;
            case MenuLocation.BOTTOM_LEFT:
                menu.style.top = rect.y + "px";
                menu.style.bottom = "";
                menu.style.right = Math.round(window.innerWidth - rect.x - menuWidth) + "px";
                menu.style.left = "";
                menuButton.style.top = "0";
                menuButton.style.right = "0";
                break;
            case MenuLocation.BOTTOM_RIGHT:
                menu.style.top = rect.y + "px";
                menu.style.bottom = "";
                menu.style.right = "";
                menu.style.left = rect.x + "px";
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
                <ModalComponent removeModal={() => setLoginDisplayed(false)} modalType={ModalType.LOGIN} fetchItems={null}/>
            }
            { state.addItemDisplayed &&
                <ModalComponent removeModal={() => setAddItemDisplayed(false)} modalType={ModalType.ADD_ITEM} fetchItems={fetchItems}/>
            }
            {
                state.menuLocation !== MenuLocation.NONE && 
                    <ul className="menu-items-list">
                        <li className="menu-item" style={{marginTop: state.menuLocation === MenuLocation.BOTTOM_LEFT || state.menuLocation === MenuLocation.BOTTOM_RIGHT ? "75px" : "30px"}} onClick={login}>
                            { username && username !== "" ? "Logout" : "Login" }
                        </li>
                        <li className="menu-item" onClick={() => {setAddItemDisplayed(true)}}>Add Item</li>
                    </ul>
            }
            <MenuButtonSVG id={menuButtonId} className={menuButtonId} onClick={pressButton}></MenuButtonSVG>
        </div>
    );
}