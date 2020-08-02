import React, { useState } from 'react';
import { UserContext } from '../app-shell'
import { ModalComponent } from '../modal/modal';

// type imports
import { ModalType } from '../../types';

// styles
import './menu.css';

interface MenuComponentProps {
    menuId: string,
    setUserDetails: any;
};
export const MenuComponent = (props: MenuComponentProps) => {
    const { menuId, setUserDetails } = props;
    const [state, setState] = useState<{loginDisplayed: Boolean  }>({
        loginDisplayed: false
    });
    let { username } = React.useContext(UserContext)

    const setLoginDisplayed = (loginDisplayed: Boolean) => {
        setState({loginDisplayed: loginDisplayed});
    }

    return (
        <div>
            { state.loginDisplayed &&
                <ModalComponent removeModal={() => setLoginDisplayed(false)} modalType={ModalType.LOGIN} setUserDetails={setUserDetails} fetchItems={null}/>
            }
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
                                    <div className='login-button' onClick={ () => { setLoginDisplayed(true) } }>Log In</div>
                                </div>
                        }
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}