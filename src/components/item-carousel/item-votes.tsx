import React, {memo} from 'react';
import { postData } from '../../https-client/post-data';
import { itemsConfig } from '../../https-client/config';

//type imports

//style imports
import './item-carousel.css';
import { useCookies } from 'react-cookie';
import { VotingSlider } from './voting-slider';

interface ItemVotesComponentProps {
    itemName: string,
    userVote: number | undefined,
    halalPoints: number,
    haramPoints: number,
    numVotes: number,
};

const ItemVotesImplementation = (props: ItemVotesComponentProps) => {
    const { itemName, userVote, halalPoints, haramPoints, numVotes } = props;
    const [cookies] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const submitVote = async (value: number) => {
        if (itemName && username && sessiontoken) {
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
            await postData({
                baseUrl: itemsConfig.url,
                path: 'vote-item',
                data: {
                    "itemName": itemName,
                    "username": username,
                    "vote": value,
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                }
            });
        }
    };

    return (
        <div className={"item-votes-container"}>
            <div className={"voting-slider"} >
                <span className={"item-vote-text"}>
                    <span>{` 😈 `}</span>
                </span>
                <VotingSlider 
                    submitVote={submitVote}
                    userVote={userVote}
                    halalPoints={halalPoints}
                    haramPoints={haramPoints}
                    numVotes={numVotes}
                />
                <span className={"item-vote-text"}>
                    <span>{` 👼 `}</span>
                </span>
            </div>
        </div>
    )
};

export const ItemVotesComponent = memo(ItemVotesImplementation);
