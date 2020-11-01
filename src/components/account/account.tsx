import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { ReactComponent as HeartButtonSVG } from '../../icons/heart-icon.svg';
import { 
    useHistory,
} from "react-router-dom";

// styles
import './account.css';
import { getData } from '../../https-client/client';
import { usersConfig } from '../../https-client/config';
import { Topic, Comment } from '../../types';
import { timeSince, vhToPixels, setCardQueryParam } from '../../utils';
import { modalHeightVh, modalMaxHeight } from '../../';
import { commentsCardId } from '../cards-shell/cards-shell';
import { useQuery } from '../../hooks/useQuery';


enum Tab {
    CREATEDTOPICS,
    VOTEDTOPICS,
    COMMENTS,
};

interface AccountComponentProps {
    username: string,
    fetchTopics: (topicTofetch?: string) => Promise<void>;
    showSpecificComment: any;
    closeModal: any;
};

interface State {
    userCreatedTopics: Topic[] | undefined; 
    userVotedTopics: Topic[] | undefined; 
    userComments: Comment[] | undefined;
    selectedTab: Tab | undefined;
}

export const AccountComponent = (props: AccountComponentProps) => {
    // eslint-disable-next-line
    const [cookies] = useCookies(['username', 'sessiontoken']);
    const [state, setState] = useState<State>({ 
        userCreatedTopics: undefined, 
        userVotedTopics: undefined, 
        userComments: undefined,
        selectedTab: Tab.CREATEDTOPICS,
    });

    useEffect(() => {
        onCreatedTopicsTab(); // eslint-disable-next-line
    }, []);

    const fetchUserCreatedTopics = async () => {
        const { data }: { data: Topic[]} = await getData({ 
            baseUrl: usersConfig.url,
            path: 'user-created-topics', 
            queryParams: {
                "username": props.username,
            },
            additionalHeaders: { },
        });
        setState(prevState => ({ ...prevState, userCreatedTopics: data }));
    }

    const fetchUserVotedTopics = async () => {
        const { data }: { data: Topic[]} = await getData({ 
            baseUrl: usersConfig.url,
            path: 'user-voted-topics', 
            queryParams: {
                "username": props.username,
            },
            additionalHeaders: { },
        });
        setState(prevState => ({ ...prevState, userVotedTopics: data }));
    }

    const fetchUserComments = async () => {
        const { data }: { data: Comment[]} = await getData({ 
            baseUrl: usersConfig.url,
            path: 'user-comments', 
            queryParams: {
                "username": props.username,
            },
            additionalHeaders: { },
        });
        setState(prevState => ({ ...prevState, userComments: data }));
    }

    const onCreatedTopicsTab = () => {
        setState({ ...state, selectedTab: Tab.CREATEDTOPICS });
        fetchUserCreatedTopics();
    }

    const onVotedTopicsTab = () => {
        setState({ ...state, selectedTab: Tab.VOTEDTOPICS });
        fetchUserVotedTopics();
    }

    const onCommentsTab = () => {
        setState({ ...state, selectedTab: Tab.COMMENTS });
        fetchUserComments();
    }

    return (
        <div className="account-container" style={{ height: `${vhToPixels(modalHeightVh)}px`, maxHeight: modalMaxHeight}}>
            <div className="account-header-section">
                <div className="account-title">{`${props.username}`}</div>
                <div className="account-tabs">
                    <div className={state.selectedTab===Tab.CREATEDTOPICS ? "account-tab-selected" : "account-tab"} onClick={onCreatedTopicsTab} >Created Topics</div>
                    <div className={state.selectedTab===Tab.VOTEDTOPICS ? "account-tab-selected" : "account-tab"} onClick={onVotedTopicsTab} >Voted Topics</div>
                    <div className={state.selectedTab===Tab.COMMENTS ? "account-tab-selected" : "account-tab"} onClick={onCommentsTab} >Comments</div>
                </div>
            </div>
            <div className="account-body">
                <ul style={{ listStyleType: 'none', paddingInlineStart: '2em' }}>
                    {state.selectedTab===Tab.CREATEDTOPICS && state.userCreatedTopics?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((topic) => (
                        <UserTopic topic={topic} fetchTopics={props.fetchTopics} closeModal={props.closeModal}/>
                    ))}
                    {state.selectedTab===Tab.VOTEDTOPICS && state.userVotedTopics?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((topic) => (
                        <UserTopic topic={topic} fetchTopics={props.fetchTopics} closeModal={props.closeModal}/>
                    ))}
                    {state.selectedTab===Tab.COMMENTS && state.userComments?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((comment) => (
                        <UserComment comment={comment} fetchTopics={props.fetchTopics} showSpecificComment={props.showSpecificComment} closeModal={props.closeModal} />
                    ))}
                </ul>
            </div>
        </div>
    );
}

interface UserTopicProps {
    topic: Topic,
    fetchTopics: (topicTofetch?: string) => Promise<void>,
    closeModal: any,
};
const UserTopic = (props: UserTopicProps) => {
    const { topic, fetchTopics, closeModal } = props;
    return (
            <li>
                <div className="user-topic-container" onClick={() => { fetchTopics(topic.topicTitle); closeModal(); }}>
                    <span>{topic.topicTitle}</span>
                    <div className="topic-meta-info-container">
                        <span className="topic-meta-info-item">({topic.numVotes} votes)</span>
                        <span className="topic-meta-info-item">{timeSince(topic.timeStamp)} ago</span>
                    </div>
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
        <div className="user-comment-container">
            <div id={`comment-${comment.id}`} className={"comment-container"}>
                <div className="comment-bubble-container">
                    <div className="comment-bubble"></div>
                </div>
                <div className="comment-body">
                    <div 
                        className={"comment-content"}
                        onClick={async (e) => { setCardQueryParam(history, query, commentsCardId); await fetchTopics(comment.topicTitle); showSpecificComment(comment); closeModal(); }}
                    >
                        <div className="username" style={{ color: 'var(--site-background-color)' }}>{comment.username}</div>
                        <div className="comment" style={{ color: 'var(--site-background-color)' }}>
                            <div style={{ maxWidth: 'calc(100% - 50px)' }} dangerouslySetInnerHTML={{__html: comment.comment}}/>
                        </div>
                        <div>
                            <span className={"time-stamp"} style={{ color: 'var(--site-background-color)' }} >{timeSince(comment.timeStamp)}</span>
                        </div>
                    </div>
                </div>
                <div className="likes-container">
                    <HeartButtonSVG className={"heart"} style={{ stroke: 'var(--site-background-color)' }} />
                    <div className={"likes"} style={{ color: 'var(--site-background-color)' }}>{comment.upVotes}</div>
                </div>
            </div>
        </div>
    )
}