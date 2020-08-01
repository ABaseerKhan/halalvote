import React from 'react';
import { UserContext } from '../app-shell'

// styles
import './menu.css';
import { ModalType } from '../../types';

interface MenuComponentProps {
    menuId: string,
    displayModal: any;
    setUserDetails: any;
};
export const MenuComponent = (props: MenuComponentProps) => {
    const { menuId, displayModal, setUserDetails } = props;
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
                            <div className='login-button' onClick={ () => { displayModal(ModalType.LOGIN) } }>Log In</div>
                    }
                    </td>
                </tr>
            </tbody>
        </table>
    );
}