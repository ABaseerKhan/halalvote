import React from 'react';
import Linkify from 'react-linkify';
import { ItemVotesComponent } from './item-votes';

// type imports

// styles
import './item-carousel.css';

interface ItemCarouselComponentProps {
    id: string,
    iterateItem: any,
    itemName: string,
    userVote: number | undefined | null,
    halalVotes: number,
    haramVotes: number,
    addItemVoteLocally: (itemName: string, itemVote: number) => void,
    style?: any;
};
export const ItemCarouselComponent = (props: ItemCarouselComponentProps) => {
    const { id, iterateItem, itemName, userVote, halalVotes, haramVotes, addItemVoteLocally } = props;
    return (
        <div id={id} style={props.style} className='item-carousel'>
            <div className="item-navigator">
                <button onClick={iterateItem(-1)} className='carousel-button'>{"<"}</button>
                <div className='item-text'>
                    <Linkify>{itemName}</Linkify>
                </div>
                <button onClick={iterateItem(1)} className='carousel-button'>{">"}</button>
            </div>
            <ItemVotesComponent itemName={itemName} userVote={userVote} halalVotes={halalVotes} haramVotes={haramVotes} addItemVoteLocally={addItemVoteLocally} />
        </div>
    );
}