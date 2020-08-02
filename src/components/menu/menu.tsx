import React from 'react';
import { ModalType } from '../../types';

// styles
import './menu.css';
import { useCookies } from 'react-cookie';

interface MenuComponentProps {
    menuId: string,
    displayModal: any;
};
export const MenuComponent = (props: MenuComponentProps) => {
    const { menuId, displayModal } = props;
    const [cookies, setCookie] = useCookies(['userDetails']);

    let username: string | undefined;
    if (cookies.userDetails) {
        username = cookies.userDetails.username;
    };

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
                                <div className="logout-button" onClick={ () => { setCookie("userDetails", { username: "", sessiontoken: "" }, { path: '/' }) } }>Logout</div>
                                <div className="username-text">{cookies.username}</div>
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