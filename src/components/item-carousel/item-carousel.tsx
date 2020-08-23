import React, { useState } from 'react';
import Linkify from 'react-linkify';
import { ItemVotesComponent } from './item-votes';
import { ReactComponent as ChevronLeftSVG } from '../../icons/chevron-left.svg';
import { ReactComponent as ChevronRightSVG } from '../../icons/chevron-right.svg';
import { useMedia } from '../../hooks/useMedia';
import { ModalComponent } from '../modal/modal';

// type imports
import { ModalType } from '../../types';

// styles
import './item-carousel.css';

interface ItemCarouselComponentProps {
    id: string,
    iterateItem: any,
    itemName: string,
    userVote: number | undefined,
    halalPoints: number,
    haramPoints: number,
    numVotes: number,
    style?: any;
};
interface ItemCarouselComponentState {
    descriptionDisplayed: boolean
}
export const ItemCarouselComponent = (props: ItemCarouselComponentProps) => {
    const { id, iterateItem, itemName, userVote, halalPoints, haramPoints, numVotes } = props;
    const [state, setState] = useState<ItemCarouselComponentState>({
        descriptionDisplayed: false
    });

    const isMobile = useMedia(
        // Media queries
        ['(max-width: 600px)'],
        [true],
        // default value
        false
    );

    const leftCarouselButtonId = "left-carousel-button";
    const rightCarouselButtonId = "right-carousel-button";

    if (!isMobile) {
        const leftCarouselButton = document.getElementById(leftCarouselButtonId);
        const rightCarouselButton = document.getElementById(rightCarouselButtonId);
        if (leftCarouselButton && rightCarouselButton) {
            leftCarouselButton.classList.add("carousel-button-computer");
            rightCarouselButton.classList.add("carousel-button-computer");
        }
    }

    const setDescriptionDisplayed = (descriptionDisplayed: boolean) => {
        setState({...state, descriptionDisplayed: descriptionDisplayed})
    }

    return (
        <div id={id} style={props.style} className='item-carousel'>
            { state.descriptionDisplayed &&
                <ModalComponent removeModal={() => {setDescriptionDisplayed(false)}} modalType={ModalType.DESCRIPTION} fetchItems={null} itemName={props.itemName}/>
            }
            <div className="item-navigator">
                <button id={leftCarouselButtonId} onClick={iterateItem(-1)} className='carousel-button'>
                    <ChevronLeftSVG className={"arrow-icon-left"}/>
                </button>
                <div className='item-text' onClick={() => {setDescriptionDisplayed(true)}}>
                    <Linkify>{itemName}</Linkify>
                </div>
                <button id={rightCarouselButtonId} onClick={iterateItem(1)} className='carousel-button'>
                    <ChevronRightSVG className={"arrow-icon-right"}/>
                </button>
            </div>
            <ItemVotesComponent itemName={itemName} userVote={userVote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes} />
        </div>
    );
}