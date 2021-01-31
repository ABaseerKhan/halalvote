import React, { useState, useContext, useEffect } from 'react';
import { topicsConfig } from '../../https-client/config';
import { useCookies } from 'react-cookie';
import { authenticatedPostDataContext } from '../app-shell';
import { useTopicsSearch } from '../search/search';
import { MyUploader } from '../topic-images/topic-images';
import { ReactComponent as CheckIcon} from '../../icons/check-icon.svg';
import { ReactComponent as CrossIcon} from '../../icons/cross-icon.svg';
import { ReactComponent as LeftArrowSVG } from "../../icons/left-arrow.svg";


// styles
import './add-topic.css';

export enum AddTopicScreenType {
    ENTER_TITLE,
    MEDIA_UPLOAD,
    REVIEW_AND_CONFIRM,
}
interface AddTopicComponentProps {
    closeModal: any,
    fetchTopics: any;
};
export const AddTopicComponent = (props: AddTopicComponentProps) => {
    const { closeModal, fetchTopics } = props;
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;
    const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);
    const [isTitleValid, setIsTitleValid] = useState(false);
    const [screenType, setScreenType] = useState(AddTopicScreenType.ENTER_TITLE);
    const [title, setTitle] = useState<string|undefined>(undefined);
    const [media, setMedia] = useState<string|null>(null);

    const { inputText, setInputText, searchResults } = useTopicsSearch();

    useEffect(() => {
        if (searchResults?.result?.data && searchResults?.result?.data.length && inputText.length > 2) {
            setAutoCompleteOpen(true);
            if (inputText.toLowerCase() === searchResults?.result?.data[0][0].toLowerCase()) {
                setIsTitleValid(false);
            } else {
                setIsTitleValid(true);
            }
        } else {
            if (inputText.length <= 2) setIsTitleValid(false);
            setAutoCompleteOpen(false);
        }
    }, [searchResults, inputText]);

    const { authenticatedPostData } = useContext(authenticatedPostDataContext);

    const addTopic = async () => {
        if (title) {
            const body: any = {
                "username": username,
                "topicTitle": title
            };
            if (media) body["image"] = media;
            const { status, data } = await authenticatedPostData({
                baseUrl: topicsConfig.url,
                path: 'add-topic',
                data: body,
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                },
                setCookie: setCookie
            }, true);

            if (status === 200 && title === data) {
                fetchTopics(title);
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

    const goToPreviousScreen = () => {
        if(screenType < 2) {
            setTitle(undefined);
        }
        if (screenType === 1) {
            setMedia(null);
        }
        setScreenType(screenType - 1);
    }

    const enterTitleSubmit = () => {
        setTitle(inputText);
        setScreenType(AddTopicScreenType.MEDIA_UPLOAD);
    }

    const mediaSubmit = () => {
        setScreenType(AddTopicScreenType.REVIEW_AND_CONFIRM);
    }

    const EnterTitleScreen = (
        <div className="enter-title-screen">
            <div className="add-topic-input-section">
                <input 
                    id={"add-topic-title-input"}
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
                    {isTitleValid ?
                        <CheckIcon style={{color: "green"}} /> :
                        <CrossIcon style={{color: "red"}} />
                    }
                </div>
            </div>
            <div className="next-button">
                <button disabled={!isTitleValid} className={isTitleValid ? `button` : `disabled-button`} onClick={enterTitleSubmit}>Next</button>
            </div>
        </div>
    );

    const MediaUploadScreen = (
        <div className="media-upload-screen">
            {media && <img className="add-topic-image" alt="Topic" src={media!}/>}
            {!media && <div className="uploader-container">
                <MyUploader skipDBUpdate submitCallback={(incomingMedia: string) => setMedia(incomingMedia)}/>
            </div>}
            <div className="next-button">
                <button className={`button`} onClick={mediaSubmit}>{media ? 'Next' : 'Skip'}</button>
            </div>
        </div>
    )

    const ReviewAndConfirmScreen = (
        <div className="review-and-confirm-screen">
            {media && <img className="add-topic-image" alt="Topic" src={media!}/>}
            <div className="next-button">
                <button disabled={isTitleValid} className={`button`} onClick={addTopic}>Submit Topic</button>
            </div>
        </div>
    )

    return (
        <div className="add-topic-body">
            {screenType > 0 && <LeftArrowSVG className='back-action' onClick={goToPreviousScreen}/>}
            <div className="add-topic-section-text">Add Topic:</div>
            {title && <span style={{ color: 'var(--dark-mode-text-color)'}}>{title}</span>}
            {screenType===AddTopicScreenType.ENTER_TITLE && 
                EnterTitleScreen
            }
            {screenType===AddTopicScreenType.MEDIA_UPLOAD && 
                MediaUploadScreen
            }
            {screenType===AddTopicScreenType.REVIEW_AND_CONFIRM && 
                ReviewAndConfirmScreen
            }
        </div>
    );
}
