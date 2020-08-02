import React from 'react';
import { UserContext } from '../app-shell'
import { ModalType } from '../../types';

// styles
import './menu.css';

interface MenuComponentProps {
    menuId: string,
    displayModal: any;
    setUserDetails: any;
};
export const MenuComponent = (props: MenuComponentProps) => {
    const { menuId, displayModal, setUserDetails } = props;
    let { username } = React.useContext(UserContext)

    return (
        <table id={menuId} className='menu-table'>
            <tbody>
                <tr>
                    <td className='menu-table-column'>

                    </td>
                    <td className='menu-table-column'>
                        <div className='logo'>HV</div>
                    </td>
                    <td className='menu-table-column'>
                    {
                        username && username !== "" ?
                            <div className="menu-text-container">
                                <div className="logout-button" onClick={ () => { setUserDetails("", "") } }>Logout</div>
                                <div className="username-text">{username}</div>
                            </div> :
                            <div className="menu-text-container">
                                <div className='login-button' onClick={ () => { displayModal(ModalType.LOGIN) } }>Log In</div>
                            </div>
                    }
                    </td>
                </tr>
            </tbody>
        </table>
    );
}