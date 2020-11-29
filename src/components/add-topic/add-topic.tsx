import React, { useState, useContext } from 'react';
import { topicsConfig } from '../../https-client/config';
import { useCookies } from 'react-cookie';
import { authenticatedPostDataContext } from '../app-shell';

// styles
import './add-topic.css';
import { MyUploader } from '../topic-images/topic-images';

interface AddTopicComponentProps {
    closeModal: any,
    fetchTopics: any;
};
export const AddTopicComponent = (props: AddTopicComponentProps) => {
    const { closeModal, fetchTopics } = props;
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;
    const [state, setState] = useState<{ picture: string | null }>({
        picture: null
    });

    const addTopicTitleInputId = "add-topic-title-input";
    const addTopicSubmitButtonId = "add-topic-submit-button";

    const { authenticatedPostData } = useContext(authenticatedPostDataContext);

    const getTitleInput = (): HTMLInputElement => {
        return document.getElementById(addTopicTitleInputId) as HTMLInputElement;
    }

    const addTopic = async () => {
        const titleInput = getTitleInput();
        
        if (titleInput && titleInput.value && titleInput.value !== "") {
            const body: any = {
                "username": username,
                "topicTitle": titleInput.value
            };
            if (state.picture) body["image"] = state.picture;
            const { status, data } = await authenticatedPostData({
                baseUrl: topicsConfig.url,
                path: 'add-topic',
                data: body,
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                },
                setCookie: setCookie
            }, true);

            if (status === 200 && titleInput.value === data) {
                fetchTopics(titleInput.value);
                closeModal();
                document.getElementById('app-shell')?.scrollTo(0, window.innerHeight);
            }
        }
    }

    const handleKeyPress = (event: any) => {
        if (event.charCode === 13) {
            addTopic();
        }
    }

    return (
        <div className="add-topic-body">
            {
                !state.picture && <div className="add-topic-section-text">Add Topic</div>
            }

            <input id={addTopicTitleInputId} className="add-topic-input" type="text" placeholder="Title" onKeyPress={(event: any) => handleKeyPress(event)}/>
            
            {
                state.picture && <img className="add-topic-image" alt="Topic" src={state.picture}/>
            }
            {
                !state.picture && <MyUploader skipDBUpdate submitCallback={(image: string) => setState(prevState => ({ ...prevState, picture: image }))}/>
            }
            <button id={addTopicSubmitButtonId} className={`button ${addTopicSubmitButtonId}`} onClick={addTopic}>Add Topic</button>
        </div>
    );
}