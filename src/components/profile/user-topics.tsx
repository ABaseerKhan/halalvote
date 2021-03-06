import React, { useState, useEffect, useContext } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { topicsConfig, usersConfig } from '../../https-client/config';
import { Topic } from '../../types';
import { setCardQueryParam, timeSince } from '../../utils';
import { authenticatedGetDataContext, authenticatedPostDataContext } from '../app-shell';
import { closeModalContext } from '../modal/modal';
import { TabScroll } from '../tab-scroll/tab-scroll';
import { mediaCardId } from '../topic-container/topic-container';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';

// styles
import './profile.css';

interface UserTopicsProps {
    profileUsername: string,
    fetchTopics: (topicTofetch?: string) => Promise<void>,
};
interface UserTopicsState {
    userCreatedTopics: Topic[]; 
    userVotedTopics: Topic[];
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
    });

    enum Tab {
        USER_CREATED_TOPICS,
        USER_VOTED_TOPICS
    } 

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

    const userTopic = (topic: Topic, tab: any) => (
            <li>
                <div className="user-topic-li">
                    <div className="user-topic-container" onClick={() => { closeModal(async () => { query.delete('userProfile'); await setCardQueryParam(history, query, mediaCardId.toLowerCase()); fetchTopics(topic.topicTitle); }); }}>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end"}}>
                            <span className="profile-topic-title">{topic.topicTitle}</span>
                            {/* {tab === Tab.USER_VOTED_TOPICS && <span className="vote" style={{color: (topic.vote === 1) ? "var(--halal-color)" : "var(--haram-color)", fontSize: ".8em"}}>{(topic.vote === 1) ? "Voted Halal" : "Voted Haram"}</span>} */}
                            {tab === Tab.USER_VOTED_TOPICS && (topic.vote === 1 ? <ThumbUpIcon style={{color: "var(--halal-color)"}}/> : <ThumbDownIcon style={{color: "var(--haram-color)"}}/>)}
                            
                        </div>
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
                <div className="topics-section-container">{state.userCreatedTopics?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((topic) => userTopic(topic, Tab.USER_CREATED_TOPICS))}</div>,
                <div className="topics-section-container">{state.userVotedTopics?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((topic) => userTopic(topic, Tab.USER_VOTED_TOPICS))}</div>
            ]}
        />
    )
}