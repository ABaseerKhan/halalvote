import React, { useState, useContext, useEffect } from 'react';
import { topicsConfig } from '../../https-client/config';
import { useCookies } from 'react-cookie';
import { authenticatedPostDataContext } from '../app-shell';
import { useTopicsSearch } from '../search/search';
import { ReactComponent as CheckIcon} from '../../icons/check-icon.svg';
import { ReactComponent as CrossIcon} from '../../icons/cross-icon.svg';
import ClipLoader from "react-spinners/ClipLoader";


// styles
import './add-topic.css';

interface AddTopicComponentProps {
    closeModal: any,
    fetchTopics: any;
};
export const AddTopicComponent = (props: AddTopicComponentProps) => {
    const { closeModal, fetchTopics } = props;

    const { authenticatedPostData } = useContext(authenticatedPostDataContext);

    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);
    const [isTitleValid, setIsTitleValid] = useState(false);

    const { inputText, setInputText, searchResults } = useTopicsSearch();

    useEffect(() => {
        if (searchResults?.result?.data && searchResults?.result?.data.length && inputText.length > 2) {
            setAutoCompleteOpen(true);
        } else {
            setAutoCompleteOpen(false);
        } // eslint-disable-next-line
    }, [searchResults]);

    useEffect(() => {
        if (inputText.length <= 2) {
            setIsTitleValid(false);
        } else {
            if (searchResults?.result?.data && searchResults?.result?.data.length && inputText.toLowerCase() === searchResults?.result?.data[0][0].toLowerCase()) {
                setIsTitleValid(false);
            } else {
                if (searchResults?.result?.data && searchResults?.result?.data.length) {
                    setIsTitleValid(true);
                }
            }
        }
    }, [searchResults, inputText]);

    const addTopic = async () => {
        if (inputText) {
            const body: any = {
                "username": username,
                "topicTitle": inputText
            };
            const { status, data } = await authenticatedPostData({
                baseUrl: topicsConfig.url,
                path: 'add-topic',
                data: body,
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                },
                setCookie: setCookie
            }, true);

            if (status === 200 && inputText === data) {
                fetchTopics(inputText);
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

    const EnterTitleScreen = (
        <div className="enter-title-screen">
            <div className="add-topic-input-section">
                <input 
                    id={"add-topic-title-input"}
                    autoComplete="off"
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
                                            <div className={"similar-topic-title"}>{searchResults.result.data[0][0]}</div>
                                        </div>
                                    </li>
                                }
                            </ul>
                        </>
                    )}
                </div>
                <div className="validation-check-container">
                    {searchResults?.result?.data === undefined && inputText.length > 0 ? <ClipLoader size={25} color={"var(--light-neutral-color)"} loading={searchResults?.result?.data === undefined}/> :
                    isTitleValid ?
                            <CheckIcon style={{color: "green"}} /> :
                            <CrossIcon style={{color: "red"}} />
                    }
                </div>
            </div>
            <div className="next-button">
                <button disabled={!isTitleValid || (searchResults?.result?.data === undefined)} className={!isTitleValid  || (searchResults?.result?.data === undefined) ? `disabled-button` : `button`} onClick={addTopic}>Submit</button>
            </div>
        </div>
    );

    return (
        <div className="add-topic-body">
            <div className="add-topic-section-text">Add Topic</div>
            {EnterTitleScreen}
        </div>
    );
}
