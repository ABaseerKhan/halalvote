import React, {memo, useState, useEffect, useContext} from 'react';
import { postData } from '../../https-client/client';
import { topicsConfig } from '../../https-client/config';
import { VotingSwitch } from './voting-switch';

//type imports

//style imports
import './topic-carousel.css';
import { useCookies } from 'react-cookie';
import { VotesBar } from './votes-bar';
import { TopicContext } from '../app-shell';

interface TopicVotesComponentProps {
    topicTitle: string,
    userVote: number | undefined,
    halalPoints: number,
    haramPoints: number,
    numVotes: number,
};

const TopicVotesImplementation = (props: TopicVotesComponentProps) => {
    const { topicTitle, userVote, halalPoints, haramPoints, numVotes } = props;
    const { topic, setTopic } = useContext(TopicContext);
    const [state, setState] = useState({ halalPoints: halalPoints, haramPoints: haramPoints, numVotes: numVotes, userVote: userVote });
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    useEffect(() => {
        setState(prevState => ({ ...prevState, numVotes: numVotes, halalPoints: halalPoints, haramPoints: haramPoints, userVote: userVote }));
    }, [halalPoints, haramPoints, numVotes, userVote]);

    const submitVote = async (value: number) => {
        if (topicTitle) {
            const { status, data } = await postData({
                baseUrl: topicsConfig.url,
                path: 'vote-topic',
                data: {
                    "topicTitle": topicTitle,
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
                    document.body.style.backgroundColor = 'var(--halal-color)';
                    setTimeout(() => {
                        document.body.style.backgroundColor = 'var(--site-background-color)'
                    }, 500);
                } else if (value < 0) {
                    document.body.style.backgroundColor = 'var(--haram-color)';
                    setTimeout(() => {
                        document.body.style.backgroundColor = 'var(--site-background-color)'
                    }, 500);
                }
                setState(prevState => ({ ...prevState, numVotes: data.numVotes, halalPoints: data.halalPoints, haramPoints: data.haramPoints, userVote: value }));
                setTopic({ ...topic!, vote: value, halalPoints: data.halalPoints, haramPoints: data.haramPoints, numVotes: data.numVotes });
            } else {
                const newUserVote = state.userVote === undefined ? 0 : undefined;
                setState(prevState => ({ ...prevState, userVote: newUserVote }));
                setTopic({ ...topic!, vote: newUserVote });
            }
        }
    };

    return (
        <div className={"topic-votes-container"}>
            <VotingSwitch
                submitVote={submitVote}
                userVote={state.userVote}
            />
            <VotesBar
                halalPoints={state.halalPoints}
                haramPoints={state.haramPoints}
                numVotes={state.numVotes}
            />
        </div>
    )
};

export const TopicVotesComponent = memo(TopicVotesImplementation);
