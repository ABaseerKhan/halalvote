import React from 'react';

// type imports

// styles
import './menu.css';

interface MenuComponentProps {
    displayLogin: any;
};
export const MenuComponent = (props: MenuComponentProps) => {
    const { displayLogin } = props;

    return (
        <div className='menu'>
            <div className='login-button' onClick={ () => { displayLogin(true) } }>Log In</div>
        </div>
    );
}