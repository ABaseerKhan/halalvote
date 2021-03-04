import React, { useState, useEffect, useRef, useContext, useLayoutEffect } from 'react';
import { useCookies } from 'react-cookie';
import { topicsConfig, usersConfig } from '../../https-client/config';
import { ReactComponent as AddButtonSVG} from '../../icons/add-button.svg'
import { ReactComponent as TrashButtonSVG } from '../../icons/trash-icon.svg';
import { ReactComponent as DownArrowSVG } from "../../icons/down-arrow.svg";
import { ReactComponent as UpArrowSVG } from "../../icons/up-arrow.svg";
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
import { topicMediaContext, topicsContext } from '../app-shell';
import Dropzone, { IFileWithMeta, IUploadParams, StatusValue } from 'react-dropzone-uploader';
import { v4 as uuidv4 } from 'uuid';
import { VideoPlayer } from './video-player';
import { postData } from '../../https-client/client';

// type imports
import { TopicMedia } from '../../types';

// styles
import './topic-media.css';
import 'react-dropzone-uploader/dist/styles.css';
import { HeartLike } from '../heart-like/heart-like';


export const videoFormats = new Set();
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
    addMediaDisplayed: boolean,
    picture: BasicPicture | null,
    previewDisplayed: boolean
};
export const TopicMediaComponent = (props: TopicImagesComponentProps) => {
    let { topicIndexOverride } = props;

    const { topicsState: { topics, topicIndex } } = useContext(topicsContext);
    topicIndexOverride = (topicIndexOverride !== undefined) ? topicIndexOverride : topicIndex;
    const topicTitle = topics?.length ? topics[topicIndexOverride]?.topicTitle || '' : '';

    const { topicMediaState, setTopicMediaContext } = useContext(topicMediaContext);
    const topicMedia = topicMediaState[topicTitle]?.images || [];
    const imageIndex = topicMediaState[topicTitle]?.index || 0;
    const doneLoading = !!topicMediaState[topicTitle]?.doneLoading;

    const { authenticatedPostData } = useContext(authenticatedPostDataContext);
    const { authenticatedGetData } = useContext(authenticatedGetDataContext);

    const [state, setState] = useState<TopicImagesComponentState>({
        addMediaDisplayed: false,
        picture: null,
        previewDisplayed: false
    });

    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const history = useHistory();
    const query = useQuery();

    const imagesBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (topicTitle && !topicMediaState[topicTitle]) { 
            fetchMedia();
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicTitle, sessiontoken]);

    useLayoutEffect(() => {
        setState(prevState => ({ ...prevState, addMediaDisplayed: false }))
        if (imagesBodyRef.current) {
            imagesBodyRef.current?.scroll(0, (imageIndex * imagesBodyRef.current.clientHeight));
        } // eslint-disable-next-line
    }, [topicTitle]);

    useEffect(() => {
        setState(prevState=> prevState)
    }, [props.shown]);

    useEffect(() => {
        var isScrolling: any;
        if (imagesBodyRef.current) {
            imagesBodyRef.current.onscroll = () => {
                clearTimeout( isScrolling );
                isScrolling = setTimeout(async function() {
                    if (imagesBodyRef.current) {
                        const imgIndex = Math.floor((imagesBodyRef.current!.scrollTop+10) / imagesBodyRef.current!.clientHeight);
                        if ((imgIndex >= topicMedia.length - 2) && (imgIndex > imageIndex)) {
                            await fetchMedia(imgIndex);
                        } else {
                            setTopicMediaContext(topicTitle, topicMedia, Math.min(Math.max(imgIndex, 0), topicMedia.length - 1));
                        }
                    }
                }, 66);
            }
        }
    });

    useEffect(() => {
        if (username && topicMedia && topicMedia.length && topicMedia[imageIndex] && !topicMedia[imageIndex].userSeen) {
            const body: any = {
                "username": username,
                "mediaId": topicMedia[imageIndex].id
            };
            postData({
                baseUrl: usersConfig.url,
                path: 'user-see-media',
                data: body,
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                },
                setCookie: setCookie
            });
            topicMedia[imageIndex].userSeen = 1;
        }
    }, [imageIndex, topicMedia, sessiontoken, username, setCookie])

    const fetchMedia = async (newIndex?: number, refresh?: boolean, singleImageId?: string) => {
        let queryParams: any = { 
            "topicTitle": topicTitle,
            "n": refresh ? Math.max(newIndex! + 1, 2) : 3,
        };
        if (topicMedia && topicMedia.length && !refresh) queryParams["excludedIds"] = topicMedia.reduce((acc, image) => acc + `${image.id} `, '');
        if (topicMedia && topicMedia.length && singleImageId) queryParams["singleImageId"] = singleImageId;
        let additionalHeaders: any = {};
        if (username && username !== "" && sessiontoken && sessiontoken !== "") {
            queryParams['username'] = username;
            additionalHeaders['sessiontoken'] = sessiontoken;
        }

        const { data }: { data: TopicMedia[] } = await authenticatedGetData({ 
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
                    if (!refresh) {
                        setTopicMediaContext(topicTitle, [...topicMedia, ...data], newIndex || 0, true);
                    } else {
                        setTopicMediaContext(topicTitle, data, newIndex || 0, true);
                    }
                }
            });
        } else {
            setTopicMediaContext(topicTitle, topicMedia, newIndex || 0, true);
        }
    }

    const addMedia = (mediaId: string) => {
        showAddMedia(false);
        fetchMedia(0, true, mediaId);
    };

    const deleteImage = (idx: number) => async () => {
        if (isUserImage(idx)) {
            const { status } = await authenticatedPostData({
                baseUrl: topicsConfig.url,
                path: 'delete-topic-image',
                data: {
                    "id": topicMedia[imageIndex].id,
                    "username": username
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                },
                setCookie: setCookie,
            }, true);

            if (status === 200) {
                fetchMedia(imageIndex > 0 ? imageIndex-1 : 0, true);
            }
        }
    }

    const updateImageLike = async () => {
        const topicMediaItem = topicMedia[imageIndex];
        const { status, data } = await authenticatedPostData({
            baseUrl: topicsConfig.url,
            path: 'update-topic-image-like',
            data: {
                "username": username,
                "imageId": topicMediaItem.id,
                "like": !topicMediaItem.userLike
            },
            additionalHeaders: {
                "sessiontoken": sessiontoken
            },
            setCookie: setCookie,
        }, true);

        if (status === 200) {
            topicMediaItem.likes = data.likes;
            topicMediaItem.userLike = !topicMediaItem.userLike ? 1 : 0;
            setTopicMediaContext(topicTitle, topicMedia, imageIndex, true);
        }
    }

    const showAddMedia = (addMediaDisplayed: boolean) => {
        setState(prevState => ({ ...prevState, addMediaDisplayed: addMediaDisplayed }))
    }

    const isUserImage = (idx: number) => {
        return topicMedia.length > imageIndex && topicMedia[idx].username === username;
    }

    const onUserClick = (user: string) => (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault();
        event.stopPropagation();
        
        query.set('userProfile', user);
        history.replace({
            search: "?" + query.toString()
        });
    };

    const previewDisplayedCallback = (displayed: boolean) => {
        setState(prevState => ({ ...prevState, previewDisplayed: displayed }));
    }

    const fileUploader = (
        <div style={{ height: '100%', width: '100%' }}>
            <div className={"images-body"} style={{ background: 'black'}}>
                <MyUploader submitCallback={addMedia} previewDisplayedCallback={previewDisplayedCallback}/>
            </div>
            {
                !state.previewDisplayed && topicMedia.length > 0 &&
                <div className={"canvas-footer"}>
                    <button className="add-image-back-button" onClick={() => {showAddMedia(false)}}>
                        Cancel
                    </button>
                </div>                
            }
        </div>
    );

    const ImageNavigator = (
        <div style={{ height: '100%', width: '100%' }}>
            <div id="images-body" ref={imagesBodyRef} className={"images-body"}>
                {
                    topicMedia.length > 0 ?
                        topicMedia.map((topicImg, idx) => {
                            const ImgStats = 
                            <>
                                <div className="image-username" onClick={onUserClick(topicImg.username)}>{"@" + topicImg.username}</div>
                                {
                                    isUserImage(idx) && <TrashButtonSVG className="image-delete-button" onClick={deleteImage(idx)}/>
                                }
                                <div className="image-likes-container">
                                    <HeartLike liked={!!topicImg.userLike} numLikes={topicImg.likes} onClickCallback={updateImageLike} strokeColor={'white'} />
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
                    !doneLoading ?
                        <ClipLoader css={loaderCssOverride} size={50} color={"var(--light-neutral-color)"}/> :
                        fileUploader
                }
                {topicMedia.length > (imageIndex + 1) && 
                    <div className={"more-images-below"} style={{ left: 'calc(35% - 16px)' }} onClick={() => imagesBodyRef.current?.scroll(0, (((imageIndex + 1) * imagesBodyRef.current.clientHeight))) }>
                        <DownArrowSVG />
                    </div>
                }
                {topicMedia.length > (imageIndex + 1) && 
                    <div className={"more-images-below"} style={{ left: 'calc(65% - 16px)' }} onClick={() => imagesBodyRef.current?.scroll(0, (((imageIndex + 1) * imagesBodyRef.current.clientHeight))) }>
                        <DownArrowSVG />
                    </div>
                }
                {imageIndex > 0 && 
                    <div className={"more-images-above"} style={{ left: 'calc(50% - 16px)' }} onClick={() => imagesBodyRef.current?.scroll(0, (((imageIndex - 1) * imagesBodyRef.current.clientHeight))) }>
                        <UpArrowSVG />
                    </div>
                }
            </div>
            {topicMedia.length > 0 && <div className={!state.addMediaDisplayed ? "show-add-image-button" : "hide-add-image-button"} onClick={() => {showAddMedia(true)}}>
                <AddButtonSVG />
            </div>}
        </div>
    );

    return state.addMediaDisplayed ? fileUploader : ImageNavigator;
}

interface UploaderProps {
    submitCallback?: any;
    skipDBUpdate?: boolean;
    previewDisplayedCallback?: (displayed: boolean) => void;
};

export const MyUploader = (props: UploaderProps) => {
    const { authenticatedGetData } = useContext(authenticatedGetDataContext);
    const { authenticatedPostData } = useContext(authenticatedPostDataContext);
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;
    const { topicsState: { topics, topicIndex } } = useContext(topicsContext);
    const topicTitle = topics?.length ? topics[topicIndex]?.topicTitle || '' : '';
    const fileUrl = useRef<string>("");
    const previewImagesBodyRef = useRef<HTMLDivElement>(null);

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
        fileUrl.current = url+fileName;
        return { fields, meta: { fileUrl: url+fileName }, url: url };
    }
    
    // called every time a file's `status` changes
    const handleChangeStatus = ({ meta, file }: IFileWithMeta, status: StatusValue) => {
        props.previewDisplayedCallback && props.previewDisplayedCallback(status !== "removed");
    }
    
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

            if (status === 200 && data) {
                allFiles.forEach(f => f.remove());
                props.submitCallback && props.submitCallback(data);
            }
        } else {
            allFiles.forEach(f => f.remove());
            props.submitCallback && props.submitCallback(files[0].meta.fileUrl);
        }
    }

    return (
        <Dropzone
            multiple={false}
            inputContent={'Upload Media'}
            getUploadParams={getUploadParams}
            onChangeStatus={handleChangeStatus}
            onSubmit={handleSubmit}
            accept="image/*,video/*"
            PreviewComponent={props => {
                const isImage = props.fileWithMeta.file.type.includes("image");
                return (
                    <div ref={previewImagesBodyRef} className="image-container" style={{ flexDirection: (props.meta.width || 0) > (props.meta.height || 0) ? 'unset' : 'column' }}>
                        <div className="image-preview-title">{isImage ? "Image" : "Video"} Preview</div>
                        {
                            props.meta.status === "done" ?
                            (isImage ?
                                <img className='image' style={{margin: "auto"}} alt="Topic" src={fileUrl.current}/> :
                                <VideoPlayer src={fileUrl.current} inView={true} stylesOverride={{height: previewImagesBodyRef.current?.clientHeight, width: previewImagesBodyRef.current?.clientWidth}}/>) :
                            <ClipLoader css={loaderCssOverride} size={50} color={"var(--light-neutral-color)"}/>
                        }
                        <LeftArrowSVG className='cancel-preview' onClick={() => props.files.forEach((f) => f.remove())}/>
                    </div>
                )
            }}
            canCancel
        />
    )
}

export const isVideo = (url: string) => {
    return videoFormats.has(url.split('.').pop()?.toUpperCase());
};

export const loaderCssOverride = css`
        position: absolute;
        top: calc(50% - 25px);
        left: calc(50% - 25px);
    `;