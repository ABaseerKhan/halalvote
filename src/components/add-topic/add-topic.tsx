import React, { useState } from 'react';
import { postData } from '../../https-client/client';
import { topicsConfig } from '../../https-client/config';
import { useCookies } from 'react-cookie';

// styles
import './add-topic.css';

interface AddTopicComponentProps {
    closeModal: any,
    fetchTopics: any;
};
export const AddTopicComponent = (props: AddTopicComponentProps) => {
    const { closeModal, fetchTopics } = props;
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;
    const [state, setState] = useState<{ isAddTopicButtonDisabled: boolean }>({
        isAddTopicButtonDisabled: true,
    });

    const addTopicTitleInputId = "add-topic-title-input";
    const addTopicDescriptionInputId = "add-topic-description-input";
    const addTopicSubmitButtonId = "add-topic-submit-button";

    const getNameInput = (): HTMLInputElement => {
        return document.getElementById(addTopicTitleInputId) as HTMLInputElement;
    }

    const getDescriptionInput = (): HTMLInputElement => {
        return document.getElementById(addTopicDescriptionInputId) as HTMLInputElement;
    }

    const getSubmitButton = (): HTMLButtonElement => {
        return document.getElementById(addTopicSubmitButtonId) as HTMLButtonElement;
    }

    const addTopic = async () => {
        const nameInput = getNameInput();
        const descriptionInput = getDescriptionInput();
        
        if (nameInput) {
            const { status, data } = await postData({
                baseUrl: topicsConfig.url,
                path: 'add-topic',
                data: {
                    "username": username,
                    "topicTitle": nameInput.value,
                    "description": descriptionInput.value
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                },
                setCookie: setCookie
            });

            if (status === 200 && nameInput.value === data) {
                fetchTopics(nameInput.value);
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
                setState({...state, isAddTopicButtonDisabled: true});
            } else {
                submitButton.classList.remove("disabled-button");
                setState({...state, isAddTopicButtonDisabled: false});
            }
        }
    }

    const handleKeyPress = (event: any) => {
        if (!state.isAddTopicButtonDisabled && event.charCode === 13) {
            addTopic();
        }
    }

    return (
        <div className="add-topic-body">
            <div className="add-topic-section-text">Add Topic</div>
            <input id={addTopicTitleInputId} className="add-topic-input" type="text" placeholder="Title" onChange={checkInput} onKeyPress={(event: any) => handleKeyPress(event)}/>
            <input id={addTopicDescriptionInputId} className="add-topic-input" type="text" placeholder="Description" onChange={checkInput} onKeyPress={(event: any) => handleKeyPress(event)}/>
            <button id={addTopicSubmitButtonId} className="button disabled-button" onClick={addTopic} disabled={state.isAddTopicButtonDisabled}>Add Topic</button>
        </div>
    );
}