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
import { TopicImage } from '../../types';

// styles
import './topic-image.css';

interface TopicImageComponentProps {
    topicTitle: string
};
interface TopicImageComponentState {
    addTopicDisplayed: boolean,
    topicImages: TopicImage[],
    currentIndex: number,
    picture: string | null,
    loading: boolean
};
export const TopicImageComponent = (props: TopicImageComponentProps) => {
    const { topicTitle } = props;
    const [state, setState] = useState<TopicImageComponentState>({
        addTopicDisplayed: false,
        topicImages: [],
        currentIndex: 0,
        picture: null,
        loading: true
    });
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken', 'topicTitle']);
    const { username, sessiontoken } = cookies;

    useEffect(() => {
        fetchImages(); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addImageSubmitId = "add-image-submit-button";

    const fetchImages = async () => {
        let queryParams: any = { 
            "topicTitle": topicTitle
        };
        let additionalHeaders = {};

        const { data }: { data: TopicImage[] } = await getData({ 
            baseUrl: topicsConfig.url, 
            path: 'get-topic-images', 
            queryParams: queryParams, 
            additionalHeaders: additionalHeaders, 
        });

        setState({...state, topicImages: data, currentIndex: 0, addTopicDisplayed: false, loading: false});
    }

    const addImage = async () => {
        if (state.picture) {
            const { status, data } = await postData({
                baseUrl: topicsConfig.url,
                path: 'add-topic-image',
                data: {
                    "username": username,
                    "topicTitle": props.topicTitle,
                    "image": state.picture
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                },
                setCookie: setCookie,
            });

            if (status === 200 && props.topicTitle === data) {
                fetchImages();
            }
        }
    }

    const iterateImage = (value: number) => {
        setState({...state, currentIndex: Math.min(Math.max(state.currentIndex + value, 0), state.topicImages.length - 1)})
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

    const ImageNavigator = (
        <div className="image-body" style={{background: state.topicImages.length > 0 && !state.loading ? "black" : "none"}}>
            {
                state.topicImages.length > 0 ?
                <div style={{margin: "auto"}}>
                    <div className='image-navigator-button image-navigator-button-left' onClick={() => {iterateImage(-1)}}>
                        <ChevronLeftSVG className="image-navigator-button-icon"/>
                    </div>
                    <div className='image-navigator-button image-navigator-button-right' onClick={() => {iterateImage(1)}}>
                        <ChevronRightSVG className="image-navigator-button-icon"/>
                    </div>
                    <img className='image' alt={props.topicTitle} src={state.topicImages[state.currentIndex].image}/>
                    <div className="image-username">{state.topicImages[state.currentIndex].username}</div>
                </div> :

                state.loading ?
                    <ClipLoader css={loaderCssOverride} size={50} color={"var(--light-neutral-color)"} loading={state.loading}/> :
                    <div className='no-image-text'>No images to show</div>
            }
            <div className="show-add-image-button" onClick={() => {showAddTopic(true)}}>
                <AddButtonSVG/>
            </div>
        </div>
    );

    const ImageAdder = (
        <div>
            <div className="add-image-body">
                {
                    state.picture ? 
                        <div>
                            <img className="adding-image" alt="Topic" src={state.picture}/>
                            <ImageUploader 
                                fileContainerStyle={{background: "transparent", boxShadow: "none", color: "var(--site-background-color)", padding: "0", margin: "0"}} 
                                buttonClassName="add-image-choose-button"
                                buttonStyles={{background: "none", width: "auto", color: "var(--site-background-color)", transition: "none", padding: "0"}}
                                withIcon={false} 
                                buttonText="Choose New Image"
                                onChange={onDrop} 
                                imgExtension={['.jpg', '.gif', '.png', '.gif']}
                                maxFileSize={5242880} 
                                singleImage={true}
                            />
                            <button id={addImageSubmitId} className={`button ${addImageSubmitId}`} onClick={addImage} >Add Image</button>
                        </div>:
                        <div>
                            <div className="add-image-section-text">Add Image</div>
                            <ImageUploader 
                                fileContainerStyle={{background: "transparent", boxShadow: "none", color: "var(--site-background-color)", padding: "0", margin: "0"}} 
                                buttonClassName="button"
                                buttonStyles={{width: "auto", transition: "none"}}
                                withIcon={false}
                                buttonText="Choose Image"
                                onChange={onDrop} 
                                imgExtension={['.jpg', '.gif', '.png', '.gif']}
                                maxFileSize={5242880} 
                                singleImage={true}
                            />
                        </div>
                }
            </div>
            <button className="add-image-back-button" onClick={() => {showAddTopic(false)}}>
                <LeftArrowSVG/>
            </button>
        </div>
    );

    return !state.addTopicDisplayed ? ImageNavigator : ImageAdder;
}