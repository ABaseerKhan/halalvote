import React from 'react';
import { useCookies } from 'react-cookie';

// styles
import './account.css';

interface AccountComponentProps {
};

export const AccountComponent = (props: AccountComponentProps) => {
    // eslint-disable-next-line
    const [cookies] = useCookies(['username', 'sessiontoken']);
    const { username } = cookies;

    return (
        <div className="account-container">
            {`Account - ${username}`}
        </div>
    );
}