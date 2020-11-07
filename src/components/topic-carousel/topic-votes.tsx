import React, {memo, useContext} from 'react';
import { postData } from '../../https-client/client';
import { topicsConfig } from '../../https-client/config';
import { VotingSwitch } from './voting-switch';

//type imports

//style imports
import './topic-carousel.css';
import { useCookies } from 'react-cookie';
import { topicsContext } from '../app-shell';
import { Topic } from '../../types';

interface TopicVotesComponentProps {
    topicTitle: string,
    userVote: number | undefined,
    halalPoints: number,
    haramPoints: number,
    numVotes: number,
};

const TopicVotesImplementation = (props: TopicVotesComponentProps) => {
    const { topicsState: { topics, topicIndex }, setTopicsContext } = useContext(topicsContext);
    const topic = topics?.length ? topics[topicIndex] : undefined;

    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const submitVote = async (value: number) => {
        if (topic?.topicTitle) {
            const { status, data } = await postData({
                baseUrl: topicsConfig.url,
                path: 'vote-topic',
                data: {
                    "topicTitle": topic.topicTitle,
                    "username": username,
                    "vote": value,
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                },
                setCookie: setCookie,
            });
            
            if (status === 200 && !("noUpdates" in data) && !("message" in data)) {
                if (value > 0) {
                    document.body.style.backgroundColor = 'var(--dark-mode-halal-color)';
                    setTimeout(() => {
                        document.body.style.backgroundColor = 'var(--site-background-color)'
                    }, 500);
                } else if (value < 0) {
                    document.body.style.backgroundColor = 'var(--dark-mode-haram-color)';
                    setTimeout(() => {
                        document.body.style.backgroundColor = 'var(--site-background-color)'
                    }, 500);
                }
                const newTopics: Topic[] = topics.map((t: Topic) => { 
                    if (t.topicTitle === topic.topicTitle) { 
                        return {...t, vote: value, halalPoints: data.halalPoints, haramPoints: data.haramPoints, numVotes: data.numVotes}; 
                    } else {
                        return t;
                    }
                });
                setTopicsContext(newTopics, topicIndex);
            } else {
                topic.vote = topic.vote === undefined ? 0 : undefined;
                setTopicsContext(topics, topicIndex);
            }
        }
    };

    return (
        <div className={"topic-votes-container"}>
            <VotingSwitch
                submitVote={submitVote}
                userVote={topic?.vote}
                halalPoints={topic?.halalPoints}
                haramPoints={topic?.haramPoints}
                numVotes={topic?.numVotes}
            />
        </div>
    )
};

export const TopicVotesComponent = memo(TopicVotesImplementation);
