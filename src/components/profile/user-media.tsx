import React, { useState, useEffect, useRef, useContext } from 'react';
import { authenticatedGetDataContext } from '../app-shell';
import { TopicMedia } from '../../types';
import { setCardQueryParam } from '../../utils';
import { commentsCardId } from '../topic-container/topic-container';
import { useQuery } from '../../hooks/useQuery';
import { 
    useHistory,
} from "react-router-dom";
import { VideoPlayer } from '../topic-media/video-player';
import ClipLoader from "react-spinners/ClipLoader";
import { ReactComponent as DownArrowSVG } from "../../icons/down-arrow.svg";
import { ReactComponent as UpArrowSVG } from "../../icons/up-arrow.svg";
import { isVideo, loaderCssOverride } from '../topic-media/topic-media';
import { usersConfig } from '../../https-client/config';
import { HeartLike } from '../heart-like/heart-like';
import { TabScroll } from '../tab-scroll/tab-scroll';

interface UserCreatedMediaProps {
    profileUsername: string,
    fetchTopics: (topicTofetch?: string) => Promise<void>,
    closeModal: any,
    
}

interface UserMediaState {
    userCreatedMedia: { media: TopicMedia[], index: number }; 
    userLikedMedia: { media: TopicMedia[], index: number };
    loading: boolean;
}

export const UserCreatedMedia = (props: UserCreatedMediaProps) => {  
    const { profileUsername, fetchTopics, closeModal } = props;

    const { authenticatedGetData } = useContext(authenticatedGetDataContext);

    const query = useQuery();
    const history = useHistory();

    const [state, setState] = useState<UserMediaState>({
        userLikedMedia: { media: [], index: 0 },
        userCreatedMedia: { media: [], index: 0 },
        loading: true,
    });

    const imagesBodyRef = useRef<HTMLDivElement>(null);
    const likedImagesBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchLikedMedia();
        fetchCreatedMedia(); // eslint-disable-next-line
    }, [])

    useEffect(() => {
        var isScrolling: any;
        if (likedImagesBodyRef.current) {
            likedImagesBodyRef.current.onscroll = () => {
                clearTimeout( isScrolling );
                isScrolling = setTimeout(async function() {
                    if (likedImagesBodyRef.current) {
                        const mediaIndex = Math.floor((likedImagesBodyRef.current!.scrollTop+10) / likedImagesBodyRef.current!.clientHeight);
                        if ((mediaIndex >= state.userLikedMedia.media.length - 2) && (mediaIndex > state.userLikedMedia.index)) {
                            await fetchLikedMedia(state.userLikedMedia.media.length, mediaIndex);
                        } else {
                            setState(prevState => ({ ...prevState, userLikedMedia: { index: Math.min(Math.max(mediaIndex, 0), state.userLikedMedia.media.length - 1), media: prevState.userLikedMedia.media }}));
                        }
                    }
                }, 66);
            }
        }
    });

    useEffect(() => {
        var isScrolling: any;
        if (imagesBodyRef.current) {
            imagesBodyRef.current.onscroll = () => {
                clearTimeout( isScrolling );
                isScrolling = setTimeout(async function() {
                    if (imagesBodyRef.current) {
                        const mediaIndex = Math.floor((imagesBodyRef.current!.scrollTop+10) / imagesBodyRef.current!.clientHeight);
                        if ((mediaIndex >= state.userCreatedMedia.media.length - 2) && (mediaIndex > state.userCreatedMedia.index)) {
                            await fetchCreatedMedia(state.userCreatedMedia.media.length, mediaIndex);
                        } else {
                            setState(prevState => ({ ...prevState, userCreatedMedia: { index: Math.min(Math.max(mediaIndex, 0), state.userCreatedMedia.media.length - 1), media: prevState.userCreatedMedia.media } }));
                        }
                    }
                }, 66);
            }
        }
    });

    const fetchCreatedMedia = async (offset?: number, newIndex?: number) => {
        const { data }: { data: TopicMedia[]} = await authenticatedGetData({ 
            baseUrl: usersConfig.url,
            path: 'user-created-media', 
            queryParams: {
                "username": profileUsername,
                "n": 3,
                "offset": offset || 0,
            },
            additionalHeaders: { },
        }, true);
        setState(prevState => ({ ...prevState, userCreatedMedia: { media: [...prevState.userCreatedMedia.media, ...data], index: newIndex || 0 }}));
    }

    const fetchLikedMedia = async (offset?: number, newIndex?: number) => {
        const { data }: { data: TopicMedia[]} = await authenticatedGetData({ 
            baseUrl: usersConfig.url,
            path: 'user-liked-media', 
            queryParams: {
                "username": profileUsername,
                "n": 3,
                "offset": offset || 0,
            },
            additionalHeaders: { },
        }, true);
        setState(prevState => ({ ...prevState, userLikedMedia: { media: [...prevState.userLikedMedia.media, ...data], index: newIndex || 0 }}));
    }

    // const isUserImage = (idx: number) => {
    //     return state.userMedia.length > state.mediaIndex && state.userMedia[idx].username === username;
    // }

    const userMedia = (mediaState: { media: TopicMedia[], index: number }, liked: number) => (
        <div style={{ height: '100%', width: '100%' }}>
            <div id="images-body" ref={liked === 1 ? likedImagesBodyRef : imagesBodyRef} className={"images-body"}>
                {
                    mediaState.media.length > 0 ?
                        mediaState.media.map((mediaItem, idx) => {
                            const ImgStats = 
                            <>
                                <div className="media-topic-title" onClick={async () => { setCardQueryParam(history, query, commentsCardId.toLowerCase()); await fetchTopics(mediaItem.topicTitle); closeModal(); }}><span className="topic-label">Topic:</span>{mediaItem.topicTitle}</div>
                                <div className="image-actions-container">
                                    {/* {
                                        isUserImage(idx) && <TrashButtonSVG className="image-delete-button" />
                                    } */}
                                    <div className="image-likes-container">
                                    <HeartLike liked={!!mediaItem.userLike} numLikes={mediaItem.likes} onClickCallback={() => {}} strokeColor={'white'}/>
                                    </div>
                                </div>
                            </>
                            const Img = (
                                <div key={idx} className="image-container" style={{ flexDirection: (mediaItem?.width || 0) > (mediaItem?.height || 0) ? 'unset' : 'column' }}>
                                    {isVideo(mediaItem.image) ? <VideoPlayer src={mediaItem.image} inView={typeof idx === "number" && isNaN(idx)} stylesOverride={{ height: imagesBodyRef.current?.clientHeight, width: imagesBodyRef.current?.clientWidth }}/> : 
                                    <img id="image" className='image' style={{ margin: "auto"}} alt={mediaItem.username} src={mediaItem.image}/>
                                    }
                                    {ImgStats}
                                </div>
                            )
                            return Img;
                        })
                    :
                    state.loading ?
                        <ClipLoader css={loaderCssOverride} size={50} color={"var(--light-neutral-color)"} loading={state.loading}/> :
                        <div className='no-image-text'>No media to show</div>
                }
                {mediaState.media.length > (mediaState.index + 1) && 
                    <div className={"more-images-below"} style={{ left: 'calc(35% - 16px)' }} onClick={() => imagesBodyRef.current?.scroll(0, (((mediaState.index + 1) * imagesBodyRef.current.clientHeight))) }>
                        <DownArrowSVG />
                    </div>
                }
                {mediaState.media.length > (mediaState.index + 1) && 
                    <div className={"more-images-below"} style={{ left: 'calc(65% - 16px)' }} onClick={() => imagesBodyRef.current?.scroll(0, (((mediaState.index + 1) * imagesBodyRef.current.clientHeight))) }>
                        <DownArrowSVG />
                    </div>
                }
                {mediaState.index > 0 && 
                    <div className={"more-images-above"} style={{ left: 'calc(50% - 16px)' }} onClick={() => imagesBodyRef.current?.scroll(0, (((mediaState.index - 1) * imagesBodyRef.current.clientHeight))) }>
                        <UpArrowSVG />
                    </div>
                }
            </div>
        </div>
    )

    return (
        <TabScroll 
                tabNames={["Liked Media", "Created Media"]}
                Sections={[
                    <div className="topics-section-container">{userMedia(state.userLikedMedia, 1)}</div>,
                    <div className="topics-section-container">{userMedia(state.userCreatedMedia, 0)}</div>,
                ]}
            />
    )
}