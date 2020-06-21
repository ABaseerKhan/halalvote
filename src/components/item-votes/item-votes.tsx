import React, {memo} from 'react';
import { ItemVoterComponent } from './item-voter';

//type imports
import { Judgment, Item } from '../../types';

//style imports
import './item-votes.css';

interface ItemVotesComponentProps {
    judgment: Judgment,
    itemName: string,
    vote: number | undefined | null,
    halalVotes: number,
    haramVotes: number,
    addItemVoteLocally: (itemName: string, itemVote: number) => void
};

const ItemVotesImplementation = (props: ItemVotesComponentProps) => {
    const { judgment, itemName, vote, halalVotes, haramVotes, addItemVoteLocally } = props;

    return (
        <div>
            <div className={'header-text'} >{judgementToVoteText(judgment, halalVotes, haramVotes)}</div>
            <br />
            <ItemVoterComponent 
                judgment={judgment}
                userVote={vote}
                itemName={itemName}
                addItemVoteLocally={addItemVoteLocally}
            />
        </div>
    )
};

const judgementToVoteText = (judgement: Judgment, halalVotes: number, haramVotes: number) => {
    switch (judgement) {
        case Judgment.HALAL:
            if (halalVotes != undefined && haramVotes != undefined) {
                if (halalVotes > 0 || haramVotes > 0) {
                    return `👼 Halal - ${ halalVotes + " (" + Math.round((halalVotes / (halalVotes + haramVotes) ) * 100) + "%)"} 👼`
                } else {
                    return `👼 Halal - ${halalVotes} 👼`
                }
            } else {
                return "👼 Halal 👼"
            }
        case Judgment.HARAM:
            if (halalVotes != undefined && haramVotes != undefined) {
                if (halalVotes > 0 || haramVotes > 0) {
                    return `🔥 Haram - ${ haramVotes + " (" + Math.round((haramVotes / (halalVotes + haramVotes) ) * 100) + "%)"} 🔥`
                } else {
                    return `🔥 Haram - ${haramVotes} 🔥`
                }
            } else {
                return "🔥 Haram 🔥"
            }
        default:
            return ""
    }
};

const areItemVotesPropsEqual = (prevProps: ItemVotesComponentProps, nextProps: ItemVotesComponentProps) => {
    return prevProps.itemName === nextProps.itemName &&
        prevProps.vote === nextProps.vote && 
        prevProps.halalVotes === nextProps.halalVotes &&
        prevProps.haramVotes === nextProps.haramVotes
}

export const ItemVotesComponent = memo(ItemVotesImplementation, areItemVotesPropsEqual);
