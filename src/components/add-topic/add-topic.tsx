import React, { useState } from 'react';
import { postData } from '../../https-client/client';
import { topicsConfig } from '../../https-client/config';
import { useCookies } from 'react-cookie';
import ImageUploader from 'react-images-upload';

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
    const [state, setState] = useState<{ isAddTopicButtonDisabled: boolean, picture: string | null }>({
        isAddTopicButtonDisabled: true,
        picture: null
    });

    const addTopicTitleInputId = "add-topic-title-input";
    const addTopicSubmitButtonId = "add-topic-submit-button";

    const getTitleInput = (): HTMLInputElement => {
        return document.getElementById(addTopicTitleInputId) as HTMLInputElement;
    }

    const getSubmitButton = (): HTMLButtonElement => {
        return document.getElementById(addTopicSubmitButtonId) as HTMLButtonElement;
    }

    const addTopic = async () => {
        const titleInput = getTitleInput();
        
        if (titleInput && state.picture) {
            const { status, data } = await postData({
                baseUrl: topicsConfig.url,
                path: 'add-topic',
                data: {
                    "username": username,
                    "topicTitle": titleInput.value,
                    "image": state.picture
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                },
                setCookie: setCookie
            });

            if (status === 200 && titleInput.value === data) {
                fetchTopics(titleInput.value);
                closeModal();
                document.getElementById('app-shell')?.scrollTo(0, window.innerHeight);
            }
        }
    }

    const checkInput = () => {
        const titleInput = getTitleInput();
        const submitButton = getSubmitButton();

        if (titleInput && submitButton) {
            if (titleInput.value === "") {
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

    const onDrop = (files: File[], picture: string[]) => {
        setState({...state, picture: picture[0]});
    }

    return (
        <div className="add-topic-body">
            <div className="add-topic-section-text">Add Topic</div>
            <input id={addTopicTitleInputId} className="add-topic-input" type="text" placeholder="Title" onChange={checkInput} onKeyPress={(event: any) => handleKeyPress(event)}/>
            {
                state.picture && <div className="add-topic-image-container"><img className="add-topic-image" alt="Topic" src={state.picture}/></div>
            }
            <ImageUploader 
                fileContainerStyle={{background: "transparent", boxShadow: "none", color: "var(--site-background-color)", padding: "0", margin: "0"}} 
                buttonClassName="add-topic-image-uploader-button"
                buttonStyles={{background: "none", width: "auto", color: "var(--site-background-color)", transition: "none", padding: "0"}}
                withIcon={false} 
                buttonText={state.picture ? "Upload New Image" : "Upload Image"}
                onChange={onDrop} 
                imgExtension={['.jpg', '.gif', '.png', '.gif']}
                maxFileSize={5242880} 
                singleImage={true}
            />
            <button id={addTopicSubmitButtonId} className="button disabled-button" onClick={addTopic} disabled={state.isAddTopicButtonDisabled}>Add Topic</button>
        </div>
    );
}