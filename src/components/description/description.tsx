import React, { useState, useEffect } from 'react';
import { getData } from '../../https-client/client';
import { useCookies } from 'react-cookie';
import { topicsConfig } from '../../https-client/config';
import { ReactComponent as ChevronLeftSVG } from '../../icons/chevron-left.svg';
import { ReactComponent as ChevronRightSVG } from '../../icons/chevron-right.svg';
import { ReactComponent as AddButtonSVG} from '../../icons/add-button.svg'
import { ReactComponent as LeftArrowSVG } from '../../icons/left-arrow.svg';
import { postData } from '../../https-client/client';

// type imports
import { TopicDescription } from '../../types';

// styles
import './description.css';

interface DescriptionComponentProps {
    topicTitle: string
};
interface DescriptionComponentState {
    addTopicDisplayed: boolean,
    topicDescriptions: TopicDescription[],
    currentIndex: number,
    isAddTopicButtonDisabled: boolean
};
export const DescriptionComponent = (props: DescriptionComponentProps) => {
    const { topicTitle } = props;
    const [state, setState] = useState<DescriptionComponentState>({
        addTopicDisplayed: false,
        topicDescriptions: [],
        currentIndex: 0,
        isAddTopicButtonDisabled: true
    });
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken', 'topicTitle']);
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
            "topicTitle": topicTitle
        };
        let additionalHeaders = {};

        const { data }: { data: TopicDescription[] } = await getData({ 
            baseUrl: topicsConfig.url, 
            path: 'get-topic-descriptions', 
            queryParams: queryParams, 
            additionalHeaders: additionalHeaders, 
        });

        setState({...state, topicDescriptions: data, currentIndex: 0, addTopicDisplayed: false, isAddTopicButtonDisabled: true});
    }

    const addDescription = async () => {
        const descriptionInput = getDescriptionInput();
        
        if (descriptionInput) {
            const { status, data } = await postData({
                baseUrl: topicsConfig.url,
                path: 'add-topic-description',
                data: {
                    "username": username,
                    "topicTitle": props.topicTitle,
                    "description": descriptionInput.value
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                },
                setCookie: setCookie,
            });

            if (status === 200 && props.topicTitle === data) {
                fetchDescriptions();
            }
        }
    }

    const iterateDescription = (value: number) => {
        setState({...state, currentIndex: Math.min(Math.max(state.currentIndex + value, 0), state.topicDescriptions.length - 1)})
    }

    const showAddTopic = (addTopicDisplayed: boolean) => {
        setState({...state, addTopicDisplayed: addTopicDisplayed, isAddTopicButtonDisabled: true})
    }

    const checkInput = () => {
        const descriptionInput = getDescriptionInput();
        const submitButton = getSubmitButton();

        if (descriptionInput && submitButton) {
            if (descriptionInput.value === "") {
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
            addDescription();
        }
    }

    const DescriptionNavigator = (
        <table className="description">
            <tbody>
                <tr className='topic-description-name-row'>
                    <td>
                        <div className='topic-description-name'>{props.topicTitle}</div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div>
                            {
                                state.topicDescriptions.length > 0 ?
                                    <div>
                                        <div className='description-navigator-button description-navigator-button-left' onClick={() => {iterateDescription(-1)}}>
                                            <ChevronLeftSVG className="description-navigator-button-icon"/>
                                        </div>
                                        <div className='description-navigator-button description-navigator-button-right' onClick={() => {iterateDescription(1)}}>
                                            <ChevronRightSVG className="description-navigator-button-icon"/>
                                        </div>
                                        <div className='topic-description'>
                                            <span>{state.topicDescriptions[state.currentIndex].description}</span>
                                            <br/>
                                            <br/>
                                            <span>{"-" + state.topicDescriptions[state.currentIndex].username}</span>
                                        </div>
                                    </div> :
                                    <div className='no-topic-description-text'>No Descriptions</div>
                            }
                            <div className="show-add-topic-button" onClick={() => {showAddTopic(true)}}>
                                <AddButtonSVG/>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    );

    const DescriptionAdder = (
        <div>
            <button className="add-description-back-button" onClick={() => {showAddTopic(false)}}>
                <LeftArrowSVG/>
            </button>
            <div className="add-description-body">
                <div className="add-description-section-text">{props.topicTitle}</div>
                <input id={addDescriptionInputId} className="add-description-input" type="text" placeholder="Description" onChange={checkInput} onKeyPress={(event: any) => handleKeyPress(event)}/>
                <button id={addDescriptionSubmitId} className="button disabled-button" onClick={addDescription} disabled={state.isAddTopicButtonDisabled}>Add Description</button>
            </div>
        </div>
    );

    return !state.addTopicDisplayed ? DescriptionNavigator : DescriptionAdder;
}