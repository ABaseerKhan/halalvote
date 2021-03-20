import React, { useState, useEffect, useRef, useContext } from 'react';
import { authenticatedGetDataContext } from '../app-shell';
import { TopicMedia } from '../../types';
import { setCardQueryParam, deleteUserProfileQueryParam, modifyTopicQueryParam } from '../../utils';
import { mediaCardId } from '../topic-container/topic-container';
import { useQuery } from '../../hooks/useQuery';
import { 
    useHistory,
} from "react-router-dom";
import { VideoPlayer } from '../topic-media/video-player';
import ClipLoader from "react-spinners/ClipLoader";
import { ReactComponent as DownArrowSVG } from "../../icons/down-arrow.svg";
import { ReactComponent as UpArrowSVG } from "../../icons/up-arrow.svg";
import { isVideo, loaderCssOverride } from '../topic-media/topic-media';
import { superUsername, usersAPIConfig } from '../../https-client/config';
import { HeartLike } from '../heart-like/heart-like';
import { TabScroll } from '../tab-scroll/tab-scroll';
import { ReactComponent as TrashButtonSVG } from '../../icons/trash-icon.svg';
import { useCookies } from 'react-cookie';
import { closeModalContext } from '../modal/modal';


interface UserCreatedMediaProps {
    profileUsername: string,
    fetchTopics: (topicTofetch?: string) => Promise<void>,
}

interface UserMediaState {
    userCreatedMedia: { media: TopicMedia[], index: number, loading: boolean }; 
    userLikedMedia: { media: TopicMedia[], index: number, loading: boolean };   
}

export const UserCreatedMedia = (props: UserCreatedMediaProps) => {  
    const { profileUsername, fetchTopics } = props;

    const { authenticatedGetData } = useContext(authenticatedGetDataContext);
    const { closeModal } = useContext(closeModalContext);

    const query = useQuery();
    const history = useHistory();

    // eslint-disable-next-line
    const [cookies, , ] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const [state, setState] = useState<UserMediaState>({
        userLikedMedia: { media: [], index: 0, loading: true },
        userCreatedMedia: { media: [], index: 0, loading: true },
    });

    const imagesBodyRef = useRef<HTMLDivElement>(null);
    const likedImagesBodyRef = useRef<HTMLDivElement>(null);

    const ownProfile = profileUsername === username || superUsername === username;

    useEffect(() => {
        ownProfile && fetchLikedMedia();
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
                            setState(prevState => ({ ...prevState, userLikedMedia: { index: Math.min(Math.max(mediaIndex, 0), state.userLikedMedia.media.length - 1), media: prevState.userLikedMedia.media, loading: prevState.userLikedMedia.loading }}));
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
                            setState(prevState => ({ ...prevState, userCreatedMedia: { index: Math.min(Math.max(mediaIndex, 0), state.userCreatedMedia.media.length - 1), media: prevState.userCreatedMedia.media, loading: prevState.userCreatedMedia.loading } }));
                        }
                    }
                }, 66);
            }
        }
    });

    const fetchCreatedMedia = async (offset?: number, newIndex?: number) => {
        const { data, status }: { data: TopicMedia[], status: number } = await authenticatedGetData({ 
            baseUrl: usersAPIConfig.url,
            path: 'user-created-media', 
            queryParams: {
                "username": profileUsername,
                "n": 3,
                "offset": offset || 0,
            },
            additionalHeaders: { },
        }, true);
        if (status === 200) {
            setState(prevState => { 
                let deDuped = new Map();
                for (const mediaItem of [...prevState.userCreatedMedia.media, ...data]) {
                    deDuped.set(mediaItem.id, mediaItem);
                }
                return { ...prevState, userCreatedMedia: { media: [...deDuped.values()], index: newIndex || 0 , loading: false}}
            });
        }
    }

    const fetchLikedMedia = async (offset?: number, newIndex?: number) => {
        const { data, status }: { data: TopicMedia[], status: number } = await authenticatedGetData({ 
            baseUrl: usersAPIConfig.url,
            path: 'user-liked-media', 
            queryParams: {
                "username": profileUsername,
                "n": 3,
                "offset": offset || 0,
            },
            additionalHeaders: { "sessiontoken": sessiontoken },
        }, true);
        if (status === 200) { 
            setState(prevState => { 
                let deDuped = new Map();
                for (const mediaItem of [...prevState.userLikedMedia.media, ...data]) {
                    deDuped.set(mediaItem.id, mediaItem);
                }
                return { ...prevState, userLikedMedia: { media: [...deDuped.values()], index: newIndex || 0, loading: false }} 
            });
        }
    }

    const selectMediaHandler = async (mediaItem: TopicMedia) => {
        deleteUserProfileQueryParam(history, query);
        await fetchTopics(mediaItem.topicTitle);
        modifyTopicQueryParam(query, mediaItem.topicTitle!);
        setCardQueryParam(history, query, mediaCardId.toLowerCase());
    }

    const userMedia = (mediaState: { media: TopicMedia[], index: number, loading : boolean }, liked: number) => (
        <div style={{ height: '100%', width: '100%' }}>
            <div id="images-body" ref={liked === 1 ? likedImagesBodyRef : imagesBodyRef} className={"images-body"} style={{ borderRadius: '0 0 25px 25px' }}>
                {
                    mediaState.media.length > 0 ?
                        mediaState.media.map((mediaItem, idx) => {
                            const ImgStats = 
                            <>
                                <div className="media-topic-title" onClick={() => { closeModal(async () => { selectMediaHandler(mediaItem); }); }}><span className="topic-label">Topic:</span>{mediaItem.topicTitle}</div>
                                <div className="image-username" >{"@" + mediaItem.username}</div>
                                {
                                    (mediaItem.username === username || superUsername === username) && <TrashButtonSVG className="image-delete-button" />
                                }
                                <div className="image-likes-container">
                                    <HeartLike liked={!!mediaItem.userLike} numLikes={mediaItem.likes} onClickCallback={() => {}} strokeColor={'white'}/>
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
                    mediaState.loading ?
                        <ClipLoader css={loaderCssOverride} size={50} color={"var(--light-neutral-color)"} loading={mediaState.loading}/> :
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
    );

    const tabNames = ownProfile ? ["Liked Media", "Created Media"] : ["Created Media"];
    const sections = ownProfile ? [
        <div className="topics-section-container">{userMedia(state.userLikedMedia, 1)}</div>,
        <div className="topics-section-container">{userMedia(state.userCreatedMedia, 0)}</div>,
    ] : [<div className="topics-section-container">{userMedia(state.userCreatedMedia, 0)}</div>,];

    return (
        <TabScroll 
            tabNames={tabNames}
            Sections={sections}
            sectionFillsContainer
        /> 
    )
}