import React from 'react';
import { UserContext } from '../app-shell';
import { postData } from '../../https-client/post-data';
import { itemsConfig } from '../../https-client/config';

// styles
import './add-item.css';

interface AddItemComponentProps {
    removeModal: any,
    fetchItems: any;
};
export const AddItemComponent = (props: AddItemComponentProps) => {
    let { username, sessiontoken } = React.useContext(UserContext);
    const { removeModal, fetchItems } = props;

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
            fetchItems(itemName);
            removeModal();
            document.getElementById('app-shell')?.scrollTo(0, window.innerHeight);
        }
    }

    return (
        <div className="add-item-body">
            <div className="add-item-section-text">Add Item</div>
            <input id="item-name-input" className="add-item-input" type="text" placeholder="Item Name"/>
            <button className="add-item-submit-button" onClick={ () => { addItem() } }>Add Item</button>
        </div>
    );
}