import React from 'react';
import { UserContext } from '../app-shell';
import { postData } from '../../https-client/post-data';
import { itemsConfig } from '../../https-client/config';

// type imports
import { ModalType } from '../../types';

// styles
import './add-item.css';

interface AddItemComponentProps {
    displayModal: any;
    fetchItems: any;
};
export const AddItemComponent = (props: AddItemComponentProps) => {
    let { username, sessiontoken } = React.useContext(UserContext);
    const { displayModal, fetchItems } = props;

    const addItem = async () => {
        const itemName = (document.getElementById("item-name-input") as HTMLInputElement).value

        const { status, data } = await postData({
            baseUrl: itemsConfig.url,
            path: 'add-item',
            data: {
                "username": username,
                "itemName": itemName
            },
            additionalHeaders: {
                "sessiontoken": sessiontoken
            }
        });

        if (status === 200 && itemName === data) {
            displayModal(ModalType.NONE);
            fetchItems(itemName);
            document.getElementById('app-shell')?.scrollTo(0, window.innerHeight);
        }
    }

    return (
        <table className="add-item-body">
            <tbody>
                <tr>
                    <input id="item-name-input" type="text" placeholder="Item Name"/>
                </tr>
                <tr>
                    <button className="add-item-submit-button" onClick={ () => { addItem() } }>Add Item</button>
                </tr>
            </tbody>
        </table>
    );
}