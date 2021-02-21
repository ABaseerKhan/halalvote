import React, { useState, useEffect, useContext } from 'react';
import { useCookies } from 'react-cookie';
import { topicsConfig, usersConfig } from '../../https-client/config';
import { Topic } from '../../types';
import { timeSince } from '../../utils';
import { authenticatedGetDataContext, authenticatedPostDataContext } from '../app-shell';
import { TabScroll } from '../tab-scroll/tab-scroll';

// styles
import './profile.css';

interface UserTopicsProps {
    profileUsername: string,
    fetchTopics: (topicTofetch?: string) => Promise<void>,
    closeModal: any,
};
interface UserTopicsState {
    userCreatedTopics: Topic[]; 
    userVotedTopics: Topic[];
}
export const UserTopics = (props: UserTopicsProps) => {
    const { profileUsername, fetchTopics, closeModal } = props;

    const [cookies] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const { authenticatedGetData } = useContext(authenticatedGetDataContext);
    const { authenticatedPostData } = useContext(authenticatedPostDataContext);

    const [state, setState] = useState<UserTopicsState>({ 
        userCreatedTopics: [], 
        userVotedTopics: [],
    });

    useEffect(() => {
        fetchUserCreatedTopics();
        fetchUserVotedTopics(); // eslint-disable-next-line
    }, []);

    const fetchUserCreatedTopics = async () => {
        const { data }: { data: Topic[]} = await authenticatedGetData({ 
            baseUrl: usersConfig.url,
            path: 'user-created-topics', 
            queryParams: {
                "username": profileUsername,
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
                "username": profileUsername,
            },
            additionalHeaders: { },
        }, true);
        setState(prevState => ({ ...prevState, userVotedTopics: data }));
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

    const userTopic = (topic: Topic) => (
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
    );

    return (
        <TabScroll
            tabNames={["Created Topics", "Voted Topics"]}
            Sections={[
                <div className="topics-section-container">{state.userCreatedTopics?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((topic) => userTopic(topic))}</div>,
                <div className="topics-section-container">{state.userVotedTopics?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((topic) => userTopic(topic))}</div>
            ]}
        />
    )
}