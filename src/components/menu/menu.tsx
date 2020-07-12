import React from 'react';
import { UserContext } from '../app-shell'

// styles
import './menu.css';

interface MenuComponentProps {
    menuId: string,
    displayLogin: any;
    setUserDetails: any;
};
export const MenuComponent = (props: MenuComponentProps) => {
    const { menuId, displayLogin, setUserDetails } = props;
    let {username, sessiontoken} = React.useContext(UserContext)

    return (
        <table id={menuId} className='menu-table'>
            <tbody>
                <tr>
                    <td className='menu-table-column'>

                    </td>
                    <td className='menu-table-column'>
                        <div className='logo'>--LOGO--</div>
                    </td>
                    <td className='menu-table-column'>
                    {
                        username && username != "" ?
                            <div className="user-info-container">
                                <div className="logout-button" onClick={ () => { setUserDetails("", "") } }>Logout</div>
                                <div className="username-text">{username}</div>
                            </div> :
                            <div className='login-button' onClick={ () => { displayLogin(true) } }>Log In</div>
                    }
                    </td>
                </tr>
            </tbody>
        </table>
    );
}