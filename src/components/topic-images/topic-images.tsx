import React, { useState, useEffect, useRef, useContext, useLayoutEffect } from 'react';
import { getData } from '../../https-client/client';
import { useCookies } from 'react-cookie';
import { topicsConfig } from '../../https-client/config';
import { ReactComponent as AddButtonSVG} from '../../icons/add-button.svg'
import { ReactComponent as TrashButtonSVG } from '../../icons/trash-icon.svg';
import { ReactComponent as HeartButtonSVG } from '../../icons/heart-icon.svg';
import { ReactComponent as DownArrowSVG } from "../../icons/down-arrow.svg";
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
import { fullScreenContext, topicImagesContext, topicsContext } from '../app-shell';

interface TopicImagesComponentProps {
    shown?: boolean,
    topicIndexOverride?: number;
};

interface BasicPicture { src: string; width: number; height: number; };
interface TopicImagesComponentState {
    addTopicDisplayed: boolean,
    picture: BasicPicture | null,
    loading: boolean,
};
export const TopicImagesComponent = (props: TopicImagesComponentProps) => {
    let { topicIndexOverride } = props;

    const { fullScreenMode, setFullScreenModeContext } = useContext(fullScreenContext);

    const { topicsState: { topics, topicIndex } } = useContext(topicsContext);
    topicIndexOverride = (topicIndexOverride !== undefined) ? topicIndexOverride : topicIndex;
    const topicTitle = topics?.length ? topics[topicIndexOverride]?.topicTitle || '' : '';

    const { topicImagesState, setTopicImagesContext } = useContext(topicImagesContext);
    const topicImages = topicImagesState[topicTitle]?.images || [];
    const imageIndex = topicImagesState[topicTitle]?.index || 0;

    const [state, setState] = useState<TopicImagesComponentState>({
        addTopicDisplayed: false,
        picture: null,
        loading: false,
    });

    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const history = useHistory();
    const query = useQuery();

    const imagesBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (topicTitle && !topicImagesState[topicTitle]) { 
            fetchImages();
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicTitle, sessiontoken]);

    useLayoutEffect(() => {
        if (imagesBodyRef.current) {
            imagesBodyRef.current?.scroll(0, (imageIndex * imagesBodyRef.current.clientHeight));
        } // eslint-disable-next-line
    }, []);

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
                    setTopicImagesContext(topicTitle, topicImages, Math.min(Math.max(imgIndex, 0), topicImages.length - 1));
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
                    setTopicImagesContext(topicTitle, data, 0);
                    setState({...state, addTopicDisplayed: false, loading: false});
                }
            });
        } else {
            setTopicImagesContext(topicTitle, data, 0);
            setState({...state, addTopicDisplayed: false, loading: false});
        }
    }

    const addImage = async () => {
        if (state.picture) {
            const { status, data } = await postData({
                baseUrl: topicsConfig.url,
                path: 'add-topic-image',
                data: {
                    "username": username,
                    "topicTitle": topicTitle,
                    "image": state.picture.src
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                },
                setCookie: setCookie,
            });

            if (status === 200 && topicTitle === data) {
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
                    "id": topicImages[imageIndex].id,
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
        const topicImage = topicImages[imageIndex];
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
            setTopicImagesContext(topicTitle, topicImages, imageIndex);
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
        return topicImages.length > imageIndex && topicImages[idx].username === username;
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
        setFullScreenModeContext(!fullScreenMode);
    };

    const moreImagesIndicatorPosition = fullScreenMode ? "fixed" : "absolute";

    const ImageNavigator = (
        <div style={{ height: '100%', width: '100%' }}>
            <div id="images-body" ref={imagesBodyRef} className={fullScreenMode ? "images-body-fullscreen" : "images-body"} onDoubleClick={doubleTap}>
                {
                    topicImages.length > 0 ?
                        topicImages.map((topicImg, idx) => {
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
                                <div key={idx} className="image-container" style={{ flexDirection: (topicImg?.width || 0) > (topicImg?.height || 0) ? 'unset' : 'column' }}>
                                    <img id="image" className='image' style={{ margin: "auto"}} alt={topicTitle} src={topicImg.image}/>
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
                {topicImages.length > imageIndex + 1 && <div className={"more-images-below"} style={{ position: moreImagesIndicatorPosition }} onClick={() => imagesBodyRef.current?.scroll(0, ((imageIndex * imagesBodyRef.current.clientHeight) + 500)) }>
                    <DownArrowSVG />
                </div>}
            </div>
            <div className={fullScreenMode ? "canvas-footer-fullscreen" : "canvas-footer"}>
                <div className={!state.addTopicDisplayed ? "show-add-image-button" : "hide-add-image-button"} onClick={() => {showAddTopic(true)}}>
                    <AddButtonSVG />
                </div>
            </div>
        </div>
    );

    const ImageAdder = (
        <div style={{ height: '100%', width: '100%' }}>
            <div className={fullScreenMode ? "images-body-fullscreen" : "images-body"} style={{ background: 'black'}} onDoubleClick={doubleTap}>
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
                        </div>
                }
            </div>
            <div className={fullScreenMode ? "canvas-footer-fullscreen" : "canvas-footer"}>
                <button className="add-image-back-button" onClick={() => {showAddTopic(false)}}>
                    Cancel
                </button>
            </div>
        </div>
    );

    return !state.addTopicDisplayed ? ImageNavigator : ImageAdder;
}