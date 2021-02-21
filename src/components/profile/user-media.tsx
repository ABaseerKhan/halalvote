import React, { useState, useEffect, useRef, useContext } from 'react';
import { useCookies } from 'react-cookie';
import { authenticatedGetDataContext } from '../app-shell';
import { ReactComponent as HeartButtonSVG } from '../../icons/heart-icon.svg';
import { TopicMedia } from '../../types';
import { setCardQueryParam } from '../../utils';
import { commentsCardId } from '../topic-container/topic-container';
import { useQuery } from '../../hooks/useQuery';
import { 
    useHistory,
} from "react-router-dom";
import { ReactComponent as TrashButtonSVG } from '../../icons/trash-icon.svg';
import { VideoPlayer } from '../topic-media/video-player';
import ClipLoader from "react-spinners/ClipLoader";
import { ReactComponent as DownArrowSVG } from "../../icons/down-arrow.svg";
import { ReactComponent as UpArrowSVG } from "../../icons/up-arrow.svg";
import { isVideo, loaderCssOverride } from '../topic-media/topic-media';
import { usersConfig } from '../../https-client/config';

interface UserCreatedMediaProps {
    profileUsername: string,
    fetchTopics: (topicTofetch?: string) => Promise<void>,
    closeModal: any,
    
}
export const UserCreatedMedia = (props: UserCreatedMediaProps) => {  
    const { profileUsername, fetchTopics, closeModal } = props;

    const { authenticatedGetData } = useContext(authenticatedGetDataContext);

    const query = useQuery();
    const history = useHistory();
    const [cookies,] = useCookies(['username', 'sessiontoken']);
    const { username, } = cookies;

    const [state, setState] = useState<{ userMedia: TopicMedia[], mediaIndex: number, loading: boolean }>({
        userMedia: [],
        mediaIndex: 0,
        loading: true,
    });

    const imagesBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchCreatedMedia(); // eslint-disable-next-line
    }, [])

    useEffect(() => {
        var isScrolling: any;
        if (imagesBodyRef.current) {
            imagesBodyRef.current.onscroll = () => {
                clearTimeout( isScrolling );
                isScrolling = setTimeout(async function() {
                    if (imagesBodyRef.current) {
                        const mediaIndex = Math.floor((imagesBodyRef.current!.scrollTop+10) / imagesBodyRef.current!.clientHeight);
                        if ((mediaIndex >= state.userMedia.length - 2) && (mediaIndex > state.mediaIndex)) {
                            await fetchCreatedMedia(state.userMedia.length, mediaIndex);
                        } else {
                            setState(prevState => ({ ...prevState, mediaIndex: Math.min(Math.max(mediaIndex, 0), state.userMedia.length - 1) }));
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
        setState(prevState => ({ ...prevState, userMedia: [...prevState.userMedia, ...data], mediaIndex: newIndex || 0 }));
    }

    const isUserImage = (idx: number) => {
        return state.userMedia.length > state.mediaIndex && state.userMedia[idx].username === username;
    }
    
    return (
        <div style={{ height: '100%', width: '100%' }}>
            <div id="images-body" ref={imagesBodyRef} className={"images-body"}>
                {
                    state.userMedia.length > 0 ?
                        state.userMedia.map((mediaItem, idx) => {
                            const ImgStats = 
                            <>
                                <div className="media-topic-title" onClick={async () => { setCardQueryParam(history, query, commentsCardId.toLowerCase()); await fetchTopics(mediaItem.topicTitle); closeModal(); }}><span className="topic-label">Topic:</span>{mediaItem.topicTitle}</div>
                                <div className="image-actions-container">
                                    {
                                        isUserImage(idx) && <TrashButtonSVG className="image-delete-button" />
                                    }
                                    <div className="image-likes-container">
                                        <HeartButtonSVG className={!!mediaItem.userLike ? "liked" : "like"} />
                                        <div className="image-likes">{mediaItem.likes}</div>
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
                {state.userMedia.length > (state.mediaIndex + 1) && 
                    <div className={"more-images-below"} style={{ left: 'calc(35% - 16px)' }} onClick={() => imagesBodyRef.current?.scroll(0, (((state.mediaIndex + 1) * imagesBodyRef.current.clientHeight))) }>
                        <DownArrowSVG />
                    </div>
                }
                {state.userMedia.length > (state.mediaIndex + 1) && 
                    <div className={"more-images-below"} style={{ left: 'calc(65% - 16px)' }} onClick={() => imagesBodyRef.current?.scroll(0, (((state.mediaIndex + 1) * imagesBodyRef.current.clientHeight))) }>
                        <DownArrowSVG />
                    </div>
                }
                {state.mediaIndex > 0 && 
                    <div className={"more-images-above"} style={{ left: 'calc(50% - 16px)' }} onClick={() => imagesBodyRef.current?.scroll(0, (((state.mediaIndex - 1) * imagesBodyRef.current.clientHeight))) }>
                        <UpArrowSVG />
                    </div>
                }
            </div>
        </div>
    )
}