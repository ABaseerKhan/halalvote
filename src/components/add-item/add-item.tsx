import React, { useState } from 'react';
import { postData } from '../../https-client/post-data';
import { itemsConfig } from '../../https-client/config';
import { useCookies } from 'react-cookie';

// styles
import './add-item.css';

interface AddItemComponentProps {
    removeModal: any,
    fetchItems: any;
};
export const AddItemComponent = (props: AddItemComponentProps) => {
    const { removeModal, fetchItems } = props;
    const [cookies] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;
    const [state, setState] = useState<{ isAddItemButtonDisabled: boolean }>({
        isAddItemButtonDisabled: true,
    });

    const getInput = (): HTMLInputElement => {
        return document.getElementById("add-item-input") as HTMLInputElement;
    }

    const getSubmitButton = (): HTMLButtonElement => {
        return document.getElementById("add-item-submit-button") as HTMLButtonElement;
    }

    const addItem = async () => {
        const input = getInput();
        
        if (input) {
            const { status, data } = await postData({
                baseUrl: itemsConfig.url,
                path: 'add-item',
                data: {
                    "username": username,
                    "itemName": input.value
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                }
            });

            if (status === 200 && input.value === data) {
                fetchItems(input.value);
                removeModal();
                document.getElementById('app-shell')?.scrollTo(0, window.innerHeight);
            }
        }
    }

    const checkInput = () => {
        const input = getInput();
        const submitButton = getSubmitButton();

        if (input && submitButton) {
            if (input.value === "") {
                submitButton.classList.add("disabled-button");
                setState({...state, isAddItemButtonDisabled: true});
            } else {
                submitButton.classList.remove("disabled-button");
                setState({...state, isAddItemButtonDisabled: false});
            }
        }
    }

    return (
        <div className="add-item-body">
            <div className="add-item-section-text">Add Item</div>
            <input id="add-item-input" className="add-item-input" type="text" placeholder="Item Name" onChange={checkInput}/>
            <button id="add-item-submit-button" className="add-item-submit-button disabled-button" onClick={ () => { addItem() } } disabled={state.isAddItemButtonDisabled}>Add Item</button>
        </div>
    );
}