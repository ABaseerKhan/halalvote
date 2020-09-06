import React, {memo, useState} from 'react';
import { postData } from '../../https-client/client';
import { topicsConfig } from '../../https-client/config';

//type imports

//style imports
import './topic-carousel.css';
import { useCookies } from 'react-cookie';
import { VotingSlider } from './voting-slider';

interface TopicVotesComponentProps {
    topicTitle: string,
    userVote: number | undefined,
    halalPoints: number,
    haramPoints: number,
    numVotes: number,
};

const TopicVotesImplementation = (props: TopicVotesComponentProps) => {
    const { topicTitle, userVote, halalPoints, haramPoints, numVotes } = props;
    const [state, setState] = useState({ halalPoints: halalPoints, haramPoints: haramPoints, numVotes: numVotes });
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const submitVote = async (value: number) => {
        if (topicTitle) {
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
            const { data } = await postData({
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
            setState(prevState => ({ ...prevState, numVotes: data.numVotes, halalPoints: data.halalPoints, haramPoints: data.haramPoints }));
        }
    };

    return (
        <div className={"topic-votes-container"}>
            <div className={"voting-slider"} >
                <VotingSlider 
                    submitVote={submitVote}
                    userVote={userVote}
                    halalPoints={state.halalPoints}
                    haramPoints={state.haramPoints}
                    numVotes={state.numVotes}
                />
            </div>
        </div>
    )
};

export const TopicVotesComponent = memo(TopicVotesImplementation);
