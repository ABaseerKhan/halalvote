import React, { useState } from 'react';
import { postData } from '../../https-client/post-data';
import { itemsConfig } from '../../https-client/config';
import { useCookies } from 'react-cookie';

// styles
import './add-item.css';

interface AddItemComponentProps {
    closeModal: any,
    fetchItems: any;
};
export const AddItemComponent = (props: AddItemComponentProps) => {
    const { closeModal, fetchItems } = props;
    const [cookies] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;
    const [state, setState] = useState<{ isAddItemButtonDisabled: boolean }>({
        isAddItemButtonDisabled: true,
    });

    const addItemNameInputId = "add-item-name-input"
    const addItemDescriptionInputId = "add-item-description-input"

    const getNameInput = (): HTMLInputElement => {
        return document.getElementById(addItemNameInputId) as HTMLInputElement;
    }

    const getDescriptionInput = (): HTMLInputElement => {
        return document.getElementById(addItemDescriptionInputId) as HTMLInputElement;
    }

    const getSubmitButton = (): HTMLButtonElement => {
        return document.getElementById("add-item-submit-button") as HTMLButtonElement;
    }

    const addItem = async () => {
        const nameInput = getNameInput();
        const descriptionInput = getDescriptionInput();
        
        if (nameInput) {
            const { status, data } = await postData({
                baseUrl: itemsConfig.url,
                path: 'add-item',
                data: {
                    "username": username,
                    "itemName": nameInput.value,
                    "description": descriptionInput.value
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                }
            });

            if (status === 200 && nameInput.value === data) {
                fetchItems(nameInput.value);
                closeModal();
                document.getElementById('app-shell')?.scrollTo(0, window.innerHeight);
            }
        }
    }

    const checkInput = () => {
        const nameInput = getNameInput();
        const descriptionInput = getDescriptionInput();
        const submitButton = getSubmitButton();

        if (nameInput && descriptionInput && submitButton) {
            if (nameInput.value === "" || descriptionInput.value === "") {
                submitButton.classList.add("disabled-button");
                setState({...state, isAddItemButtonDisabled: true});
            } else {
                submitButton.classList.remove("disabled-button");
                setState({...state, isAddItemButtonDisabled: false});
            }
        }
    }

    const handleKeyPress = (event: any) => {
        if (!state.isAddItemButtonDisabled && event.charCode === 13) {
            addItem();
        }
    }

    return (
        <div className="add-item-body">
            <div className="add-item-section-text">Add Item</div>
            <input id={addItemNameInputId} className="add-item-input" type="text" placeholder="Name" onChange={checkInput} onKeyPress={(event: any) => handleKeyPress(event)}/>
            <input id={addItemDescriptionInputId} className="add-item-input" type="text" placeholder="Description" onChange={checkInput} onKeyPress={(event: any) => handleKeyPress(event)}/>
            <button id="add-item-submit-button" className="add-item-submit-button disabled-button" onClick={addItem} disabled={state.isAddItemButtonDisabled}>Add Item</button>
        </div>
    );
}