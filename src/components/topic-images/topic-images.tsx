import React, { useState, useEffect, useRef } from 'react';
import { getData } from '../../https-client/client';
import { useCookies } from 'react-cookie';
import { topicsConfig } from '../../https-client/config';
import { ReactComponent as AddButtonSVG} from '../../icons/add-button.svg'
import { ReactComponent as TrashButtonSVG } from '../../icons/trash-icon.svg';
import { ReactComponent as HeartButtonSVG } from '../../icons/heart-icon.svg';
import { postData } from '../../https-client/client';
import ImageUploader from 'react-images-upload';
import { css } from "@emotion/core";
import ClipLoader from "react-spinners/ClipLoader";
import { getImageDimensionsFromSource } from '../../utils';
import { resizeImage } from '../../utils';
import { 
    useHistory,
} from "react-router-dom";

// type imports
import { TopicImages } from '../../types';

// styles
import './topic-images.css';
import { useQuery } from '../../hooks/useQuery';
import { FullScreenPortal } from '../..';

interface TopicImagesComponentProps {
    topicTitle: string,
    shown?: boolean,
};

interface BasicPicture { src: string; width: number; height: number; };
interface TopicImagesComponentState {
    addTopicDisplayed: boolean,
    topicImages: TopicImages[],
    currentIndex: number,
    picture: BasicPicture | null,
    loading: boolean,
    fullScreenMode: boolean,
};
export const TopicImagesComponent = (props: TopicImagesComponentProps) => {
    const { topicTitle } = props;
    const [state, setState] = useState<TopicImagesComponentState>({
        addTopicDisplayed: false,
        topicImages: [],
        currentIndex: 0,
        picture: null,
        loading: true,
        fullScreenMode: false,
    });
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;
    const history = useHistory();
    const query = useQuery();
    const imagesBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (topicTitle) { 
            fetchImages();
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicTitle, sessiontoken]);

    useEffect(() => {
        setState(prevState=> prevState)
    }, [props.shown]);

    useEffect(() => {
        var isScrolling: any;
        if (imagesBodyRef.current) {
            imagesBodyRef.current.onscroll = () => {
                clearTimeout( isScrolling );
                isScrolling = setTimeout(function() {
                    const imgIndex = Math.floor((imagesBodyRef.current!.scrollTop+10) / imagesBodyRef.current!.clientHeight);
                    setState(prevState => ({...prevState, currentIndex: Math.min(Math.max(imgIndex, 0), state.topicImages.length - 1)}));
                }, 66);
            }
        }
    });

    const addImageSubmitId = "add-image-submit-button";

    const fetchImages = async () => {
        setState(prevState => ({ ...prevState, topicImages: [], currentIndex: 0, picture: null, loading: true }));
        let queryParams: any = { 
            "topicTitle": topicTitle
        };
        let additionalHeaders: any = {};
        if (username && username !== "" && sessiontoken && sessiontoken !== "") {
            queryParams['username'] = username;
            additionalHeaders['sessiontoken'] = sessiontoken;
        }

        const { data }: { data: TopicImages[] } = await getData({ 
            baseUrl: topicsConfig.url,
            path: 'get-topic-images',
            queryParams: queryParams,
            additionalHeaders: additionalHeaders,
        });
        if (data.length) {
            data.forEach(async (img, idx) => { 
                const imgDimensions = await getImageDimensionsFromSource(img.image);
                img.height = imgDimensions.height;
                img.width = imgDimensions.width;
                if (idx === data.length - 1) {
                    setState({...state, topicImages: data, currentIndex: 0, addTopicDisplayed: false, loading: false});
                }
            });
        } else {
            setState({...state, topicImages: data, currentIndex: 0, addTopicDisplayed: false, loading: false});
        }
    }

    const addImage = async () => {
        if (state.picture) {
            const { status, data } = await postData({
                baseUrl: topicsConfig.url,
                path: 'add-topic-image',
                data: {
                    "username": username,
                    "topicTitle": props.topicTitle,
                    "image": state.picture.src
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

    const deleteImage = (idx: number) => async () => {
        if (isUserImage(idx)) {
            const { status } = await postData({
                baseUrl: topicsConfig.url,
                path: 'delete-topic-image',
                data: {
                    "id": state.topicImages[state.currentIndex].id,
                    "username": username
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                },
                setCookie: setCookie,
            });

            if (status === 200) {
                fetchImages();
            }
        }
    }

    const updateImageLike = async () => {
        const topicImage = state.topicImages[state.currentIndex];
        const { status, data } = await postData({
            baseUrl: topicsConfig.url,
            path: 'update-topic-image-like',
            data: {
                "username": username,
                "imageId": topicImage.id,
                "like": topicImage.userLike === 0
            },
            additionalHeaders: {
                "sessiontoken": sessiontoken
            },
            setCookie: setCookie,
        });

        if (status === 200) {
            topicImage.likes = data.likes;
            topicImage.userLike = topicImage.userLike === 0 ? 1 : 0;
            setState({...state, topicImages: state.topicImages});
        }
    }

    const showAddTopic = (addTopicDisplayed: boolean) => {
        setState({...state, addTopicDisplayed: addTopicDisplayed})
    }

    const onDrop = async (files: File[], picture: string[]) => {
        const resizedImage = await resizeImage(files[0]);
        const imgDimensions = await getImageDimensionsFromSource(resizedImage);
        const basicPicture: BasicPicture = { src: resizedImage, height: imgDimensions.height, width: imgDimensions.width };

        setState({...state, picture: basicPicture});
    }

    const isUserImage = (idx: number) => {
        return state.topicImages.length > state.currentIndex && state.topicImages[idx].username === username;
    }

    const loaderCssOverride = css`
        position: absolute;
        top: calc(50% - 25px);
        left: calc(50% - 25px);
    `;

    const onUserClick = (user: string) => (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault();
        event.stopPropagation();
        
        query.set('userProfile', user);
        history.push({
            search: "?" + query.toString()
        });
    };

    const doubleTap = () => {
        setState(prevState => ({ ...prevState, fullScreenMode: !prevState.fullScreenMode }));
        setTimeout(() => { 
            imagesBodyRef.current?.scroll(0, (state.currentIndex * imagesBodyRef.current.clientHeight));
        }, 0);
    };

    const ImageNavigator = (
        <div id="images-body" ref={imagesBodyRef} className={state.fullScreenMode ? "images-body-fullscreen" : "images-body"} onDoubleClick={doubleTap}>
            {
                state.topicImages.length > 0 ?
                    state.topicImages.map((topicImg, idx) => {
                        const ImgStats = 
                        <>
                            <div className="image-actions-container">
                                <div className="image-username" onClick={onUserClick(topicImg.username)}>{"@" + topicImg.username}</div>
                                {
                                    isUserImage(idx) && <TrashButtonSVG className="image-delete-button" onClick={deleteImage(idx)}/>
                                }
                                <div className="image-likes-container">
                                    <HeartButtonSVG className={!!topicImg.userLike ? "liked" : "like"} onClick={updateImageLike} />
                                    <div className="image-likes">{topicImg.likes}</div>
                                </div>
                            </div>
                        </>
                        const Img = (
                            <div className="image-container" style={{ flexDirection: (topicImg?.width || 0) > (topicImg?.height || 0) ? 'unset' : 'column' }}>
                                <img id="image" className='image' style={{ margin: "auto"}} alt={props.topicTitle} src={topicImg.image}/>
                                {ImgStats}
                            </div>
                        )
                        return Img;
                    })
                :
                state.loading ?
                    <ClipLoader css={loaderCssOverride} size={50} color={"var(--light-neutral-color)"} loading={state.loading}/> :
                    <div className='no-image-text'>No images to show</div>
            }
            <div className={!!props.shown ? ("show-add-image-button" + (state.fullScreenMode ? "-fullscreen" : "")) : ("hide-add-image-button" + (state.fullScreenMode ? "-fullscreen" : ""))} onClick={() => {showAddTopic(true)}}>
                <AddButtonSVG/>
            </div>
        </div>
    );

    const ImageAdder = (
        <div className={state.fullScreenMode ? "images-body-fullscreen" : "images-body"} style={{ background: 'black'}} onDoubleClick={doubleTap}>
            {
                state.picture ? 
                    <div className="image-container" style={{ flexDirection: (state.picture?.width || 0) > (state.picture?.height || 0) ? 'unset' : 'column' }}>
                        <div className="image-preview-title">Image Preview</div>
                        <img className='image' style={{margin: "auto"}} alt="Topic" src={state.picture.src}/>
                        <ImageUploader 
                            className={"file-uploader"}
                            fileContainerStyle={{padding: '5px', background: "rgba(0,0,0,0.4)", height: 'fit-content', boxShadow: "none", color: "white", margin: '0', flexDirection: 'unset'}} 
                            buttonClassName="add-image-choose-button"
                            buttonStyles={{background: "none", width: "auto", color: "white", fontStyle: 'italic', textDecoration: 'underline', fontSize: '1.5vh', transition: "none", padding: "0", margin: "0 0 0 0"}}
                            withIcon={false} 
                            buttonText="Choose New Image"
                            onChange={onDrop} 
                            imgExtension={['.jpg', '.gif', '.png', '.gif', 'jpeg']}
                            maxFileSize={5242880} 
                            singleImage={true}
                            label={""}
                        />
                        <button id={addImageSubmitId} className={`button ${addImageSubmitId}`} onClick={addImage} >Add Image</button>
                    </div>:
                    <div style={{ height: '100px', width: '100%', position: 'absolute', top: 'calc(50% - 100px)'}}>
                        <div className="add-image-section-text">Add Image</div>
                        <ImageUploader 
                            fileContainerStyle={{background: "transparent", boxShadow: "none", color: "var(--site-background-color)", padding: "0", margin: "20px 0 0 0"}} 
                            buttonClassName="button"
                            buttonStyles={{width: "auto", transition: "none", margin: "20px 0 0 0"}}
                            withIcon={false}
                            buttonText="Choose Image"
                            onChange={onDrop} 
                            imgExtension={['.jpg', '.gif', '.png', '.gif', 'jpeg']}
                            maxFileSize={5242880} 
                            singleImage={true}
                        />
                        <button className="add-image-back-button" onClick={() => {showAddTopic(false)}}>
                            Cancel
                        </button>
                    </div>
            }
        </div> 
    );

    return !state.addTopicDisplayed ? (state.fullScreenMode ? <FullScreenPortal>{ImageNavigator}</FullScreenPortal> : ImageNavigator) : (state.fullScreenMode ? <FullScreenPortal>{ImageAdder}</FullScreenPortal> : ImageAdder);
}