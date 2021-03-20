import React, { useState, useEffect, useContext } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { topicsAPIConfig, usersAPIConfig, superUsername } from '../../https-client/config';
import { Topic } from '../../types';
import { setCardQueryParam, timeSince, deleteUserProfileQueryParam, modifyTopicQueryParam } from '../../utils';
import { authenticatedGetDataContext, authenticatedPostDataContext } from '../app-shell';
import { closeModalContext } from '../modal/modal';
import { TabScroll } from '../tab-scroll/tab-scroll';
import { mediaCardId } from '../topic-container/topic-container';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import { TopicSkeletonComponent } from './topics-skeleton';

// styles
import './profile.css';

interface UserTopicsProps {
    profileUsername: string,
    fetchTopics: (topicTofetch?: string) => Promise<void>,
};
interface UserTopicsState {
    userCreatedTopics: Topic[]; 
    userVotedTopics: Topic[];
    loading: boolean;
}

enum Tab {
    USER_CREATED_TOPICS,
    USER_VOTED_TOPICS
} 

export const UserTopics = (props: UserTopicsProps) => {
    const { profileUsername, fetchTopics } = props;

    const query = useQuery();
    const history = useHistory();
    const [cookies] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const { authenticatedGetData } = useContext(authenticatedGetDataContext);
    const { authenticatedPostData } = useContext(authenticatedPostDataContext);
    const { closeModal } = useContext(closeModalContext);

    const [state, setState] = useState<UserTopicsState>({ 
        userCreatedTopics: [], 
        userVotedTopics: [],
        loading: true,
    });

    const ownProfile = profileUsername === username || superUsername === username;

    useEffect(() => {
        ownProfile && fetchUserVotedTopics();
        fetchUserCreatedTopics(); // eslint-disable-next-line
    }, []);

    const fetchUserCreatedTopics = async () => {
        const { data }: { data: Topic[]} = await authenticatedGetData({ 
            baseUrl: usersAPIConfig.url,
            path: 'user-created-topics', 
            queryParams: {
                "username": profileUsername,
            },
            additionalHeaders: { },
        }, true);
        setState(prevState => ({ ...prevState, userCreatedTopics: data, loading: false }));
    }

    const fetchUserVotedTopics = async () => {
        const { data }: { data: Topic[]} = await authenticatedGetData({ 
            baseUrl: usersAPIConfig.url,
            path: 'user-voted-topics', 
            queryParams: {
                "username": profileUsername,
            },
            additionalHeaders: {
                "sessiontoken": sessiontoken
            },
        }, true);
        setState(prevState => ({ ...prevState, userVotedTopics: data, loading: false }));
    }

    const deleteTopic = async (topic: Topic) => {
        const topicTitle = topic.topicTitle;
        const topicCreator = topic.username;
        const { status } = await authenticatedPostData({
            baseUrl: topicsAPIConfig.url,
            path: 'delete-topic', 
            data: { 
                "topicTitle": topicTitle,
                "username": topicCreator,
            },
            additionalHeaders: {
                "sessiontoken": sessiontoken
            }
        }, true);

        if (status === 200) {
            setState(prevState => ({ ...prevState, userCreatedTopics: prevState.userCreatedTopics?.filter((topic) => topic.topicTitle !== topicTitle), userVotedTopics: prevState.userVotedTopics?.filter((topic) => topic.topicTitle !== topicTitle) }))
        }
    }

    const selectTopicHandler = async (topic: Topic) => {
        deleteUserProfileQueryParam(history, query);
        await fetchTopics(topic.topicTitle);
        modifyTopicQueryParam(query, topic.topicTitle!);
        setCardQueryParam(history, query, mediaCardId.toLowerCase());
    }

    const userTopic = (topic: Topic, tab: any) => (
            <li key={`${topic.topicTitle}-${tab}`}>
                <div className="user-topic-li">
                    <div className="user-topic-container" onClick={() => { closeModal(async () => { selectTopicHandler(topic); }); }}>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end"}}>
                            <span className="profile-topic-title">{topic.topicTitle}</span>
                            {tab === Tab.USER_VOTED_TOPICS && (topic.vote === 1 ? <ThumbUpIcon style={{color: "var(--halal-color)"}}/> : <ThumbDownIcon style={{color: "var(--haram-color)"}}/>)}
                            
                        </div>
                        <div className="topic-meta-info-container">
                            <span className="topic-meta-info-item">({topic.numVotes} votes)</span>
                            <span className="topic-meta-info-item">{timeSince(topic.timeStamp)} ago</span>
                        </div>
                    </div>
                    {
                        (topic.username === username || superUsername === username) && tab !== Tab.USER_VOTED_TOPICS && (
                        <span
                            className={"delete-button"}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteTopic(topic); }}
                            role={"img"}
                            aria-label="trash"
                        >
                            🗑️
                        </span>)
                    }
                </div>
            </li>
    );

    const tabNames = ownProfile ? ["Created Topics", "Voted Topics"] : ["Created Topics"];
    const sections = ownProfile ? [
        <div className="topics-section-container">{state.userCreatedTopics?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((topic) => userTopic(topic, Tab.USER_CREATED_TOPICS))}</div>,
        <div className="topics-section-container">{state.userVotedTopics?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((topic) => userTopic(topic, Tab.USER_VOTED_TOPICS))}</div>
    ] : [<div className="topics-section-container">{state.userCreatedTopics?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((topic) => userTopic(topic, Tab.USER_CREATED_TOPICS))}</div>];

    return (
        state.loading ? <TopicSkeletonComponent /> : 
        <TabScroll
            tabNames={tabNames}
            Sections={sections}
        />
    )
}