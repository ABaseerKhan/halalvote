import React, { useState, useContext, useEffect } from 'react';
import { topicsConfig } from '../../https-client/config';
import { useCookies } from 'react-cookie';
import { authenticatedPostDataContext } from '../app-shell';
import { useTopicsSearch } from '../search/search';
import { MyUploader } from '../topic-images/topic-images';

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
    const [state, setState] = useState<{ picture: string | null }>({
        picture: null
    });

    const { inputText, setInputText, searchResults } = useTopicsSearch();
    const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);

    useEffect(() => {
        if (searchResults?.result?.data && searchResults?.result?.data.length && inputText.length > 2) {
            setAutoCompleteOpen(true);
        } else {
            setAutoCompleteOpen(false);
        }
    }, [searchResults, inputText]);

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
            <div className="add-topic-input-section">
                <input 
                    id={addTopicTitleInputId}
                    className={autoCompleteOpen ? "add-topic-input-similar-topic-open" : "add-topic-input"}
                    type="text" value={inputText} 
                    onChange={e => setInputText(e.target.value)} 
                    placeholder="Title" 
                    onKeyPress={(event: any) => handleKeyPress(event)}
                />
                <div className={"similar-topic-autocomplete"} >
                    {searchResults.result && searchResults.result.data && !!searchResults.result.data.length && inputText.length > 2 && (
                        <>
                            <div className="similar-topic-label">Similar, existing topic: </div>
                            <ul className={"similar-topic-list"}>
                                {
                                    <li className={"similar-topic-list-item"} key={searchResults.result.data[0]} >
                                        <div onClick={() => { fetchTopics(searchResults.result.data[0]); closeModal(); }} className={"similar-topic-inner-container"}>
                                            <div className={"similar-topic-title"}>{searchResults.result.data[0]}</div>
                                        </div>
                                    </li>
                                }
                            </ul>
                        </>
                    )}
                </div>
            </div>
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