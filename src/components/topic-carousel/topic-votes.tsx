import React, {memo, useState, useEffect} from 'react';
import { postData } from '../../https-client/client';
import { topicsConfig } from '../../https-client/config';
import { VotingSwitch } from './voting-switch';

//type imports

//style imports
import './topic-carousel.css';
import { useCookies } from 'react-cookie';
import { VotingSlider } from './voting-slider';
import { VotesBar } from './votes-bar';

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

    useEffect(() => {
        setState(prevState => ({ ...prevState, numVotes: numVotes, halalPoints: halalPoints, haramPoints: haramPoints }));
    }, [halalPoints, haramPoints, numVotes]);

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
            if (status === 200) {
                setState(prevState => ({ ...prevState, numVotes: data.numVotes, halalPoints: data.halalPoints, haramPoints: data.haramPoints }));
            }
        }
    };

    return (
        <div className={"topic-votes-container"}>
            <VotingSwitch
                submitVote={submitVote}
                userVote={userVote}
            />
            <VotesBar
                halalPoints={state.halalPoints}
                haramPoints={state.haramPoints}
                numVotes={state.numVotes}
            />
            {/* <div className={"voting-slider"} >
                <VotingSlider 
                    submitVote={submitVote}
                    userVote={userVote}
                    halalPoints={state.halalPoints}
                    haramPoints={state.haramPoints}
                    numVotes={state.numVotes}
                />
            </div> */}
        </div>
    )
};

export const TopicVotesComponent = memo(TopicVotesImplementation);
