import React, { useState, useEffect, useContext } from 'react';
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
import CommentIcon from '@material-ui/icons/Comment';
import ImageIcon from '@material-ui/icons/Image';
import ThumbsUpDownIcon from '@material-ui/icons/ThumbsUpDown';
import AssignmentIcon from '@material-ui/icons/Assignment';

// styles
import './profile.css';
import { UserCreatedMedia } from './user-media';

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
                    {state.selectedTab===Tab.CREATEDMEDIA && <UserCreatedMedia profileUsername={props.username} fetchTopics={props.fetchTopics} closeModal={props.closeModal} />}
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
