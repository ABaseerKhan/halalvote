import React, { useState, useEffect, useContext, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { ReactComponent as HeartButtonSVG } from '../../icons/heart-icon.svg';
import { topicsConfig, usersConfig } from '../../https-client/config';
import { Topic, Comment, TopicMedia } from '../../types';
import { timeSince, vhToPixels, setCardQueryParam } from '../../utils';
import { modalHeightVh } from '../..';
import { commentsCardId } from '../topic-container/topic-container';
import { useQuery } from '../../hooks/useQuery';
import { 
    useHistory,
} from "react-router-dom";
import { authenticatedGetDataContext, authenticatedPostDataContext } from '../app-shell';
import { ReactComponent as TrashButtonSVG } from '../../icons/trash-icon.svg';
import { VideoPlayer } from '../topic-media/video-player';
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";
import { ReactComponent as DownArrowSVG } from "../../icons/down-arrow.svg";
import { ReactComponent as UpArrowSVG } from "../../icons/up-arrow.svg";
import { isVideo } from '../topic-media/topic-media';
import CommentIcon from '@material-ui/icons/Comment';
import ImageIcon from '@material-ui/icons/Image';
import ThumbsUpDownIcon from '@material-ui/icons/ThumbsUpDown';
import AssignmentIcon from '@material-ui/icons/Assignment';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';


// styles
import './profile.css';

enum Tab {
    CREATEDTOPICS,
    VOTEDTOPICS,
    ARGUMENTS,
    CREATEDMEDIA
};

interface ProfileComponentProps {
    username: string,
    fetchTopics: (topicTofetch?: string) => Promise<void>;
    showSpecificComment: any;
    closeModal: any;
};

interface State {
    userCreatedTopics: Topic[] | undefined; 
    userVotedTopics: Topic[] | undefined; 
    userComments: Comment[] | undefined;
    userCreatedMedia: TopicMedia[];
    selectedTab: Tab | undefined;
}

export const ProfileComponent = (props: ProfileComponentProps) => {
    // eslint-disable-next-line
    const [cookies] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const [state, setState] = useState<State>({ 
        userCreatedTopics: undefined, 
        userVotedTopics: undefined, 
        userComments: undefined,
        userCreatedMedia: [],
        selectedTab: Tab.CREATEDTOPICS,
    });

    const { authenticatedGetData } = useContext(authenticatedGetDataContext);
    const { authenticatedPostData } = useContext(authenticatedPostDataContext);

    useEffect(() => {
        onCreatedTopicsTab(); // eslint-disable-next-line
    }, []);

    const fetchUserCreatedTopics = async () => {
        const { data }: { data: Topic[]} = await authenticatedGetData({ 
            baseUrl: usersConfig.url,
            path: 'user-created-topics', 
            queryParams: {
                "username": props.username,
            },
            additionalHeaders: { },
        }, true);
        setState(prevState => ({ ...prevState, userCreatedTopics: data }));
    }

    const fetchUserVotedTopics = async () => {
        const { data }: { data: Topic[]} = await authenticatedGetData({ 
            baseUrl: usersConfig.url,
            path: 'user-voted-topics', 
            queryParams: {
                "username": props.username,
            },
            additionalHeaders: { },
        }, true);
        setState(prevState => ({ ...prevState, userVotedTopics: data }));
    }

    const fetchUserComments = async () => {
        const { data }: { data: Comment[]} = await authenticatedGetData({ 
            baseUrl: usersConfig.url,
            path: 'user-comments', 
            queryParams: {
                "username": props.username,
            },
            additionalHeaders: { },
        }, true);
        setState(prevState => ({ ...prevState, userComments: data }));
    }

    const fetchCreatedMedia = async () => {
        const { data }: { data: TopicMedia[]} = await authenticatedGetData({ 
            baseUrl: usersConfig.url,
            path: 'user-created-media', 
            queryParams: {
                "username": props.username,
            },
            additionalHeaders: { },
        }, true);
        setState(prevState => ({ ...prevState, userCreatedMedia: data }));
    }

    const deleteTopic = async (topicTitle: string) => {
        const { status } = await authenticatedPostData({
            baseUrl: topicsConfig.url,
            path: 'delete-topic', 
            data: { 
                "topicTitle": topicTitle,
                "username": username,
            },
            additionalHeaders: {
                "sessiontoken": sessiontoken
            }
        }, true);

        if (status === 200) {
            setState(prevState => ({ ...prevState, userCreatedTopics: prevState.userCreatedTopics?.filter((topic) => topic.topicTitle !== topicTitle), userVotedTopics: prevState.userVotedTopics?.filter((topic) => topic.topicTitle !== topicTitle) }))
        }
    }

    const onCreatedTopicsTab = () => {
        setState({ ...state, selectedTab: Tab.CREATEDTOPICS });
        fetchUserCreatedTopics();
    }

    const onVotedTopicsTab = () => {
        setState({ ...state, selectedTab: Tab.VOTEDTOPICS });
        fetchUserVotedTopics();
    }

    const onArgumentsTab = () => {
        setState({ ...state, selectedTab: Tab.ARGUMENTS });
        fetchUserComments();
    }

    const onCreatedMediaTab = () => {
        setState({ ...state, selectedTab: Tab.CREATEDMEDIA });
        fetchCreatedMedia();    
    }

    return (
        <div className="profile-container" style={{ height: `${vhToPixels(modalHeightVh)}px`}}>
            <div className="profile-header-section">
                <div className="profile-title">{`${props.username}`}</div> 
                <div className="profile-tabs">
                    <div className={state.selectedTab===Tab.CREATEDTOPICS ? "profile-tab-selected" : "profile-tab"} onClick={onCreatedTopicsTab} ><AssignmentIcon/></div>
                    <div className={state.selectedTab===Tab.VOTEDTOPICS ? "profile-tab-selected" : "profile-tab"} onClick={onVotedTopicsTab} ><ThumbsUpDownIcon/></div>
                    <div className={state.selectedTab===Tab.ARGUMENTS ? "profile-tab-selected" : "profile-tab"} onClick={onArgumentsTab} ><CommentIcon/></div>
                    <div className={state.selectedTab===Tab.CREATEDMEDIA ? "profile-tab-selected" : "profile-tab"} onClick={onCreatedMediaTab} ><ImageIcon/></div> 
                </div>
            </div>

            <div className="profile-body">
                <div style={{ listStyleType: 'none', height: "100%" }}>
                    {state.selectedTab===Tab.CREATEDTOPICS && state.userCreatedTopics?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((topic) => (
                        <UserTopic key={topic.topicTitle} topic={topic} fetchTopics={props.fetchTopics} deleteTopic={deleteTopic} closeModal={props.closeModal}/>
                    ))}
                    {state.selectedTab===Tab.VOTEDTOPICS && state.userVotedTopics?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((topic) => (
                        <UserTopic key={topic.topicTitle} topic={topic} fetchTopics={props.fetchTopics} deleteTopic={deleteTopic} closeModal={props.closeModal}/>
                    ))}
                    {state.selectedTab===Tab.ARGUMENTS && state.userComments?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((comment) => (
                        <UserComment comment={comment} fetchTopics={props.fetchTopics} showSpecificComment={props.showSpecificComment} closeModal={props.closeModal} />
                    ))}
                    {state.selectedTab===Tab.CREATEDMEDIA && <UserCreatedMedia userMedia={state.userCreatedMedia} />}
                </div>
            </div>
        </div>
    );
}

interface UserTopicProps {
    topic: Topic,
    fetchTopics: (topicTofetch?: string) => Promise<void>,
    deleteTopic: (topicTitle: string) => void,
    closeModal: any,
};
const UserTopic = (props: UserTopicProps) => {
    const { topic, fetchTopics, deleteTopic, closeModal } = props;

    const [cookies] = useCookies(['username', 'sessiontoken']);
    const { username } = cookies;

    return (
            <li>
                <div className="user-topic-li">
                    <div className="user-topic-container" onClick={() => { fetchTopics(topic.topicTitle); closeModal(); }}>
                        <span>{topic.topicTitle}</span>
                        <div className="topic-meta-info-container">
                            <span className="topic-meta-info-item">({topic.numVotes} votes)</span>
                            <span className="topic-meta-info-item">{timeSince(topic.timeStamp)} ago</span>
                        </div>
                    </div>
                    {
                        topic.username === username &&
                        <span
                            className={"delete-button"}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteTopic(topic.topicTitle); }}
                            role={"img"}
                            aria-label="trash"
                        >
                            🗑️
                        </span>
                    }
                </div>
            </li>
    )
}

interface UserCommentProps {
    comment: Comment,
    showSpecificComment: any,
    fetchTopics: (topicTofetch?: string) => Promise<void>,
    closeModal: any,
}
const UserComment = (props: UserCommentProps) => {
    const { comment, showSpecificComment, fetchTopics, closeModal } = props;
    const query = useQuery();
    const history = useHistory();

    return (
        <div id={`comment-${comment.id}`} className={"user-comment-container"} >
            <div className="comment-bubble-container">
                <div className={`comment-bubble-${comment.commentType.toLowerCase()}`}></div>
            </div>
            <div className="comment-body">
                <div 
                    className={"comment-content"}
                    onClick={async (e) => { setCardQueryParam(history, query, commentsCardId.toLowerCase()); await fetchTopics(comment.topicTitle); showSpecificComment(comment); closeModal(); }}
                >
                    <div className="topic-header">{comment.topicTitle}</div>
                    <div className="user-comment">
                        <div style={{ maxWidth: 'calc(100% - 50px)' }} dangerouslySetInnerHTML={{__html: comment.comment}}/>
                    </div>
                    <div>
                        <span className={"time-stamp"} style={{ color: 'var(--dark-mode-secondary-text-color)' }} >{timeSince(comment.timeStamp)}</span>
                    </div>
                </div>
            </div>
            <div className="user-likes-container">
                <HeartButtonSVG className={"user-heart"} />
                <div className={"likes"} >{comment.upVotes}</div>
            </div>
        </div>
    )
}

interface UserCreatedMediaProps {
    userMedia: TopicMedia[];
    
}
const UserCreatedMedia = (props: UserCreatedMediaProps) => {  
    const { userMedia } = props;
    const [state,] = useState<any>({
        addMediaDisplayed: false,
        picture: null,
        loading: false,
        previewDisplayed: false
    });

    const [mediaIndex, setMediaIndex] = useState<number>(0);

    const imagesBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        var isScrolling: any;
        if (imagesBodyRef.current) {
            imagesBodyRef.current.onscroll = () => {
                clearTimeout( isScrolling );
                isScrolling = setTimeout(async function() {
                    if (imagesBodyRef.current) {
                        const imgIndex = Math.floor((imagesBodyRef.current!.scrollTop+10) / imagesBodyRef.current!.clientHeight);
                        if ((imgIndex >= userMedia.length - 2) && (imgIndex > mediaIndex)) {
                            // fetchmore
                        } else {
                            setMediaIndex(Math.min(Math.max(imgIndex, 0), userMedia.length - 1));
                        }
                    }
                }, 66);
            }
        }
    });

    const loaderCssOverride = css`
        position: absolute;
        top: calc(50% - 25px);
        left: calc(50% - 25px);
    `;
    
    return (
        <div style={{ height: '100%', width: '100%' }}>
            <div id="images-body" ref={imagesBodyRef} className={"images-body"}>
                {
                    userMedia.length > 0 ?
                        userMedia.map((mediaItem, idx) => {
                            const ImgStats = 
                            <>
                                <div className="image-actions-container">
                                    {
                                        <TrashButtonSVG className="image-delete-button" />
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
                {userMedia.length > (mediaIndex + 1) && 
                    <div className={"more-images-below"} style={{ left: 'calc(35% - 16px)' }} onClick={() => imagesBodyRef.current?.scroll(0, (((mediaIndex + 1) * imagesBodyRef.current.clientHeight))) }>
                        <DownArrowSVG />
                    </div>
                }
                {userMedia.length > (mediaIndex + 1) && 
                    <div className={"more-images-below"} style={{ left: 'calc(65% - 16px)' }} onClick={() => imagesBodyRef.current?.scroll(0, (((mediaIndex + 1) * imagesBodyRef.current.clientHeight))) }>
                        <DownArrowSVG />
                    </div>
                }
                {mediaIndex > 0 && 
                    <div className={"more-images-above"} style={{ left: 'calc(50% - 16px)' }} onClick={() => imagesBodyRef.current?.scroll(0, (((mediaIndex - 1) * imagesBodyRef.current.clientHeight))) }>
                        <UpArrowSVG />
                    </div>
                }
            </div>
        </div>
    )
}