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
import { css } from "@emotion/core";
import ClipLoader from "react-spinners/ClipLoader";

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
    picture: string | null,
    loading: boolean
};
export const DescriptionComponent = (props: DescriptionComponentProps) => {
    const { topicTitle } = props;
    const [state, setState] = useState<DescriptionComponentState>({
        addTopicDisplayed: false,
        topicDescriptions: [],
        currentIndex: 0,
        picture: null,
        loading: true
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

        setState({...state, topicDescriptions: data, currentIndex: 0, addTopicDisplayed: false, loading: false});
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

    const loaderCssOverride = css`
        margin: auto;
    `;

    const DescriptionNavigator = (
        <div className="description" style={{background: state.topicDescriptions.length > 0 && !state.loading ? "black" : "none"}}>
            {
                state.topicDescriptions.length > 0 ?
                <div style={{margin: "auto"}}>
                    <div className='description-navigator-button description-navigator-button-left' onClick={() => {iterateDescription(-1)}}>
                        <ChevronLeftSVG className="description-navigator-button-icon"/>
                    </div>
                    <div className='description-navigator-button description-navigator-button-right' onClick={() => {iterateDescription(1)}}>
                        <ChevronRightSVG className="description-navigator-button-icon"/>
                    </div>
                    <img className='topic-description' alt={props.topicTitle} src={state.topicDescriptions[state.currentIndex].description}/>
                    <div className="topic-description-username">{state.topicDescriptions[state.currentIndex].username}</div>
                </div> :

                state.loading ?
                    <ClipLoader css={loaderCssOverride} size={50} color={"var(--light-neutral-color)"} loading={state.loading}/> :
                    <div className='no-topic-description-text'>No images to show</div>
            }
            <div className="show-add-topic-button" onClick={() => {showAddTopic(true)}}>
                <AddButtonSVG/>
            </div>
        </div>
    );

    const DescriptionAdder = (
        <div>
            <div className="add-description-body">
                {
                    state.picture ? 
                        <div>
                            <img className="add-description-image" alt="Topic" src={state.picture}/>
                            <ImageUploader 
                                fileContainerStyle={{background: "transparent", boxShadow: "none", color: "var(--site-background-color)", padding: "0", margin: "0"}} 
                                buttonClassName="add-description-image-uploader-button"
                                buttonStyles={{background: "none", width: "auto", color: "var(--site-background-color)", transition: "none", padding: "0"}}
                                withIcon={false} 
                                buttonText={state.picture ? "Choose New Image" : "Choose Image"}
                                onChange={onDrop} 
                                imgExtension={['.jpg', '.gif', '.png', '.gif']}
                                maxFileSize={5242880} 
                                singleImage={true}
                            />
                            <button id={addDescriptionSubmitId} className={`button disabled-button ${addDescriptionSubmitId}`} onClick={addDescription} >Add Description</button>
                        </div>:
                        <ImageUploader 
                            fileContainerStyle={{background: "transparent", boxShadow: "none", color: "var(--site-background-color)", padding: "0", margin: "0"}} 
                            buttonClassName="button"
                            buttonStyles={{width: "auto", transition: "none"}}
                            withIcon={false}
                            buttonText={state.picture ? "Choose New Image" : "Choose Image"}
                            onChange={onDrop} 
                            imgExtension={['.jpg', '.gif', '.png', '.gif']}
                            maxFileSize={5242880} 
                            singleImage={true}
                        />
                }
            </div>
            <button className="add-description-back-button" onClick={() => {showAddTopic(false)}}>
                <LeftArrowSVG/>
            </button>
        </div>
    );

    return !state.addTopicDisplayed ? DescriptionNavigator : DescriptionAdder;
}