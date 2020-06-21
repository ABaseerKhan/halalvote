import React from 'react';
import { ItemVoterComponent } from './item-voter';

//type imports
import { Judgment, Item } from '../../types';

//style imports
import './item-votes.css';

interface ItemVoterComponentProps {
    judgment: Judgment,
    item: Item | undefined
    addItemVoteLocally: (itemName: string, itemVote: number) => void
};

export const ItemVotesComponent = (props: ItemVoterComponentProps) => {
    const { judgment, item, addItemVoteLocally } = props;

    return (
        <div>
            <div className={'header-text'} >{judgementToVoteText(judgment, item?.halalVotes, item?.haramVotes)}</div>
            <br />
            <ItemVoterComponent 
                judgment={judgment}
                userVote={item?.vote}
                itemName={item?.itemName}
                addItemVoteLocally={addItemVoteLocally}
            />
        </div>
    )
}

export const judgementToVoteText = (judgement: Judgment, halalVotes: number | undefined, haramVotes: number | undefined) => {
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
