import React, { useState, useEffect } from 'react';
import { getData } from '../../https-client/client';
import { useCookies } from 'react-cookie';
import { topicsConfig } from '../../https-client/config';
import { ReactComponent as ChevronLeftSVG } from '../../icons/chevron-left.svg';
import { ReactComponent as ChevronRightSVG } from '../../icons/chevron-right.svg';
import { ReactComponent as AddButtonSVG} from '../../icons/add-button.svg'
import { ReactComponent as LeftArrowSVG } from '../../icons/left-arrow.svg';
import { postData } from '../../https-client/client';
import ImageUploader from 'react-images-upload';

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
    picture: string | null
};
export const DescriptionComponent = (props: DescriptionComponentProps) => {
    const { topicTitle } = props;
    const [state, setState] = useState<DescriptionComponentState>({
        addTopicDisplayed: false,
        topicDescriptions: [],
        currentIndex: 0,
        picture: null
    });
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken', 'topicTitle']);
    const { username, sessiontoken } = cookies;

    useEffect(() => {
        fetchDescriptions(); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addDescriptionSubmitId = "add-description-submit-button";

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

        setState({...state, topicDescriptions: data, currentIndex: 0, addTopicDisplayed: false});
    }

    const addDescription = async () => {
        if (state.picture) {
            const { status, data } = await postData({
                baseUrl: topicsConfig.url,
                path: 'add-topic-description',
                data: {
                    "username": username,
                    "topicTitle": props.topicTitle,
                    "description": state.picture
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
        setState({...state, addTopicDisplayed: addTopicDisplayed})
    }

    const onDrop = (files: File[], picture: string[]) => {
        setState({...state, picture: picture[0]});
    }

    const DescriptionNavigator = (
        <div className="description">
            {
                state.topicDescriptions.length > 0 ?
                    <img className='topic-description' alt={props.topicTitle} src={state.topicDescriptions[state.currentIndex].description}/> :
                    <div className='no-topic-description-text'>No images to show</div>
            }
            {
                state.topicDescriptions.length > 0 &&
                <div>
                    <div className='description-navigator-button description-navigator-button-left' onClick={() => {iterateDescription(-1)}}>
                        <ChevronLeftSVG className="description-navigator-button-icon"/>
                    </div>
                    <div className='description-navigator-button description-navigator-button-right' onClick={() => {iterateDescription(1)}}>
                        <ChevronRightSVG className="description-navigator-button-icon"/>
                    </div>
                </div>
            }
            <div className="show-add-topic-button" onClick={() => {showAddTopic(true)}}>
                <AddButtonSVG/>
            </div>
        </div>
    );

    const DescriptionAdder = (
        <div>
            <button className="add-description-back-button" onClick={() => {showAddTopic(false)}}>
                <LeftArrowSVG/>
            </button>
            <div className="add-description-body">
                <div className="add-description-section-text">{props.topicTitle}</div>
                {
                    state.picture && <div className="add-description-image-container"><img className="add-description-image" alt="Topic" src={state.picture}/></div>
                }
                <ImageUploader 
                    fileContainerStyle={{background: "transparent", boxShadow: "none", color: "var(--site-background-color)", padding: "0", margin: "0"}} 
                    buttonClassName="add-description-image-uploader-button"
                    buttonStyles={{background: "none", width: "auto", color: "var(--site-background-color)", transition: "none", padding: "0"}}
                    withIcon={false} 
                    buttonText={state.picture ? "Upload New Image" : "Upload Image"}
                    onChange={onDrop} 
                    imgExtension={['.jpg', '.gif', '.png', '.gif']}
                    maxFileSize={5242880} 
                    singleImage={true}
                />
                <button id={addDescriptionSubmitId} className="button disabled-button" onClick={addDescription} >Add Description</button>
            </div>
        </div>
    );

    return !state.addTopicDisplayed ? DescriptionNavigator : DescriptionAdder;
}