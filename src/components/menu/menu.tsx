import React from 'react';
import { UserContext } from '../app-shell'

// styles
import './menu.css';

interface MenuComponentProps {
    id: string,
    displayLogin: any;
    setUserDetails: any;
};
export const MenuComponent = (props: MenuComponentProps) => {
    const { id, displayLogin, setUserDetails } = props;
    let {username, sessiontoken} = React.useContext(UserContext)

    return (
        <div id={id} className='menu'>
            {
                username && username != "" ?
                    <div className="user-info-container">
                        <div className="logout-button" onClick={ () => { setUserDetails("", "") } }>Logout</div>
                        <div className="username-text">{username}</div>
                    </div> :
                    <div className='login-button' onClick={ () => { displayLogin(true) } }>Log In</div>
            }
        </div>
    );
}