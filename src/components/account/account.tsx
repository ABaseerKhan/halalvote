import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

// styles
import './account.css';
import { getData } from '../../https-client/client';
import { usersConfig } from '../../https-client/config';
import { Topic, Comment } from '../../types';
import { timeSince } from '../../utils';

enum Tab {
    CREATEDTOPICS,
    VOTEDTOPICS,
    COMMENTS,
};

interface AccountComponentProps {
    username: string,
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
        <div className="account-container">
            <div className="account-header-section">
                <div className="account-title">{`${props.username}`}</div>
                <div className="account-tabs">
                    <span className={state.selectedTab===Tab.CREATEDTOPICS ? "account-tab-selected" : "account-tab"} onClick={onCreatedTopicsTab} >Created Topics</span>
                    <span className={state.selectedTab===Tab.VOTEDTOPICS ? "account-tab-selected" : "account-tab"} onClick={onVotedTopicsTab} >Voted Topics</span>
                    <span className={state.selectedTab===Tab.COMMENTS ? "account-tab-selected" : "account-tab"} onClick={onCommentsTab} >Comments</span>
                </div>
            </div>
            <div className="account-body">
                <ul style={{ listStyleType: 'none', paddingInlineStart: '2em' }}>
                    {state.selectedTab===Tab.CREATEDTOPICS && state.userCreatedTopics?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((topic) => (
                        <UserTopic topic={topic} />
                    ))}
                    {state.selectedTab===Tab.VOTEDTOPICS && state.userVotedTopics?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((topic) => (
                        <UserTopic topic={topic} />
                    ))}
                    {state.selectedTab===Tab.COMMENTS && state.userComments?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((comment) => (
                        <UserComment comment={comment} />
                    ))}
                </ul>
            </div>
        </div>
    );
}

const UserTopic = ({ topic }: { topic: Topic}) => {
    return (
            <li>
                <div className="user-topic-container">
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
}
const UserComment = (props: UserCommentProps) => {
    const { comment } = props;

    const CommentHeader = (
        <div className={"comment-header"}>
            <div className={"vote-counts"}>
                <div className="up-votes" >{comment.upVotes}</div>
                <div className="down-votes" >{comment.downVotes}</div>
            </div>
            <span className={"user-comment-bullet-separator"}>&bull;</span>
            <div className="username">{props.comment.username}</div>
            <span className={"user-comment-bullet-separator"}>&bull;</span>
            <div className={"user-comment-time-stamp"} >
                <span>{timeSince(props.comment.timeStamp)}</span>
            </div>
        </div>
    );
    return (
        <div id={`comment-${comment.id}`} onClick={(e) => { e.stopPropagation(); }} className={"user-comment-container"}>
            {CommentHeader}
            <div className="user-comment">
                <div dangerouslySetInnerHTML={{__html: comment.comment}}/>
            </div>
        </div>
    )
}