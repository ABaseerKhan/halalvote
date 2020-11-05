import React, {memo, useContext} from 'react';
import { postData } from '../../https-client/client';
import { topicsConfig } from '../../https-client/config';
import { VotingSwitch } from './voting-switch';

//type imports

//style imports
import './topic-carousel.css';
import { useCookies } from 'react-cookie';
import { topicContext } from '../app-shell';

interface TopicVotesComponentProps {
    topicTitle: string,
    userVote: number | undefined,
    halalPoints: number,
    haramPoints: number,
    numVotes: number,
};

const TopicVotesImplementation = (props: TopicVotesComponentProps) => {
    const { topic, setTopicContext } = useContext(topicContext);
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
                setTopicContext({ ...topic!, vote: value, halalPoints: data.halalPoints, haramPoints: data.haramPoints, numVotes: data.numVotes });
            } else {
                const newUserVote = topic.vote === undefined ? 0 : undefined;
                setTopicContext({ ...topic!, vote: newUserVote });
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
