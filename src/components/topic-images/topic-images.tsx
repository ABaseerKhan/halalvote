import React, { useState, useEffect, useRef, useContext, useLayoutEffect } from 'react';
import { useCookies } from 'react-cookie';
import { topicsConfig } from '../../https-client/config';
import { ReactComponent as AddButtonSVG} from '../../icons/add-button.svg'
import { ReactComponent as TrashButtonSVG } from '../../icons/trash-icon.svg';
import { ReactComponent as HeartButtonSVG } from '../../icons/heart-icon.svg';
import { ReactComponent as DownArrowSVG } from "../../icons/down-arrow.svg";
import { ReactComponent as LeftArrowSVG } from "../../icons/left-arrow.svg";
import { css } from "@emotion/core";
import ClipLoader from "react-spinners/ClipLoader";
import { getImageDimensionsFromSource, getVideoDimensionsOf } from '../../utils';
import { 
    useHistory,
} from "react-router-dom";
import { authenticatedPostDataContext } from '../app-shell';
import { authenticatedGetDataContext } from '../app-shell';
import { useQuery } from '../../hooks/useQuery';
import { topicImagesContext, topicsContext } from '../app-shell';
import Dropzone, { IFileWithMeta, IUploadParams, StatusValue } from 'react-dropzone-uploader'
import { v4 as uuidv4 } from 'uuid';
import { VideoPlayer } from './video-player';

// type imports
import { TopicImages } from '../../types';

// styles
import './topic-images.css';
import 'react-dropzone-uploader/dist/styles.css'


const videoFormats = new Set();
videoFormats.add('MOV');
videoFormats.add('MP4');
videoFormats.add('AVI');
videoFormats.add('FLV');
videoFormats.add('WEBM');
videoFormats.add('WMV');
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

    const { topicsState: { topics, topicIndex } } = useContext(topicsContext);
    topicIndexOverride = (topicIndexOverride !== undefined) ? topicIndexOverride : topicIndex;
    const topicTitle = topics?.length ? topics[topicIndexOverride]?.topicTitle || '' : '';

    const { topicImagesState, setTopicImagesContext } = useContext(topicImagesContext);
    const topicImages = topicImagesState[topicTitle]?.images || [];
    const imageIndex = topicImagesState[topicTitle]?.index || 0;

    const { authenticatedPostData } = useContext(authenticatedPostDataContext);
    const { authenticatedGetData } = useContext(authenticatedGetDataContext);

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
                    if (imagesBodyRef.current) {
                        const imgIndex = Math.floor((imagesBodyRef.current!.scrollTop+10) / imagesBodyRef.current!.clientHeight);
                        if ((imgIndex === topicImages.length - 2) && (imgIndex > imageIndex)) {
                            fetchImages(imgIndex);
                        }
                        setTopicImagesContext(topicTitle, topicImages, Math.min(Math.max(imgIndex, 0), topicImages.length - 1));
                    }
                }, 66);
            }
        }
    });

    const fetchImages = async (newIndex?: number) => {
        setState(prevState => ({ ...prevState, topicImages: [], currentIndex: 0, picture: null, loading: true }));
        let queryParams: any = { 
            "topicTitle": topicTitle,
            "n": 3,
        };
        if (topicImages && topicImages.length) queryParams["excludedIds"] = topicImages.reduce((acc, image) => acc + `${image.id} `, '');
        let additionalHeaders: any = {};
        if (username && username !== "" && sessiontoken && sessiontoken !== "") {
            queryParams['username'] = username;
            additionalHeaders['sessiontoken'] = sessiontoken;
        }

        const { data }: { data: TopicImages[] } = await authenticatedGetData({ 
            baseUrl: topicsConfig.url,
            path: 'get-topic-images',
            queryParams: queryParams,
            additionalHeaders: additionalHeaders,
        }, true);
        if (data.length) {
            data.forEach(async (img, idx) => { 
                let imgDimensions;
                if (!isVideo(img.image)) {
                    imgDimensions = await getImageDimensionsFromSource(img.image);
                } else {
                    imgDimensions = await getVideoDimensionsOf(img.image);
                }
                img.height = imgDimensions.height;
                img.width = imgDimensions.width;
                if (idx === data.length - 1) {
                    setTopicImagesContext(topicTitle, [...topicImages, ...data], newIndex || 0);
                    setState({...state, addTopicDisplayed: false, loading: false});
                }
            });
        } else {
            setTopicImagesContext(topicTitle, topicImages, newIndex || topicIndex);
            setState({...state, addTopicDisplayed: false, loading: false});
        }
    }

    const deleteImage = (idx: number) => async () => {
        if (isUserImage(idx)) {
            const { status } = await authenticatedPostData({
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
            }, true);

            if (status === 200) {
                fetchImages();
            }
        }
    }

    const updateImageLike = async () => {
        const topicImage = topicImages[imageIndex];
        const { status, data } = await authenticatedPostData({
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
        }, true);

        if (status === 200) {
            topicImage.likes = data.likes;
            topicImage.userLike = topicImage.userLike === 0 ? 1 : 0;
            setTopicImagesContext(topicTitle, topicImages, imageIndex);
        }
    }

    const showAddTopic = (addTopicDisplayed: boolean) => {
        setState({...state, addTopicDisplayed: addTopicDisplayed})
    }

    const isUserImage = (idx: number) => {
        return topicImages.length > imageIndex && topicImages[idx].username === username;
    }

    const onUserClick = (user: string) => (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault();
        event.stopPropagation();
        
        query.set('userProfile', user);
        history.push({
            search: "?" + query.toString()
        });
    };

    const moreImagesIndicatorPosition = "absolute";

    const ImageNavigator = (
        <div style={{ height: '100%', width: '100%' }}>
            <div id="images-body" ref={imagesBodyRef} className={"images-body"}>
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
                                    {isVideo(topicImg.image) ? <VideoPlayer src={topicImg.image} inView={idx===imageIndex} stylesOverride={{ height: imagesBodyRef.current?.clientHeight, width: imagesBodyRef.current?.clientWidth }}/> : 
                                    <img id="image" className='image' style={{ margin: "auto"}} alt={topicTitle} src={topicImg.image}/>
                                    }
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
            <div className={"canvas-footer"}>
                <div className={!state.addTopicDisplayed ? "show-add-image-button" : "hide-add-image-button"} onClick={() => {showAddTopic(true)}}>
                    <AddButtonSVG />
                </div>
            </div>
        </div>
    );

    const fileUploader = (
        <div style={{ height: '100%', width: '100%' }}>
            <div className={"images-body"} style={{ background: 'black'}}>
                <MyUploader submitCallback={fetchImages}/>
            </div>
            <div className={"canvas-footer"}>
                <button className="add-image-back-button" onClick={() => {showAddTopic(false)}}>
                    Cancel
                </button>
            </div>
        </div>
    );

    return !state.addTopicDisplayed ? ImageNavigator : fileUploader;
}

interface UploaderProps {
    submitCallback?: any;
    skipDBUpdate?: boolean;
};

export const MyUploader = (props: UploaderProps) => {
    const { authenticatedGetData } = useContext(authenticatedGetDataContext);
    const { authenticatedPostData } = useContext(authenticatedPostDataContext);
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;
    const { topicsState: { topics, topicIndex } } = useContext(topicsContext);
    const topicTitle = topics?.length ? topics[topicIndex]?.topicTitle || '' : '';

    // specify upload params and url for your files
    const getUploadParams = async ({ meta: { name } }: IFileWithMeta): Promise<IUploadParams> => {
        const fileName = `${uuidv4()}_${name}`;
        const { data: { fields, url } }: { data: any} = await authenticatedGetData({ 
            baseUrl: topicsConfig.url,
            path: 'get-presigned-media-upload-url',
            queryParams: {
                "objectKey": fileName
            },
            additionalHeaders: { },
        }, true);
        return { fields, meta: { fileUrl: url+fileName }, url: url };
    }
    
    // called every time a file's `status` changes
    const handleChangeStatus = ({ meta, file }: IFileWithMeta, status: StatusValue) => { console.log(status) }
    
    // receives array of files that are done uploading when submit button is clicked
    const handleSubmit = async (files: (IFileWithMeta & { meta: { fileUrl: string } })[], allFiles: IFileWithMeta[]) => {
        if (!props.skipDBUpdate) {
            const { status, data } = await authenticatedPostData({
                baseUrl: topicsConfig.url,
                path: 'add-topic-image',
                data: {
                    "username": username,
                    "topicTitle": topicTitle,
                    "image": files[0].meta.fileUrl,
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                },
                setCookie: setCookie,
            }, true);

            if (status === 200 && topicTitle === data) {
                allFiles.forEach(f => f.remove());
                props.submitCallback && props.submitCallback(files[0].meta.fileUrl);
            }
        } else {
            allFiles.forEach(f => f.remove());
            props.submitCallback && props.submitCallback(files[0].meta.fileUrl);
        }
    }

    return (
        <Dropzone
            getUploadParams={getUploadParams}
            onChangeStatus={handleChangeStatus}
            onSubmit={handleSubmit}
            accept="image/*,audio/*,video/*"
            PreviewComponent={props => {
                return (
                    <div className="image-container" style={{ flexDirection: (props.meta.width || 0) > (props.meta.height || 0) ? 'unset' : 'column' }}>
                        <div className="image-preview-title">Image Preview</div>
                        <img className='image' style={{margin: "auto"}} alt="Topic" src={props.meta.previewUrl}/>
                        <LeftArrowSVG className='cancel-preview' onClick={() => props.files.forEach((f) => f.remove())}/>
                    </div>
                )}
            }
            canCancel
        />
    )
}

const isVideo = (url: string) => {
    return videoFormats.has(url.split('.').pop()?.toUpperCase());
};

export const loaderCssOverride = css`
        position: absolute;
        top: calc(50% - 25px);
        left: calc(50% - 25px);
    `;