import React from 'react';

// type imports

// styles
import './login.css';

interface LoginComponentProps {
    displayLogin: any;
};
export const LoginComponent = (props: LoginComponentProps) => {
    const { displayLogin } = props;

    return (
        <div>
            <div className='login-cover' onClick={ () => { displayLogin(false) } }></div>
            <div className='login'></div>
        </div>
    );
}