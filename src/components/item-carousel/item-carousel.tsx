import React from 'react';
import Linkify from 'react-linkify';
import { ItemVotesComponent } from './item-votes';
import { ReactComponent as ChevronLeftSVG } from '../../icons/chevron-left.svg';
import { ReactComponent as ChevronRightSVG } from '../../icons/chevron-right.svg';

// type imports

// styles
import './item-carousel.css';

interface ItemCarouselComponentProps {
    id: string,
    iterateItem: any,
    itemName: string,
    userVote: number | undefined | null,
    halalPoints: number,
    haramPoints: number,
    numVotes: number,
    style?: any;
};
export const ItemCarouselComponent = (props: ItemCarouselComponentProps) => {
    const { id, iterateItem, itemName, userVote, halalPoints, haramPoints, numVotes } = props;
    return (
        <div id={id} style={props.style} className='item-carousel'>
            <div className="item-navigator">
                <button onClick={iterateItem(-1)} className='carousel-button'>
                    <ChevronLeftSVG className={"arrow-icon-left"}/>
                </button>
                <div className='item-text'>
                    <Linkify>{itemName}</Linkify>
                </div>
                <button onClick={iterateItem(1)} className='carousel-button'>
                    <ChevronRightSVG className={"arrow-icon-right"}/>
                </button>
            </div>
            <ItemVotesComponent itemName={itemName} userVote={userVote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes} />
        </div>
    );
}