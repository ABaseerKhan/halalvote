import React, {memo} from 'react';
import { UserContext } from '../../app-shell'
import { postData } from '../../../https-client/post-data';
import { itemsConfig } from '../../../https-client/config';

//type imports
import { Judgment } from '../../../types';

//style imports
import './item-votes.css';

interface ItemVotesComponentProps {
    itemName: string,
    userVote: number | undefined | null,
    halalVotes: number,
    haramVotes: number,
    addItemVoteLocally: (itemName: string, itemVote: number) => void
};

const ItemVotesImplementation = (props: ItemVotesComponentProps) => {
    const { itemName, userVote, halalVotes, haramVotes, addItemVoteLocally } = props;
    const { username, sessiontoken } = React.useContext(UserContext)

    const isHalalSelected = userVote === Judgment.HALAL;
    const isHaramSelected = userVote === Judgment.HARAM;

    const vote = async (vote: Judgment) => {
        if (itemName && username && sessiontoken) {
            const response = await postData({
                baseUrl: itemsConfig.url,
                path: 'vote-item',
                data: {
                    "itemName": itemName,
                    "username": username,
                    "vote": vote,
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                }
            });
    
            addItemVoteLocally(itemName, vote)
        }
    };

    const halalClassNames = "item-voter-" + Judgment.HALAL + " " + (isHalalSelected ? "item-voter-" + Judgment.HALAL + "-selected" : "");
    const haramClassNames = "item-voter-" + Judgment.HARAM + " " + (isHaramSelected ? "item-voter-" + Judgment.HARAM + "-selected" : "");

    return (
        <div className={"item-votes-container"}>
            <div onClick={() => {vote(Judgment.HARAM)}} className={haramClassNames}>{judgementToVoteText(Judgment.HARAM, halalVotes, haramVotes)}</div>
            <div onClick={() => {vote(Judgment.HALAL)}} className={halalClassNames}>{judgementToVoteText(Judgment.HALAL, halalVotes, haramVotes)}</div>
        </div>
    )
};

const judgementToVoteText = (judgement: Judgment, halalVotes: number, haramVotes: number) => {
    switch (judgement) {
        case Judgment.HALAL:
            if (halalVotes != undefined && haramVotes != undefined) {
                if (halalVotes > 0 || haramVotes > 0) {
                    return (
                        <span className={"item-vote-text"}>
                            <span>{`👼 Halal `}</span>
                            <span className={"votes-bullet-separator"}>&bull;</span>
                            <span>{` ${halalVotes} `}</span>
                            <span className={"votes-bullet-separator"}>&bull;</span>
                            <span>{` ${Math.round((halalVotes / (halalVotes + haramVotes) ) * 100)}% 👼`}</span>
                        </span>
                    )
                } else {
                    return (
                        <span className={"item-vote-text"}>
                            <span>{`👼 Halal`}</span>
                            <span className={"votes-bullet-separator"}>&bull;</span>
                            <span>{`${halalVotes} 👼`}</span>
                        </span>
                    )
                }
            } else {
                return <span className={"item-vote-text"}>{"👼 Halal 👼"}</span>
            }
        case Judgment.HARAM:
            if (halalVotes != undefined && haramVotes != undefined) {
                if (halalVotes > 0 || haramVotes > 0) {
                    return (
                        <span className={"item-vote-text"}>
                            <span>{`😈 Haram `}</span>
                            <span className={"votes-bullet-separator"}>&bull;</span>
                            <span>{` ${haramVotes} `}</span>
                            <span className={"votes-bullet-separator"}>&bull;</span>
                            <span>{` ${Math.round((haramVotes / (halalVotes + haramVotes) ) * 100)}% 😈`}</span>
                        </span>
                    )
                } else {
                    return (
                        <span className={"item-vote-text"}>
                            <span>{`😈 Haram ${halalVotes} 😈`}</span>
                            <span className={"votes-bullet-separator"}>&bull;</span>
                            <span>{`${haramVotes} 😈`}</span>
                        </span>
                    )
                }
            } else {
                return <span className={"item-vote-text"}>{"😈 Haram 😈"}</span>
            }
        default:
            return <span></span>
    }
};

const areItemVotesPropsEqual = (prevProps: ItemVotesComponentProps, nextProps: ItemVotesComponentProps) => {
    return prevProps.itemName === nextProps.itemName &&
        prevProps.userVote === nextProps.userVote && 
        prevProps.halalVotes === nextProps.halalVotes &&
        prevProps.haramVotes === nextProps.haramVotes
}

export const ItemVotesComponent = memo(ItemVotesImplementation, areItemVotesPropsEqual);
