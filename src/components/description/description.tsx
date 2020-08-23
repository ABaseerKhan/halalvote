import React, { useState, useEffect } from 'react';
import { getData } from '../../https-client/client';
import { useCookies } from 'react-cookie';
import { itemsConfig } from '../../https-client/config';
import { ReactComponent as ChevronLeftSVG } from '../../icons/chevron-left.svg';
import { ReactComponent as ChevronRightSVG } from '../../icons/chevron-right.svg';
import { ReactComponent as AddButtonSVG} from '../../icons/add-button.svg'
import { postData } from '../../https-client/client';

// type imports
import { ItemDescription } from '../../types';

// styles
import './description.css';

interface DescriptionComponentProps {
    itemName: string
};
interface DescriptionComponentState {
    addItemDisplayed: boolean,
    itemDescriptions: ItemDescription[],
    currentIndex: number,
    isAddItemButtonDisabled: boolean
};
export const DescriptionComponent = (props: DescriptionComponentProps) => {
    const { itemName } = props;
    const [state, setState] = useState<DescriptionComponentState>({
        addItemDisplayed: false,
        itemDescriptions: [],
        currentIndex: 0,
        isAddItemButtonDisabled: true
    });
    const [cookies, setCookie, removeCookie] = useCookies(['username', 'sessiontoken', 'itemName']);
    const { username, sessiontoken } = cookies;

    useEffect(() => {
        fetchDescriptions(); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addDescriptionInputId = "add-description-input";
    const addDescriptionSubmitId = "add-description-submit-button";

    const getDescriptionInput = (): HTMLInputElement => {
        return document.getElementById(addDescriptionInputId) as HTMLInputElement;
    }

    const getSubmitButton = (): HTMLButtonElement => {
        return document.getElementById(addDescriptionSubmitId) as HTMLButtonElement;
    }

    const fetchDescriptions = async () => {
        let queryParams: any = { 
            "itemName": itemName
        };
        let additionalHeaders = {};

        const { data }: { data: ItemDescription[] } = await getData({ 
            baseUrl: itemsConfig.url, 
            path: 'get-item-descriptions', 
            queryParams: queryParams, 
            additionalHeaders: additionalHeaders, 
        });

        setState({...state, itemDescriptions: data, currentIndex: 0, addItemDisplayed: false, isAddItemButtonDisabled: true});
    }

    const addDescription = async () => {
        const descriptionInput = getDescriptionInput();
        
        if (descriptionInput) {
            const { status, data } = await postData({
                baseUrl: itemsConfig.url,
                path: 'add-item-description',
                data: {
                    "username": username,
                    "itemName": props.itemName,
                    "description": descriptionInput.value
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                }
            });

            if (status === 200 && props.itemName === data) {
                fetchDescriptions();
            }
        }
    }

    const iterateDescription = (value: number) => {
        setState({...state, currentIndex: Math.min(Math.max(state.currentIndex + value, 0), state.itemDescriptions.length - 1)})
    }

    const showAddItem = (addItemDisplayed: boolean) => {
        setState({...state, addItemDisplayed: addItemDisplayed, isAddItemButtonDisabled: true})
    }

    const checkInput = () => {
        const descriptionInput = getDescriptionInput();
        const submitButton = getSubmitButton();

        if (descriptionInput && submitButton) {
            if (descriptionInput.value === "") {
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
            addDescription();
        }
    }

    const DescriptionNavigator = (
        <table className="description">
            <tbody>
                <tr>
                    <td className='description-navigator-button-column'>
                        {
                            state.currentIndex > 0 &&
                                <button onClick={() => {iterateDescription(-1)}} className='description-navigator-button'> 
                                    <ChevronLeftSVG className={"arrow-icon-left"}/>
                                </button>
                        }
                    </td>
                    <td>
                        <div>
                            <div className='item-description-name'>{props.itemName}</div>
                            {
                                state.itemDescriptions.length > 0 && 
                                    <div className='item-description'>
                                        <span>{state.itemDescriptions[state.currentIndex].description}</span>
                                        <br/>
                                        <br/>
                                        <span>{"-" + state.itemDescriptions[state.currentIndex].username}</span>
                                    </div>
                            }
                            <div className="show-add-item-button" onClick={() => {showAddItem(true)}}>
                                <AddButtonSVG/>
                            </div>
                        </div>
                    </td>
                    <td className='description-navigator-button-column'>
                        {
                            state.currentIndex < state.itemDescriptions.length - 1 &&
                                <button onClick={() => {iterateDescription(1)}} className='description-navigator-button'>
                                    <ChevronRightSVG className={"arrow-icon-right"}/>
                                </button>
                        }
                    </td>
                </tr>
            </tbody>
        </table>
    );

    const DescriptionAdder = (
        <div>
            <button className="add-description-back-button" onClick={() => {showAddItem(false)}}>
                <ChevronLeftSVG className={"arrow-icon-left"}/>
            </button>
            <div className="add-description-body">
                <div className="add-description-section-text">{props.itemName}</div>
                <input id={addDescriptionInputId} className="add-description-input" type="text" placeholder="Description" onChange={checkInput} onKeyPress={(event: any) => handleKeyPress(event)}/>
                <button id={addDescriptionSubmitId} className="add-description-submit-button disabled-button" onClick={addDescription} disabled={state.isAddItemButtonDisabled}>Add Description</button>
            </div>
        </div>
    );

    return !state.addItemDisplayed ? DescriptionNavigator : DescriptionAdder;
}