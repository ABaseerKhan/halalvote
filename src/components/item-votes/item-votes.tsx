import React, {memo} from 'react';
import { UserContext } from '../app-shell'
import { postData } from '../../https-client/post-data';
import { itemsConfig } from '../../https-client/config';

//type imports
import { Judgment } from '../../types';

//style imports
import './item-votes.css';

interface ItemVotesComponentProps {
    judgment: Judgment,
    itemName: string,
    userVote: number | undefined | null,
    halalVotes: number,
    haramVotes: number,
    addItemVoteLocally: (itemName: string, itemVote: number) => void
};

const ItemVotesImplementation = (props: ItemVotesComponentProps) => {
    const { judgment, itemName, userVote, halalVotes, haramVotes, addItemVoteLocally } = props;
    const { username, sessiontoken } = React.useContext(UserContext)

    const isSelected = userVote === judgment

    const vote = async () => {
        if (itemName && username && sessiontoken) {
            const response = await postData({
                baseUrl: itemsConfig.url,
                path: 'vote-item',
                data: {
                    "itemName": itemName,
                    "username": username,
                    "vote": judgment,
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                }
            });
    
            addItemVoteLocally(itemName, judgment)
        }
    };

    const classNames = "item-voter-" + judgment + " " + (isSelected ? "item-voter-" + judgment + "-selected" : "");

    return (
        <div onClick={ vote } className={classNames}>{judgementToVoteText(judgment, halalVotes, haramVotes)}</div>
    )
};

const judgementToVoteText = (judgement: Judgment, halalVotes: number, haramVotes: number) => {
    switch (judgement) {
        case Judgment.HALAL:
            if (halalVotes != undefined && haramVotes != undefined) {
                if (halalVotes > 0 || haramVotes > 0) {
                    return (
                        <span>
                            <span>{`👼 Halal `}</span>
                            <span className={"votes-bullet-separator"}>&bull;</span>
                            <span>{` ${halalVotes} `}</span>
                            <span className={"votes-bullet-separator"}>&bull;</span>
                            <span>{` ${Math.round((halalVotes / (halalVotes + haramVotes) ) * 100)}% 👼`}</span>
                        </span>
                    )
                } else {
                    return (
                        <span>
                            <span>{`👼 Halal`}</span>
                            <span className={"votes-bullet-separator"}>&bull;</span>
                            <span>{`${halalVotes} 👼`}</span>
                        </span>
                    )
                }
            } else {
                return <span>{"👼 Halal 👼"}</span>
            }
        case Judgment.HARAM:
            if (halalVotes != undefined && haramVotes != undefined) {
                if (halalVotes > 0 || haramVotes > 0) {
                    return (
                        <span>
                            <span>{`😈 Haram `}</span>
                            <span className={"votes-bullet-separator"}>&bull;</span>
                            <span>{` ${haramVotes} `}</span>
                            <span className={"votes-bullet-separator"}>&bull;</span>
                            <span>{` ${Math.round((haramVotes / (halalVotes + haramVotes) ) * 100)}% 😈`}</span>
                        </span>
                    )
                } else {
                    return (
                        <span>
                            <span>{`😈 Haram ${halalVotes} 😈`}</span>
                            <span className={"votes-bullet-separator"}>&bull;</span>
                            <span>{`${haramVotes} 😈`}</span>
                        </span>
                    )
                }
            } else {
                return <span>{"😈 Haram 😈"}</span>
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
